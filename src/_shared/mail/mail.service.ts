import { Injectable } from '@nestjs/common';
import { MailerService } from '@nestjs-modules/mailer';
import { MailSendOptions } from './interfaces/mail-options.interface';

@Injectable()
export class MailService {
  constructor(private readonly mailer: MailerService) {}

  async send(options: MailSendOptions) {
    return this.mailer.sendMail({
      to: options.to,
      subject: options.subject,
      template: options.template,
      context: options.context,
      from: process.env.MAIL_FROM,
    });
  }
}
