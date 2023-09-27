import {
  Controller,
  Post,
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
    logger.log(
      `Updating mission status to IN_PROGRESS for mission id: ${missionId}`,
    );
    this.missionService.saveNewStatus(missionId, MissionStatus.IN_PROGRESS);
    logger.log(`Received request for mission ID: ${missionId}`);

    const go = await this.missionService.goOrNoGoPoll(missionId);
    logger.log(`Response for mission ID: ${missionId}, Go: ${go}`);

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


    @Post(':idrocket/telemetry')
    @ApiNotFoundResponse({
        type: RocketNotFoundException,
        description: 'Rocket not found',
      })
    @HttpCode(200)
    async postTelemetryRecord(
      @Param('rocket id') idrocket: string ,
      @Body() telemetryRecordDto: MissionTelemetryDto,
    ): Promise<void> {
        logger.log(`Received telemetry for rocket ID: ${idrocket}`);
        this.missionService.evaluateRocketDestruction(
          idrocket,
        );

    }



}
