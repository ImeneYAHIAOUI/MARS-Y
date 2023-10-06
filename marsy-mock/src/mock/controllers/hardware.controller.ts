import {
  Controller,
  Get,
  Param,
  Post,
  Logger,
  HttpCode,
  Body,
} from '@nestjs/common';
import {
  ApiBody,
  ApiCreatedResponse,
  ApiOkResponse,
  ApiTags,
} from '@nestjs/swagger';

import { HardwareService } from '../services/hardware.service';
import { DeliveryDto } from '../dto/delivery.dto';
import { StagingDto } from '../dto/staging.dto';
import { TelemetryRecordDto } from '../dto/telemetry-record.dto';
import { LaunchDto } from '../dto/launch.dto';

@ApiTags('mock')
@Controller('/mock')
export class HardwareController {
  private readonly logger: Logger = new Logger(HardwareController.name);
  constructor(private readonly hardwareService: HardwareService) {}


  @ApiOkResponse({
    type: StagingDto,
    description: 'The staging status of the rocket',
  })
  @Post(':idrocket/stage')
  @HttpCode(200)
  async stageRocket(@Param('idrocket') id: string): Promise<StagingDto> {
    //this.logger.log(`Received request to stage rocket: ${id}`);
    return await this.hardwareService.stageRocket(id);
  }

  @ApiOkResponse({
    type: TelemetryRecordDto,
    description: 'The telemetry data for the rocket',
  })
  @Get(':idrocket/telemetry')
  async getRocketTelemetry(
    @Param('idrocket') id: string,
  ): Promise<TelemetryRecordDto> {
    //this.logger.log(`Received request to get telemetry for rocket: ${id}`);
    return await this.hardwareService.retrieveTelemetry(id);
  }

  @Post('launch')
  @ApiOkResponse({
    description: 'Starts sending telemetry data',
  })
  @HttpCode(200)
  async startSendingTelemetry(@Body() launchDto: LaunchDto): Promise<boolean> {
    //this.logger.log(`Received request to start telemetry`);
    return await this.hardwareService.startSendingTelemetry(launchDto.rocketId);
  }

  @Post(':idrocket/land')
  @ApiOkResponse({
    description: 'Starts landing booster rocket',
  })
  @HttpCode(200)
  async landRocketBooster(@Param('idrocket') id: string): Promise<boolean> {
    //this.logger.log(`Received request to start landing booster for mission ${id}`);
    return await this.hardwareService.landBooster(id);
  }

  @Post(':idrocket/destroy')
  @HttpCode(200)
  async destroyRocket(@Param('idrocket') id: string): Promise<void> {
    //this.logger.log(`Received request to deliver rocket: ${id}`);
    this.hardwareService.stopSendingTelemetry(id);
  }
}
