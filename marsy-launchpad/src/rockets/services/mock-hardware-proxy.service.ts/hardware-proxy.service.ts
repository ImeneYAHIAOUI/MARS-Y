import { HttpStatus, Injectable, Logger } from '@nestjs/common';
import { firstValueFrom } from 'rxjs';
import { AxiosResponse } from 'axios';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';

import { DependenciesConfig } from '../../../shared/config/interfaces/dependencies-config.interface';

@Injectable()
export class HardwareProxyService {
  private readonly logger: Logger = new Logger(HardwareProxyService.name);
  private _baseUrl: string;
  private _mockPath = '/mock';

  constructor(
    private configService: ConfigService,
    private readonly httpService: HttpService,
  ) {
    const dependenciesConfig =
      this.configService.get<DependenciesConfig>('dependencies');
    this._baseUrl = `http://${dependenciesConfig.marsy_mock_url_with_port}`;
  }
  async destroyRocket(
    rocketId: string
  ): Promise<void> {
    try {
      this.logger.log(`Sending explosion order to rocket : ${rocketId.slice(-3).toUpperCase()}`);
      const response: AxiosResponse<any> = await firstValueFrom(
        this.httpService.post(
          `${this._baseUrl}${this._mockPath}/${rocketId}/destroy`,
        ),
      );
      if (response.status == HttpStatus.OK) {
        this.logger.log(`Rocket exploded`);
      } else {
        this.logger.error(`Error while sending the explosion order`);
      }
    } catch (error) {
      this.logger.error(`Error while stopping telemetry for rocket id ${rocketId.slice(-3)
          .toUpperCase()}: ${error.message}`);
      throw error;
    }
  }

  async throttleDownEngines(
    rocketId: string
  ): Promise<void> {
    try {
      this.logger.log(`Throttling down engines for rocket id : ${rocketId.slice(-3)
          .toUpperCase()}`);
      const response: AxiosResponse<any> = await firstValueFrom(
        this.httpService.post(
          `${this._baseUrl}${this._mockPath}/${rocketId}/throttle-down`,
        ),
      );
      this.logger.log(`Rocket engines throttled down`);
    } catch (error) {
      this.logger.error(`Error while throttling down engines for rocket id ${rocketId.slice(-3)
          .toUpperCase()}: ${error.message}`);
      throw error;
    }
  }
}