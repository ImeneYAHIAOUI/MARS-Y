import { Controller, Get, Post , Logger, Param } from '@nestjs/common';
import { AppService } from '../services/app.service';
import { Kafka,EachMessagePayload } from 'kafkajs';
@Controller()
export class AppController {
    private readonly logger = new Logger(AppController.name);
  constructor(private readonly appService: AppService) {
}

  @Get()
  getService(): string {
    return this.appService.getService();
  }
 @Post('/takeControl/:rocketId')
  async reorientPayload(  @Param('rocketId') rocketId: string): Promise<void> {
    try {
        this.appService.reorientPayload(rocketId);
    } catch (error) {
      throw new Error('Failed to take control');
    }
  }
}


