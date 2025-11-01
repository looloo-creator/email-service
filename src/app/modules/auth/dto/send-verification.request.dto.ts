import { ApiProperty } from '@nestjs/swagger';
import { IsEmail } from 'class-validator';

export class SendVerificationRequestDto {
  @ApiProperty({
    example: 'john.doe@example.com',
    description: 'User email address to send verification link',
  })
  @IsEmail()
  email: string;
}
