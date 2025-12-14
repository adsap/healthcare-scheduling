import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios from 'axios';

interface BrevoEmailPayload {
  sender: {
    name: string;
    email: string;
  };
  to: Array<{
    email: string;
    name: string;
  }>;
  subject: string;
  htmlContent: string;
}

@Injectable()
export class EmailService {
  private readonly logger = new Logger(EmailService.name);
  private readonly apiKey: string;
  private readonly apiUrl = 'https://api.brevo.com/v3/smtp/email';
  private readonly senderName: string;
  private readonly senderEmail: string;

  constructor(private configService: ConfigService) {
    this.apiKey = this.configService.get<string>('brevo.apiKey');
    this.senderName = 'Healthcare Scheduling';
    this.senderEmail = this.configService.get<string>('brevo.senderEmail');

    if (!this.apiKey) {
      this.logger.error('Brevo API key is not configured');
    }
  }

  async sendScheduleCreatedEmail(customerEmail: string, customerName: string, doctorName: string, scheduledAt: Date): Promise<void> {
    try {
      const payload: BrevoEmailPayload = {
        sender: {
          name: this.senderName,
          email: this.senderEmail,
        },
        to: [
          {
            email: customerEmail,
            name: customerName,
          },
        ],
        subject: 'Appointment Scheduled Successfully',
        htmlContent: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
            <h2>Appointment Scheduled Successfully</h2>
            <p>Dear ${customerName},</p>
            <p>Your appointment has been scheduled with Dr. ${doctorName}.</p>
            <div>
              <p><strong>Doctor:</strong> Dr. ${doctorName}</p>
              <p><strong>Date & Time:</strong> ${scheduledAt.toLocaleString()}</p>
            </div>
            <p>Please arrive 10 minutes before your scheduled time.</p>
            <p>Thank you for choosing our healthcare service!</p>
          </div>
        `,
      };

      await axios.post(this.apiUrl, payload, {
        headers: {
          'api-key': this.apiKey,
          'Content-Type': 'application/json',
        },
      });

      this.logger.log(`Schedule created email sent to ${customerEmail} via Brevo`);
    } catch (error) {
      this.logger.error(`Failed to send schedule created email to ${customerEmail}:`, error);
      throw error;
    }
  }

  async sendScheduleDeletedEmail(customerEmail: string, customerName: string, doctorName: string, scheduledAt: Date): Promise<void> {
    try {
      const payload: BrevoEmailPayload = {
        sender: {
          name: this.senderName,
          email: this.senderEmail,
        },
        to: [
          {
            email: customerEmail,
            name: customerName,
          },
        ],
        subject: 'Appointment Cancelled',
        htmlContent: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
            <h2>Appointment Cancelled</h2>
            <p>Dear ${customerName},</p>
            <p>Your appointment with Dr. ${doctorName} has been cancelled.</p>
            <div>
              <p><strong>Doctor:</strong> Dr. ${doctorName}</p>
              <p><strong>Originally Scheduled:</strong> ${scheduledAt.toLocaleString()}</p>
            </div>
            <p>If you didn't request this cancellation, please contact our support team immediately.</p>
            <p>Thank you for your understanding!</p>
          </div>
        `,
      };

      await axios.post(this.apiUrl, payload, {
        headers: {
          'api-key': this.apiKey,
          'Content-Type': 'application/json',
        },
      });

      this.logger.log(`Schedule deleted email sent to ${customerEmail} via Brevo`);
    } catch (error) {
      this.logger.error(`Failed to send schedule deleted email to ${customerEmail}:`, error);
      throw error;
    }
  }
}
