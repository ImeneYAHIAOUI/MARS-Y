import {
  Controller,
  Get,
  Param,
  Post,
  Logger,
  HttpCode,
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

@ApiTags('mock')
@Controller('/mock')
export class HardwareController {
  private readonly logger: Logger = new Logger(HardwareController.name);
  constructor(private readonly hardwareService: HardwareService) {}
  @ApiOkResponse({
    type: DeliveryDto,
    description: 'The delivery status of the rocket'
  })
  @Post(":idrocket/deliver")
  @HttpCode(200)
  async deliverRocket(@Param("idrocket") id: string): Promise<DeliveryDto> {
    this.logger.log(`Received request to deliver rocket: ${id}`);
    return await this.hardwareService.deliverRocket(id);
  }

  @ApiOkResponse({
    type: StagingDto,
    description: 'The staging status of the rocket'
  })
  @Post(":idrocket/stage")
  @HttpCode(200)
  async stageRocket(@Param("idrocket") id: string): Promise<StagingDto> {
    this.logger.log(`Received request to stage rocket: ${id}`);
    return await this.hardwareService.stageRocket(id);
  }

  @ApiOkResponse({
    type: TelemetryRecordDto,
    description: 'The telemetry data for the rocket'
  })
  @Get(":idrocket/telemetry")
  async getRocketTelemetry(@Param("idrocket") id: string): Promise<TelemetryRecordDto> {
    this.logger.log(`Received request to get telemetry for rocket: ${id}`);
    return await this.hardwareService.retrieveTelemetry(id);
  }
}
