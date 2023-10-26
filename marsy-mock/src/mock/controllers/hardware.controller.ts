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
import { Kafka } from 'kafkajs';
import { Event } from '../dto/event.dto';

@ApiTags('mock')
@Controller('/mock')
export class HardwareController {
  private readonly logger: Logger = new Logger(HardwareController.name);

  private kafka = new Kafka({
    clientId: 'hardware',
    brokers: ['kafka-service:9092'],
  });

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

  // 3) Startup (T-00:01:00)
  // 4) Main engine start (T-00:00:03)
  // 5) Liftoff/Launch (T+00:00:00)
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

  // 1) prepare
  @Post(':idrocket/prepare')
  @HttpCode(200)
  async prepare(@Param('idrocket') id: string): Promise<boolean> {
    this.logger.log(`Received request to prepare rocket: ${id}`);
    await this.hardwareService.postMessageToKafka({
      rocketId: id,
      event: Event.ROCKET_PREPARATION,
    });
    this.logger.log('Rocket prepared');
    return true;
  }
  // 2) power on
  @Post(':idrocket/power-on')
  @HttpCode(200)
  async powerOnRocket(@Param('idrocket') id: string): Promise<boolean> {
    this.logger.log(`Received request to power on rocket: ${id}`);
    await this.hardwareService.postMessageToKafka({
      rocketId: id,
      event: Event.ROCKET_INTERNAL_POWER_ON,
    });
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

  @Post('evaluateDestruction')
  @HttpCode(200)
  async evaluateDestruction(
    @Body() telemetry: TelemetryRecordDto,
  ): Promise<string> {
    await this.hardwareService.evaluateRocketDestruction(telemetry);
    return 'ok';
  }

  @Post('sleep')
  @HttpCode(200)
  async sleep(): Promise<string> {
    this.hardwareService.sleep();
    return 'ok';
  }

  @Post('wake')
  @HttpCode(200)
  async wake(): Promise<string> {
    this.hardwareService.wake();
    return 'ok';
  }
}
