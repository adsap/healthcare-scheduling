import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { ExternalAuthService } from './external-auth.service';

@Module({
  imports: [HttpModule],
  providers: [ExternalAuthService],
  exports: [ExternalAuthService],
})
export class AuthModule {}
