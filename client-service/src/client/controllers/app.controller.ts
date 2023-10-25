import { Controller, Get, Post , Logger } from '@nestjs/common';
import { AppService } from '../services/app.service';
import { Kafka,EachMessagePayload } from 'kafkajs';
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
    eachMessage: async ({ topic, partition, message }:EachMessagePayload ) => {
      const messageValue = message.value?.toString();
      const messageKey = message.key?.toString();
       this.logger.log(`Received event  ${messageValue} from payload service`);
      if (messageValue === 'DELIVERED') {
        this.logger.log(`Payload of rocket ${messageKey} has been delivered.`);
        // envoyez a Payload Hardware Service

      }
    },
  });
    const consumer1 = this.kafka.consumer({
      groupId: 'client-service-group-1',
    });

    await consumer1.connect();
    await consumer1.subscribe({
      topic: 'broadcast-events',
      fromBeginning: true,
    });

  await consumer1.run({
    eachMessage: async ({ message }) => {
      const messageValue = message.value.toString();
      const messageKey = message.key.toString();
       this.logger.log(`Received event  ${messageValue} from broadcast service`);
    },}
  );
}


}
