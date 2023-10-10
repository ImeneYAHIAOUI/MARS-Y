import { Injectable, Logger } from '@nestjs/common';
import { firstValueFrom } from 'rxjs';
import { AxiosResponse } from 'axios';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';

import { DependenciesConfig } from '../../../shared/config/interfaces/dependencies-config.interface';
import { TelemetryRecordDto } from 'src/mock/dto/telemetry-record.dto';
import { BoosterTelemetryRecordDto } from 'src/mock/dto/booster-telemetry-record.dto';

@Injectable()
export class MarsyTelemetryProxyService {
  private readonly logger: Logger = new Logger(MarsyTelemetryProxyService.name);
  private _baseUrl: string;
  private _telemtryPath = '/telemetry';

  constructor(
    private configService: ConfigService,
    private readonly httpService: HttpService,
  ) {
    const dependenciesConfig =
      this.configService.get<DependenciesConfig>('dependencies');
    this._baseUrl = `http://${dependenciesConfig.marsy_telemetry_url_with_port}`;
  }

  async sendTelemetryToApi(
    telemetryData: BoosterTelemetryRecordDto,
  ): Promise<TelemetryRecordDto> {
    try {
      const response: AxiosResponse<TelemetryRecordDto> = await firstValueFrom(
        this.httpService.post<TelemetryRecordDto>(
          `${this._baseUrl}${this._telemtryPath}`,
          telemetryData,
        ),
      );
      return response.data;
    } catch (error) {
      this.logger.error(
        `Error sending telemetry data to ${this._baseUrl}${this._telemtryPath}`,
      );
      throw error;
    }
  }
}
