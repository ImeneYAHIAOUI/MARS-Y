import { Injectable, Logger,Post } from '@nestjs/common';
import { EventDto } from '../dto/event.dto';
import { Kafka } from 'kafkajs';

@Injectable()
export class AppService {
  private readonly logger = new Logger(AppService.name);
  private kafka = new Kafka({
    clientId: 'broadcast-service',
    brokers: ['kafka-service:9092'],
  });
  constructor() {}

  getService(): string {
    return 'Welcome to the broadcast service!';
  }
     async launch_events_listener() {
        const consumer = this.kafka.consumer({ groupId: 'broadcast-group' });
        await consumer.connect();
        await consumer.subscribe({
          topic: 'payload-hardware',
          fromBeginning: true,
        });
       await consumer.run({
         eachMessage: async ({ message }) => {
         this.logger.log('Received event', message.value.toString());
        // const eventDto: EventDto = {
        //event: message.value.toString() as Event,};
           //await this.appService.requestLaunchDetails(eventDto);

        },
       });

      }
}

