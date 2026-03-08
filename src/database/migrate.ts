import 'dotenv/config';
import { readdirSync } from 'fs';
import { extname, join } from 'path';
import { pathToFileURL } from 'url';
import { DataTypes, Dialect, QueryTypes, Sequelize } from 'sequelize';
import { validateEnv } from '../config/env.validation';
import type { MigrationDefinition } from './migrations/migration.interface';

type MigrationRow = { name: string; executed_at: Date };
type Command = 'up' | 'status' | 'down';

function asBool(value: string | undefined, fallback: boolean): boolean {
  if (value === undefined) {
    return fallback;
  }
  return value === 'true' || value === '1';
}

function asPositiveInt(value: string | undefined, fallback: number): number {
  const parsed = Number(value);
  if (!Number.isInteger(parsed) || parsed <= 0) {
    return fallback;
  }
  return parsed;
}

function asDialect(value: string | undefined): Dialect {
  if (value === 'mssql') {
    return 'mssql';
  }
  return 'postgres';
}

function parseCommand(argv: string[]): {
  command: Command;
  rollbackAll: boolean;
} {
  const command = (argv[2] as Command | undefined) ?? 'up';
  if (!['up', 'status', 'down'].includes(command)) {
    throw new Error('Invalid command. Use one of: up, status, down');
  }

  return {
    command,
    rollbackAll: argv.includes('--all'),
  };
}

async function ensureMigrationsTable(sequelize: Sequelize): Promise<void> {
  const queryInterface = sequelize.getQueryInterface();
  const tables = (await queryInterface.showAllTables()) as Array<
    string | { tableName?: string; schema?: string }
  >;
  const hasMigrationsTable = tables.some((table) => {
    if (typeof table === 'string') {
      return table === 'schema_migrations';
    }
    return table.tableName === 'schema_migrations';
  });

  if (hasMigrationsTable) {
    return;
  }

  await queryInterface.createTable('schema_migrations', {
    name: {
      type: DataTypes.STRING,
      primaryKey: true,
      allowNull: false,
    },
    executed_at: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
    },
  });
}

async function loadExecutedMigrations(
  sequelize: Sequelize,
): Promise<MigrationRow[]> {
  return sequelize.query<MigrationRow>(
    'SELECT name, executed_at FROM schema_migrations ORDER BY executed_at ASC, name ASC',
    { type: QueryTypes.SELECT },
  );
}

async function loadMigrations(): Promise<MigrationDefinition[]> {
  const migrationsDir = join(__dirname, 'migrations');
  const currentExt = extname(__filename);
  const files = readdirSync(migrationsDir)
    .filter((file) => file.endsWith(currentExt) && /^\d{4}-/.test(file))
    .sort();

  const migrations: MigrationDefinition[] = [];
  for (const file of files) {
    const modulePath = pathToFileURL(join(migrationsDir, file)).href;
    const loaded = (await import(modulePath)) as {
      migration?: MigrationDefinition;
    };
    if (!loaded.migration) {
      throw new Error(`Migration file "${file}" does not export "migration"`);
    }
    migrations.push(loaded.migration);
  }

  return migrations;
}

async function applyPendingMigrations(
  sequelize: Sequelize,
  migrations: MigrationDefinition[],
  executedRows: MigrationRow[],
): Promise<void> {
  const executedSet = new Set(executedRows.map((row) => row.name));
  const pending = migrations.filter(
    (migration) => !executedSet.has(migration.name),
  );

  if (pending.length === 0) {
    console.log('No pending migrations.');
    return;
  }

  for (const migration of pending) {
    await sequelize.transaction(async (transaction) => {
      await migration.up({
        queryInterface: sequelize.getQueryInterface(),
        sequelize,
        transaction,
      });

      await sequelize.query(
        'INSERT INTO schema_migrations(name, executed_at) VALUES (:name, CURRENT_TIMESTAMP)',
        {
          replacements: { name: migration.name },
          type: QueryTypes.INSERT,
          transaction,
        },
      );
    });
    console.log(`Applied migration: ${migration.name}`);
  }
}

async function rollbackMigrations(
  sequelize: Sequelize,
  migrations: MigrationDefinition[],
  executedRows: MigrationRow[],
  rollbackAll: boolean,
): Promise<void> {
  if (executedRows.length === 0) {
    console.log('No applied migrations to roll back.');
    return;
  }

  const migrationMap = new Map(
    migrations.map((migration) => [migration.name, migration]),
  );
  const targets = rollbackAll
    ? [...executedRows].reverse()
    : [executedRows[executedRows.length - 1]];

  for (const row of targets) {
    const migration = migrationMap.get(row.name);
    if (!migration) {
      throw new Error(`Cannot rollback unknown migration: ${row.name}`);
    }
    if (!migration.down) {
      throw new Error(`Migration does not implement down(): ${migration.name}`);
    }

    await sequelize.transaction(async (transaction) => {
      await migration.down?.({
        queryInterface: sequelize.getQueryInterface(),
        sequelize,
        transaction,
      });

      await sequelize.query(
        'DELETE FROM schema_migrations WHERE name = :name',
        {
          replacements: { name: migration.name },
          type: QueryTypes.DELETE,
          transaction,
        },
      );
    });
    console.log(`Rolled back migration: ${migration.name}`);
  }
}

function printStatus(
  migrations: MigrationDefinition[],
  executedRows: MigrationRow[],
): void {
  const executedSet = new Set(executedRows.map((row) => row.name));
  const lines = migrations.map((migration) => {
    const state = executedSet.has(migration.name) ? 'applied' : 'pending';
    return `${migration.name}  ${state}`;
  });

  if (lines.length === 0) {
    console.log('No migration files found.');
    return;
  }

  console.log(lines.join('\n'));
}

async function run(): Promise<void> {
  const { command, rollbackAll } = parseCommand(process.argv);
  const env = validateEnv(process.env);
  const isProduction = env.NODE_ENV === 'production';
  const dialect = asDialect(env.DB_DIALECT);
  const useSsl = asBool(env.DB_SSL, isProduction);
  const rejectUnauthorized = asBool(
    env.DB_SSL_REJECT_UNAUTHORIZED,
    isProduction,
  );
  const connectTimeout = asPositiveInt(env.DB_CONNECT_TIMEOUT, 15000);
  const requestTimeout = asPositiveInt(env.DB_REQUEST_TIMEOUT, 15000);

  const sequelize = new Sequelize({
    dialect,
    host: env.DB_HOST,
    port: Number(env.DB_PORT),
    username: env.DB_USER,
    password: env.DB_PASS,
    database: env.DB_NAME,
    logging: false,
    dialectOptions:
      dialect === 'mssql'
        ? {
            options: {
              encrypt: useSsl,
              trustServerCertificate: !rejectUnauthorized,
              connectTimeout,
              requestTimeout,
            },
          }
        : useSsl
          ? {
              ssl: {
                require: true,
                rejectUnauthorized,
              },
            }
          : {},
  });

  try {
    await sequelize.authenticate();
    await ensureMigrationsTable(sequelize);

    const [migrations, executedRows] = await Promise.all([
      loadMigrations(),
      loadExecutedMigrations(sequelize),
    ]);

    if (command === 'status') {
      printStatus(migrations, executedRows);
      return;
    }

    if (command === 'down') {
      await rollbackMigrations(
        sequelize,
        migrations,
        executedRows,
        rollbackAll,
      );
      return;
    }

    await applyPendingMigrations(sequelize, migrations, executedRows);
  } finally {
    await sequelize.close();
  }
}

void run();
