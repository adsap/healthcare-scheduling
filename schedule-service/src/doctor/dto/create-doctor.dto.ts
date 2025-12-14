import { IsString } from 'class-validator';
import { InputType, Field } from '@nestjs/graphql';

@InputType()
export class CreateDoctorDto {
  @Field()
  @IsString()
  name: string;
}
