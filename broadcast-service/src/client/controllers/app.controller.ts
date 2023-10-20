import { Controller, Get,Post,Logger } from '@nestjs/common';
import { AppService } from '../services/app.service';
import { Kafka } from 'kafkajs';
import {EventDto} from '../dto/event.dto';
import {Event} from '../dto/event.dto';
@Controller()
export class AppController {
  private readonly logger = new Logger(AppController.name);

  private kafka = new Kafka({
    clientId: 'client-service',
    brokers: ['kafka-service:9092'],
  });
  constructor(private readonly appService: AppService) {
      this.launch_events_listener();
}

  @Get()
  getService(): string {
    return this.appService.getService();
  }

    async launch_events_listener() {
      const consumer = this.kafka.consumer({ groupId: 'broadcast-group' });
      await consumer.connect();
      await consumer.subscribe({
        topic: 'events-broadcast',
        fromBeginning: true,
      });
     await consumer.run({
       eachMessage: async ({ message }) => {
       this.logger.log('Received event', message.value.toString());
       const eventDto: EventDto = {
      event: message.value.toString() as Event,};
         await this.appService.requestLaunchDetails(eventDto);       },
     });

    }


}
