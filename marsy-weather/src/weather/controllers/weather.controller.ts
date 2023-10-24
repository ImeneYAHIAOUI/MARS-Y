import { Controller, Post,Get, Query,Body ,Inject} from '@nestjs/common';
import { WeatherStatus } from '../schemas/weather-status.enum';
import { Logger } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { WeatherDto } from '../../dto/weather.dto';

import { Kafka } from 'kafkajs';


@Controller('weather')
@ApiTags('weather')
export class WeatherController {

  private kafka = new Kafka({
    clientId: 'hardware',
    brokers: ['kafka-service:9092'],
  });

  async postMessageToKafka(event: any) {
    const producer = this.kafka.producer();
    await producer.connect();
    await producer.send({
      topic: 'topic-mission-events',
      messages: [{ value: JSON.stringify(event) }],
    });
    await producer.disconnect();
  }

  private readonly logger = new Logger(WeatherController.name);
  constructor() {

  }

  @Get('status')
  async getWeatherStatus(@Query('lat') lat: number, @Query('long') long: number): Promise<{ status: WeatherStatus }> {
    //this.logger.log(`Requested weather status for lat: ${lat}, long: ${long}`);

    const cacheKey = `weather-status-${lat}-${long}`;

    const statuses = Object.values(WeatherStatus);
    const randomStatusIndex = Math.floor(Math.random() * statuses.length);
    const randomStatus = statuses[randomStatusIndex];

    //this.logger.log(`Response sent: status - ${randomStatus}`);
    return {
      status: randomStatus,
    };
  }

  @Post('poll')
    async pollWeather(@Body() weatherDto: WeatherDto):Promise<{ go: string }> {
      const weatherStatusResponse = await this.getWeatherStatus(weatherDto.lat, weatherDto.long);
      const canGo = weatherStatusResponse.status === WeatherStatus.Sunny;
      this.postMessageToKafka({ 
        weather: true,
      });
      return {
        go: "POLL REQUEST RECEIVED SUCCESSFULLY",
      };
    }
}
