import { Module } from '@nestjs/common';
import { ScheduleService } from './schedule.service';
import { ScheduleResolver } from './schedule.resolver';
import { AuthModule } from '../auth/auth.module';
import { CommonModule } from '../common/common.module';

@Module({
  imports: [AuthModule, CommonModule],
  providers: [ScheduleService, ScheduleResolver],
  exports: [ScheduleService],
})
export class ScheduleModule {}
