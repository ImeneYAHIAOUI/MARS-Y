import { Controller, Get } from '@nestjs/common';
import {
  HealthCheck,
  HealthCheckService,
  HttpHealthIndicator,
} from '@nestjs/terminus';
import { ConfigService } from '@nestjs/config';

import { DependenciesConfig } from '../shared/config/interfaces/dependencies-config.interface';

@Controller('health')
export class HealthController {
  private _marsyRocketServiceHealthCheckUrl: string;
  private _marsyMissionServiceHealthCheckUrl: string;

  constructor(
    private configService: ConfigService,
    private health: HealthCheckService,
    private http: HttpHealthIndicator,
  ) {
    const dependenciesConfig =
      this.configService.get<DependenciesConfig>('dependencies');
    this._marsyRocketServiceHealthCheckUrl = `http://${dependenciesConfig.marsy_launchpad_service_url_with_port}/health`;
    //this._marsyWeatherServiceHealthCheckUrl = `http://${dependenciesConfig.marsy_weather_service_url_with_port}/health`;
    this._marsyMissionServiceHealthCheckUrl = `http://${dependenciesConfig.marsy_mission_service_url_with_port}/health`;
  }

  async checkIsHealthy(name, url) {
    try {
      return await this.http.responseCheck(
        name,
        url,
        (res) => (<any>res.data)?.status === 'ok',
      );
    } catch (e) {
      return await this.http.pingCheck(name, url);
    }
  }

  @Get()
  @HealthCheck()
  check() {
    return this.health.check([
      async () =>
        this.checkIsHealthy(
          'marsy-launchpad-service',
          this._marsyRocketServiceHealthCheckUrl,
        ),
        async () =>
        this.checkIsHealthy(
          'marsy-mission-service',
          this._marsyRocketServiceHealthCheckUrl,
        ),
    ]);
  }
}
