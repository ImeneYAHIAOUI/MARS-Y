import { Injectable, Logger } from '@nestjs/common';

import { HardwareProxyService } from '../../shared/services/mock-hardware-proxy.service.ts/hardware-proxy.service';
import { RocketStatus } from '../../rockets/schemas/rocket-status-enum.schema';
import { RocketService } from '../../rockets/services/rocket.service';
import { DeliveryResponseDto } from '../dto/delivery-response.dto';
import { RocketNotInFlightException } from '../../command/exceptions/rocket-not-in-flight.exception';

@Injectable()
export class PayloadService {
  private readonly logger: Logger = new Logger(PayloadService.name);

  constructor(
    private readonly hardwareProxyService: HardwareProxyService,
    private readonly rocketService: RocketService,
  ) {}

  async sendPayloadDeliveryCommand(
    rocketId: string,
  ): Promise<DeliveryResponseDto> {
    this.logger.log(
      `Received request to deliver payload rocket with id ${rocketId}`,
    );
    const rocket = await this.rocketService.findRocket(rocketId);
    const rocketStatus = rocket.status;
    if (rocketStatus === RocketStatus.IN_FLIGHT) {
      this.logger.log(`Delivering payload for rocket: ${rocketId}`);
      if (await this.hardwareProxyService.deliverPayload(rocketId)) {
        this.logger.log(`Payload delivered for rocket: ${rocketId}`);
        return {
          delivered: true,
          rocket: await this.rocketService.updateRocketStatus(
            rocketId,
            RocketStatus.PAYLOAD_DELIVERED,
          ),
        };
      } else {
        this.logger.error(
          `Error while delivering payload for rocket: ${rocketId}`,
        );
        return {
          delivered: false,
          rocket: await this.rocketService.updateRocketStatus(
            rocketId,
            RocketStatus.PAYLOAD_DELIVERY_FAILED,
          ),
        };
      }
    } else {
      throw new RocketNotInFlightException(rocketId);
    }
  }
}
