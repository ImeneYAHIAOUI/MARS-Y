import { Body, Controller, Get, Query, Post, Logger, Param } from '@nestjs/common';
import {
  ApiBody,
  ApiCreatedResponse,
  ApiOkResponse,
  ApiTags,
} from '@nestjs/swagger';

import { TelemetryService } from '../services/telemetry.service';
import { TelemetryRecordDto } from '../dto/telemetry-record.dto';
import { TelemetryRecord } from '../schemas/telemetry-record.schema';
import { BoosterTelemetryRecordDto } from '../dto/booster-telemetry-record.dto';

@ApiTags('telemetry')
@Controller('/telemetry')
export class TelemetryController {
  private readonly logger: Logger = new Logger(TelemetryController.name);

  constructor(private readonly rocketService: TelemetryService) {}

  @ApiOkResponse({ type: TelemetryRecord, isArray: true })
  @Get()
  async getMissionTelemetryRecords(
    @Query('missionId') missionId: string,
  ): Promise<TelemetryRecord[]> {
    // this.logger.log(
    //   `Received request to get telemetry records for mission ${missionId}`,
    // );
    return await this.rocketService.fetchRocketTelemetryRecords(missionId);
  }

  @ApiBody({ type: TelemetryRecordDto })
  @ApiCreatedResponse({
    type: TelemetryRecord,
    description: 'The rocket telemetry has been successfully added.',
  })
  @Post()
  async postMissionTelemetryRecord(
    @Body() telemetryRecordDto: TelemetryRecordDto,
  ): Promise<TelemetryRecord> {
    // this.logger.log(
    //   `Received request to add telemetry: ${telemetryRecordDto.missionId}`,
    // );
    return await this.rocketService.storeTelemetryRecord(telemetryRecordDto);
  }

  @ApiBody({ type: BoosterTelemetryRecordDto })
  @ApiCreatedResponse({
    type: BoosterTelemetryRecordDto,
    description: 'The booster telemetry has been successfuly stored.',
  })
  @Post(':idrocket/booster')
  async postMissionBoosterTelemetryRecord(
    @Body() telemetryRecordDto: BoosterTelemetryRecordDto,
    @Param('idrocket') id: string,
  ): Promise<BoosterTelemetryRecordDto> {
    // this.logger.log(
    //   `Received request to add booster telemetry: ${telemetryRecordDto.missionId}`,
    // );
    return await this.rocketService.storeBoosterTelemetryRecord(telemetryRecordDto, id);
  }
}
