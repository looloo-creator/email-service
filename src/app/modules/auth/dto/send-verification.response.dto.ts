import { ApiProperty } from '@nestjs/swagger';
class data {
  @ApiProperty({
    example: 'john.doe@example.com',
    description: 'verification link sent email address',
  })
  email: string;

  @ApiProperty({
    example: '2025-11-01T18:33:52.828Z',
    description: 'mail sent time',
  })
  sent_at?: Date;
}

export class SendVerificationResponseDto {
  @ApiProperty({
    example: true,
    description: 'Response Flag',
  })
  status: boolean;

  @ApiProperty({
    example: true,
    description: 'Response Message',
  })
  message: string;

  @ApiProperty({
    example: true,
    description: 'Response Data',
  })
  data: data;
}
