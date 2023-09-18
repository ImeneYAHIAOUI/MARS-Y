import { HttpException, HttpStatus, Injectable, Logger } from '@nestjs/common';
import { firstValueFrom } from 'rxjs';
import { AxiosResponse } from 'axios';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';

import { DependenciesConfig } from '../../../shared/config/interfaces/dependencies-config.interface';
import { RocketStatusDto } from 'src/go-poll/dto/rocket.status.dto';
import { RocketNotFoundException } from 'src/go-poll/exceptions/rocket-not-found.exception';

const logger = new Logger('MarsyRocketProxyService');

@Injectable()
export class MarsyRocketProxyService {
    private _baseUrl: string;
    private _rocketsPath = '/rockets';
    private _rocketStatus: RocketStatusDto= null;


    constructor(private configService: ConfigService, private readonly httpService: HttpService) {
        const dependenciesConfig = this.configService.get<DependenciesConfig>('dependencies');
        this._baseUrl = `http://${dependenciesConfig.marsy_rocket_url_with_port}`;
    }

    async retrieveRocketStatus(_rocketId : string) : Promise<string> {
        if (this._rocketStatus === null) {
            const response: AxiosResponse<RocketStatusDto> = await firstValueFrom(this.httpService.get<RocketStatusDto>(`${this._baseUrl}${this._rocketsPath}/${_rocketId}/status`));
            if(response.status == HttpStatus.OK){
                this._rocketStatus = response.data;
                return this._rocketStatus.status;
            }
            else  {
                throw new HttpException(response.data, response.status);
            }            
        }
        return this._rocketStatus.status;
    }

}
