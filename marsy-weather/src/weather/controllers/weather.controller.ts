import { Controller, Post,Get, Query,Body ,Inject} from '@nestjs/common';
import { WeatherStatus } from '../schemas/weather-status.enum';
import { Logger } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { WeatherDto } from '../../dto/weather.dto';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';


@Controller('weather')
@ApiTags('weather')
export class WeatherController {
  private readonly logger = new Logger(WeatherController.name);
  constructor(@Inject(CACHE_MANAGER) private cacheManager: Cache) {}

  @Get('status')
  async getWeatherStatus(@Query('lat') lat: number, @Query('long') long: number): Promise<{ status: WeatherStatus }> {
    //this.logger.log(`Requested weather status for lat: ${lat}, long: ${long}`);

    const cacheKey = `weather-status-${lat}-${long}`;
    const cachedStatus = await this.cacheManager.get(cacheKey) as WeatherStatus;
    if (cachedStatus) {
      //this.logger.log(`Response sent from cache: status - ${cachedStatus}`);
      return { status: cachedStatus };
    }
    const statuses = Object.values(WeatherStatus);
    const randomStatusIndex = Math.floor(Math.random() * statuses.length);
    const randomStatus = statuses[randomStatusIndex];

    await this.cacheManager.set(cacheKey, randomStatus,  3600 );

    //this.logger.log(`Response sent: status - ${randomStatus}`);
    return {
      status: randomStatus,
    };
  }

  @Post('poll')
    async pollWeather(@Body() weatherDto: WeatherDto):Promise<{ go: boolean }> {
      this.logger.debug(`Requested weather poll`);
      const weatherStatusResponse = await this.getWeatherStatus(weatherDto.lat, weatherDto.long);
      const canGo = weatherStatusResponse.status === WeatherStatus.Sunny;
      this.logger.debug(`Response sent: go`);
      return {
        go: true,
      };
    }
}
