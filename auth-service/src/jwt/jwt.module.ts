import { Module } from '@nestjs/common';
import { JwtModule as NestJwtModule } from '@nestjs/jwt';
import { JwtAuthService } from './jwt-auth.service';

@Module({
  imports: [
    NestJwtModule.registerAsync({
      useFactory: () => ({
        secret: process.env.JWT_SECRET,
        signOptions: { expiresIn: '7d' },
      }),
      inject: [],
    }),
  ],
  providers: [JwtAuthService],
  exports: [JwtAuthService],
})
export class JwtModule {}
