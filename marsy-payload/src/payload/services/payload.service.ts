import { Injectable, Logger } from '@nestjs/common';
import { MarsyLaunchpadProxyService } from './marsy-launchpad-proxy/marsy-launchpad-proxy.service';
import { TelemetryDto } from '../dto/telemetry.dto';
import { PayloadDeliveryDto } from '../dto/payload-delivery.dto';

const logger = new Logger('PayloadService');

const latitude = 280;
const longitude = 80;
const altitude = 10000;
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
  const rocketCode = rocketId.slice(-3).toUpperCase();
  const rocketInfo = `Rocket ${rocketCode} - altitude: ${telemetry.altitude} - latitude: ${telemetry.latitude} - longitude: ${telemetry.longitude} - angle: ${telemetry.angle.toPrecision(2)}`;
  logger.log(`Received telemetry for ${rocketInfo}`);
  if (
    telemetry.latitude < (latitude + 15) &&
    telemetry.latitude > (latitude - 15) &&
    telemetry.longitude < (longitude + 15) &&
    telemetry.longitude > (longitude - 15) &&
    telemetry.altitude > (altitude - 150)
  ) {
     logger.log(`Orbit reached for ${rocketCode}`);
    const payloadDelivery = await this.marsyLaunchpadProxyService.notifyCommandPadOfOrbitReach(rocketId);
    return payloadDelivery;
  } else {
    logger.debug(`Orbit not reached for ${rocketCode}`);
  }
}

}
