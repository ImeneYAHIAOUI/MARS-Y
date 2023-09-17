import { Injectable } from '@nestjs/common';
import { firstValueFrom } from 'rxjs';
import { AxiosResponse } from 'axios';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';

import { DependenciesConfig } from '../../../shared/config/interfaces/dependencies-config.interface';

@Injectable()
export class MarsyRocketProxyService {
    private _baseUrl: string;
    private _rocketsPath = '/rockets';
    private _rocketStatus: string= null;


    constructor(private configService: ConfigService, private readonly httpService: HttpService) {
        const dependenciesConfig = this.configService.get<DependenciesConfig>('dependencies');
        this._baseUrl = `http://${dependenciesConfig.marsy_rocket_url_with_port}`;
    }

    async retrieveRocketStatus(_rocketId : string) : Promise<string> {
        if (this._rocketStatus === null) {
            const response: AxiosResponse<string> = await firstValueFrom(this.httpService.get<string>(`${this._baseUrl}${this._rocketsPath}/${_rocketId}/status`));
            this._rocketStatus = response.data;
        }
        return this._rocketStatus;
    }

}
