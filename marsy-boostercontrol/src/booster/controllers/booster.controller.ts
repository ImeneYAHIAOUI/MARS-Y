import { Body, Param , Controller, Logger, Post } from '@nestjs/common';

import { BoosterService } from '../services/booster.service';

import {
    ApiOkResponse,
    ApiTags
  } from '@nestjs/swagger';
import { BoosterTelemetryDto } from '../dtos/booster.telemetry.dto';
import { BoosterDto } from '../dtos/booster.dto';

const logger = new Logger('BoosterController');

@Controller('booster')
@ApiTags('Booster')
export class BoosterController {

  constructor(private readonly boosterService: BoosterService) {}

  @ApiOkResponse({ description: 'Booster data received!' })
  @Post(':rocketId/telemetry')
  async reveiveBoosterDta(@Body() boosterTelemetryDto: BoosterTelemetryDto,
   @Param() params: { rocketId: string }) : Promise<string> {
    logger.log(`Received booster telemetry data  for mission id ${boosterTelemetryDto.missionId}`);
    return this.boosterService.receiveBoosterData(boosterTelemetryDto, params.rocketId);
  }

  @Post()
  async createBooster(@Body() BoosterDto: BoosterDto) : Promise<void> {
    return this.boosterService.createBooster(BoosterDto);
  }
}