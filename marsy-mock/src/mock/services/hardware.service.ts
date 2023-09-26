import {
  Injectable, Logger,
} from '@nestjs/common';

import { TelemetryRecordDto } from '../dto/telemetry-record.dto';
import { DeliveryDto } from '../dto/delivery.dto';
import { StagingDto } from '../dto/staging.dto';


@Injectable()
export class HardwareService {
  private readonly logger : Logger = new Logger(HardwareService.name);

  constructor() {}

  async deliverRocket(rocketId : string) : Promise<DeliveryDto> {
    this.logger.log(`Delivering rocket ${rocketId}`);
    return {
      _id: rocketId,
      delivered: true,
    };
  }

  async stageRocket(rocketId : string) : Promise<StagingDto> {
    this.logger.log(`Staging rocket ${rocketId}`);
    return {
      _id: rocketId,
      staged: true
    };
  }

  async retrieveTelemetry(rocketId : string) : Promise<TelemetryRecordDto> {
    this.logger.log(`Retrieving telemetry for the rocket ${rocketId}`);
    return {
      timestamp: Date.now(),
      longitude: Math.floor(Math.random() * (255 - 0)) + 0,
      altitude: Math.floor(Math.random() * (255 - 0)) + 0,
      latitude: Math.floor(Math.random() * (255 - 0)) + 0,
      pressure: Math.floor(Math.random() * (255 - 0)) + 0,
      speed: Math.floor(Math.random() * (255 - 0)) + 0,
      humidity: Math.floor(Math.random() * (255 - 0)) + 0,
      temperature: Math.floor(Math.random() * (255 - 0)) + 0,
      fuel: Math.floor(Math.random() * (255 - 0)) + 0,
    };
  }
}
