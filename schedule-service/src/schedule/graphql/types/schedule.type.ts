import { Field, ObjectType } from '@nestjs/graphql';
import { Customer } from '../../../customer/graphql/types/customer.type';
import { Doctor } from '../../../doctor/graphql/types/doctor.type';

@ObjectType()
export class Schedule {
  @Field(() => String)
  id: string;

  @Field(() => String)
  objective: string;

  @Field(() => Customer)
  customer: Customer;

  @Field(() => Doctor)
  doctor: Doctor;

  @Field(() => Date)
  scheduledAt: Date;

  @Field(() => Date)
  createdAt: Date;

  @Field(() => Date)
  updatedAt: Date;
}
