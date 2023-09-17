import { Module } from '@nestjs/common';
import { AppController } from './weather/controllers/app.controller';
import { AppService } from './weather/services/app.service';
import { WeatherController } from './weather/controllers/weather.controller';

@Module({
  imports: [],
  controllers: [AppController, WeatherController],
  providers: [AppService],
})
export class AppModule {}
