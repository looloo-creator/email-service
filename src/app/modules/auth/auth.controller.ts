import { Body, Controller, Post } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { SendVerificationDto } from './dto/send-verification.dto';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('send-verification')
  sendVerification(@Body() dto: SendVerificationDto) {
    return this.authService.sendVerificationEmail(dto);
  }
}
