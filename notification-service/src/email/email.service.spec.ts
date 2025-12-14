import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import { EmailService } from './email.service';
import axios from 'axios';

jest.mock('axios');
const mockedAxios = axios as jest.Mocked<typeof axios>;

describe('EmailService', () => {
  let service: EmailService;
  let configService: ConfigService;

  const mockConfigService = {
    get: jest.fn((key: string) => {
      const configMap: Record<string, string> = {
        'brevo.apiKey': 'test-api-key',
        'brevo.senderEmail': 'sender@example.com',
      };
      return configMap[key];
    }),
  } as unknown as jest.Mocked<ConfigService>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        EmailService,
        {
          provide: ConfigService,
          useValue: mockConfigService,
        },
      ],
    }).compile();

    service = module.get<EmailService>(EmailService);
    configService = module.get<ConfigService>(ConfigService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should initialize with correct configuration', () => {
    expect(configService.get).toHaveBeenCalledWith('brevo.apiKey');
    expect(configService.get).toHaveBeenCalledWith('brevo.senderEmail');
  });

  describe('sendScheduleCreatedEmail', () => {
    const testData = {
      customerEmail: 'customer@example.com',
      customerName: 'John Doe',
      doctorName: 'Dr. Smith',
      scheduledAt: new Date('2024-01-15T10:00:00Z'),
    };

    it('should send schedule created email successfully', async () => {
      mockedAxios.post.mockResolvedValue({
        status: 201,
        statusText: 'Created',
        headers: {},
        config: {} as any,
        data: {}
      });

      await service.sendScheduleCreatedEmail(
        testData.customerEmail,
        testData.customerName,
        testData.doctorName,
        testData.scheduledAt
      );

      expect(mockedAxios.post).toHaveBeenCalledWith(
        'https://api.brevo.com/v3/smtp/email',
        expect.objectContaining({
          sender: {
            name: 'Healthcare Scheduling',
            email: 'sender@example.com',
          },
          to: [
            {
              email: testData.customerEmail,
              name: testData.customerName,
            },
          ],
          subject: 'Appointment Scheduled Successfully',
          htmlContent: expect.stringContaining('Appointment Scheduled Successfully'),
        }),
        {
          headers: {
            'api-key': 'test-api-key',
            'Content-Type': 'application/json',
          },
        }
      );
    });

    it('should include correct data in email content', async () => {
      mockedAxios.post.mockResolvedValue({
        status: 201,
        statusText: 'Created',
        headers: {},
        config: {} as any,
        data: {}
      });

      await service.sendScheduleCreatedEmail(
        testData.customerEmail,
        testData.customerName,
        testData.doctorName,
        testData.scheduledAt
      );

      const callArgs = mockedAxios.post.mock.calls[0];
      const emailContent = (callArgs[1] as any).htmlContent;

      expect(emailContent).toContain(testData.customerName);
      expect(emailContent).toContain(testData.doctorName);
      expect(emailContent).toContain('Dr. Smith');
      expect(emailContent).toContain(testData.scheduledAt.toLocaleString());
    });

    it('should handle API errors', async () => {
      const error = {
        response: {
          data: { message: 'Invalid API key' },
        },
      };
      mockedAxios.post.mockRejectedValue(error);

      const promise = service.sendScheduleCreatedEmail(
        testData.customerEmail,
        testData.customerName,
        testData.doctorName,
        testData.scheduledAt
      );

      await expect(promise).rejects.toEqual(error);
    });
  });

  describe('sendScheduleDeletedEmail', () => {
    const testData = {
      customerEmail: 'customer@example.com',
      customerName: 'John Doe',
      doctorName: 'Dr. Smith',
      scheduledAt: new Date('2024-01-15T10:00:00Z'),
    };

    it('should send schedule deleted email successfully', async () => {
      mockedAxios.post.mockResolvedValue({
        status: 201,
        statusText: 'Created',
        headers: {},
        config: {} as any,
        data: {}
      });

      await service.sendScheduleDeletedEmail(
        testData.customerEmail,
        testData.customerName,
        testData.doctorName,
        testData.scheduledAt
      );

      expect(mockedAxios.post).toHaveBeenCalledWith(
        'https://api.brevo.com/v3/smtp/email',
        expect.objectContaining({
          sender: {
            name: 'Healthcare Scheduling',
            email: 'sender@example.com',
          },
          to: [
            {
              email: testData.customerEmail,
              name: testData.customerName,
            },
          ],
          subject: 'Appointment Cancelled',
          htmlContent: expect.stringContaining('Appointment Cancelled'),
        }),
        {
          headers: {
            'api-key': 'test-api-key',
            'Content-Type': 'application/json',
          },
        }
      );
    });

    it('should include correct cancellation content', async () => {
      mockedAxios.post.mockResolvedValue({
        status: 201,
        statusText: 'Created',
        headers: {},
        config: {} as any,
        data: {}
      });

      await service.sendScheduleDeletedEmail(
        testData.customerEmail,
        testData.customerName,
        testData.doctorName,
        testData.scheduledAt
      );

      const callArgs = mockedAxios.post.mock.calls[0];
      const emailContent = (callArgs[1] as any).htmlContent;

      expect(emailContent).toContain(testData.customerName);
      expect(emailContent).toContain(testData.doctorName);
      expect(emailContent).toContain('Dr. Smith');
      expect(emailContent).toContain(testData.scheduledAt.toLocaleString());
      expect(emailContent).toContain('has been cancelled');
      expect(emailContent).toContain('If you didn\'t request this cancellation');
    });

    it('should handle API errors with axios error', async () => {
      const axiosError = {
        response: {
          data: { message: 'Template not found' },
        },
        isAxiosError: true,
      };
      mockedAxios.post.mockRejectedValue(axiosError);
      
      const promise = service.sendScheduleDeletedEmail(
        testData.customerEmail,
        testData.customerName,
        testData.doctorName,
        testData.scheduledAt
      );

      await expect(promise).rejects.toEqual(axiosError);
    });
  });
});