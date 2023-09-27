import { HttpException, HttpStatus, Injectable, Logger } from '@nestjs/common';
import { firstValueFrom } from 'rxjs';
import { AxiosResponse } from 'axios';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';

import { DependenciesConfig } from '../../config/interfaces/dependencies-config.interface';
import { StagingResultDto } from '../../../command/dto/staging-result-dto';
import { DeliveryDto } from '../../../payload/dto/delivery.dto';
const logger = new Logger('MarsyMockHardwareProxyService');

@Injectable()
export class HardwareProxyService {
  private _baseUrl: string;
  private _hardwarePath = '/mock';
  private StagingResultDto: StagingResultDto = null;

  constructor(
    private configService: ConfigService,
    private readonly httpService: HttpService,
  ) {
    const dependenciesConfig =
      this.configService.get<DependenciesConfig>('dependencies');
    this._baseUrl = `http://${dependenciesConfig.marsy_mock_url_with_port}`;
  }

  async stageMidFlightFlight(_rocketId: string): Promise<boolean> {
    if (StagingResultDto === null) {
      logger.log(`Performing stageMidFlightFlight for rocket: ${_rocketId}`);
      const response: AxiosResponse<StagingResultDto> = await firstValueFrom(
        this.httpService.post<StagingResultDto>(
          `${this._baseUrl}${this._hardwarePath}/${_rocketId}/stage`,
        ),
      );
      if (response.status == HttpStatus.OK) {
        this.StagingResultDto = response.data;
        logger.log(`stageMidFlightFlight successful for rocket: ${_rocketId}`);
        return this.StagingResultDto.staged;
      } else {
        logger.error(`Error in stageMidFlightFlight for rocket: ${_rocketId}`);
        throw new HttpException(response.data, response.status);
      }
    }
  }

  async deliverPayload(_rocketId: string): Promise<boolean> {
    logger.log(`Performing deliverPayload for rocket: ${_rocketId}`);
    const response: AxiosResponse<DeliveryDto> = await firstValueFrom(
      this.httpService.post<DeliveryDto>(
        `${this._baseUrl}${this._hardwarePath}/${_rocketId}/deliver`,
      ),
    );
    if (response.status == HttpStatus.OK) {
      logger.log(`deliverPayload successful for rocket: ${_rocketId}`);
      return response.data.delivered;
    } else {
      logger.error(`Error in deliverPayload for rocket: ${_rocketId}`);
      throw new HttpException(response.data, response.status);
    }
  }
}
