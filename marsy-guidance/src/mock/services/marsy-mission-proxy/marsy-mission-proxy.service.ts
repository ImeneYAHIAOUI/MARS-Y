import { HttpException, HttpStatus, Injectable, Logger } from '@nestjs/common';
import { firstValueFrom } from 'rxjs';
import { AxiosResponse } from 'axios';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';

import { DependenciesConfig } from '../../../shared/config/interfaces/dependencies-config.interface';
import { MissionDto } from '../../dto/mission.dto';

const logger = new Logger('MarsyMissionProxyService');

@Injectable()
export class MarsyMissionProxyService {
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

  async getMission(_rocketId: string): Promise<MissionDto> {
    //logger.log(`Performing getMission for rocket: ${_rocketId.slice(-3).toUpperCase()}`);
    const response: AxiosResponse<MissionDto> = await firstValueFrom(
      this.httpService.get<MissionDto>(
        `${this._baseUrl}${this._missionPath}/search?rocketId=${_rocketId}&status=IN_PROGRESS`,
      ),
    );
    if (response.status == HttpStatus.OK) {
      //logger.log(`getMission successful for rocket: ${_rocketId.slice(-3).toUpperCase()}`);
      return response.data;
    } else {
      logger.error(`Error in getMission for rocket: ${_rocketId.slice(-3).toUpperCase()}`);
      throw new HttpException(response.data, response.status);
    }
  }
}
