import { Injectable, Logger } from '@nestjs/common';
import { MailService } from 'src/_shared/mail/mail.service';
import { SendVerificationRequestDto, SendVerificationResponseDto } from './dto';
import { User } from 'src/app/entities/user.model';
import { InjectModel } from '@nestjs/sequelize';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    private readonly mailService: MailService,
    private readonly configService: ConfigService,
    @InjectModel(User) private readonly userModel: typeof User,
  ) {}

  async sendVerification(
    data: SendVerificationRequestDto,
  ): Promise<SendVerificationResponseDto> {
    const user = await this.userModel.findOne({
      where: { email: data.email },
      attributes: ['username', 'email_token', 'is_email_verified'],
      raw: true,
    });

    if (!user || user.is_email_verified || !user.email_token) {
      return this.genericSuccessResponse(data.email);
    }

    const verifyBaseUrl = this.configService.get<string>(
      'EMAIL_VERIFICATION_URL',
    );
    if (!verifyBaseUrl) {
      this.logger.error('EMAIL_VERIFICATION_URL is not configured');
      return this.genericSuccessResponse(data.email);
    }

    const verifyUrl = `${verifyBaseUrl}/${user.email_token}`;
    await this.mailService.send({
      to: data.email,
      subject: 'Verify your email',
      template: 'app/modules/auth/templates/verification.hbs',
      context: {
        username: user.username,
        verifyUrl,
      },
    });

    return this.genericSuccessResponse(data.email);
  }

  private genericSuccessResponse(email: string): SendVerificationResponseDto {
    return {
      status: true,
      message: 'If the account exists, a verification email has been sent',
      data: {
        email,
        sent_at: new Date(),
      },
    };
  }
}
