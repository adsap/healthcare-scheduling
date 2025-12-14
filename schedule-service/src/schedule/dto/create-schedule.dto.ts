import { IsString, IsUUID, IsDate, IsNotEmpty } from 'class-validator';
import { InputType, Field } from '@nestjs/graphql';

@InputType()
export class CreateScheduleDto {
  @Field()
  @IsString()
  @IsNotEmpty()
  objective: string;

  @Field()
  @IsUUID()
  @IsNotEmpty()
  customerId: string;

  @Field()
  @IsUUID()
  @IsNotEmpty()
  doctorId: string;

  @Field()
  @IsDate()
  @IsNotEmpty()
  scheduledAt: Date;
}
