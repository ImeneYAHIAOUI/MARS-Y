import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';

import appConfig from './shared/config/app.config';
import swaggeruiConfig from './shared/config/swaggerui.config';

import dependenciesConfig from './shared/config/dependencies.config';
import { GuidanceHardwareModule } from './mock/guidance-hardware.module';
import { ScheduleModule } from '@nestjs/schedule';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [appConfig, swaggeruiConfig, dependenciesConfig],
    }),
    ScheduleModule.forRoot(),
    GuidanceHardwareModule,
  ],
})
export class AppModule {}
