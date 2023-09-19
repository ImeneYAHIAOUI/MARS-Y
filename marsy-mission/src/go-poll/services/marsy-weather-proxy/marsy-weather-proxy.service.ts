import { Injectable, Logger } from '@nestjs/common';
import { firstValueFrom } from 'rxjs';
import { AxiosResponse } from 'axios';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';

import { DependenciesConfig } from '../../../shared/config/interfaces/dependencies-config.interface';
import { WeatherStatusDto } from '../../dto/weather.status.dto';
import { WeatherServiceUnavailableException } from 'src/go-poll/exceptions/weather-service-error-exception';

const logger = new Logger('MarsyWeatherProxyService');

@Injectable()
export class MarsyWeatherProxyService {
    private _baseUrl: string;
    private _weatherPath = '/weather/status';
    private _weatherStatus: string= null;

    constructor(private configService: ConfigService, private readonly httpService: HttpService) {
        const dependenciesConfig = this.configService.get<DependenciesConfig>('dependencies');
        this._baseUrl = `http://${dependenciesConfig.marsy_weather_url_with_port}`;
    }
    async retrieveWeatherStatus(): Promise<string> {
      try {
        const response: AxiosResponse<WeatherStatusDto> = await 
            firstValueFrom(this.httpService.get<WeatherStatusDto>(`${this._baseUrl}${this._weatherPath}`));
        this._weatherStatus = response.data.status;
        logger.log( `retrieving weather status successfullt , status is ${this._weatherStatus}`)
        return this._weatherStatus;
    } catch (error) {
          logger.error(`${error}`)
          throw new WeatherServiceUnavailableException(error.message);
        }
    }
}