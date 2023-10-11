import { HttpException, HttpStatus, Injectable, Logger } from '@nestjs/common';
import { firstValueFrom } from 'rxjs';

import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';

import { DependenciesConfig } from '../../../shared/config/interfaces/dependencies-config.interface';
import { TelemetryRecordDto } from 'src/mock/dto/telemetry-record.dto';
import { AxiosResponse } from '@nestjs/terminus/dist/health-indicator/http/axios.interfaces';
const logger = new Logger('MarsyGuidanceHardwareProxyService');

@Injectable()
export class GuidanceHardwareProxyService {
  private _baseUrl: string;
  private _guidancePath = '/mock-guidance';

  constructor(
    private configService: ConfigService,
    private readonly httpService: HttpService,
  ) {
    const dependenciesConfig =
      this.configService.get<DependenciesConfig>('dependencies');
    this._baseUrl = `http://${dependenciesConfig.marsy_guidance_url_with_port}`;
  }

  async startEmittingStageTwoTelemetry(telemetry: TelemetryRecordDto): Promise<boolean> {
    try {
      const response: AxiosResponse<Boolean> = await firstValueFrom(
        this.httpService.post(
          `${this._baseUrl}${this._guidancePath}/launch`,
          telemetry,
        ),
      );
        return true;
    } catch (error) {
      logger.error(`Error in startEmittingStageTwoTelemetry for rocket: ${telemetry.rocketId}`);
      throw new HttpException(error.status, error.data);
    }
  }
}
