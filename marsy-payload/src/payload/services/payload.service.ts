import { Injectable, Logger } from '@nestjs/common';
import { MarsyLaunchpadProxyService } from './marsy-launchpad-proxy/marsy-launchpad-proxy.service';
import { TelemetryDto } from '../dto/telemetry.dto';
import { PayloadDeliveryDto } from '../dto/payload-delivery.dto';

const logger = new Logger('PayloadService');

const latitude = 280;
const longitude = 300;
const altitude = 250;
const angle = 80;
@Injectable()
export class PayloadService {
  constructor(
    private readonly marsyLaunchpadProxyService: MarsyLaunchpadProxyService,
  ) {}
  async receiveTelemetry(
    rocketId: string,
    telemetry: TelemetryDto,
  ): Promise<PayloadDeliveryDto | void> {
    logger.log('telemetry received');
    if (
      telemetry.latitude === latitude &&
      telemetry.longitude === longitude &&
      telemetry.altitude === altitude &&
      telemetry.angle === angle
    ) {
      logger.log('orbit reached');
      return this.marsyLaunchpadProxyService.notifyCommandPadOfOrbitReach(
        rocketId,
      );
    } else {
      logger.log('orbit not reached');
    }
  }
}
