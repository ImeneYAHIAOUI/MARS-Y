import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';

import appConfig from './shared/config/app.config';
import swaggeruiConfig from './shared/config/swaggerui.config';

import { MongooseModule } from '@nestjs/mongoose';
import { MongooseConfigService } from './shared/services/mongoose-config.service';
import { HealthModule } from './health/health.module';
import mongodbConfig from './shared/config/mongodb.config';
import dependenciesConfig from './shared/config/dependencies.config';
import { TelemetryModule } from './telemetry/telemetry.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [appConfig, mongodbConfig, swaggeruiConfig, dependenciesConfig],
    }),
    MongooseModule.forRootAsync({
      useClass: MongooseConfigService,
    }),
    HealthModule,
    TelemetryModule
  ]
})
export class AppModule {}
