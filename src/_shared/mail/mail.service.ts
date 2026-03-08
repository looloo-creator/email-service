import { Injectable } from '@nestjs/common';
import { MailerService } from '@nestjs-modules/mailer';
import { MailSendOptions } from './interfaces/mail-options.interface';
import { SentMessageInfo } from 'nodemailer';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class MailService {
  constructor(
    private readonly mailer: MailerService,
    private readonly configService: ConfigService,
  ) {}

  async send(options: MailSendOptions): Promise<SentMessageInfo> {
    return this.mailer.sendMail({
      to: options.to,
      subject: options.subject,
      template: options.template,
      context: options.context,
      from: this.configService.get<string>('MAIL_FROM'),
    });
  }
}
