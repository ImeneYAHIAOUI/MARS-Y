import { HttpException, HttpStatus, Injectable, Logger } from '@nestjs/common';
import { firstValueFrom } from 'rxjs';
import { AxiosResponse } from 'axios';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';

import { DependenciesConfig } from '../../../shared/config/interfaces/dependencies-config.interface';
import { GoNoGoDto } from 'src/command/dto/go-no-go.dto';
import {MissionDto} from "../../dto/mission.dto";

const logger = new Logger('MarsyMissionProxyService');

@Injectable()
export class MarsyMissionProxyService {
  private _baseUrl: string;
  private _missionPath = '/missions';
  private _goNoGo: GoNoGoDto = null;

  constructor(
    private configService: ConfigService,
    private readonly httpService: HttpService,
  ) {
    const dependenciesConfig =
      this.configService.get<DependenciesConfig>('dependencies');
    this._baseUrl = `http://${dependenciesConfig.marsy_mission_url_with_port}`;
  }

  async goOrNoGoPoll(_rocketId: string): Promise<boolean> {
    if (this._goNoGo === null) {
      logger.log(`Performing goOrNoGoPoll for rocket: ${_rocketId}`);
      const mission = await this.getMission(_rocketId);
      const response: AxiosResponse<GoNoGoDto> = await firstValueFrom(
        this.httpService.post<GoNoGoDto>(
          `${this._baseUrl}${this._missionPath}/${mission._id}/poll`,
        ),
      );
      if (response.status == HttpStatus.OK) {
        this._goNoGo = response.data;
        logger.log(`goOrNoGoPoll successful for rocket: ${_rocketId}`);
        return this._goNoGo.go;
      } else if (response.status == HttpStatus.NOT_FOUND) {
        logger.error(`Error in goOrNoGoPoll for rocket: ${_rocketId}`);
        logger.error(`Mission not found for rocket: ${_rocketId}`);
        throw new HttpException(response.data, response.status);
      }
    }
    logger.log(`Using cached goNoGo result for rocket: ${_rocketId}`);
    return this._goNoGo.go;
  }

  async getMission(_rocketId: string): Promise<MissionDto> {
    logger.log(`Performing getMission for rocket: ${_rocketId}`);
    const response: AxiosResponse<MissionDto> = await firstValueFrom(
      this.httpService.get<MissionDto>(
        `${this._baseUrl}${this._missionPath}/search?rocketId=${_rocketId}&status=IN_PROGRESS`,
      ),
    );
    if (response.status == HttpStatus.OK) {
      logger.log(`getMission successful for rocket: ${_rocketId}`);
      return response.data;
    } else {
      logger.error(`Error in getMission for rocket: ${_rocketId}`);
      throw new HttpException(response.data, response.status);
    }
  }


}
