import { Controller, Get, Logger } from '@nestjs/common';
import { BroadcastService } from '../services/broadcast.service';

import { ApiOperation, ApiResponse } from '@nestjs/swagger';
@Controller()
export class AppController {
  private readonly logger = new Logger(AppController.name);
  constructor(private readonly broadcastService: BroadcastService) {
    //this.appService.launch_events_listener();
  }
  @Get()
  @ApiOperation({
    summary: 'Get broadcast service information',
    description: 'Retrieve information about the broadcast service.',
  })
  @ApiResponse({
    status: 200,
    description: 'Successful operation',
    type: String,
  })
  getService(): string {
    return this.broadcastService.getService();
  }
}
