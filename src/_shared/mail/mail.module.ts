import { Global, Module } from '@nestjs/common';
import { MailerModule } from '@nestjs-modules/mailer';
import { HandlebarsAdapter } from '@nestjs-modules/mailer/dist/adapters/handlebars.adapter';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MailService } from './mail.service';
import { join } from 'path';
import { existsSync } from 'fs';

function asBool(value: string | undefined, fallback: boolean): boolean {
  if (value === undefined) {
    return fallback;
  }
  return value === 'true' || value === '1';
}

@Global()
@Module({
  imports: [
    ConfigModule,
    MailerModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => {
        const isProduction = config.get<string>('NODE_ENV') === 'production';
        const rejectUnauthorized = asBool(
          config.get<string>('MAIL_TLS_REJECT_UNAUTHORIZED'),
          isProduction,
        );
        const srcRoot = join(process.cwd(), 'src');
        const distRoot = join(process.cwd(), 'dist');
        const distTemplateDir = join(distRoot, 'app', 'modules', 'auth', 'templates');
        const templateRoot = existsSync(distTemplateDir) ? distRoot : srcRoot;

        return {
          transport: {
            host: config.get<string>('MAIL_HOST'),
            port: Number(config.get<string>('MAIL_PORT')),
            secure: false,
            auth: {
              user: config.get<string>('MAIL_USER'),
              pass: config.get<string>('MAIL_PASS'),
            },
            tls: {
              rejectUnauthorized,
            },
          },
          defaults: {
            from: `"Looloo" <${config.get<string>('MAIL_FROM')}>`,
          },
          template: {
            dir: templateRoot,
            adapter: new HandlebarsAdapter(),
          },
        };
      },
    }),
  ],
  providers: [MailService],
  exports: [MailService],
})
export class MailModule {}
