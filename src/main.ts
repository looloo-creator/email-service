import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AppModule } from './app.module';
import { LoggerService, ValidationPipe } from '@nestjs/common';
import { WINSTON_MODULE_NEST_PROVIDER } from 'nest-winston';
import morgan from 'morgan';
import { LoggerExceptionsFilter } from './_shared/logger/logger-exceptions.filter'; // ✅ add this

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  const logger = app.get<LoggerService>(WINSTON_MODULE_NEST_PROVIDER);

  const winstonStream: morgan.StreamOptions = {
    write: (message: string) => {
      logger.log(message.trim());
    },
  };
  app.use(morgan('combined', { stream: winstonStream }));
  app.useLogger(logger);

  // ✅ Global error filter
  app.useGlobalFilters(new LoggerExceptionsFilter(logger));

  const config = new DocumentBuilder()
    .setTitle('Email Service')
    .setVersion('1.0')
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('docs', app, document);

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  await app.listen(process.env.PORT ?? 3000);
  logger.log(`🚀 Server started on port ${process.env.PORT || 3000}`);
}
void bootstrap();
