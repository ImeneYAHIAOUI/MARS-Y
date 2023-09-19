import { Controller, Get, Param, Query, Logger } from '@nestjs/common';
import { GoPollService } from '../services/go-poll.service';

import { ApiOkResponse, ApiParam, ApiTags, ApiQuery, ApiNotFoundResponse, ApiServiceUnavailableResponse } from '@nestjs/swagger';
import { GoResponseDto } from '../dto/go.dto';import { RocketNotFoundException } from '../exceptions/rocket-not-found.exception';
import { RocketServiceUnavailableException } from '../exceptions/rocket-service-error-exception';

const logger = new Logger('GoPollController'); 

@ApiTags('Go')
@Controller('/go')
export class GoPollController {
  constructor(private readonly goPollService: GoPollService) {}

  @Get('rockets')
  @ApiQuery({ name: 'name', required: true })

  @ApiNotFoundResponse({
    type: RocketNotFoundException,
    description: 'Rocket not found',
  })
  @ApiServiceUnavailableResponse({
    type: RocketServiceUnavailableException,
    description: 'MarsyRocketService is unavailble',
  })
  @ApiOkResponse({ type: GoResponseDto, description: 'Go or Not poll response' })
  async goOrNoGo(@Query('name') rocketName: string): Promise<GoResponseDto> {
    logger.log(`Received request for rocket name: ${rocketName}`);

    const go = await this.goPollService.goOrNoGoPoll(rocketName);
    logger.log(`Response for rocket name: ${rocketName}, Go: ${go}`);
    return { go };
  }
}
