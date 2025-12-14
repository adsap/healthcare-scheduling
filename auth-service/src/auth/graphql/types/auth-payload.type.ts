import { Field, ObjectType } from '@nestjs/graphql';
import { User } from './user.type';

@ObjectType()
export class AuthPayload {
  @Field(() => String)
  accessToken: string;

  @Field(() => User)
  user: User;
}
