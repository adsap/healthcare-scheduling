import { Injectable, Logger } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { InjectQueue } from '@nestjs/bullmq';
import { type Queue } from 'bullmq';

@Injectable()
export class NotificationListener {
  private readonly logger = new Logger(NotificationListener.name);

  constructor(
    @InjectQueue('notification-queue') private notificationQueue: Queue,
  ) {}

  @OnEvent('schedule.created')
  async handleScheduleCreated(data: {
    customerId: string;
    customerEmail: string;
    customerName: string;
    doctorId: string;
    doctorName: string;
    scheduledAt: Date;
  }) {
    this.logger.log(
      `Schedule created event received, sending notification to ${data.customerEmail}`,
    );

    try {
      await this.notificationQueue.add('send-notification', {
        type: 'SCHEDULE_CREATED',
        customerEmail: data.customerEmail,
        customerName: data.customerName,
        doctorName: data.doctorName,
        scheduledAt: data.scheduledAt,
      });
    } catch (error) {
      this.logger.error(`Failed to send notification: ${error.message}`, error);
    }
  }

  @OnEvent('schedule.deleted')
  async handleScheduleDeleted(data: {
    customerId: string;
    customerEmail: string;
    customerName: string;
    doctorId: string;
    doctorName: string;
    scheduledAt: Date;
  }) {
    this.logger.log(
      `Schedule deleted event received, sending notification to ${data.customerEmail}`,
    );

    try {
      await this.notificationQueue.add('send-notification', {
        type: 'SCHEDULE_DELETED',
        customerEmail: data.customerEmail,
        customerName: data.customerName,
        doctorName: data.doctorName,
        scheduledAt: data.scheduledAt,
      });
    } catch (error) {
      this.logger.error(`Failed to send notification: ${error.message}`, error);
    }
  }
}
