import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateScheduleDto } from './dto/create-schedule.dto';
import { EventEmitterService } from '../common/services/event-emitter.service';

@Injectable()
export class ScheduleService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly eventEmitterService: EventEmitterService,
  ) {}

  async create(createScheduleDto: CreateScheduleDto) {
    const { objective, customerId, doctorId, scheduledAt } = createScheduleDto;

    const customer = await this.prisma.customer.findUnique({
      where: { id: customerId },
    });

    if (!customer) {
      throw new NotFoundException(`Customer with ID ${customerId} not found`);
    }

    const doctor = await this.prisma.doctor.findUnique({
      where: { id: doctorId },
    });

    if (!doctor) {
      throw new NotFoundException(`Doctor with ID ${doctorId} not found`);
    }

    const scheduledDateTime = new Date(scheduledAt);

    const overlappingSchedule = await this.prisma.schedule.findFirst({
      where: {
        doctorId,
        scheduledAt: {
          gte: new Date(scheduledDateTime.getTime() - 30 * 60 * 1000),
          lt: new Date(scheduledDateTime.getTime() + 30 * 60 * 1000),
        },
      },
    });

    if (overlappingSchedule) {
      throw new ConflictException(
        'Doctor already has a scheduled consultation at this time',
      );
    }

    const newSchedule = await this.prisma.schedule.create({
      data: {
        objective,
        customerId,
        doctorId,
        scheduledAt: scheduledDateTime,
      },
      include: {
        customer: true,
        doctor: true,
      },
    });

    this.eventEmitterService.emitScheduleCreated({
      customerId: newSchedule.customerId,
      customerEmail: newSchedule.customer.email,
      customerName: newSchedule.customer.name,
      doctorId: newSchedule.doctorId,
      doctorName: newSchedule.doctor.name,
      scheduledAt: newSchedule.scheduledAt,
    });

    return newSchedule;
  }

  async findAll(
    page: number = 1,
    limit: number = 10,
    customerId?: string,
    doctorId?: string,
    dateFrom?: Date,
    dateTo?: Date,
  ) {
    const skip = (page - 1) * limit;
    const where: {
      customerId?: string;
      doctorId?: string;
      scheduledAt?: {
        gte?: Date;
        lte?: Date;
      };
    } = {};

    if (customerId) {
      where.customerId = customerId;
    }

    if (doctorId) {
      where.doctorId = doctorId;
    }

    if (dateFrom || dateTo) {
      where.scheduledAt = {};
      if (dateFrom) {
        where.scheduledAt.gte = dateFrom;
      }
      if (dateTo) {
        where.scheduledAt.lte = dateTo;
      }
    }

    const [schedules, total] = await Promise.all([
      this.prisma.schedule.findMany({
        where,
        skip,
        take: limit,
        orderBy: { scheduledAt: 'asc' },
        include: {
          customer: true,
          doctor: true,
        },
      }),
      this.prisma.schedule.count({ where }),
    ]);

    return {
      schedules,
      total,
      page,
      totalPages: Math.ceil(total / limit),
    };
  }

  async findOne(id: string) {
    const schedule = await this.prisma.schedule.findUnique({
      where: { id },
      include: {
        customer: true,
        doctor: true,
      },
    });

    if (!schedule) {
      throw new NotFoundException(`Schedule with ID ${id} not found`);
    }

    return schedule;
  }

  async remove(id: string) {
    const schedule = await this.prisma.schedule.findUnique({
      where: { id },
      include: {
        customer: true,
        doctor: true,
      },
    });

    if (!schedule) {
      throw new NotFoundException(`Schedule with ID ${id} not found`);
    }

    const deletedSchedule = await this.prisma.schedule.delete({
      where: { id },
      include: {
        customer: true,
        doctor: true,
      },
    });

    this.eventEmitterService.emitScheduleDeleted({
      customerId: deletedSchedule.customerId,
      customerEmail: deletedSchedule.customer.email,
      customerName: deletedSchedule.customer.name,
      doctorId: deletedSchedule.doctorId,
      doctorName: deletedSchedule.doctor.name,
      scheduledAt: deletedSchedule.scheduledAt,
    });

    return deletedSchedule;
  }
}
