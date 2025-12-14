import { Test, TestingModule } from '@nestjs/testing';
import { NotificationProcessor } from './notification.processor';
import { EmailService } from '../email/email.service';
import { Job } from 'bullmq';
import { ScheduleNotificationJob } from './notification.processor';

describe('NotificationProcessor', () => {
  let processor: NotificationProcessor;
  let emailService: EmailService;

  const mockEmailService = {
    sendScheduleCreatedEmail: jest.fn(),
    sendScheduleDeletedEmail: jest.fn(),
  } as unknown as jest.Mocked<EmailService>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        NotificationProcessor,
        {
          provide: EmailService,
          useValue: mockEmailService,
        },
      ],
    }).compile();

    processor = module.get<NotificationProcessor>(NotificationProcessor);
    emailService = module.get<EmailService>(EmailService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(processor).toBeDefined();
  });

  describe('process', () => {
    const mockJob = {
      updateProgress: jest.fn(),
      data: {} as ScheduleNotificationJob,
    } as unknown as jest.Mocked<Job<ScheduleNotificationJob>>;

    const scheduleData = {
      type: 'SCHEDULE_CREATED' as const,
      customerEmail: 'test@example.com',
      customerName: 'John Doe',
      doctorName: 'Dr. Smith',
      scheduledAt: new Date('2024-01-15T10:00:00Z'),
    };

    it('should process schedule created notification successfully', async () => {
      mockJob.data = scheduleData;

      await processor.process(mockJob);

      expect(mockJob.updateProgress).toHaveBeenCalledWith(10);
      expect(emailService.sendScheduleCreatedEmail).toHaveBeenCalledWith(
        scheduleData.customerEmail,
        scheduleData.customerName,
        scheduleData.doctorName,
        scheduleData.scheduledAt
      );
    });

    it('should process schedule deleted notification successfully', async () => {
      const deleteScheduleData = {
        ...scheduleData,
        type: 'SCHEDULE_DELETED' as const,
      };
      mockJob.data = deleteScheduleData;

      await processor.process(mockJob);

      expect(mockJob.updateProgress).toHaveBeenCalledWith(10);
      expect(emailService.sendScheduleDeletedEmail).toHaveBeenCalledWith(
        deleteScheduleData.customerEmail,
        deleteScheduleData.customerName,
        deleteScheduleData.doctorName,
        deleteScheduleData.scheduledAt
      );
    });

    it('should handle unknown notification type', async () => {
      const unknownData = {
        ...scheduleData,
        type: 'UNKNOWN_TYPE' as any,
      };
      mockJob.data = unknownData;

      await processor.process(mockJob);

      expect(mockJob.updateProgress).toHaveBeenCalledWith(10);
      expect(emailService.sendScheduleCreatedEmail).not.toHaveBeenCalled();
      expect(emailService.sendScheduleDeletedEmail).not.toHaveBeenCalled();
    });

    it('should handle email service errors', async () => {
      mockJob.data = scheduleData;
      const error = new Error('Email service failed');
      mockEmailService.sendScheduleCreatedEmail.mockRejectedValue(error);

      await expect(processor.process(mockJob)).rejects.toThrow(error);
      expect(mockJob.updateProgress).toHaveBeenCalledWith(10);
      expect(emailService.sendScheduleCreatedEmail).toHaveBeenCalledWith(
        scheduleData.customerEmail,
        scheduleData.customerName,
        scheduleData.doctorName,
        scheduleData.scheduledAt
      );
    });
  });
});