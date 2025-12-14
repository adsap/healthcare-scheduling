import { Module } from '@nestjs/common';
import { GraphQLModule } from '@nestjs/graphql';
import { ApolloDriver, ApolloDriverConfig } from '@nestjs/apollo';
import { BullModule } from '@nestjs/bullmq';
import { join } from 'path';
import { ConfigModule } from './config/config.module';
import { ConfigService } from '@nestjs/config';
import { PrismaModule } from './prisma/prisma.module';
import { CommonModule } from './common/common.module';
import { AuthModule } from './auth/auth.module';
import { CustomerModule } from './customer/customer.module';
import { DoctorModule } from './doctor/doctor.module';
import { ScheduleModule } from './schedule/schedule.module';
import { NotificationModule } from './notification/notification.module';
import { DateScalar } from './common/scalars/date.scalar';

@Module({
  imports: [
    ConfigModule,
    GraphQLModule.forRoot<ApolloDriverConfig>({
      driver: ApolloDriver,
      autoSchemaFile: join(process.cwd(), 'src/schema.gql'),
      playground: process.env.NODE_ENV !== 'production',
    }),
    BullModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        connection: {
          host: configService.get('bull.redis.host'),
          port: configService.get('bull.redis.port'),
        },
      }),
      inject: [ConfigService],
    }),
    PrismaModule,
    CommonModule,
    AuthModule,
    CustomerModule,
    DoctorModule,
    ScheduleModule,
    NotificationModule,
  ],
  providers: [DateScalar],
})
export class AppModule {}
