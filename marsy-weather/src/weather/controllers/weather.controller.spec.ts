import { Test, TestingModule } from '@nestjs/testing';
import { WeatherController } from './weather.controller';
import { WeatherStatus } from '../schemas/weather-status.enum';
import { Logger } from '@nestjs/common';

describe('WeatherController', () => {
  let weatherController: WeatherController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [WeatherController],
      providers: [Logger],
    }).compile();

    weatherController = module.get<WeatherController>(WeatherController);
  });

  describe('getWeatherStatus', () => {
    it('should return a random weather status', () => {
      const spyLoggerLog = jest.spyOn(weatherController['logger'], 'log');

      const result = weatherController.getWeatherStatus(undefined, undefined);

      expect(spyLoggerLog).toHaveBeenCalledWith('Requested weather status for lat: undefined, long: undefined');
      expect(Object.values(WeatherStatus)).toContain(result.status);
    });
  });
});
