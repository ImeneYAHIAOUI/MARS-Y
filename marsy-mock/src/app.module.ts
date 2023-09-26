import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';

import appConfig from './shared/config/app.config';
import swaggeruiConfig from './shared/config/swaggerui.config';

import dependenciesConfig from './shared/config/dependencies.config';
import { HardwareModule } from './mock/hardware.module';


@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [appConfig, swaggeruiConfig, dependenciesConfig],
    }),
    HardwareModule
  ]
})
export class AppModule {}
