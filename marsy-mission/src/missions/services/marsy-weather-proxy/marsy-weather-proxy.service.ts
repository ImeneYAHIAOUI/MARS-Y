import { Injectable, Logger } from '@nestjs/common';
import { firstValueFrom } from 'rxjs';
import { AxiosResponse } from 'axios';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';

import { DependenciesConfig } from '../../../shared/config/interfaces/dependencies-config.interface';
import { WeatherDto } from '../../dto/weather.dto';
import { WeatherServiceUnavailableException } from '../../exceptions/weather-service-error-exception';
import { GoResponseDto } from 'src/missions/dto/go.dto';

const logger = new Logger('MarsyWeatherProxyService');

@Injectable()
export class MarsyWeatherProxyService {
    private _baseUrl: string;
    private _weatherPath = '/weather/poll';

    constructor(private configService: ConfigService, private readonly httpService: HttpService) {
        const dependenciesConfig = this.configService.get<DependenciesConfig>('dependencies');
        this._baseUrl = `http://${dependenciesConfig.marsy_weather_url_with_port}`;
    }
    async retrieveWeatherStatus(latitude: number, longitude: number, rocketId): Promise<boolean> {
        try {
            const weatherDto = new WeatherDto();
            weatherDto.lat = latitude;
            weatherDto.long = longitude;
            weatherDto.rocketId = rocketId;
            const response: AxiosResponse<GoResponseDto> = await firstValueFrom(
                this.httpService.post<GoResponseDto>(
                  `${this._baseUrl}${this._weatherPath}`,
                  weatherDto
                )
              );
            const status = response.data.go;
            //logger.log(`Retrieving weather status successfully , status is ${status}`)
            return status;
        } catch (error) {
            logger.error(`${error}`)
            throw new WeatherServiceUnavailableException(error.message);
        }
    }
}