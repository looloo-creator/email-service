import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { MailModule } from './_shared/mail/mail.module';
import { AuthModule } from './app/modules/auth/auth.module';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { LoggerModule } from './_shared/logger/logger.module';
import { PostgresModule } from './_shared/postgres/postgres.module';
import { validateEnv } from './config/env.validation';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true, validate: validateEnv }),
    MailModule,
    AuthModule,
    PostgresModule,
    LoggerModule,
  ],
  providers: [AppService],
  controllers: [AppController],
})
export class AppModule {}
