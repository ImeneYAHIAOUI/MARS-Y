import { Controller, Get, Post , Logger } from '@nestjs/common';
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
      this.receiveEventListener();
}

  @Get()
  getService(): string {
    return this.appService.getService();
  }
 @Post('/send')
  async sendLaunchDetails(): Promise<void> {
    try {
    this.logger.log('Sending launch details');
    } catch (error) {
      throw new Error('Failed to send launch details');
    }
  }
async receiveEventListener(): Promise<void> {
  const consumer = this.kafka.consumer({
    groupId: 'client-service-group',
  });

  await consumer.connect();
  await consumer.subscribe({
    topic: 'client-service-events',
    fromBeginning: true,
  });

  await consumer.run({
    eachMessage: async ({ message }) => {
      const messageValue = message.value.toString();
        this.logger.log(`Received event: ${messageValue}`);
      if (messageValue === 'DELIVERED') {
        const producer = this.kafka.producer();
        await producer.connect();

        await producer.send({
          topic: 'events-broadcast',
          messages: [{ value: 'LAUNCHED' }],
        });
        this.logger.log('Sent event to broadcast service: LAUNCHED');
        await producer.disconnect();
      }
    },
  });
}


}
