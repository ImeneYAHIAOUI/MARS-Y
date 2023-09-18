import { Test, TestingModule } from '@nestjs/testing';
import { MarsyWeatherProxyService } from './marsy-weather-proxy.service';
import { of } from 'rxjs';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';

import { DependenciesConfig } from '../../../shared/config/interfaces/dependencies-config.interface';
import { WeatherStatusDto } from '../../dto/weather.status.dto'; // Import the WeatherStatusDto

describe('MarsyWeatherProxyService', () => {
  let service: MarsyWeatherProxyService;
  let configService: ConfigService;
  let httpService: HttpService;

  let mockDependenciesConfig: DependenciesConfig;
  let getRetrieveWeatherStatusAxiosResponse: Function;

  beforeEach(async () => {
    mockDependenciesConfig = {
      marsy_weather_url_with_port: 'marsy_weather_url:port', 
      marsy_rocket_url_with_port: 'marsy_rocket_url:port',
    };

    getRetrieveWeatherStatusAxiosResponse = (data) => ({
      data: { status: data }, // Wrap the data in the WeatherStatusDto
      headers: {},
      config: { url: `http://${mockDependenciesConfig.marsy_weather_url_with_port}/weather` },
      status: 200,
      statusText: 'OK',
    });

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        MarsyWeatherProxyService,
        {
          provide: ConfigService,
          useValue: {
            get: jest.fn().mockReturnValue(mockDependenciesConfig),
          },
        },
        {
          provide: HttpService,
          useValue: {
            get: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<MarsyWeatherProxyService>(MarsyWeatherProxyService);
    configService = module.get<ConfigService>(ConfigService);
    httpService = module.get<HttpService>(HttpService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
    expect(configService.get).toHaveBeenCalled();
  });

  describe('retrieveWeatherStatus', () => {
    it('should retrieve weather status successfully', async () => {
      jest.spyOn(httpService, 'get').mockReturnValue(of(getRetrieveWeatherStatusAxiosResponse('sunny')));

      const weatherStatus = await service.retrieveWeatherStatus();
      expect(weatherStatus).toBe('sunny');
      expect(httpService.get).toHaveBeenCalledWith(
        `http://${mockDependenciesConfig.marsy_weather_url_with_port}/weather`
      );
    });
  });
});
