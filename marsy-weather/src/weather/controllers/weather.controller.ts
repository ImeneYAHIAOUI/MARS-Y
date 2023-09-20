import { Controller, Post,Get, Query,Body } from '@nestjs/common';
import { WeatherStatus } from '../schemas/weather-status.enum';
import { Logger } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { WeatherDto } from '../../dto/weather.dto';

@Controller('weather')
@ApiTags('weather')
export class WeatherController {
  private readonly logger = new Logger(WeatherController.name);

  @Get('status')
  getWeatherStatus(@Query('lat') lat: number, @Query('long') long: number): { status: WeatherStatus } {
    this.logger.log(`Requested weather status for lat: ${lat}, long: ${long}`);
    const statuses = Object.values(WeatherStatus);
    const randomStatusIndex = Math.floor(Math.random() * statuses.length);
    const randomStatus = statuses[randomStatusIndex];
    this.logger.log(`Response sent: status - ${randomStatus}`);
    return {
      status: randomStatus,
    };
  }
  @Post('poll')
    pollWeather(@Body() weatherDto: WeatherDto): { go: boolean } {
      this.logger.log(`Requested weather poll for lat: ${weatherDto.lat}, long: ${weatherDto.long}`);
      const canGo = true;
      this.logger.log(`Response sent: go - ${canGo}`);
      return {
        go: canGo,
      };
    }
}
