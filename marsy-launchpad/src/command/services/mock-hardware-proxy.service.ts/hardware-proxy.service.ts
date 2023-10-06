import { HttpException, HttpStatus, Injectable, Logger } from '@nestjs/common';
import { firstValueFrom } from 'rxjs';
import { AxiosResponse } from 'axios';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';

import { DependenciesConfig } from '../../../shared/config/interfaces/dependencies-config.interface';
import { StagingResultDto } from '../../dto/staging-result-dto';
import { DeliveryDto } from '../../dto/delivery.dto';
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
    
      //logger.log(`Performing staging for rocket: ${_rocketId}`);
      const response: AxiosResponse<StagingResultDto> = await firstValueFrom(
        this.httpService.post<StagingResultDto>(
          `${this._baseUrl}${this._hardwarePath}/${_rocketId}/stage`,
        ),
      );
      if (response.status == HttpStatus.OK) {
        this.StagingResultDto = response.data;
        //logger.log(`Staging was successful for rocket: ${_rocketId.slice(-3).toUpperCase()}`);
        return this.StagingResultDto.staged;
      } else {
        logger.error(`Error in staging for rocket: ${_rocketId}`);
        throw new HttpException(response.data, response.status);
      }
    
  }

  async startEmittingTelemetry(_rocketId: string): Promise<void> {
    logger.log(`Request to start sending telemetry for rocket: ${_rocketId.slice(-3).toUpperCase()}`);
    const response: AxiosResponse = await firstValueFrom(
      this.httpService.post(`${this._baseUrl}${this._hardwarePath}/launch`, {
        rocketId: _rocketId,
      }),
    );
    if (response.status == HttpStatus.OK) {
      //logger.log(`Telemetry started for rocket: ${_rocketId}`);
    } else {
      logger.error(`Error starting telemetry for rocket: ${_rocketId}`);
      throw new HttpException(response.data, response.status);
    }
  }
   async prepareRocket(rocketId: string): Promise<boolean> {
      try {
        const response: AxiosResponse<any> = await firstValueFrom(
          this.httpService.post(
            `${this._baseUrl}${this._hardwarePath}/${rocketId}/prepare`,
          ),
        );
        return response.status === 200;
      } catch (error) {
        logger.error(`Error while preparing rocket id ${rocketId}: ${error.message}`);
        throw error;
      }
    }

    async startupRocket(rocketId: string): Promise<boolean> {
      try {
        const response: AxiosResponse<any> = await firstValueFrom(
          this.httpService.post(
            `${this._baseUrl}${this._hardwarePath}/${rocketId}/startup`,
          ),
        );
        return response.status === 200;
      } catch (error) {
        logger.error(`Error while starting up rocket ${rocketId}: ${error.message}`);
        throw error;
      }
    }

    async powerOnRocket(rocketId: string): Promise<boolean> {
      try {
        const response: AxiosResponse<any> = await firstValueFrom(
          this.httpService.post(
            `${this._baseUrl}${this._hardwarePath}/${rocketId}/power-on`
          )
        );
        return response.status === 200;
      } catch (error) {
        logger.error(`Error while powering on rocket ${rocketId}: ${error.message}`);
        throw error;
      }
    }

    async startMainEngine(rocketId: string): Promise<boolean> {
      try {
        const response: AxiosResponse<any> = await firstValueFrom(
          this.httpService.post(
            `${this._baseUrl}${this._hardwarePath}/${rocketId}/start-main-engine`
          )
        );
        return response.status === 200;
      } catch (error) {
        logger.error(`Error while starting the main engine of rocket ${rocketId}: ${error.message}`);
        throw error;
      }
    }

    async startSecondEngine(rocketId: string): Promise<boolean> {
      try {
        const response: AxiosResponse<any> = await firstValueFrom(
          this.httpService.post(
            `${this._baseUrl}${this._hardwarePath}/${rocketId}/start-second-engine`
          )
        );
        return response.status === 200;
      } catch (error) {
        logger.error(`Error while starting the second engine of rocket ${rocketId}: ${error.message}`);
        throw error;
      }
    }
        async mainEngineCutoff(rocketId: string): Promise<boolean> {
          try {
            const response: AxiosResponse<any> = await firstValueFrom(
              this.httpService.post(
                `${this._baseUrl}${this._hardwarePath}/${rocketId}/main-engine-cutoff`
              )
            );
            return response.status === 200;
          } catch (error) {
            logger.error(`Error while cutting off the main engine of rocket ${rocketId}: ${error.message}`);
            throw error;
          }
        }

    async secondEngineCutoff(rocketId: string): Promise<boolean> {
      try {
        const response: AxiosResponse<any> = await firstValueFrom(
          this.httpService.post(
            `${this._baseUrl}${this._hardwarePath}/${rocketId}/second-engine-cutoff`
          )
        );
        return response.status === 200;
      } catch (error) {
        logger.error(`Error while cutting off the second engine of rocket ${rocketId}: ${error.message}`);
        throw error;
      }
    }
}
