import { Injectable } from '@nestjs/common';
import { MailService } from 'src/_shared/mail/mail.service';
import { SendVerificationDto } from './dto/send-verification.dto';

@Injectable()
export class AuthService {
  constructor(private readonly mailService: MailService) {}

  sendVerificationEmail(dto: SendVerificationDto) {
    return this.mailService.send({
      to: dto.email,
      subject: 'Verify your email',
      template: 'app/modules/auth/templates/verification.hbs',
      context: {
        username: dto.username,
        verifyUrl: `${process.env.APP_URL}/auth/verify?token=${dto.token}`,
      },
    });
  }
}
