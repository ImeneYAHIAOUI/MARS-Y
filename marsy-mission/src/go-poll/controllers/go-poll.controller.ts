import { Controller, Post, Param, Get, Logger } from '@nestjs/common';
import { MissionService } from '../services/missions.service';

import { ApiOkResponse, ApiParam, ApiTags, ApiQuery, ApiNotFoundResponse, ApiServiceUnavailableResponse, ApiCreatedResponse } from '@nestjs/swagger';
import { GoResponseDto } from '../dto/go.dto';import { RocketNotFoundException } from '../exceptions/rocket-not-found.exception';
import { RocketServiceUnavailableException } from '../exceptions/rocket-service-error-exception';
import { Mission } from '../schema/mission.schema';
import { MissionNotFoundException } from '../exceptions/mission-not-found.exception';

const logger = new Logger('GoPollController'); 

@ApiTags('Missions')
@Controller('/missions')
export class GoPollController {
  constructor(private readonly goPollService: MissionService) {}

  @Post(':id/poll')
  @ApiNotFoundResponse({
    type: RocketNotFoundException,
    description: 'Rocket not found',
  })
  @ApiServiceUnavailableResponse({
    type: RocketServiceUnavailableException,
    description: 'MarsyRocketService is unavailble',
  })
  @ApiNotFoundResponse({
    type: MissionNotFoundException,
    description: 'mission not found',
  })
  @ApiCreatedResponse({ type: GoResponseDto, description: 'Go or Not poll response' })
  async goOrNoGo(@Param('id') missionId: string): Promise<GoResponseDto> {
    logger.log(`Received request for mission ID: ${missionId}`);

    const go = await this.goPollService.goOrNoGoPoll(missionId);
    logger.log(`Response for mission ID: ${missionId}, Go: ${go}`);
    
    return { go };
  }

  @Get()
  @ApiOkResponse({ type: GoResponseDto, description: 'getting all mission' })
  async getAllMissions(): Promise<Mission[]> {
    const missions = await this.goPollService.getAllMissions();
    return missions;
  }
}
