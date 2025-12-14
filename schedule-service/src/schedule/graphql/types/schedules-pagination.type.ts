import { ObjectType, Field } from '@nestjs/graphql';
import { Schedule } from './schedule.type';
import { PaginationInfo } from '../../../common/graphql/types/pagination.type';

@ObjectType()
export class SchedulesPagination {
  @Field(() => [Schedule])
  data: Schedule[];

  @Field(() => PaginationInfo)
  pagination: PaginationInfo;
}
