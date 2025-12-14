import { Field, Int, ObjectType } from '@nestjs/graphql';

@ObjectType()
export class PaginationInfo {
  @Field(() => Int)
  page: number;

  @Field(() => Int)
  limit: number;

  @Field(() => Int)
  total: number;

  @Field(() => Int)
  totalPages: number;
}
