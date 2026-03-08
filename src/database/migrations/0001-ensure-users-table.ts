import { DataTypes } from 'sequelize';
import type { MigrationContext, MigrationDefinition } from './migration.interface';

function hasTable(
  tables: Array<string | { tableName?: string; schema?: string }>,
  tableName: string,
): boolean {
  return tables.some((table) => {
    if (typeof table === 'string') {
      return table === tableName;
    }
    return table.tableName === tableName;
  });
}

export const migration: MigrationDefinition = {
  name: '0001-ensure-users-table',
  up: async ({ queryInterface, sequelize, transaction }: MigrationContext) => {
    const tables = (await queryInterface.showAllTables()) as Array<
      string | { tableName?: string; schema?: string }
    >;

    if (hasTable(tables, 'users')) {
      return;
    }

    await queryInterface.createTable(
      'users',
      {
        id: {
          type: DataTypes.INTEGER,
          autoIncrement: true,
          primaryKey: true,
          allowNull: false,
        },
        email: {
          type: DataTypes.STRING,
          allowNull: true,
        },
        username: {
          type: DataTypes.STRING,
          allowNull: true,
        },
        password: {
          type: DataTypes.STRING,
          allowNull: true,
        },
        is_email_verified: {
          type: DataTypes.INTEGER,
          allowNull: false,
          defaultValue: 0,
          comment: '0-Not verified, 1-verified',
        },
        email_verified_at: {
          type: DataTypes.DATE,
          allowNull: true,
        },
        email_token: {
          type: DataTypes.STRING,
          allowNull: true,
        },
        refresh_token: {
          type: DataTypes.STRING,
          allowNull: true,
        },
        status: {
          type: DataTypes.INTEGER,
          allowNull: false,
          defaultValue: 1,
          comment:
            '1-Verification Pending, 2-Active, 3-Blocked, 4-Deactivated By User',
        },
        last_login: {
          type: DataTypes.DATE,
          allowNull: true,
        },
        is_active: {
          type: DataTypes.INTEGER,
          allowNull: false,
          defaultValue: 1,
          comment: '0-Deleted, 1-Active',
        },
      },
      { transaction },
    );

    await queryInterface.addIndex('users', ['email'], {
      name: 'users_email_unique_idx',
      unique: true,
      transaction,
    });
  },
  down: async ({ queryInterface, transaction }: MigrationContext) => {
    const tables = (await queryInterface.showAllTables()) as Array<
      string | { tableName?: string; schema?: string }
    >;

    if (!hasTable(tables, 'users')) {
      return;
    }

    await queryInterface.removeIndex('users', 'users_email_unique_idx', {
      transaction,
    });
    await queryInterface.dropTable('users', { transaction });
  },
};
