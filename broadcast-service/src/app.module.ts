import { Module } from '@nestjs/common';
import {AppController } from './client/controllers/app.controller';
import { BroadcastService } from './client/services/broadcast.service';
import appConfig from './shared/config/app.config';
import swaggeruiConfig from './shared/config/swaggerui.config';
import { ConfigModule } from '@nestjs/config';
import { HttpModule } from '@nestjs/axios';

@Module({
 imports: [
     ConfigModule.forRoot({
       isGlobal: true,
       load: [appConfig, swaggeruiConfig],
     }), HttpModule,],
  controllers: [AppController],
  providers: [BroadcastService],
})
export class AppModule {}
