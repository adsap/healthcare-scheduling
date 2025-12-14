import { Controller, Post, Body, Logger } from '@nestjs/common';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';
import { ScheduleNotificationDto } from './notification.types';


@Controller('notifications')
export class NotificationController {
  private readonly logger = new Logger(NotificationController.name);

  constructor(
    @InjectQueue('notification-queue') private notificationQueue: Queue,
  ) {}

  @Post()
  async sendNotification(@Body() notificationData: ScheduleNotificationDto) {
    this.logger.log(`Received notification request: ${notificationData.type} for ${notificationData.customerEmail}`);

    const job = await this.notificationQueue.add('send-notification', notificationData);

    return {
      success: true,
      jobId: job.id,
      message: 'Notification queued successfully',
    };
  }
}
