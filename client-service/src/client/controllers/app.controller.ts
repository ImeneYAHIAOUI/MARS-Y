import { Controller, Get, Post , Logger,Param } from '@nestjs/common';
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
    eachMessage: async ({  message }:EachMessagePayload ) => {
      const payload = JSON.parse(message.value.toString());
      const messageValue = payload.message?.toString();
      const messageKey = payload.rocketId?.toString();
       this.logger.log(`Received event  ${messageValue} from payload service`);
      if (messageValue === 'DELIVERED') {
        const rocket=messageKey.slice(-3).toUpperCase()
        this.logger.log(`Payload of rocket ${rocket} has been delivered.`);
        this.appService.announceEvent(messageKey);
      }else if(messageValue === 'BROADCASTING STARTED'){
        this.logger.log(`broadcast service started broadcasting`);
      }else if(messageValue === 'BROADCASTING TERMINATED'){
        this.logger.log(`broadcast service stopped broadcasting`);
      }
      else if(messageValue === 'BROADCASTING DISTURBED'){
          this.logger.log(`broadcasting disturbed`);
          this.appService.requestPilotService(messageKey);
      }else if(messageValue === 'BROADCASTING RESUMED'){
        this.logger.log(`broadcasting resumed`);}
    },
  });

}


}
