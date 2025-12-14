import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateDoctorDto } from './dto/create-doctor.dto';
import { UpdateDoctorDto } from './dto/update-doctor.dto';

@Injectable()
export class DoctorService {
  constructor(private readonly prisma: PrismaService) {}

  async create(createDoctorDto: CreateDoctorDto) {
    const { name } = createDoctorDto;

    return await this.prisma.doctor.create({
      data: {
        name,
      },
    });
  }

  async findAll(page: number = 1, limit: number = 10) {
    const skip = (page - 1) * limit;

    const [doctors, total] = await Promise.all([
      this.prisma.doctor.findMany({
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.doctor.count(),
    ]);

    return {
      doctors,
      total,
      page,
      totalPages: Math.ceil(total / limit),
    };
  }

  async findOne(id: string) {
    const doctor = await this.prisma.doctor.findUnique({
      where: { id },
      include: {
        schedules: {
          include: {
            customer: true,
          },
        },
      },
    });

    if (!doctor) {
      throw new NotFoundException(`Doctor with ID ${id} not found`);
    }

    return doctor;
  }

  async update(id: string, updateDoctorDto: UpdateDoctorDto) {
    const { name } = updateDoctorDto;

    const existingDoctor = await this.prisma.doctor.findUnique({
      where: { id },
    });

    if (!existingDoctor) {
      throw new NotFoundException(`Doctor with ID ${id} not found`);
    }

    return await this.prisma.doctor.update({
      where: { id },
      data: {
        ...(name && { name }),
      },
    });
  }

  async remove(id: string) {
    const doctor = await this.prisma.doctor.findUnique({
      where: { id },
    });

    if (!doctor) {
      throw new NotFoundException(`Doctor with ID ${id} not found`);
    }

    return await this.prisma.doctor.delete({
      where: { id },
    });
  }
}
