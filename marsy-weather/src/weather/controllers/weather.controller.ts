import { Controller, Get } from '@nestjs/common';
import { WeatherStatus } from '../schemas/weather-status.enum';

@Controller('/status')
export class WeatherController {
  @Get()
  getWeatherStatus(): { status: WeatherStatus } {
    const statuses = Object.values(WeatherStatus);
    const randomStatusIndex = Math.floor(Math.random() * statuses.length);
    return {
      status: statuses[randomStatusIndex],
    };
  }
}
