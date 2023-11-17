import { Controller, Get, Post , Logger, Param, HttpException, HttpStatus } from '@nestjs/common';
import { AppService } from '../services/app.service';
import { Kafka,EachMessagePayload } from 'kafkajs';
import {ApiOkResponse, ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
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
    @ApiOperation({ summary: 'Get client service information', description: 'Retrieve information about the client service.' })
    @ApiResponse({ status: 200, description: 'Successful operation', type: String })
  getService(): string {
    return this.appService.getService();
  }
 @Post('/send')
 @ApiOperation({ summary: ' initiates satellite launches ', description: 'client service initiates satellite launches.' })
 @ApiResponse({ status: 500, description: 'Failed to initiate satellite launches : Internal server error' })
  async sendLaunchDetails(): Promise<void> {
    try {
    this.logger.log('Initializing launch details');
    } catch (error) {
       throw new HttpException('Failed to initiate satellite launches', HttpStatus.INTERNAL_SERVER_ERROR);
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
