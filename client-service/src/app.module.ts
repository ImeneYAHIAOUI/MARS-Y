import { Module} from '@nestjs/common';
import {AppController } from './client/controllers/app.controller';
import { AppService } from './client/services/app.service';
import appConfig from './shared/config/app.config';
import swaggeruiConfig from './shared/config/swaggerui.config';
import { ClientServiceProxy } from './client/services/client-service-proxy/client-service-proxy';
import {PilotServiceProxy} from './client/services/client-service-proxy/pilot-service-proxy';
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
  providers: [ClientServiceProxy,PilotServiceProxy,AppService],
})
export class AppModule {}
