import { HttpStatus, Injectable, Logger } from '@nestjs/common';
import { firstValueFrom } from 'rxjs';
import { AxiosResponse } from 'axios';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';

import { DependenciesConfig } from '../../../shared/config/interfaces/dependencies-config.interface';
import { LandingResultDto } from 'src/booster/controllers/dtos/result.dto';
const logger = new Logger('MarsyMockHardwareProxyService');

@Injectable()
export class HardwareProxyService {
  private _baseUrl: string;
  private _hardwarePath = '/mock';
  private resultDto: LandingResultDto = null;

  constructor(
    private configService: ConfigService,
    private readonly httpService: HttpService,
  ) {
    const dependenciesConfig =
      this.configService.get<DependenciesConfig>('dependencies');
    this._baseUrl = `http://${dependenciesConfig.marsy_mock_url_with_port}`;
  }

  async callHardwareToLand(_rocketId: string): Promise<boolean> {
    if (this.resultDto === null) {
      logger.log(`Calling Hardware for landing for rocket id : ${_rocketId}`);
      const response: AxiosResponse<LandingResultDto> = await firstValueFrom(
        this.httpService.post<LandingResultDto>(
          `${this._baseUrl}${this._hardwarePath}/${_rocketId}/land`,
        ),
      );
      if (response.status == HttpStatus.OK) {
        this.resultDto = response.data;
        logger.log(`response for rocket id : ${_rocketId} is ${this.resultDto.landed}`);
        return this.resultDto.landed;
      } else {
        logger.log(`response for rocket id : ${_rocketId} is false`);
        return false;
      }
    }
  }
}

