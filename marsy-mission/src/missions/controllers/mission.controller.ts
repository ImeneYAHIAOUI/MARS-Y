import {
  Controller,
  Post, 
  Put,
  Param,
  Get,
  Logger,
  Query,
  Body,
  HttpCode,
  Delete,
} from '@nestjs/common';
import { MissionService } from '../services/missions.service';

import {
  ApiOkResponse,
  ApiTags,
  ApiNotFoundResponse,
  ApiServiceUnavailableResponse,
  ApiCreatedResponse,
  ApiConflictResponse,
} from '@nestjs/swagger';
import { GoResponseDto } from '../dto/go.dto';
import { RocketNotFoundException } from '../exceptions/rocket-not-found.exception';
import { RocketServiceUnavailableException } from '../exceptions/rocket-service-error-exception';
import { Mission } from '../schema/mission.schema';
import { MissionNotFoundException } from '../exceptions/mission-not-found.exception';
import { MissionStatus } from '../schema/mission.status.schema';
import { MissionExistsException } from '../exceptions/mission-exists.exception';
import { AddMissionDto } from '../dto/add.mission.dto';
import { MissionBoosterDto } from '../dto/mission.booster.dto';
import { MissionTelemetryDto } from '../dto/mission-telemetry.dto';

const logger = new Logger('MissionController');

@ApiTags('Missions')
@Controller('/missions')
export class MissionController {
  constructor(private readonly missionService: MissionService) {}
  @Post(':id/poll')
  @HttpCode(200)
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
  @ApiCreatedResponse({
    type: GoResponseDto,
    description: 'Go or Not poll response',
  })
  async goOrNoGo(@Param('id') missionId: string): Promise<GoResponseDto> {
    this.missionService.saveNewStatus(missionId, MissionStatus.IN_PROGRESS);
    const go = await this.missionService.goOrNoGoPoll(missionId);
    return { go };
  }

  @Get()
  @ApiOkResponse({ description: 'getting all mission' })
  async getAllMissions(): Promise<Mission[]> {
    const missions = await this.missionService.getAllMissions();
    return missions;
  }

  @ApiNotFoundResponse({
    type: MissionNotFoundException,
    description: 'mission not found',
  })
  @Get('search')
  @ApiOkResponse({
    type: Mission,
    description: 'Getting missions by rocket ID and status',
  })
  async findByRocketIdAndStatus(
    @Query('rocketId') rocketId: string,
    @Query('status') status: string,
  ) {
    const mission = await this.missionService.getMissionByRocketIdAndStatus(
      rocketId,
      status,
    );
    return mission;
  }

  @Get(':id')
  @ApiOkResponse({ type: Mission, description: 'getting mission' })
  async findById(@Param('id') id: string) {
    const mission = await this.missionService.getMissionById(id);
    return mission;
  }

  @Post()
  @ApiCreatedResponse({ type: Mission })
  @ApiConflictResponse({
    type: MissionExistsException,
    description: 'site already exists',
  })
  async createSite(@Body() addDto: AddMissionDto): Promise<Mission> {
    return this.missionService.createMission(
      addDto.name,
      addDto.rocket,
      addDto.site,
    );
  }
  @Delete(':id')
  @ApiOkResponse({ type: Mission, description: 'deleting mission' })
  @ApiNotFoundResponse({
    type: MissionNotFoundException,
    description: 'mission not found',
  })
  async deleteMission(@Param('id') id: string) {
    const mission = await this.missionService.deleteMission(id);
    return mission;
  }

  @Put()
  @ApiOkResponse({ type: Mission, description: 'updating mission' })
  @ApiNotFoundResponse({
    type: MissionNotFoundException,
    description: 'mission not found',
  })
  async updateMission(@Body() mission: MissionBoosterDto) {
    const updatedMission = await this.missionService.saveNewStatusBooster(mission);
    return updatedMission;
  }


@Post(':idrocket/telemetry')
@HttpCode(200)
async postTelemetryRecord(
  @Param('idrocket') rocketId: string,
  @Body() telemetryRecordDto: MissionTelemetryDto,
): Promise<void> {
  try {
    logger.log(`Received telemetry for rocket ${rocketId.slice(-3).toUpperCase()}`);
    await this.missionService.evaluateRocketDestruction(rocketId,telemetryRecordDto);
  } catch (error) {
    logger.error(`Error while processing telemetry: ${error.message}`);
    throw error;
  }
}
}
