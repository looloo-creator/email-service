import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsString } from 'class-validator';

export class SendMailRequestDto {
  @ApiProperty({
    example: 'john.doe@example.com',
    description: 'User email address to send verification link',
  })
  @IsEmail()
  email: string;

  @ApiProperty({
    example: 'John Doe',
    description: 'Name of the user to personalize the email template',
  })
  @IsString()
  @IsNotEmpty()
  username: string;

  @ApiProperty({
    example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
    description: 'Verification token that will be embedded in email link',
  })
  @IsString()
  @IsNotEmpty()
  token: string;
}
