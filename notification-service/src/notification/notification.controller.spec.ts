import { Test, TestingModule } from '@nestjs/testing';
import { NotificationController } from './notification.controller';
import { Queue } from 'bullmq';
import { ScheduleNotificationDto } from './notification.types';

describe('NotificationController', () => {
  let controller: NotificationController;
  let notificationQueue: Queue;

  const mockNotificationQueue = {
    add: jest.fn(),
  } as unknown as jest.Mocked<Queue>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [NotificationController],
      providers: [
        {
          provide: 'BullQueue_notification-queue',
          useValue: mockNotificationQueue,
        },
      ],
    }).compile();

    controller = module.get<NotificationController>(NotificationController);
    notificationQueue = module.get<Queue>('BullQueue_notification-queue');
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('sendNotification', () => {
    const notificationData: ScheduleNotificationDto = {
      type: 'SCHEDULE_CREATED',
      customerEmail: 'test@example.com',
      customerName: 'John Doe',
      doctorName: 'Dr. Smith',
      scheduledAt: new Date('2024-01-15T10:00:00Z'),
    };

    it('should queue a notification successfully', async () => {
      const mockJobId = 'test-job-id-123';
      mockNotificationQueue.add.mockResolvedValue({ id: mockJobId } as any);

      const result = await controller.sendNotification(notificationData);

      expect(mockNotificationQueue.add).toHaveBeenCalledWith('send-notification', notificationData);
      expect(result).toEqual({
        success: true,
        jobId: mockJobId,
        message: 'Notification queued successfully',
      });
    });

    it('should queue a schedule deleted notification', async () => {
      const deleteNotificationData: ScheduleNotificationDto = {
        ...notificationData,
        type: 'SCHEDULE_DELETED',
      };

      const mockJobId = 'delete-job-id-456';
      mockNotificationQueue.add.mockResolvedValue({ id: mockJobId } as any);

      const result = await controller.sendNotification(deleteNotificationData);

      expect(mockNotificationQueue.add).toHaveBeenCalledWith('send-notification', deleteNotificationData);
      expect(result).toEqual({
        success: true,
        jobId: mockJobId,
        message: 'Notification queued successfully',
      });
    });

    it('should handle queue errors gracefully', async () => {
      const errorMessage = 'Queue connection failed';
      mockNotificationQueue.add.mockRejectedValue(new Error(errorMessage));

      await expect(controller.sendNotification(notificationData)).rejects.toThrow(errorMessage);
      expect(mockNotificationQueue.add).toHaveBeenCalledWith('send-notification', notificationData);
    });
  });
});