import { ObjectType, Field } from '@nestjs/graphql';
import { Customer } from './customer.type';
import { PaginationInfo } from '../../../common/graphql/types/pagination.type';

@ObjectType()
export class CustomersPagination {
  @Field(() => [Customer])
  data: Customer[];

  @Field(() => PaginationInfo)
  pagination: PaginationInfo;
}
