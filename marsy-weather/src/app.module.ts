import { Module } from '@nestjs/common';
import { CacheModule } from '@nestjs/cache-manager';

import {AppController } from './weather/controllers/app.controller';
import { AppService } from './weather/services/app.service';
import { WeatherController } from './weather/controllers/weather.controller';
import appConfig from './shared/config/app.config';
import swaggeruiConfig from './shared/config/swaggerui.config';

import { ConfigModule } from '@nestjs/config';
@Module({
 imports: [
     ConfigModule.forRoot({
       isGlobal: true,
       load: [appConfig, swaggeruiConfig],
     }), CacheModule.register({
                                ttl: 3600,
                                max : 100
                              }),],
  controllers: [AppController, WeatherController],
  providers: [AppService],
})
export class AppModule {}
