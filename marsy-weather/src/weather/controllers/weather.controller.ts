import { Controller, Post,Get, Query,Body ,Inject} from '@nestjs/common';
import { WeatherStatus } from '../schemas/weather-status.enum';
import { Logger } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { WeatherDto } from '../../dto/weather.dto';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';
import { Kafka } from 'kafkajs';

@Controller('weather')
@ApiTags('weather')
export class WeatherController {
  private readonly logger = new Logger(WeatherController.name);
  constructor(@Inject(CACHE_MANAGER) private cacheManager: Cache) {}

  private kafka = new Kafka({
    clientId: 'rocket-service',
    brokers: ['kafka-service:9092'],
  });

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
      const weatherStatusResponse = await this.getWeatherStatus(weatherDto.lat, weatherDto.long);
      const canGo = weatherStatusResponse.status === WeatherStatus.Sunny;
      this.logger.log(`Polling weather status for rocket ${weatherDto.rocketId}. (US 1)`);
      this.postMessageToKafka({
        rocketId: weatherDto.rocketId,
        weather_poll: true,
        event : "PRELAUNCH_CHECKS : Polling weather status",
      });
      return {
        go: true,
      };
    }

    async postMessageToKafka(event: any) {
      const producer = this.kafka.producer();
      await producer.connect();
      await producer.send({
        topic: 'topic-mission-events',
        messages: [{ value: JSON.stringify(event) }],
      });
      await producer.disconnect();
    }
}
