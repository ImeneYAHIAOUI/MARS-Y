import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { BoosterModule } from './booster/booster.module';
import { BoosterController } from './booster/controllers/booster.controller';
import { BoosterService } from './booster/services/booster.service';
import { ConfigModule } from '@nestjs/config';
import appConfig from './shared/config/app.config';
import swaggeruiConfig from './shared/config/swaggerui.config';
import dependenciesConfig from './shared/config/dependencies.config';
import { HttpModule } from '@nestjs/axios';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [appConfig, swaggeruiConfig, dependenciesConfig],
    }),
    HttpModule,
    BoosterModule
  ],
  controllers: [AppController, BoosterController],
  providers: [AppService, BoosterService],
})
export class AppModule {}
