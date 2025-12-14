import { ObjectType, Field } from '@nestjs/graphql';
import { Doctor } from './doctor.type';
import { PaginationInfo } from '../../../common/graphql/types/pagination.type';

@ObjectType()
export class DoctorsPagination {
  @Field(() => [Doctor])
  data: Doctor[];

  @Field(() => PaginationInfo)
  pagination: PaginationInfo;
}
