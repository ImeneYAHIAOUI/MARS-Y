import { HttpException, HttpStatus, Injectable, Logger } from '@nestjs/common';
import { firstValueFrom } from 'rxjs';
import { AxiosResponse } from 'axios';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';

import { DependenciesConfig } from '../../../shared/config/interfaces/dependencies-config.interface';
import { RocketDto } from 'src/missions/dto/rocket.dto';
import { RocketNotFoundException } from '../../exceptions/rocket-not-found.exception';
import { RocketServiceUnavailableException } from '../../exceptions/rocket-service-error-exception';
import { GoResponseDto } from '../../dto/go.dto';

const logger = new Logger('MarsyRocketProxyService');

@Injectable()
export class MarsyRocketProxyService {
    private _baseUrl: string;
    private _rocketsPath = '/rockets';
    constructor(private configService: ConfigService, private readonly httpService: HttpService) {
        const dependenciesConfig = this.configService.get<DependenciesConfig>('dependencies');
        this._baseUrl = `http://${dependenciesConfig.marsy_launchpad_url_with_port}`;
    }

    async destroyRocket(_rocketId: string): Promise<boolean> {
        try {
            const response = await this.httpService
                .put(`${this._baseUrl}${this._rocketsPath}/${_rocketId}/status`, {
                    status: 'destroyed',
                })
                .toPromise();
        logger.log(`Rocket ${_rocketId.slice(-3).toUpperCase()} has been successfully destroyed.`);

            return true;
        } catch (error) {
            if (error.response && error.response.status === 404) {
                throw new RocketNotFoundException('Rocket not found');
            } else {
                logger.error(`${error}`);
                throw new RocketServiceUnavailableException(error.message);
            }
        }
    }

    async retrieveRocketStatus(_rocketId : string) : Promise<boolean> {
        try {
            const response: AxiosResponse<GoResponseDto> = await firstValueFrom(
              this.httpService.post<GoResponseDto>(
                `${this._baseUrl}${this._rocketsPath}/${_rocketId}/poll`
              )
            );
            const status = response.data.go;
            //logger.log(`Retrieving rocket status successfully, status is ${status}`);
            return status;
        } catch (error) {
            if (error.response && error.response.status === 404) {
              throw new RocketNotFoundException('Rocket not found');
            } else {
                logger.error(`${error}`)
              throw new RocketServiceUnavailableException(error.message);
            }
        }
    }

    async getAllRocketsFromApi(): Promise<RocketDto[]> {
      try {
        const response: AxiosResponse<RocketDto[]> = await firstValueFrom(
          this.httpService.get<RocketDto[]>(
            `${this._baseUrl}${this._rocketsPath}/all`
          ));
          return response.data;
      
      } catch (error) {
        console.error('Error while fetching rockets:', error);
        throw error;
      }
    }

}
  
