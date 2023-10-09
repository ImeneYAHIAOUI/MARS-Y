import { HttpException, Injectable, Logger } from '@nestjs/common';
import { firstValueFrom } from 'rxjs';
import { AxiosResponse } from 'axios';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';

import { DependenciesConfig } from '../../../shared/config/interfaces/dependencies-config.interface';
import { TelemetryRecordDto } from 'src/mock/dto/telemetry-record.dto';
import { PayloadTelemetryDto } from 'src/mock/dto/payload-telemetry.dto';

const logger = new Logger('MarsyHardwarePayloadProxyService');

@Injectable()
export class MarsyHardwarePayloadProxyService {
  private readonly logger: Logger = new Logger(MarsyHardwarePayloadProxyService.name);
  private _baseUrl: string;
  private _path = '/payload-hardware';

  constructor(
    private configService: ConfigService,
    private readonly httpService: HttpService,
  ) {
    const dependenciesConfig =
      this.configService.get<DependenciesConfig>('dependencies');
    this._baseUrl = `http://${dependenciesConfig.marsy_payload_hardware_url_with_port}`;
  }

  async startEmittingPayloadHardware(telemetry: PayloadTelemetryDto): Promise<boolean> {
    logger.log(
      `Sending payload hardware telemetry ${telemetry} data to ${this._baseUrl}${this._path}  ${this._baseUrl}${this._path}`,
    );
    try {
      await firstValueFrom(
        this.httpService.post(
          `${this._baseUrl}${this._path}/launch`,
          telemetry,
        ),
      );
        return true;
    } catch (error) {
      logger.error(`Error in startting emitting payload hardware telemetry: ${error}`);
      throw new HttpException(error.status, error.data);
    }
  }

}
