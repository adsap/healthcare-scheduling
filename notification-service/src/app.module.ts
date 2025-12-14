import { Module } from '@nestjs/common';
import { ConfigModule } from './config/config.module';
import { NotificationModule } from './notification/notification.module';

@Module({
  imports: [
    ConfigModule,
    NotificationModule,
  ],
})
export class AppModule {}
