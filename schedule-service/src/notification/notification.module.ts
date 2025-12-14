import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bullmq';
import { NotificationListener } from './notification.listener';
import { CommonModule } from '../common/common.module';

@Module({
  imports: [
    CommonModule,
    BullModule.registerQueue({
      name: 'notification-queue',
      defaultJobOptions: {
        removeOnComplete: 10,
        removeOnFail: 50,
      },
    }),
  ],
  providers: [NotificationListener],
})
export class NotificationModule {}
