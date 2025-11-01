import { Body, Controller, Post } from '@nestjs/common';
import { ApiBody, ApiOperation, ApiTags } from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { SendVerificationRequestDto } from './dto';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('send-verification')
  @ApiOperation({
    summary: 'Send email verification link to user',
    description: `Sends a verification email to the provided address with a token embedded in the URL.`,
  })
  @ApiBody({
    type: SendVerificationRequestDto,
  })
  async sendVerification(@Body() body: SendVerificationRequestDto) {
    const sendMailRequest = await this.authService.formSendmailRequest(body);
    return await this.authService.sendVerificationEmail(sendMailRequest);
  }
}
