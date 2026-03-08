import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { User } from 'src/app/entities/user.model';
import { SequelizeModule } from '@nestjs/sequelize';
import { AuthKafkaConsumer } from './auth.kafka.consumer';

@Module({
  imports: [SequelizeModule.forFeature([User])],
  providers: [AuthService],
  controllers: [AuthController, AuthKafkaConsumer],
})
export class AuthModule {}
