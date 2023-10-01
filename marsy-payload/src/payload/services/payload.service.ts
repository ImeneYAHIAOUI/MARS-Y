import { Injectable, Logger } from '@nestjs/common';
import { MarsyLaunchpadProxyService } from './marsy-launchpad-proxy/marsy-launchpad-proxy.service';
import { TelemetryDto } from '../dto/telemetry.dto';
import { PayloadDeliveryDto } from '../dto/payload-delivery.dto';

const logger = new Logger('PayloadService');

const latitude = 280;
const longitude = 80;
const altitude = 5000;
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
    logger.log(`Received telemetry for rocket ${rocketId.slice(-3).toUpperCase()} - altitude: ${telemetry.altitude} - latitude: ${telemetry.latitude} - longitude: ${telemetry.longitude} - angle: ${telemetry.angle.toPrecision(1)}`);
    if (
      telemetry.latitude < (latitude + 15) && (telemetry.latitude > latitude - 15) && 
      telemetry.longitude < (longitude + 15) && (telemetry.longitude > longitude - 15) &&
      (telemetry.altitude > altitude - 150)
    ) {
      logger.debug('ANNOUNCEMENT : ORBIT ALMOST REACHED!!');
      logger.debug('ANNOUNCEMENT : REQUESTING PAYLOAD DELIVERY!!');
      return this.marsyLaunchpadProxyService.notifyCommandPadOfOrbitReach(
        rocketId,
      );
    } else {
      //logger.log('orbit not reached');
    }
  }
}
