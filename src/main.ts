import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AppModule } from './app.module';
import { LoggerService, ValidationPipe } from '@nestjs/common';
import { WINSTON_MODULE_NEST_PROVIDER } from 'nest-winston';
import morgan from 'morgan';
import { LoggerExceptionsFilter } from './_shared/logger/logger-exceptions.filter';
import { ConfigService } from '@nestjs/config';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';

function parseKafkaBrokers(value: string | undefined): string[] {
  if (!value) {
    return ['localhost:9092'];
  }

  const brokers = value
    .split(',')
    .map((broker) => broker.trim())
    .filter(Boolean);

  return brokers.length > 0 ? brokers : ['localhost:9092'];
}

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  const logger = app.get<LoggerService>(WINSTON_MODULE_NEST_PROVIDER);
  const configService = app.get(ConfigService);

  const winstonStream: morgan.StreamOptions = {
    write: (message: string) => {
      logger.log(message.trim());
    },
  };
  app.use(morgan('combined', { stream: winstonStream }));
  app.useLogger(logger);

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

  const kafkaBrokers = parseKafkaBrokers(
    configService.get<string>('KAFKA_BROKERS'),
  );
  const kafkaClientId =
    configService.get<string>('KAFKA_CLIENT_ID') ?? 'email-service';
  const kafkaGroupId =
    configService.get<string>('KAFKA_GROUP_ID') ?? 'email-service-consumer';

  app.connectMicroservice<MicroserviceOptions>({
    transport: Transport.KAFKA,
    options: {
      client: {
        clientId: kafkaClientId,
        brokers: kafkaBrokers,
      },
      consumer: {
        groupId: kafkaGroupId,
      },
    },
  });
  await app.startAllMicroservices();
  logger.log(
    `Kafka consumer started for brokers: ${kafkaBrokers.join(', ')} (group: ${kafkaGroupId})`,
  );

  const port = Number(configService.get<string>('PORT')) || 3000;
  await app.listen(port);
  logger.log(`Server started on port ${port}`);
}
void bootstrap();
