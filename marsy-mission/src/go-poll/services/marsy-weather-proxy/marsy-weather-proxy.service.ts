import { Injectable } from '@nestjs/common';
import { firstValueFrom } from 'rxjs';
import { AxiosResponse } from 'axios';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';

import { DependenciesConfig } from '../../../shared/config/interfaces/dependencies-config.interface';

@Injectable()
export class MarsyWeatherProxyService {
    private _baseUrl: string;
    private _weatherPath = '/weather';
    private _weatherStatus: string= null;

    constructor(private configService: ConfigService, private readonly httpService: HttpService) {
        const dependenciesConfig = this.configService.get<DependenciesConfig>('dependencies');
        this._baseUrl = `http://${dependenciesConfig.marsy_weather_url_with_port}`;
    }

    async retrieveWeatherStatus() : Promise<string> {
        if (this._weatherStatus === null) {
            const response: AxiosResponse<string> = await firstValueFrom(this.httpService.get<string>(`${this._baseUrl}${this._weatherPath}`));
            this._weatherStatus = response.data;
        }
        return this._weatherStatus;
    }

}