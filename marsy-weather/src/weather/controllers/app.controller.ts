import { Controller, Get } from '@nestjs/common';
import { AppService } from '../services/app.service';
import {ApiOkResponse, ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  @ApiOperation({ summary: 'Get weather service information', description: 'Retrieve information about the weather service.' })
  @ApiResponse({ status: 200, description: 'Successful operation', type: String })
  getService(): string {
    return this.appService.getService();
  }
}
