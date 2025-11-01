import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { MailModule } from './_shared/mail/mail.module';
import { AuthModule } from './app/modules/auth/auth.module';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { MysqlModule } from './_shared/mysql/mysql.module';
import { LoggerModule } from './_shared/logger/logger.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    MailModule,
    AuthModule,
    MysqlModule,
    LoggerModule,
  ],
  providers: [AppService],
  controllers: [AppController],
})
export class AppModule {}
