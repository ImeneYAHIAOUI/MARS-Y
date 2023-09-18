import { Test, TestingModule } from '@nestjs/testing';
import { GoPollService } from './go-poll.service';
import { MarsyRocketProxyService } from './marsy-rocket-proxy/marsy-rocket-proxy.service';
import { MarsyWeatherProxyService } from './marsy-weather-proxy/marsy-weather-proxy.service';

describe('GoPollService', () => {
  let service: GoPollService;
  let marsyRocketProxyService: MarsyRocketProxyService;
  let marsyWeatherProxyService: MarsyWeatherProxyService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        GoPollService,
        {
          provide: MarsyRocketProxyService,
          useValue: {
            retrieveRocketStatus: jest.fn(),
          },
        },
        {
          provide: MarsyWeatherProxyService,
          useValue: {
            retrieveWeatherStatus: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<GoPollService>(GoPollService);
    marsyRocketProxyService = module.get<MarsyRocketProxyService>(MarsyRocketProxyService);
    marsyWeatherProxyService = module.get<MarsyWeatherProxyService>(MarsyWeatherProxyService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should return true when both rocket and weather are ready', async () => {
    // Mock the responses of the dependencies
    (marsyRocketProxyService.retrieveRocketStatus as jest.Mock).mockResolvedValue('readyForLaunch');
    (marsyWeatherProxyService.retrieveWeatherStatus as jest.Mock).mockResolvedValue('Sunny');

    const result = await service.goOrNoGoPoll('rocket1');

    expect(result).toBe(true);
    expect(marsyRocketProxyService.retrieveRocketStatus).toHaveBeenCalledWith('rocket1');
    expect(marsyWeatherProxyService.retrieveWeatherStatus).toHaveBeenCalled();
  });

  it('should return false when rocket is not ready', async () => {
    // Mock the responses of the dependencies
    (marsyRocketProxyService.retrieveRocketStatus as jest.Mock).mockResolvedValue('NotReady');
    (marsyWeatherProxyService.retrieveWeatherStatus as jest.Mock).mockResolvedValue('Good');

    const result = await service.goOrNoGoPoll('rocket1');

    expect(result).toBe(false);
    expect(marsyRocketProxyService.retrieveRocketStatus).toHaveBeenCalledWith('rocket1');
    expect(marsyWeatherProxyService.retrieveWeatherStatus).toHaveBeenCalled();
  });

  it('should return false when weather is not good', async () => {
    // Mock the responses of the dependencies
    (marsyRocketProxyService.retrieveRocketStatus as jest.Mock).mockResolvedValue('readyForLaunch');
    (marsyWeatherProxyService.retrieveWeatherStatus as jest.Mock).mockResolvedValue('Bad');

    const result = await service.goOrNoGoPoll('rocket1');

    expect(result).toBe(false);
    expect(marsyRocketProxyService.retrieveRocketStatus).toHaveBeenCalledWith('rocket1');
    expect(marsyWeatherProxyService.retrieveWeatherStatus).toHaveBeenCalled();
  });
});
