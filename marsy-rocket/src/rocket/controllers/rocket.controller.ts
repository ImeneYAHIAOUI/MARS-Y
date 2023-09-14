import { Controller, Get, Param } from '@nestjs/common';
import { ApiOkResponse, ApiParam, ApiTags } from '@nestjs/swagger';

import { RocketService } from '../services/rocket.service';

@ApiTags('rocket')
@Controller('/rocket')
export class RocketController {
  constructor(private readonly rocketService: RocketService) {}

  @ApiParam({ name: 'rocketId' })
  @ApiOkResponse({ type: String, description: 'The rockets status.' })
  @Get(':rocketId')
  retrievePreparation(@Param() params: { rocketId: string }): string {
    const rocketId = params.rocketId; // Access the 'rocketId' property
    return this.rocketService.getRocketStatus(rocketId);
  }
}
