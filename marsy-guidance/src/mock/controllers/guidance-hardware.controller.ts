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


import { DeliveryDto } from '../dto/delivery.dto';
import { TelemetryRecordDto } from '../dto/telemetry-record.dto';
import { GuidanceHardwareService } from '../services/guidance-hardware.service';

@ApiTags('mock-guidance')
@Controller('/mock-guidance')
export class GuidanceHardwareController {
  private readonly logger: Logger = new Logger(GuidanceHardwareController.name);
  constructor(private readonly hardwareService: GuidanceHardwareService) {}
  @ApiOkResponse({
    type: DeliveryDto,
    description: 'The delivery status of the rocket guidance',
  })
  @Post(':idrocket/deliver')
  @HttpCode(200)
  async deliverRocket(@Param('idrocket') id: string): Promise<DeliveryDto> {
    this.logger.log(`Received request to deliver payload on the rocket guidance : ${id}`);
    const deliveryDto = await this.hardwareService.deliverRocket(id);
    this.logger.log('Stopping sending telemetry');
    this.hardwareService.stopSendingTelemetry(id);
    this.logger.log('Start sending payloaf hardware telemetry')
    this.hardwareService.startSendingPayloadHardwareTelemetry(id);
    return deliveryDto;
  }

  @Post('launch')
  @ApiOkResponse({
    description: 'Starts sending guidance telemetry data',
  })
  @HttpCode(200)
  async startSendingTelemetry(@Body() launchDto: TelemetryRecordDto): Promise<boolean> {
    //this.logger.log(`Received request to start sending guidance telemetry in stage two`);
    return await this.hardwareService.startSendingTelemetry(launchDto);
  }

  @ApiOkResponse({
    type: TelemetryRecordDto,
    description: 'The guidance hardware throttle down initialization',
  })
  @Post(':idrocket/throttle-down')
  @HttpCode(200)
  throttleDown(@Param('idrocket') id: string): boolean {
    //this.logger.log(`Received request to throttle down the rocket guidance : ${id}`);
    return this.hardwareService.throttleDown(id);
  }
}