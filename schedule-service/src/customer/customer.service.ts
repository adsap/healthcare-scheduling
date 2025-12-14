import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateCustomerDto } from './dto/create-customer.dto';
import { UpdateCustomerDto } from './dto/update-customer.dto';

@Injectable()
export class CustomerService {
  constructor(private readonly prisma: PrismaService) {}

  async create(createCustomerDto: CreateCustomerDto) {
    const { email, name } = createCustomerDto;

    const existingCustomer = await this.prisma.customer.findUnique({
      where: { email },
    });

    if (existingCustomer) {
      throw new ConflictException('Customer with this email already exists');
    }

    return await this.prisma.customer.create({
      data: {
        name,
        email,
      },
    });
  }

  async findAll(page: number = 1, limit: number = 10) {
    const skip = (page - 1) * limit;

    const [customers, total] = await Promise.all([
      this.prisma.customer.findMany({
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.customer.count(),
    ]);

    return {
      customers,
      total,
      page,
      totalPages: Math.ceil(total / limit),
    };
  }

  async findOne(id: string) {
    const customer = await this.prisma.customer.findUnique({
      where: { id },
      include: {
        schedules: true,
      },
    });

    if (!customer) {
      throw new NotFoundException(`Customer with ID ${id} not found`);
    }

    return customer;
  }

  async update(id: string, updateCustomerDto: UpdateCustomerDto) {
    const { email, name } = updateCustomerDto;

    const existingCustomer = await this.prisma.customer.findUnique({
      where: { id },
    });

    if (!existingCustomer) {
      throw new NotFoundException(`Customer with ID ${id} not found`);
    }

    if (email && email !== existingCustomer.email) {
      const emailTaken = await this.prisma.customer.findUnique({
        where: { email },
      });

      if (emailTaken) {
        throw new ConflictException(
          'Email is already taken by another customer',
        );
      }
    }

    return await this.prisma.customer.update({
      where: { id },
      data: {
        ...(name && { name }),
        ...(email && { email }),
      },
    });
  }

  async remove(id: string) {
    const customer = await this.prisma.customer.findUnique({
      where: { id },
    });

    if (!customer) {
      throw new NotFoundException(`Customer with ID ${id} not found`);
    }

    return await this.prisma.customer.delete({
      where: { id },
    });
  }
}
