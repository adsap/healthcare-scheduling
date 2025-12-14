/* eslint-disable @typescript-eslint/unbound-method */
import { Test, TestingModule } from '@nestjs/testing';
import { CustomerService } from './customer.service';
import { PrismaService } from '../prisma/prisma.service';
import { CreateCustomerDto } from './dto/create-customer.dto';
import { UpdateCustomerDto } from './dto/update-customer.dto';
import { NotFoundException, ConflictException } from '@nestjs/common';

jest.mock('../prisma/prisma.service');

describe('CustomerService', () => {
  let service: CustomerService;
  let prisma: PrismaService;

  const mockCustomer = {
    id: 'customer-id-123',
    name: 'John Doe',
    email: 'john@example.com',
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const mockPrismaService = {
    customer: {
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
        CustomerService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
      ],
    }).compile();

    service = module.get<CustomerService>(CustomerService);
    prisma = module.get<PrismaService>(PrismaService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    const createCustomerDto: CreateCustomerDto = {
      name: 'John Doe',
      email: 'john@example.com',
    };

    it('should create a new customer successfully', async () => {
      (mockPrismaService.customer.findUnique as jest.Mock).mockResolvedValue(
        null,
      );
      (mockPrismaService.customer.create as jest.Mock).mockResolvedValue(
        mockCustomer,
      );

      const result = await service.create(createCustomerDto);

      expect(prisma.customer.findUnique).toHaveBeenCalledWith({
        where: { email: createCustomerDto.email },
      });
      expect(prisma.customer.create).toHaveBeenCalledWith({
        data: {
          name: createCustomerDto.name,
          email: createCustomerDto.email,
        },
      });
      expect(result).toEqual(mockCustomer);
    });

    it('should throw ConflictException if customer already exists', async () => {
      (mockPrismaService.customer.findUnique as jest.Mock).mockResolvedValue(
        mockCustomer,
      );

      await expect(service.create(createCustomerDto)).rejects.toThrow(
        ConflictException,
      );
    });
  });

  describe('findAll', () => {
    it('should return paginated customers', async () => {
      const mockCustomers = [mockCustomer];
      (mockPrismaService.customer.findMany as jest.Mock).mockResolvedValue(
        mockCustomers,
      );
      (mockPrismaService.customer.count as jest.Mock).mockResolvedValue(1);

      const result = await service.findAll(1, 10);

      expect(prisma.customer.findMany).toHaveBeenCalledWith({
        skip: 0,
        take: 10,
        orderBy: { createdAt: 'desc' },
      });
      expect(prisma.customer.count).toHaveBeenCalled();
      expect(result).toEqual({
        customers: mockCustomers,
        total: 1,
        page: 1,
        totalPages: 1,
      });
    });
  });

  describe('findOne', () => {
    it('should return a customer with schedules', async () => {
      const customerWithSchedules = {
        ...mockCustomer,
        schedules: [],
      };
      (mockPrismaService.customer.findUnique as jest.Mock).mockResolvedValue(
        customerWithSchedules,
      );

      const result = await service.findOne('customer-id-123');

      expect(prisma.customer.findUnique).toHaveBeenCalledWith({
        where: { id: 'customer-id-123' },
        include: {
          schedules: true,
        },
      });
      expect(result).toEqual(customerWithSchedules);
    });

    it('should throw NotFoundException if customer not found', async () => {
      (mockPrismaService.customer.findUnique as jest.Mock).mockResolvedValue(
        null,
      );

      await expect(service.findOne('invalid-id')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('update', () => {
    const updateCustomerDto: UpdateCustomerDto = {
      name: 'Jane Doe',
      email: 'jane@example.com',
    };

    it('should update customer successfully', async () => {
      (mockPrismaService.customer.findUnique as jest.Mock)
        .mockResolvedValueOnce(mockCustomer) // For finding existing customer
        .mockResolvedValue(null); // For checking if email is taken
      const updatedCustomer = { ...mockCustomer, ...updateCustomerDto };
      (mockPrismaService.customer.update as jest.Mock).mockResolvedValue(
        updatedCustomer,
      );

      const result = await service.update('customer-id-123', updateCustomerDto);

      expect(prisma.customer.update).toHaveBeenCalledWith({
        where: { id: 'customer-id-123' },
        data: updateCustomerDto,
      });
      expect(result).toEqual(updatedCustomer);
    });

    it('should throw NotFoundException if customer not found', async () => {
      (mockPrismaService.customer.findUnique as jest.Mock).mockResolvedValue(
        null,
      );

      await expect(
        service.update('invalid-id', updateCustomerDto),
      ).rejects.toThrow(NotFoundException);
    });

    it('should throw ConflictException if email is already taken', async () => {
      (mockPrismaService.customer.findUnique as jest.Mock)
        .mockResolvedValueOnce(mockCustomer) // For finding existing customer
        .mockResolvedValue({ ...mockCustomer, id: 'different-id' }); // For checking email

      await expect(
        service.update('customer-id-123', updateCustomerDto),
      ).rejects.toThrow(ConflictException);
    });
  });

  describe('remove', () => {
    it('should delete customer successfully', async () => {
      (mockPrismaService.customer.findUnique as jest.Mock).mockResolvedValue(
        mockCustomer,
      );
      (mockPrismaService.customer.delete as jest.Mock).mockResolvedValue(
        mockCustomer,
      );

      const result = await service.remove('customer-id-123');

      expect(prisma.customer.delete).toHaveBeenCalledWith({
        where: { id: 'customer-id-123' },
      });
      expect(result).toEqual(mockCustomer);
    });

    it('should throw NotFoundException if customer not found', async () => {
      (mockPrismaService.customer.findUnique as jest.Mock).mockResolvedValue(
        null,
      );

      await expect(service.remove('invalid-id')).rejects.toThrow(
        NotFoundException,
      );
    });
  });
});
