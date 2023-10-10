import { HttpException, HttpStatus, Injectable, Logger } from '@nestjs/common';
import { firstValueFrom } from 'rxjs';
import { AxiosResponse } from 'axios';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';

import { DependenciesConfig } from '../../../shared/config/interfaces/dependencies-config.interface';
import { PayloadTelemetryDto } from 'src/telemetry/dto/payload-telemetry.dt';

@Injectable()
export class MarsyPayloadProxyService {

  private logger = new Logger(MarsyPayloadProxyService.name);
  private _baseUrl: string;
  private _rocketsPath = '/payload';

  constructor(
    private configService: ConfigService,
    private readonly httpService: HttpService,
  ) {
    const dependenciesConfig =
      this.configService.get<DependenciesConfig>('dependencies');
    this._baseUrl = `http://${dependenciesConfig.marsy_payload_url_with_port}`;
  }

  async sendTelemetryDelivery(telemetryRecordDto: PayloadTelemetryDto) {
    try {

    const response: AxiosResponse = await firstValueFrom(
      this.httpService.post(
        `${this._baseUrl}${this._rocketsPath}/telemetry/delivery`,
        telemetryRecordDto,
      ),
    );
  } catch (error) {
    this.logger.error(`Failed to send telemetry : ${error}`);
  }
}

  async sendTelemetry(idrocket: string, telemetry: PayloadTelemetryDto) {
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
