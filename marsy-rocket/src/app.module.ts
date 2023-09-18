import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';

import appConfig from './shared/config/app.config';
import swaggeruiConfig from './shared/config/swaggerui.config';

import { RocketModule } from './rockets/rocket.module';
import { CommandModule } from './command/command.module';
import { MongooseModule } from '@nestjs/mongoose';
import { MongooseConfigService } from './shared/services/mongoose-config.service';
import { HealthModule } from './health/health.module';
import mongodbConfig from './shared/config/mongodb.config';
import { StartupLogicService } from './shared/services/startup-logic.service';
import dependenciesConfig from './shared/config/dependencies.config';

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
    RocketModule,
    CommandModule,
  ],
  providers: [StartupLogicService],
})
export class AppModule {}
