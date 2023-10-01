import { HttpException, HttpStatus, Injectable, Logger } from '@nestjs/common';
import { firstValueFrom } from 'rxjs';
import { AxiosResponse } from 'axios';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';

import { DependenciesConfig } from '../../../shared/config/interfaces/dependencies-config.interface';
import { MissionTelemetryDto } from 'src/telemetry/dto/mission-telemetry.dto';

@Injectable()
export class MarsyMissionProxyService {
  private logger = new Logger(MarsyMissionProxyService.name);

  private _baseUrl: string;
  private _missionPath = '/missions';

  constructor(
    private configService: ConfigService,
    private readonly httpService: HttpService,
  ) {
    const dependenciesConfig =
      this.configService.get<DependenciesConfig>('dependencies');
    this._baseUrl = `http://${dependenciesConfig.marsy_mission_url_with_port}`;
  }

  async sendTelemetry(idrocket: string, telemetry: MissionTelemetryDto) {
    try {
      // this.logger.log(
      //   `Sending telemetry to ${this._baseUrl}${this._missionPath}/${idrocket}/telemetry`,
      // );
      const response: AxiosResponse = await firstValueFrom(
        this.httpService.post(
          `${this._baseUrl}${this._missionPath}/${idrocket}/telemetry`,
          telemetry,
        ),
      );
    } catch (error) {
      this.logger.error(`Failed to send telemetry : ${error}`);
    }
  }
}
