/* eslint-disable @typescript-eslint/unbound-method */
import { Test, TestingModule } from '@nestjs/testing';
import { ScheduleService } from './schedule.service';
import { PrismaService } from '../prisma/prisma.service';
import { EventEmitterService } from '../common/services/event-emitter.service';
import { CreateScheduleDto } from './dto/create-schedule.dto';
import { NotFoundException, ConflictException } from '@nestjs/common';

jest.mock('../prisma/prisma.service');
jest.mock('../common/services/event-emitter.service');

describe('ScheduleService', () => {
  let service: ScheduleService;
  let prisma: PrismaService;
  let eventEmitterService: EventEmitterService;

  const mockCustomer = {
    id: 'customer-id-123',
    name: 'John Doe',
    email: 'john@example.com',
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const mockDoctor = {
    id: 'doctor-id-123',
    name: 'Dr. Smith',
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const mockSchedule = {
    id: 'schedule-id-123',
    objective: 'Regular checkup',
    customerId: 'customer-id-123',
    doctorId: 'doctor-id-123',
    scheduledAt: new Date('2024-01-15T10:00:00Z'),
    createdAt: new Date(),
    updatedAt: new Date(),
    customer: mockCustomer,
    doctor: mockDoctor,
  };

  const mockPrismaService = {
    customer: {
      findUnique: jest.fn(),
    },
    doctor: {
      findUnique: jest.fn(),
    },
    schedule: {
      findFirst: jest.fn(),
      create: jest.fn(),
      findMany: jest.fn(),
      count: jest.fn(),
      findUnique: jest.fn(),
      findUniqueOrThrow: jest.fn(),
      delete: jest.fn(),
    },
  } as any;

  const mockEventEmitterService = {
    emitScheduleCreated: jest.fn(),
    emitScheduleDeleted: jest.fn(),
  } as any;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ScheduleService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
        {
          provide: EventEmitterService,
          useValue: mockEventEmitterService,
        },
      ],
    }).compile();

    service = module.get<ScheduleService>(ScheduleService);
    prisma = module.get<PrismaService>(PrismaService);
    eventEmitterService = module.get<EventEmitterService>(EventEmitterService);

    jest.clearAllMocks();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    const createScheduleDto: CreateScheduleDto = {
      objective: 'Regular checkup',
      customerId: 'customer-id-123',
      doctorId: 'doctor-id-123',
      scheduledAt: new Date('2024-01-15T10:00:00Z'),
    };

    it('should create a new schedule successfully', async () => {
      (mockPrismaService.customer.findUnique as jest.Mock).mockResolvedValue(
        mockCustomer,
      );
      (mockPrismaService.doctor.findUnique as jest.Mock).mockResolvedValue(
        mockDoctor,
      );
      (mockPrismaService.schedule.findFirst as jest.Mock).mockResolvedValue(
        null,
      );
      (mockPrismaService.schedule.create as jest.Mock).mockResolvedValue(
        mockSchedule,
      );

      const result = await service.create(createScheduleDto);

      expect(prisma.customer.findUnique).toHaveBeenCalledWith({
        where: { id: createScheduleDto.customerId },
      });
      expect(prisma.doctor.findUnique).toHaveBeenCalledWith({
        where: { id: createScheduleDto.doctorId },
      });
      expect(prisma.schedule.create).toHaveBeenCalledWith({
        data: {
          objective: createScheduleDto.objective,
          customerId: createScheduleDto.customerId,
          doctorId: createScheduleDto.doctorId,
          scheduledAt: new Date(createScheduleDto.scheduledAt),
        },
        include: {
          customer: true,
          doctor: true,
        },
      });
      expect(eventEmitterService.emitScheduleCreated).toHaveBeenCalledWith({
        customerId: mockCustomer.id,
        customerEmail: mockCustomer.email,
        customerName: mockCustomer.name,
        doctorId: mockDoctor.id,
        doctorName: mockDoctor.name,
        scheduledAt: mockSchedule.scheduledAt,
      });
      expect(result).toEqual(mockSchedule);
    });

    it('should throw NotFoundException if customer not found', async () => {
      (mockPrismaService.customer.findUnique as jest.Mock).mockResolvedValue(
        null,
      );

      await expect(service.create(createScheduleDto)).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should throw NotFoundException if doctor not found', async () => {
      (mockPrismaService.customer.findUnique as jest.Mock).mockResolvedValue(
        mockCustomer,
      );
      (mockPrismaService.doctor.findUnique as jest.Mock).mockResolvedValue(
        null,
      );

      await expect(service.create(createScheduleDto)).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should throw ConflictException if doctor has overlapping schedule', async () => {
      (mockPrismaService.customer.findUnique as jest.Mock).mockResolvedValue(
        mockCustomer,
      );
      (mockPrismaService.doctor.findUnique as jest.Mock).mockResolvedValue(
        mockDoctor,
      );
      (mockPrismaService.schedule.findFirst as jest.Mock).mockResolvedValue(
        mockSchedule,
      );

      await expect(service.create(createScheduleDto)).rejects.toThrow(
        ConflictException,
      );
    });
  });

  describe('findAll', () => {
    it('should return paginated schedules', async () => {
      const mockSchedules = [mockSchedule];
      (mockPrismaService.schedule.findMany as jest.Mock).mockResolvedValue(
        mockSchedules,
      );
      (mockPrismaService.schedule.count as jest.Mock).mockResolvedValue(1);

      const result = await service.findAll(1, 10);

      expect(prisma.schedule.findMany).toHaveBeenCalledWith({
        skip: 0,
        take: 10,
        where: {},
        orderBy: { scheduledAt: 'asc' },
        include: {
          customer: true,
          doctor: true,
        },
      });
      expect(prisma.schedule.count).toHaveBeenCalledWith({
        where: {},
      });
      expect(result).toEqual({
        schedules: mockSchedules,
        total: 1,
        page: 1,
        totalPages: 1,
      });
    });

    it('should filter by customerId when provided', async () => {
      (mockPrismaService.schedule.findMany as jest.Mock).mockResolvedValue([]);
      (mockPrismaService.schedule.count as jest.Mock).mockResolvedValue(0);

      await service.findAll(1, 10, 'customer-id-123');

      expect(prisma.schedule.findMany).toHaveBeenCalledWith({
        skip: 0,
        take: 10,
        where: { customerId: 'customer-id-123' },
        orderBy: { scheduledAt: 'asc' },
        include: {
          customer: true,
          doctor: true,
        },
      });
    });

    it('should filter by doctorId when provided', async () => {
      (mockPrismaService.schedule.findMany as jest.Mock).mockResolvedValue([]);
      (mockPrismaService.schedule.count as jest.Mock).mockResolvedValue(0);

      await service.findAll(1, 10, undefined, 'doctor-id-123');

      expect(prisma.schedule.findMany).toHaveBeenCalledWith({
        skip: 0,
        take: 10,
        where: { doctorId: 'doctor-id-123' },
        orderBy: { scheduledAt: 'asc' },
        include: {
          customer: true,
          doctor: true,
        },
      });
    });
  });

  describe('findOne', () => {
    it('should return a schedule with relations', async () => {
      const scheduleWithRelations = {
        ...mockSchedule,
        customer: mockCustomer,
        doctor: mockDoctor,
      };
      (mockPrismaService.schedule.findUnique as jest.Mock).mockResolvedValue(
        scheduleWithRelations,
      );

      const result = await service.findOne('schedule-id-123');

      expect(prisma.schedule.findUnique).toHaveBeenCalledWith({
        where: { id: 'schedule-id-123' },
        include: {
          customer: true,
          doctor: true,
        },
      });
      expect(result).toEqual(scheduleWithRelations);
    });
  });

  describe('remove', () => {
    it('should delete schedule successfully', async () => {
      const scheduleWithRelations = {
        ...mockSchedule,
        customer: mockCustomer,
        doctor: mockDoctor,
      };
      (mockPrismaService.schedule.findUnique as jest.Mock).mockResolvedValue(
        scheduleWithRelations,
      );
      const deletedScheduleWithRelations = {
        ...mockSchedule,
        customer: mockCustomer,
        doctor: mockDoctor,
      };
      (mockPrismaService.schedule.delete as jest.Mock).mockResolvedValue(
        deletedScheduleWithRelations,
      );

      const result = await service.remove('schedule-id-123');

      expect(prisma.schedule.findUnique).toHaveBeenCalledWith({
        where: { id: 'schedule-id-123' },
        include: {
          customer: true,
          doctor: true,
        },
      });
      expect(prisma.schedule.delete).toHaveBeenCalledWith({
        where: { id: 'schedule-id-123' },
        include: {
          customer: true,
          doctor: true,
        },
      });
      expect(eventEmitterService.emitScheduleDeleted).toHaveBeenCalledWith({
        customerId: mockCustomer.id,
        customerEmail: mockCustomer.email,
        customerName: mockCustomer.name,
        doctorId: mockDoctor.id,
        doctorName: mockDoctor.name,
        scheduledAt: mockSchedule.scheduledAt,
      });
      expect(result).toEqual(deletedScheduleWithRelations);
    });
  });
});
