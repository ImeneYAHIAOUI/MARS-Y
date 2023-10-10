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
  // @ApiOkResponse({
  //   type: DeliveryDto,
  //   description: 'The delivery status of the rocket',
  // })
  // @Post(':idrocket/deliver')
  // @HttpCode(200)
  // async deliverRocket(@Param('idrocket') id: string): Promise<DeliveryDto> {
  //   this.logger.log(`Received request to deliver rocket: ${id}`);
  //   const deliveryDto = await this.hardwareService.deliverRocket(id);
  //   this.hardwareService.stopSendingTelemetry(id);
  //   return deliveryDto;
  // }

  @ApiOkResponse({
    type: StagingDto,
    description: 'The staging status of the rocket',
  })
  @Post(':idrocket/stage')
  @HttpCode(200)
  async stageRocket(@Param('idrocket') id: string): Promise<StagingDto> {
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
    return await this.hardwareService.retrieveTelemetry(id);
  }

  @Post('launch')
  @ApiOkResponse({
    description: 'Starts sending telemetry data',
  })
  @HttpCode(200)
  async startSendingTelemetry(@Body() launchDto: LaunchDto): Promise<boolean> {
    return await this.hardwareService.startSendingTelemetry(launchDto.rocketId);
  }

  @Post(':idrocket/land')
  @ApiOkResponse({
    description: 'Starts landing booster rocket',
  })
  @HttpCode(200)
  async landRocketBooster(@Param('idrocket') id: string): Promise<boolean> {
    return await this.hardwareService.landBooster(id);
  }

  @Post(':idrocket/destroy')
  @HttpCode(200)
  async destroyRocket(@Param('idrocket') id: string): Promise<void> {
    this.hardwareService.stopSendingTelemetry(id);
  }
@Post(':idrocket/prepare')
@HttpCode(200)
throttleDown(@Param('idrocket') id: string): boolean {
  this.logger.log(`Received request to prepare rocket: ${id}`);
  this.logger.log(`Step 1: Fueling for rocket ${id}`);
  this.logger.log(`Step 2: Status check for rocket ${id}`);
  this.logger.log('Rocket prepared');
  return true;
}
@Post(':idrocket/power-on')
@HttpCode(200)
powerOnRocket(@Param('idrocket') id: string): boolean {
  this.logger.log(`Received request to power on rocket: ${id}`);
  this.logger.log(`Step 1: Activating internal power for rocket ${id}`);
  this.logger.log('Rocket on internal power');
  return true;
}

  @ApiOkResponse({
    type: TelemetryRecordDto,
    description: 'The guidance hardware throttle down initialization',
  })
  @Post(':idrocket/throttle-down')
  @HttpCode(200)
  throttleDown(@Param('idrocket') id: string): boolean {
    return this.hardwareService.throttleDown(id);
  }
}
