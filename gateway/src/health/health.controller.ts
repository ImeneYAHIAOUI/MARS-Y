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
  private _marsyWeatherServiceHealthCheckUrl: string;

  constructor(
    private configService: ConfigService,
    private health: HealthCheckService,
    private http: HttpHealthIndicator,
  ) {
    const dependenciesConfig =
      this.configService.get<DependenciesConfig>('dependencies');
    this._marsyWeatherServiceHealthCheckUrl = `http://${dependenciesConfig.marsy_weather_service_url_with_port}/health`;
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
          'marsy-rocket-service',
          this._marsyWeatherServiceHealthCheckUrl,
        ),
    ]);
  }
}
