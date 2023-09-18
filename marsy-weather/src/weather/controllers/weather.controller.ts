import { Controller, Get } from '@nestjs/common';
import { WeatherStatus } from '../schemas/weather-status.enum';
import { Logger } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';

@Controller('weather/status')
@ApiTags('weather/status')
export class WeatherController {
  private readonly logger = new Logger(WeatherController.name);

  @Get()
  getWeatherStatus(): { status: WeatherStatus } {
    this.logger.log(`Requested weather status`);
    const statuses = Object.values(WeatherStatus);
    const randomStatusIndex = Math.floor(Math.random() * statuses.length);
    const randomStatus = statuses[randomStatusIndex];

    this.logger.log(`Response sent: status - ${randomStatus}`);

    return {
      status: randomStatus,
    };
  }
}
