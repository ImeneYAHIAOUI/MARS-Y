import { Controller, Post, Param, Get, Logger } from '@nestjs/common';
import { MissionService } from '../services/missions.service';

import { ApiOkResponse, ApiTags, ApiQuery, ApiNotFoundResponse, ApiServiceUnavailableResponse, ApiCreatedResponse } from '@nestjs/swagger';
import { GoResponseDto } from '../dto/go.dto';
import { RocketNotFoundException } from '../exceptions/rocket-not-found.exception';
import { RocketServiceUnavailableException } from '../exceptions/rocket-service-error-exception';
import { Mission } from '../schema/mission.schema';
import { MissionNotFoundException } from '../exceptions/mission-not-found.exception';

const logger = new Logger('MissionController'); 

@ApiTags('Missions')
@Controller('/missions')
export class MissionController {
  constructor(private readonly missionService: MissionService) {}

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

    const go = await this.missionService.goOrNoGoPoll(missionId);
    logger.log(`Response for mission ID: ${missionId}, Go: ${go}`);
    
    return { go };
  }

  @Get()
  @ApiOkResponse({ type: GoResponseDto, description: 'getting all mission' })
  async getAllMissions(): Promise<Mission[]> {
    const missions = await this.missionService.getAllMissions();
    return missions;
  }

  
  @Get(':id')
  @ApiOkResponse({type : Mission, description: 'getting mission' })
  async findById(@Param('id') id: string) {
    const mission = await this.missionService.getMissionById(id);
    return mission;
  }
}
