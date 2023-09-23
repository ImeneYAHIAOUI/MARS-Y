import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import appConfig from './shared/config/app.config';
import swaggeruiConfig from './shared/config/swaggerui.config';
import dependenciesConfig from './shared/config/dependencies.config';
import { MissionModule } from './missions/mission.module';
import { MongooseModule } from '@nestjs/mongoose';
import { MongooseConfigService } from './shared/services/mongoose-config.service';
import { HealthModule } from './health/health.module';
import mongodbConfig from './shared/config/mongodb.config';
import { StartupLogicService } from './shared/services/startup-logic.service';
import { MarsyRocketProxyService } from './missions/services/marsy-rocket-proxy/marsy-rocket-proxy.service';
import { HttpModule } from '@nestjs/axios';


@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [appConfig, mongodbConfig, swaggeruiConfig, dependenciesConfig],
    }),
    MongooseModule.forRootAsync({
      useClass: MongooseConfigService,
    }),
    HttpModule,
    HealthModule,
    MissionModule
  ],
  controllers: [],
  providers: [StartupLogicService, MarsyRocketProxyService],
})
export class AppModule {}
