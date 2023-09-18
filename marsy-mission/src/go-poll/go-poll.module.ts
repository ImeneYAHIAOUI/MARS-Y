import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { GoPollController } from './controllers/go-poll.controller';
import { GoPollService } from './services/go-poll.service';
import { MarsyRocketProxyService } from './services/marsy-rocket-proxy/marsy-rocket-proxy.service';
import { MarsyWeatherProxyService } from './services/marsy-weather-proxy/marsy-weather-proxy.service';

@Module({
  imports: [HttpModule],
  controllers: [GoPollController],
  providers: [GoPollService, MarsyRocketProxyService, MarsyWeatherProxyService],
})
export class GoPollModule {}