import { Controller, Get,Post,Logger } from '@nestjs/common';
import { AppService } from '../services/app.service';
import {EventDto} from '../dto/event.dto';
import {Event} from '../dto/event.dto';
import {ApiOkResponse, ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
@Controller()
export class AppController {
  private readonly logger = new Logger(AppController.name);
  constructor(private readonly appService: AppService) {
      //this.appService.launch_events_listener();
}
  @Get()
  @ApiOperation({ summary: 'Get broadcast service information', description: 'Retrieve information about the broadcast service.' })
  @ApiResponse({ status: 200, description: 'Successful operation', type: String })
  getService(): string {
    return this.appService.getService();
  }
}
