import { Injectable, Logger } from '@nestjs/common';
import { RocketService } from '../../rockets/services/rocket.service';
import { MarsyMissionProxyService } from './marsy-mission-proxy/marsy-mission-proxy.service';
import { CommandDto } from '../dto/command.dto';
import { RocketStatus } from '../../rockets/schemas/rocket-status-enum.schema';
import { StageRocketMidFlightDto } from '../dto/stage-rocket-mid-flight.dto';
import { HardwareProxyService } from './mock-hardware-proxy.service.ts/hardware-proxy.service';
import { RocketNotInFlightException } from '../exceptions/rocket-not-in-flight.exception';
import { DeliveryResponseDto } from '../dto/delivery-response.dto';
import { ControlTelemetryDto } from 'src/rockets/dto/control-telemetry.dto';
import { GuidanceHardwareProxyService } from './mock-guidance-proxy.service.ts/guidance-hardware-proxy.service';
import { RocketNotStagedException } from '../exceptions/rocket-not(staged.exception';

const logger = new Logger('ControlPadService');

@Injectable()
export class CommandService {
  constructor(
    private readonly marsyMissionProxyService: MarsyMissionProxyService,
    private readonly hardwareProxyService: HardwareProxyService,
    private readonly guidanceHardwareProxyService: GuidanceHardwareProxyService,
    private readonly rocketService: RocketService,
  ) {}

async handleTelemetry(rocketId: string, telemetry: ControlTelemetryDto) {
  try {
    logger.log(`Checking if approaching MaxQ for rocket ${rocketId.slice(-3).toUpperCase()} - Altitude: ${telemetry.altitude} meters.`);
    const approachingMaxQ =
      telemetry.altitude > 3600 && telemetry.altitude < 4400;
    // 6) MaxQ
    if (approachingMaxQ) {
      logger.warn(`Approaching MaxQ for rocket ${rocketId.slice(-3).toUpperCase()}`);
      logger.warn(`Throttling down engines for rocket ${rocketId.slice(-3).toUpperCase()}`);
      this.hardwareProxyService.throttleDownEngines(rocketId);
    }
  } catch (error) {
    logger.error(`Failed to issue throttling order for rocket ${rocketId.slice(-3).toUpperCase()}`, error.message);
  }

  try {
    const rocket = await this.rocketService.findRocket(rocketId);
    logger.log(`Checking fuel level for rocket ${rocketId.slice(-3).toUpperCase()} - Fuel: ${telemetry.fuel} liters.`);

    if (telemetry.fuel === 0 && rocket.status === RocketStatus.IN_FLIGHT) {
      logger.warn('issuing fuel depletion mid-flight for rocket ${rocketId.slice(-3).toUpperCase()}');
      logger.warn('staging mid-flight for rocket ${rocketId.slice(-3).toUpperCase()}');
      await this.hardwareProxyService.stageMidFlightFlight(rocketId);
      await this.rocketService.updateRocketStatus(
        rocketId,
        RocketStatus.STAGED,
      );
    }
  } catch (error) {
    logger.error(`Failed to stage mid-flight for rocket ${rocketId.slice(-3).toUpperCase()}: `, error.message);
  }
}


async sendLaunchCommand(rocketId: string): Promise<CommandDto> {
  logger.info(`Initiating launch sequence for rocket ${rocketId}.`);
  await this.rocketService.updateRocketStatus(
    rocketId,
    RocketStatus.READY_FOR_LAUNCH,
  );
  const goNogo = await this.marsyMissionProxyService.goOrNoGoPoll(rocketId);
  const commandDto: CommandDto = {
    decision: '',
    rocket: null,
  };
  await this.rocketService.updateRocketStatus(rocketId,RocketStatus.PRELAUNCH_CHECKS,);
  if (goNogo) {
    logger.info(`Starting launch sequence for rocket ${rocketId}.`);
    commandDto.decision = 'Starting launch sequence.';
    // 5) Liftoff/Launch (T+00:00:00)
    commandDto.rocket = await this.rocketService.updateRocketStatus(rocketId,RocketStatus.IN_FLIGHT,);
  } else {
    logger.info(`Can't start launch sequence ${rocketId}.`);
    commandDto.decision = "Can't start launch sequence.";
    commandDto.rocket = await this.rocketService.updateRocketStatus(
      rocketId,
      RocketStatus.ABORTED,
    );
    logger.warn(`Launch sequence aborted for rocket ${rocketId}.`);
  }
  await this.hardwareProxyService.startEmittingTelemetry(rocketId);
  logger.info(`Telemetry emitting started for rocket ${rocketId}.`);

  return commandDto;
}


async stageRocketMidFlight(
  rocketId: string,
): Promise<StageRocketMidFlightDto> {
  const rocket = await this.rocketService.findRocket(rocketId);
  const rocketStatus = rocket.status;

  if (rocketStatus === RocketStatus.IN_FLIGHT) {
    // 8) Stage separation
    logger.info(`Rocket ${rocketId} is currently in mid-flight. Initiating mid-stage separation process.`);
    const midStageSeparationSuccess = await this.hardwareProxyService.stageMidFlightFlight(rocketId);
    if (midStageSeparationSuccess) {
      const updatedRocket = await this.rocketService.updateRocketStatus(
        rocketId,
        RocketStatus.STAGED,
      );
      logger.info(`Successfully staged rocket mid flight`);
      return {
        midStageSeparationSuccess: true,
        rocket: updatedRocket,
      };
    } else {
      const updatedRocket = await this.rocketService.updateRocketStatus(
        rocketId,
        RocketStatus.FAILED_LAUNCH,
      );
      logger.warn(`Mid-stage separation failed for ${rocketId}.`);
      return {
        midStageSeparationSuccess: false,
        rocket: updatedRocket,
      };
    }
  } else {
    logger.error(`Rocket ${rocketId} is not in mid-flight. Mid-stage separation cannot proceed.`);
    throw new RocketNotInFlightException(rocketId);
  }
}


  async sendPayloadDeliveryCommand(
    rocketId: string,
  ): Promise<DeliveryResponseDto> {
    const rocket = await this.rocketService.findRocket(rocketId);
    logger.log(`Sending payload delivery command for rocket ${rocketId} - JSON: ${JSON.stringify(rocket)}`);
    const rocketStatus = rocket.status;

    if (rocketStatus === RocketStatus.STAGED) {
      logger.info(`Rocket ${rocketId} is staged. Initiating payload delivery.`);

      const payloadDelivered = await this.guidanceHardwareProxyService.deliverPayload(rocketId);

      if (payloadDelivered) {
        logger.info(`Payload delivered successfully for rocket ${rocketId}.`);

        const updatedRocket = await this.rocketService.updateRocketStatus(
          rocketId,
          RocketStatus.PAYLOAD_DELIVERED,
        );

        return {
          delivered: true,
          rocket: updatedRocket,
        };
      } else {
        logger.warn(`Payload delivery failed for rocket ${rocketId}.`);

        const updatedRocket = await this.rocketService.updateRocketStatus(
          rocketId,
          RocketStatus.PAYLOAD_DELIVERY_FAILED,
        );

        return {
          delivered: false,
          rocket: updatedRocket,
        };
      }
    } else {
      logger.error(`Rocket ${rocketId} is not staged. Payload delivery cannot proceed.`);
      throw new RocketNotStagedException(rocketId);
    }
  }

}
