import { Injectable } from '@nestjs/common';
import { createLogger, format, transports, Logger } from 'winston';

@Injectable()
export class LoggerService {
  private readonly logger: Logger;

  constructor() {
    this.logger = createLogger({
      level: 'info',
      format: format.combine(format.timestamp(), format.json()),
      transports: [new transports.Console()],
    });
  }

  log(message: string, data?: unknown): void {
    this.logger.info(message, data);
  }

  error(message: string, data?: unknown): void {
    this.logger.error(message, data);
  }

  warn(message: string, data?: unknown): void {
    this.logger.warn(message, data);
  }
}
