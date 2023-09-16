import { Test, TestingModule } from '@nestjs/testing';
import { MarsyRocketProxyService } from './marsy-rocket-proxy.service';
import { of } from 'rxjs';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';

import { DependenciesConfig } from '../../../shared/config/interfaces/dependencies-config.interface';

describe('MarsyRocketProxyService', () => {
  let service: MarsyRocketProxyService;
  let configService: ConfigService;
  let httpService: HttpService;

  let mockDependenciesConfig: DependenciesConfig;
  let getRetrieveRocketStatusAxiosResponse: Function;

  beforeEach(async () => {
    mockDependenciesConfig = {
      marsy_weather_url_with_port: 'marsy_weather_url:port',
      marsy_rocket_url_with_port: 'marsy_rocket_url:port',
    };

    getRetrieveRocketStatusAxiosResponse = (data) => ({
      data,
      headers: {},
      config: { url: `http://${mockDependenciesConfig.marsy_rocket_url_with_port}/rockets` },
      status: 200,
      statusText: 'OK',
    });

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        MarsyRocketProxyService,
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

    service = module.get<MarsyRocketProxyService>(MarsyRocketProxyService);
    configService = module.get<ConfigService>(ConfigService);
    httpService = module.get<HttpService>(HttpService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
    expect(configService.get).toHaveBeenCalled();
  });

  describe('retrieveRocketStatus', () => {
    it('should retrieve rocket status successfully', async () => {
      jest.spyOn(httpService, 'get').mockReturnValue(of(getRetrieveRocketStatusAxiosResponse('ready')));

      const rocketStatus = await service.retrieveRocketStatus('rocket1');
      expect(rocketStatus).toBe('ready');
      expect(httpService.get).toHaveBeenCalledWith(
        `http://${mockDependenciesConfig.marsy_rocket_url_with_port}/rockets`
      );
    });
  });
});
