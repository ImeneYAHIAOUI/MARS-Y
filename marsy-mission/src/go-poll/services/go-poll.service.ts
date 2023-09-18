import { Injectable } from '@nestjs/common';
import { MarsyRocketProxyService } from './marsy-rocket-proxy/marsy-rocket-proxy.service';
import { MarsyWeatherProxyService } from './marsy-weather-proxy/marsy-weather-proxy.service';

@Injectable()
export class GoPollService {

  constructor(
    private readonly marsyRocketProxyService: MarsyRocketProxyService,
    private readonly marsyWeatherProxyService: MarsyWeatherProxyService,
  ) {}

  async goOrNoGoPoll(_rocketId : string): Promise<boolean> {
    const _rocketStatus = await this.marsyRocketProxyService.retrieveRocketStatus(_rocketId);
    const _weatherStatus = await this.marsyWeatherProxyService.retrieveWeatherStatus();

    return (_rocketStatus === "readyForLaunch" && _weatherStatus === "Sunny") ;
  }

}