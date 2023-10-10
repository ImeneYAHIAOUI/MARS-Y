import { Injectable, Logger } from '@nestjs/common';
import { firstValueFrom } from 'rxjs';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';

import { DependenciesConfig } from '../../../shared/config/interfaces/dependencies-config.interface';
import { PayloadTelemetryDto } from 'src/payload/dto/payload-telemetry.dto';

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
    telemetryData: PayloadTelemetryDto,
  ) {
    try {
      await firstValueFrom(
        this.httpService.post(
          `${this._baseUrl}${this._telemtryPath}/payload`,
          telemetryData,
        ),
      );
      return true;
    } catch (error) {
      this.logger.error(
        `Error sending telemetry data to ${this._baseUrl}${this._telemtryPath}`,
      );
      throw error;
    }
  }
}
