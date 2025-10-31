import { Injectable } from '@nestjs/common';
import { MailerService } from '@nestjs-modules/mailer';
import { MailSendOptions } from './interfaces/mail-options.interface';
import { SentMessageInfo } from 'nodemailer';

@Injectable()
export class MailService {
  constructor(private readonly mailer: MailerService) {}

  async send(options: MailSendOptions): Promise<SentMessageInfo> {
    return this.mailer.sendMail({
      to: options.to,
      subject: options.subject,
      template: options.template,
      context: options.context,
      from: process.env.MAIL_FROM,
    });
  }
}
