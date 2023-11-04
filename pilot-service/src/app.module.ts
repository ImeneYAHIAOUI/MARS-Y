import { Module} from '@nestjs/common';
import {AppController } from './pilot/controllers/app.controller';
import { AppService } from './pilot/services/app.service';
import appConfig from './shared/config/app.config';
import swaggeruiConfig from './shared/config/swaggerui.config';
import { PayloadHardwareServiceProxy } from './pilot/services/client-service-proxy/payload-hardware-service-proxy';

import dependenciesConfig from './shared/config/dependencies.config';
import { HttpModule } from '@nestjs/axios';
import { ConfigModule } from '@nestjs/config';
@Module({
 imports: [
     ConfigModule.forRoot({
       isGlobal: true,
       load: [appConfig, swaggeruiConfig,dependenciesConfig],
     }), HttpModule,],
  controllers: [AppController],
  providers: [PayloadHardwareServiceProxy,AppService],
})
export class AppModule {}
