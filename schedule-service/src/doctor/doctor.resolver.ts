import { Resolver, Query, Mutation, Args, Int } from '@nestjs/graphql';
import { DoctorService } from './doctor.service';
import { CreateDoctorDto } from './dto/create-doctor.dto';
import { UpdateDoctorDto } from './dto/update-doctor.dto';
import { Doctor } from './graphql/types/doctor.type';
import { DoctorsPagination } from './graphql/types/doctors-pagination.type';
import { UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';

@Resolver(() => Doctor)
@UseGuards(JwtAuthGuard)
export class DoctorResolver {
  constructor(private readonly doctorService: DoctorService) {}

  @Mutation(() => Doctor)
  createDoctor(@Args('createDoctorDto') createDoctorDto: CreateDoctorDto) {
    return this.doctorService.create(createDoctorDto);
  }

  @Query(() => DoctorsPagination, { name: 'doctors' })
  async findAll(
    @Args('page', { type: () => Int, defaultValue: 1 }) page: number,
    @Args('limit', { type: () => Int, defaultValue: 10 }) limit: number,
  ) {
    const result = await this.doctorService.findAll(page, limit);
    return {
      data: result.doctors,
      pagination: {
        page: result.page,
        limit,
        total: result.total,
        totalPages: result.totalPages,
      },
    };
  }

  @Query(() => Doctor, { name: 'doctor' })
  findOne(@Args('id', { type: () => String }) id: string) {
    return this.doctorService.findOne(id);
  }

  @Mutation(() => Doctor)
  updateDoctor(
    @Args('id', { type: () => String }) id: string,
    @Args('updateDoctorDto') updateDoctorDto: UpdateDoctorDto,
  ) {
    return this.doctorService.update(id, updateDoctorDto);
  }

  @Mutation(() => Doctor)
  deleteDoctor(@Args('id', { type: () => String }) id: string) {
    return this.doctorService.remove(id);
  }
}
