import { Module } from '@nestjs/common';
import { GoPollController } from './go-poll/controllers/go-poll.controller';
import { GoPollService } from './go-poll/services/go-poll.service';
import { MarsyWeatherProxyService } from './go-poll/services/marsy-weather-proxy/marsy-weather-proxy.service';

@Module({
  imports: [],
  controllers: [GoPollController],
  providers: [GoPollService, MarsyWeatherProxyService],
})
export class AppModule {}
