import { Field, ObjectType } from '@nestjs/graphql';
import { Schedule } from '../../../schedule/graphql/types/schedule.type';

@ObjectType()
export class Doctor {
  @Field(() => String)
  id: string;

  @Field(() => String)
  name: string;

  @Field(() => Date)
  createdAt: Date;

  @Field(() => Date)
  updatedAt: Date;

  @Field(() => [Schedule], { nullable: true })
  schedules?: Schedule[];
}
