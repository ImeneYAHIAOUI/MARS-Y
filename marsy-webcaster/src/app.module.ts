import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';

import appConfig from './shared/config/app.config';
import swaggeruiConfig from './shared/config/swaggerui.config';

import dependenciesConfig from './shared/config/dependencies.config';
import { WebcasterModule } from './webcaster/webcaster.module';
import { MongooseModule } from '@nestjs/mongoose';
import { MongooseConfigService } from './shared/services/mongoose-config.service';
import mongodbConfig from './shared/config/mongodb.config';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [appConfig, mongodbConfig, swaggeruiConfig, dependenciesConfig],
    }),
    MongooseModule.forRootAsync({
      useClass: MongooseConfigService,
    }),

    WebcasterModule,
  ],
})
export class AppModule {}
