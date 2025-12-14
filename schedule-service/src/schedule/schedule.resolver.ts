import { Resolver, Query, Mutation, Args, Int } from '@nestjs/graphql';
import { ScheduleService } from './schedule.service';
import { CreateScheduleDto } from './dto/create-schedule.dto';
import { Schedule } from './graphql/types/schedule.type';
import { SchedulesPagination } from './graphql/types/schedules-pagination.type';
import { UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';

@Resolver(() => Schedule)
@UseGuards(JwtAuthGuard)
export class ScheduleResolver {
  constructor(private readonly scheduleService: ScheduleService) {}

  @Mutation(() => Schedule)
  createSchedule(
    @Args('createScheduleDto') createScheduleDto: CreateScheduleDto,
  ) {
    return this.scheduleService.create(createScheduleDto);
  }

  @Query(() => SchedulesPagination, { name: 'schedules' })
  async findAll(
    @Args('page', { type: () => Int, defaultValue: 1 }) page: number,
    @Args('limit', { type: () => Int, defaultValue: 10 }) limit: number,
    @Args('customerId', { type: () => String, nullable: true })
    customerId?: string,
    @Args('doctorId', { type: () => String, nullable: true }) doctorId?: string,
    @Args('dateFrom', { type: () => Date, nullable: true }) dateFrom?: Date,
    @Args('dateTo', { type: () => Date, nullable: true }) dateTo?: Date,
  ) {
    const result = await this.scheduleService.findAll(
      page,
      limit,
      customerId,
      doctorId,
      dateFrom,
      dateTo,
    );
    return {
      data: result.schedules,
      pagination: {
        page: result.page,
        limit,
        total: result.total,
        totalPages: result.totalPages,
      },
    };
  }

  @Query(() => Schedule, { name: 'schedule' })
  findOne(@Args('id', { type: () => String }) id: string) {
    return this.scheduleService.findOne(id);
  }

  @Mutation(() => Schedule)
  deleteSchedule(@Args('id', { type: () => String }) id: string) {
    return this.scheduleService.remove(id);
  }
}
