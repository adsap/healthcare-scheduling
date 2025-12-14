/* eslint-disable @typescript-eslint/unbound-method */
import { Test, TestingModule } from '@nestjs/testing';
import { DoctorService } from './doctor.service';
import { PrismaService } from '../prisma/prisma.service';
import { CreateDoctorDto } from './dto/create-doctor.dto';
import { UpdateDoctorDto } from './dto/update-doctor.dto';
import { NotFoundException } from '@nestjs/common';

jest.mock('../prisma/prisma.service');

describe('DoctorService', () => {
  let service: DoctorService;
  let prisma: PrismaService;

  const mockDoctor = {
    id: 'doctor-id-123',
    name: 'Dr. John Smith',
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const mockPrismaService = {
    doctor: {
      findUnique: jest.fn(),
      findMany: jest.fn(),
      count: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
  } as any;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        DoctorService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
      ],
    }).compile();

    service = module.get<DoctorService>(DoctorService);
    prisma = module.get<PrismaService>(PrismaService);

    jest.clearAllMocks();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    const createDoctorDto: CreateDoctorDto = {
      name: 'Dr. John Smith',
    };

    it('should create a new doctor successfully', async () => {
      (mockPrismaService.doctor.create as jest.Mock).mockResolvedValue(
        mockDoctor,
      );

      const result = await service.create(createDoctorDto);

      expect(prisma.doctor.create).toHaveBeenCalledWith({
        data: {
          name: createDoctorDto.name,
        },
      });
      expect(result).toEqual(mockDoctor);
    });
  });

  describe('findAll', () => {
    it('should return paginated doctors', async () => {
      const mockDoctors = [mockDoctor];
      (mockPrismaService.doctor.findMany as jest.Mock).mockResolvedValue(
        mockDoctors,
      );
      (mockPrismaService.doctor.count as jest.Mock).mockResolvedValue(1);

      const result = await service.findAll(1, 10);

      expect(prisma.doctor.findMany).toHaveBeenCalledWith({
        skip: 0,
        take: 10,
        orderBy: { createdAt: 'desc' },
      });
      expect(prisma.doctor.count).toHaveBeenCalled();
      expect(result).toEqual({
        doctors: mockDoctors,
        total: 1,
        page: 1,
        totalPages: 1,
      });
    });

    it('should handle pagination correctly', async () => {
      const mockDoctors = [mockDoctor];
      (mockPrismaService.doctor.findMany as jest.Mock).mockResolvedValue(
        mockDoctors,
      );
      (mockPrismaService.doctor.count as jest.Mock).mockResolvedValue(25);

      const result = await service.findAll(2, 10);

      expect(prisma.doctor.findMany).toHaveBeenCalledWith({
        skip: 10,
        take: 10,
        orderBy: { createdAt: 'desc' },
      });
      expect(result).toEqual({
        doctors: mockDoctors,
        total: 25,
        page: 2,
        totalPages: 3,
      });
    });
  });

  describe('findOne', () => {
    it('should return a doctor with schedules', async () => {
      const doctorWithSchedules = {
        ...mockDoctor,
        schedules: [],
      };
      (mockPrismaService.doctor.findUnique as jest.Mock).mockResolvedValue(
        doctorWithSchedules,
      );

      const result = await service.findOne('doctor-id-123');

      expect(prisma.doctor.findUnique).toHaveBeenCalledWith({
        where: { id: 'doctor-id-123' },
        include: {
          schedules: {
            include: {
              customer: true,
            },
          },
        },
      });
      expect(result).toEqual(doctorWithSchedules);
    });

    it('should throw NotFoundException if doctor not found', async () => {
      (mockPrismaService.doctor.findUnique as jest.Mock).mockResolvedValue(
        null,
      );

      await expect(service.findOne('invalid-id')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('update', () => {
    const updateDoctorDto: UpdateDoctorDto = {
      name: 'Dr. Jane Smith',
    };

    it('should update doctor successfully', async () => {
      const updatedDoctor = { ...mockDoctor, ...updateDoctorDto };
      (mockPrismaService.doctor.findUnique as jest.Mock).mockResolvedValue(
        mockDoctor,
      );
      (mockPrismaService.doctor.update as jest.Mock).mockResolvedValue(
        updatedDoctor,
      );

      const result = await service.update('doctor-id-123', updateDoctorDto);

      expect(prisma.doctor.findUnique).toHaveBeenCalledWith({
        where: { id: 'doctor-id-123' },
      });
      expect(prisma.doctor.update).toHaveBeenCalledWith({
        where: { id: 'doctor-id-123' },
        data: {
          name: updateDoctorDto.name,
        },
      });
      expect(result).toEqual(updatedDoctor);
    });

    it('should update only provided fields', async () => {
      const partialUpdateDto: UpdateDoctorDto = {};
      const updatedDoctor = mockDoctor;
      (mockPrismaService.doctor.findUnique as jest.Mock).mockResolvedValue(
        mockDoctor,
      );
      (mockPrismaService.doctor.update as jest.Mock).mockResolvedValue(
        updatedDoctor,
      );

      const result = await service.update('doctor-id-123', partialUpdateDto);

      expect(prisma.doctor.update).toHaveBeenCalledWith({
        where: { id: 'doctor-id-123' },
        data: {},
      });
      expect(result).toEqual(updatedDoctor);
    });

    it('should throw NotFoundException if doctor not found', async () => {
      (mockPrismaService.doctor.findUnique as jest.Mock).mockResolvedValue(
        null,
      );

      await expect(
        service.update('invalid-id', updateDoctorDto),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('remove', () => {
    it('should delete doctor successfully', async () => {
      (mockPrismaService.doctor.findUnique as jest.Mock).mockResolvedValue(
        mockDoctor,
      );
      (mockPrismaService.doctor.delete as jest.Mock).mockResolvedValue(
        mockDoctor,
      );

      const result = await service.remove('doctor-id-123');

      expect(prisma.doctor.findUnique).toHaveBeenCalledWith({
        where: { id: 'doctor-id-123' },
      });
      expect(prisma.doctor.delete).toHaveBeenCalledWith({
        where: { id: 'doctor-id-123' },
      });
      expect(result).toEqual(mockDoctor);
    });

    it('should throw NotFoundException if doctor not found', async () => {
      (mockPrismaService.doctor.findUnique as jest.Mock).mockResolvedValue(
        null,
      );

      await expect(service.remove('invalid-id')).rejects.toThrow(
        NotFoundException,
      );
    });
  });
});
