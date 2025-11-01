import { ApiProperty } from '@nestjs/swagger';
class mailSentResponse {
  @ApiProperty({
    example: 'john.doe@example.com',
  })
  email: string;

  @ApiProperty({
    example: '2025-11-01T18:33:52.828Z',
  })
  sent_at?: Date;
}

export class SendVerificationResponseDto {
  @ApiProperty({
    example: true,
  })
  status: boolean;

  @ApiProperty({
    example: 'Mail sent successfully',
  })
  message: string;

  @ApiProperty({
    type: mailSentResponse,
  })
  data: mailSentResponse;
}
