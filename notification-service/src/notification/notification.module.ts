import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bullmq';
import { ConfigService } from '@nestjs/config';
import { EmailService } from '../email/email.service';
import { NotificationProcessor } from './notification.processor';
import { ConfigModule } from '../config/config.module';
import { NotificationController } from './notification.controller';

@Module({
  imports: [
    ConfigModule,
    BullModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        connection: {
          host: configService.get('bull.redis.host'),
          port: configService.get('bull.redis.port'),
        },
      }),
      inject: [ConfigService],
    }),
    BullModule.registerQueue({
      name: 'notification-queue',
      defaultJobOptions: {
        removeOnComplete: 10,
        removeOnFail: 50,
        attempts: 3,
        backoff: {
          type: 'exponential',
          delay: 2000,
        },
      },
    }),
  ],
  controllers: [NotificationController],
  providers: [EmailService, NotificationProcessor],
  exports: [EmailService],
})
export class NotificationModule {}
