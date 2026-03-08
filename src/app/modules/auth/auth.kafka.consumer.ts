import { Controller, Logger } from '@nestjs/common';
import { Ctx, EventPattern, KafkaContext, Payload } from '@nestjs/microservices';
import { AuthService } from './auth.service';

type VerificationPayload = {
  email?: string;
};

@Controller()
export class AuthKafkaConsumer {
  private readonly logger = new Logger(AuthKafkaConsumer.name);

  constructor(private readonly authService: AuthService) {}

  @EventPattern('send-verification-link')
  async onSendVerification(
    @Payload() payload: unknown,
    @Ctx() context: KafkaContext,
  ): Promise<void> {
    const value = this.extractValue(payload);
    const email = typeof value.email === 'string' ? value.email : undefined;

    if (!email) {
      this.logger.warn('Skipping send-verification-link event without email');
      return;
    }

    await this.authService.sendVerification({ email });
    this.logger.log(
      `Processed topic=${context.getTopic()} partition=${context.getPartition()} email=${email}`,
    );
  }

  private extractValue(payload: unknown): VerificationPayload {
    if (!payload || typeof payload !== 'object') {
      return {};
    }

    const raw = payload as { value?: unknown } & VerificationPayload;

    if (Buffer.isBuffer(raw.value)) {
      try {
        return JSON.parse(raw.value.toString('utf8')) as VerificationPayload;
      } catch {
        return {};
      }
    }

    if (raw.value && typeof raw.value === 'object') {
      return raw.value as VerificationPayload;
    }

    return raw;
  }
}
