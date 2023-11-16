import { Controller, Get } from '@nestjs/common';
import { AppService } from './app.service';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
    @ApiOperation({ summary: 'Get booster service information', description: 'Retrieve information about the booster service.' })
    @ApiResponse({ status: 200, description: 'Successful operation', type: String })
  getHello(): string {
    return this.appService.getHello();
  }
}