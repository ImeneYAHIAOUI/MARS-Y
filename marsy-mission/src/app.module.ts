import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import appConfig from './shared/config/app.config';
import swaggeruiConfig from './shared/config/swaggerui.config';
import dependenciesConfig from './shared/config/dependencies.config';
import { GoPollModule } from './go-poll/go-poll.module';


@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [appConfig, swaggeruiConfig, dependenciesConfig],
    }),
    GoPollModule
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
