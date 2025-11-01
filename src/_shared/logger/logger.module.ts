import { Global, Module } from '@nestjs/common';
import { WinstonModule } from 'nest-winston';
import * as winston from 'winston';
import * as path from 'path';

@Global()
@Module({
  imports: [
    WinstonModule.forRoot({
      transports: [
        new winston.transports.Console({
          level: 'info',
          format: winston.format.combine(
            winston.format.timestamp(),
            winston.format.colorize(),
            winston.format.simple(),
          ),
        }),

        new winston.transports.File({
          filename: path.join(process.cwd(), 'logs', 'app.log'),
          level: 'info',
          format: winston.format.json(),
        }),
      ],
    }),
  ],
  providers: [],
  exports: [WinstonModule],
})
export class LoggerModule {}
