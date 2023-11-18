import { HttpException, HttpStatus, Injectable, Logger } from '@nestjs/common';
import { firstValueFrom } from 'rxjs';
import { AxiosError, AxiosResponse } from 'axios';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';

import { DependenciesConfig } from '../../../shared/config/interfaces/dependencies-config.interface';
import { StagingResultDto } from '../../dto/staging-result-dto';
import { DeliveryDto } from '../../dto/delivery.dto';
import withRetry from '@teneff/with-retry/decorator';
const logger = new Logger('MarsyMockHardwareProxyService');

class ErrorOnWhichWeShouldRetry extends Error {
  constructor(readonly cause?: Error) {
    super();
  }
}

const isAxiosError = (err: unknown): err is AxiosError => {
  return err instanceof Error && "code" in err;
};

@Injectable()
export class HardwareProxyService {
  private _baseUrl: string;
  private _hardwarePath = '/mock';
  private StagingResultDto: StagingResultDto = null;
  private attempts = 0;

  constructor(
    private configService: ConfigService,
    private readonly httpService: HttpService,
  ) {
    const dependenciesConfig =
      this.configService.get<DependenciesConfig>('dependencies');
    this._baseUrl = `http://${dependenciesConfig.marsy_mock_url_with_port}`;
  }

  async sleepEngine(): Promise<void> {
    try {
      const response: AxiosResponse<any> = await firstValueFrom(
        this.httpService.post(`${this._baseUrl}${this._hardwarePath}/sleep`, {
        }),
      );

      response && 
      await new Promise((r) => setTimeout(r, 5000)); 
    } catch (error) {
      logger.error(`Error while sleeping engine: ${error.message}`);
      throw error;
    }
  }

  async wakeEngine(): Promise<void> {
    try {
      // logger.log(`Request to wake engine`);
      const response: AxiosResponse<any> = await firstValueFrom(
        this.httpService.post(`${this._baseUrl}${this._hardwarePath}/wake`),
      );
    } catch (error) {
      logger.error(`Error while waking engine: ${error.message}`);
      throw error;
    }
  }


  async throttleDownEnginesRetry(rocketId: string, handleError : Function): Promise<void> {
      logger.log(
        `Request to start throttling down engines for rocket : ${rocketId
          .slice(-3)
          .toUpperCase()}`,
      );
      try {
      const response: AxiosResponse<any> = await firstValueFrom(
        this.httpService.post(
          `${this._baseUrl}${this._hardwarePath}/${rocketId}/throttle-down`,
        ),
      );
    } catch (error) {
      logger.error(
        `Error while throttling down engines for rocket ${rocketId
          .slice(-3)
          .toUpperCase()}: ${error.message}`,
      );
      if (this.attempts < 3) {
        this.attempts++;
        logger.log(`Retrying in ${Math.exp(this.attempts -1)}s...`);
        await new Promise((r) => setTimeout(r, Math.exp(this.attempts -1)*1000));
        await this.throttleDownEnginesRetry(rocketId, handleError);
      }else{
        logger.error(`Max attempts reached. Giving up.`);
        handleError(error);
      }
    }
  }

  async throttleDownEngines(rocketId: string, handleError : Function): Promise<void> {
    this.attempts = 0;
    this.throttleDownEnginesRetry(rocketId, handleError);
  }

  async stageMidFlightFlight(_rocketId: string): Promise<boolean> {
    logger.log(
      `Request to start performing staging for rocket: ${_rocketId
        .slice(-3)
        .toUpperCase()}`,
    );
    const response: AxiosResponse<StagingResultDto> = await firstValueFrom(
      this.httpService.post<StagingResultDto>(
        `${this._baseUrl}${this._hardwarePath}/${_rocketId}/stage`,
      ),
    );
    if (response.status == HttpStatus.OK) {
      this.StagingResultDto = response.data;
      return this.StagingResultDto.staged;
    } else {
      logger.error(
        `Error in staging for rocket: ${_rocketId.slice(-3).toUpperCase()}`,
      );
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
      logger.error(
        `Error while preparing rocket id ${rocketId.slice(-3).toUpperCase()}: ${
          error.message
        }`,
      );
      throw error;
    }
  }

  async powerOnRocket(rocketId: string): Promise<boolean> {
    try {
      const response: AxiosResponse<any> = await firstValueFrom(
        this.httpService.post(
          `${this._baseUrl}${this._hardwarePath}/${rocketId}/power-on`,
        ),
      );
      return response.status === 200;
    } catch (error) {
      logger.error(
        `Error while powering on rocket ${rocketId.slice(-3).toUpperCase()}: ${
          error.message
        }`,
      );
      throw error;
    }
  }

  async startEmittingTelemetry(_rocketId: string): Promise<void> {
    const response: AxiosResponse = await firstValueFrom(
      this.httpService.post(`${this._baseUrl}${this._hardwarePath}/launch`, {
        rocketId: _rocketId,
      }),
    );
    if (response.status == HttpStatus.OK) {
      //logger.log(`Telemetry started for rocket: ${_rocketId.slice(-3).toUpperCase()}`);
    } else {
      logger.error(
        `Error starting telemetry for rocket: ${_rocketId
          .slice(-3)
          .toUpperCase()}`,
      );
      throw new HttpException(response.data, response.status);
    }
  }
}
