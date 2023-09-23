import {
  Body,
  Controller,
  Get,
  Query,
  Post,
  Logger,
} from '@nestjs/common';
import {
  ApiBody,
  ApiCreatedResponse,
  ApiOkResponse,
  ApiTags,
} from '@nestjs/swagger';

import { TelemetryService } from '../services/telemetry.service';
import { TelemetryRecordDto } from '../dto/telemetry-record.dto';
import { TelemetryRecord } from '../schemas/telemetry-record.schema';

@ApiTags('telemetry')
@Controller('/telemetry')
export class TelemetryController {
  private readonly logger: Logger = new Logger(TelemetryController.name);

  constructor(private readonly rocketService: TelemetryService) {}

  @ApiOkResponse({ type: TelemetryRecord, isArray: true })
  @Get()
  async getMissionTelemetryRecords(@Query("missionId") missionId: string): Promise<TelemetryRecord[]> {
    this.logger.log(`Received request to get telemetry records for mission ${missionId}`);
    return await this.rocketService.fetchRocketTelemetryRecords(missionId);
  }

  @ApiBody({ type: TelemetryRecordDto })
  @ApiCreatedResponse({
    type: TelemetryRecord,
    description: 'The rocket has been successfully added.',
  })
  @Post()
  async postMissionTelemetryRecord(@Body() telemetryRecordDto: TelemetryRecordDto): Promise<TelemetryRecord> {
    this.logger.log(`Received request to add rocket: ${telemetryRecordDto.missionId}`);
    return await this.rocketService.storeTelemetryRecord(telemetryRecordDto);
  }
}
