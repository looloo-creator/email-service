import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { Request, Response } from 'express';
import type { LoggerService } from '@nestjs/common';

function sanitizeBody(body: Record<string, unknown>): Record<string, unknown> {
  const redacted = { ...body };
  const sensitiveKeys = [
    'password',
    'pass',
    'token',
    'refresh_token',
    'authorization',
  ];

  for (const key of sensitiveKeys) {
    if (key in redacted) {
      redacted[key] = '[REDACTED]';
    }
  }

  return redacted;
}

@Catch()
export class LoggerExceptionsFilter implements ExceptionFilter {
  constructor(private readonly logger: LoggerService) {}

  catch(exception: unknown, host: ArgumentsHost): void {
    const ctx = host.switchToHttp();
    const request = ctx.getRequest<Request>();
    const response = ctx.getResponse<Response>();

    const status =
      exception instanceof HttpException
        ? exception.getStatus()
        : HttpStatus.INTERNAL_SERVER_ERROR;

    const message =
      exception instanceof Error ? exception.message : 'Unknown error';
    const isHttpException = exception instanceof HttpException;
    const responseMessage =
      isHttpException && status < 500 ? message : 'Internal server error';

    this.logger.error(`Exception caught: ${message}`, {
      method: request.method,
      url: request.url,
      body: sanitizeBody(request.body as Record<string, unknown>),
      query: request.query,
      status,
      stack: exception instanceof Error ? exception.stack : undefined,
    });

    response.status(status).json({
      status,
      message: responseMessage,
      timestamp: new Date().toISOString(),
      path: request.url,
    });
  }
}
