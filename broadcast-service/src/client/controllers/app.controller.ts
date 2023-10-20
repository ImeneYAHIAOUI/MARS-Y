import { Controller, Get,Post,Logger } from '@nestjs/common';
import { AppService } from '../services/app.service';
import { Kafka } from 'kafkajs';
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
        eachMessage: async ({ topic, partition, message }) => {
          this.appService.requestLaunchDetails(
            JSON.parse(message.value.toString()),
          );
        },
      });
    }

}
