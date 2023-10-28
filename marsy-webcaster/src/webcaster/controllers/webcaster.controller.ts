import {
  Controller,
  Post,
  Get,
  Query,
  Body,
  Inject,
  HttpCode,
} from '@nestjs/common';
import { Logger } from '@nestjs/common';
import { ApiBody, ApiOkResponse, ApiTags } from '@nestjs/swagger';
import { PublishEventDto } from '../dto/publish-event.dto';
import { Kafka } from 'kafkajs';
import { WebCasterService } from '../services/webcaster.service';

@Controller('webcaster')
@ApiTags('webcaster')
export class WebcasterController {
  private readonly logger = new Logger(WebcasterController.name);

  private kafka = new Kafka({
    clientId: 'web-caster',
    brokers: ['kafka-service:9092'],
  });

  constructor(private readonly webCasterService: WebCasterService) {
    this.mission_launch_steps_events_listener();
  }

  @Get()
  @HttpCode(200)
  async postMessageToKafka(@Query('message') message: string): Promise<string> {
    const producer = this.kafka.producer();
    await producer.connect();
    await producer.send({
      topic: 'events-web-caster',
      messages: [{ value: message }],
    });
    await producer.disconnect();
    return message;
  }

  async mission_launch_steps_events_listener() {
    const consumer = this.kafka.consumer({ groupId: 'web-caster-group' });
    await consumer.connect();
    await consumer.subscribe({
      topic: 'events-web-caster',
      fromBeginning: true,
    });
    await consumer.run({
      eachMessage: async ({ message }) => {
        this.webCasterService.announceEvent(
          JSON.parse(message.value.toString()),
        );
      },
    });
  }

  @ApiBody({ type: PublishEventDto })
  @ApiOkResponse({ type: PublishEventDto, isArray: true })
  @Post('publish')
  @HttpCode(200)
  async publishEvent(@Body() event: PublishEventDto): Promise<PublishEventDto> {
    this.logger.log(`Message from ${event.publisher} : ${event.event}`);
    return event;
  }
}
