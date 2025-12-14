import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Job } from 'bullmq';
import { Logger } from '@nestjs/common';
import { EmailService } from '../email/email.service';

export interface ScheduleNotificationJob {
  type: 'SCHEDULE_CREATED' | 'SCHEDULE_DELETED';
  customerEmail: string;
  customerName: string;
  doctorName: string;
  scheduledAt: Date;
}

@Processor('notification-queue')
export class NotificationProcessor extends WorkerHost {
  private readonly logger = new Logger(NotificationProcessor.name);

  constructor(private readonly emailService: EmailService) {
    super();
  }

  async process(job: Job<ScheduleNotificationJob>) {
    job.updateProgress(10);
    const { type, customerEmail, customerName, doctorName, scheduledAt } = job.data;

    this.logger.log(`Processing ${type} notification for customer: ${customerEmail}`);

    try {
      switch (type) {
        case 'SCHEDULE_CREATED':
          await this.emailService.sendScheduleCreatedEmail(
            customerEmail,
            customerName,
            doctorName,
            scheduledAt,
          );
          break;

        case 'SCHEDULE_DELETED':
          await this.emailService.sendScheduleDeletedEmail(
            customerEmail,
            customerName,
            doctorName,
            scheduledAt,
          );
          break;

        default:
          this.logger.warn(`Unknown notification type: ${type}`);
      }

      this.logger.log(`Successfully processed ${type} notification`);
    } catch (error) {
      this.logger.error(`Failed to process ${type} notification:`, error);
      throw error;
    }
  }
}
