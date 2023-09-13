import { Controller, Get, Param } from '@nestjs/common';
import { ApiOkResponse, ApiParam, ApiTags } from '@nestjs/swagger';

import { MonitoringService } from '../services/monitoring.service';

@ApiTags('monitoring')
@Controller('/monitoring')
export class MonitoringController {
  constructor(private readonly monitoringService: MonitoringService) {}

  @ApiParam({ name: 'rocketId', type: Number }) // Specify the parameter name and type
  @ApiOkResponse({ type: String, description: 'The rocket status.' })
  @Get('rockets/:rocketId') // Include the dynamic parameter in the route
  retrievePreparation(@Param('rocketId') rocketId: number): string {
    return this.monitoringService.getRocketStatus(rocketId);
  }
}
