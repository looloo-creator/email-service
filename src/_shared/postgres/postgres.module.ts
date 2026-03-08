import { Global, Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { Dialect } from 'sequelize';

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

@Global()
@Module({
  imports: [
    ConfigModule,
    SequelizeModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => {
        const isProduction = config.get<string>('NODE_ENV') === 'production';
        const dialect = asDialect(config.get<string>('DB_DIALECT'));
        const useSsl = asBool(config.get<string>('DB_SSL'), isProduction);
        const rejectUnauthorized = asBool(
          config.get<string>('DB_SSL_REJECT_UNAUTHORIZED'),
          isProduction,
        );
        const connectTimeout = asPositiveInt(
          config.get<string>('DB_CONNECT_TIMEOUT'),
          15000,
        );
        const requestTimeout = asPositiveInt(
          config.get<string>('DB_REQUEST_TIMEOUT'),
          15000,
        );

        return {
          dialect,
          host: config.get<string>('DB_HOST'),
          port: Number(config.get<string>('DB_PORT')) || 5432,
          username: config.get<string>('DB_USER'),
          password: config.get<string>('DB_PASS'),
          database: config.get<string>('DB_NAME'),
          autoLoadModels: true,
          synchronize: false,
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
        };
      },
    }),
  ],
})
export class PostgresModule {}
