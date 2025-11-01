import { HttpException, Injectable } from '@nestjs/common';
import { MailService } from 'src/_shared/mail/mail.service';
import {
  SendMailRequestDto,
  SendVerificationRequestDto,
  SendVerificationResponseDto,
} from './dto';
import { User } from 'src/app/entities/user.model';
import { InjectModel } from '@nestjs/sequelize';

@Injectable()
export class AuthService {
  constructor(
    private readonly mailService: MailService,
    @InjectModel(User) private readonly userModel: typeof User,
  ) {}

  async formSendmailRequest(
    data: SendVerificationRequestDto,
  ): Promise<SendMailRequestDto> {
    const user = await this.userModel.findOne({
      where: { email: data.email },
      attributes: ['username', 'email_token', 'is_email_verified'],
      raw: true,
    });

    if (!user) {
      throw new HttpException('User not found', 404);
    }
    if (user.is_email_verified) {
      console.log('101');
      throw new HttpException('Account already verified', 400);
    }

    const { username, email_token: token } = user;
    return {
      email: data.email,
      username,
      token,
    };
  }

  async sendVerificationEmail(
    data: SendMailRequestDto,
  ): Promise<SendVerificationResponseDto> {
    await this.mailService.send({
      to: data.email,
      subject: 'Verify your email',
      template: 'app/modules/auth/templates/verification.hbs',
      context: {
        username: data.username,
        verifyUrl: `${process.env.EMAIL_VERIFICATION_URL}?token=${data.token}`,
      },
    });
    return {
      status: true,
      message: 'Mail sent successfully',
      data: {
        email: data.email,
        sent_at: new Date(),
      },
    };
  }
}
