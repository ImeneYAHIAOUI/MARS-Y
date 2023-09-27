import { HttpException, HttpStatus, Injectable, Logger } from '@nestjs/common';
import { firstValueFrom } from 'rxjs';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';

import { DependenciesConfig } from '../../../shared/config/interfaces/dependencies-config.interface';
import { MissionBoosterDto } from 'src/booster/controllers/dtos/mission.booster.dto';

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

  async updateMission(missionBoosterDto : MissionBoosterDto) {
    logger.log(`Performing updating Mission with id ${missionBoosterDto._id}`);
    const response = await firstValueFrom(
      this.httpService.put<MissionBoosterDto>(
        `${this._baseUrl}${this._missionPath}`, missionBoosterDto
      ),
    );
    if (response.status == HttpStatus.OK) {
      logger.log(`Updating mission booster successful for mission: ${missionBoosterDto._id}`);
      return response.data;
    } else {
      logger.error(`Error in updating mission booster for mission: ${missionBoosterDto._id}`);
      throw new HttpException(response.data, response.status);
    }
  }
}
