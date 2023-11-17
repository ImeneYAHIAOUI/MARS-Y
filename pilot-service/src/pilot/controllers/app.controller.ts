import { Controller, Get, Post , Logger, Param, HttpException, HttpStatus } from '@nestjs/common';
import { AppService } from '../services/app.service';
import { Kafka,EachMessagePayload } from 'kafkajs';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';

@Controller()
export class AppController {
    private readonly logger = new Logger(AppController.name);
  constructor(private readonly appService: AppService) {
}

  @Get()
  @ApiOperation({ summary: 'Get pilot service information', description: 'Retrieve information about the pilot service.' })
  @ApiResponse({ status: 200, description: 'Successful operation', type: String })
  getService(): string {
    return this.appService.getService();
  }
  @Post('/takeControl/:rocketId')
  @ApiOperation({ summary: 'Reorient payload', description: 'Take control and reorient the orbit of the satellite for the specified rocket.' })
  @ApiResponse({ status: 200, description: 'Successfully reoriented sat' })
  @ApiResponse({ status: 500, description: 'Failed to take control : Internal server error' })
  async reorientPayload(@Param('rocketId') rocketId: string): Promise<void> {
    try {
      this.appService.reorientPayload(rocketId);
    } catch (error) {
      throw new HttpException('Failed to take control', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }
}


