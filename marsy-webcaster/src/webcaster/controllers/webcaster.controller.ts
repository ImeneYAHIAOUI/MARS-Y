import { Controller, Get, Query, HttpCode } from '@nestjs/common';
import { Logger } from '@nestjs/common';
import {ApiOkResponse, ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';

import { Kafka } from 'kafkajs';
import { WebCasterService } from '../services/webcaster.service';
import { Webcasting } from '../schema/webcasting.schema';

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
    @Get('/service')
    @ApiOperation({ summary: 'Get webcaster service information', description: 'Retrieve information about the webcaster service.' })
    @ApiResponse({ status: 200, description: 'Successful operation', type: String })
    getService(): string {
      return this.webCasterService.getService();
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
        this.logger.log(`Message from web-caster: ${message.value.toString()}`);
        this.webCasterService.announceEvent(
          JSON.parse(message.value.toString()),
        );
      },
    });
  }

  @ApiOkResponse({ type: Webcasting, isArray: true })
  @Get('events')
  async listAllEvents(): Promise<Webcasting[]> {
    try {
      const events = await this.webCasterService.findAll();
      return events;
    } catch (error) {
      this.logger.error('Error while listing all events: ', error.message);
      throw error;
    }
  }
}
