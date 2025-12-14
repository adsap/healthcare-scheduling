import { IsString, IsOptional } from 'class-validator';
import { InputType, Field } from '@nestjs/graphql';

@InputType()
export class UpdateDoctorDto {
  @Field({ nullable: true })
  @IsString()
  @IsOptional()
  name?: string;
}
