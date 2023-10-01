import { HttpException, HttpStatus, Injectable, Logger } from '@nestjs/common';
import { firstValueFrom } from 'rxjs';
import { AxiosResponse } from 'axios';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';

import { DependenciesConfig } from '../../../shared/config/interfaces/dependencies-config.interface';
import { ControlTelemetryDto } from 'src/telemetry/dto/control-telemetry.dto';

@Injectable()
export class MarsyRocketProxyService {
  private logger = new Logger(MarsyRocketProxyService.name);
  private _baseUrl: string;
  private _rocketsPath = '/rockets';

  constructor(
    private configService: ConfigService,
    private readonly httpService: HttpService,
  ) {
    const dependenciesConfig =
      this.configService.get<DependenciesConfig>('dependencies');
    this._baseUrl = `http://${dependenciesConfig.marsy_launchpad_url_with_port}`;
  }

  async sendTelemetry(idrocket: string, telemetry: ControlTelemetryDto) {
    try {
      // this.logger.log(
      //   `Sending telemetry to ${this._baseUrl}${this._rocketsPath}/${idrocket}/telemetry`,
      // );
      const response: AxiosResponse = await firstValueFrom(
        this.httpService.post(
          `${this._baseUrl}${this._rocketsPath}/${idrocket}/telemetry`,
          telemetry,
        ),
      );
    } catch (error) {
      this.logger.error(`Failed to send telemetry : ${error}`);
    }
  }
}
