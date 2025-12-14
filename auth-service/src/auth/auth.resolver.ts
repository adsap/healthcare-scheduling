import { Resolver, Mutation, Query, Args } from '@nestjs/graphql';
import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { AuthPayload } from './graphql/types/auth-payload.type';
import { User } from './graphql/types/user.type';

@Resolver(() => User)
export class AuthResolver {
  constructor(private readonly authService: AuthService) {}

  @Mutation(() => AuthPayload)
  async register(@Args('registerDto') registerDto: RegisterDto) {
    return this.authService.register(registerDto);
  }

  @Mutation(() => AuthPayload)
  async login(@Args('loginDto') loginDto: LoginDto) {
    return this.authService.login(loginDto);
  }

  @Query(() => User, { nullable: true })
  async validateToken(@Args('token') token: string) {
    return this.authService.validateToken(token);
  }
}
