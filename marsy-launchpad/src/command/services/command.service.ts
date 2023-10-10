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
      const approachingMaxQ =
        telemetry.altitude > 3600 && telemetry.altitude < 4400;
      if (approachingMaxQ) {
        logger.warn(`Approaching MaxQ for rocket ${rocketId.slice(-3).toUpperCase()}`);
        logger.warn(`Throttling down engines for rocket ${rocketId.slice(-3).toUpperCase()}`);
        this.hardwareProxyService.throttleDownEngines(rocketId);
      }
    } catch (error) {
      logger.error('Failed to issue throttling order', error.message);
    }
    try {
      const rocket = await this.rocketService.findRocket(rocketId);
      logger.log(`Received telemetry for rocket ${rocketId.slice(-3).toUpperCase()} - fuel: ${telemetry.fuel}`);
      if (telemetry.fuel === 0 && rocket.status === RocketStatus.IN_FLIGHT) {
        logger.debug(`Issuing staging order to rocket ${rocketId.slice(-3).toUpperCase()}`);
        await this.hardwareProxyService.stageMidFlightFlight(rocketId);
        await this.rocketService.updateRocketStatus(
          rocketId,
          RocketStatus.STAGED,
        );
        logger.debug(`Staged rocket successfully: ${rocketId.slice(-3).toUpperCase()}`);
      }
    } catch (error) {
      logger.error('Failed to stage mid flight: ', error.message);
    }
  }

  async sendLaunchCommand(rocketId: string): Promise<CommandDto> {
    await this.rocketService.updateRocketStatus(
      rocketId,
      RocketStatus.READY_FOR_LAUNCH,
    );
    const goNogo = await this.marsyMissionProxyService.goOrNoGoPoll(rocketId);
    const commandDto: CommandDto = {
      decision: '', // Initialize with default values
      rocket: null, // Initialize with default values
    };
    await this.rocketService.updateRocketStatus(
      rocketId,
      RocketStatus.PRELAUNCH_CHECKS,
    );
    if (goNogo) {
      commandDto.decision = 'starting launch';
      commandDto.rocket = await this.rocketService.updateRocketStatus(
        rocketId,
        RocketStatus.IN_FLIGHT,
      );
    } else {
      commandDto.decision = "can't start launch";
      commandDto.rocket = await this.rocketService.updateRocketStatus(
        rocketId,
        RocketStatus.ABORTED,
      );
    }

    await this.hardwareProxyService.startEmittingTelemetry(rocketId);
    return commandDto;
  }

  async stageRocketMidFlight(
    rocketId: string,
  ): Promise<StageRocketMidFlightDto> {
    const rocket = await this.rocketService.findRocket(rocketId);
    const rocketStatus = rocket.status;
    if (rocketStatus === RocketStatus.IN_FLIGHT) {
      if (await this.hardwareProxyService.stageMidFlightFlight(rocketId)) {
        logger.debug(`Sending order to stage rocket mid flight`);
        return {
          midStageSeparationSuccess: true,
          rocket: await this.rocketService.updateRocketStatus(
            rocketId,
            RocketStatus.STAGED,
          ),
        };
      } else {
        return {
          midStageSeparationSuccess: false,
          rocket: await this.rocketService.updateRocketStatus(
            rocketId,
            RocketStatus.FAILED_LAUNCH,
          ),
        };
      }
    } else {
      throw new RocketNotInFlightException(rocketId);
    }
  }

  async sendPayloadDeliveryCommand(
    rocketId: string,
  ): Promise<DeliveryResponseDto> {
    const rocket = await this.rocketService.findRocket(rocketId);
    logger.debug(`Sending payload delivery command for rocket ${rocketId} - JSON: ${JSON.stringify(rocket)}`);
    const rocketStatus = rocket.status;
    if (rocketStatus === RocketStatus.STAGED) {
      if (await this.guidanceHardwareProxyService.deliverPayload(rocketId)) {
        return {
          delivered: true,
          rocket: await this.rocketService.updateRocketStatus(
            rocketId,
            RocketStatus.PAYLOAD_DELIVERED,
          ),
        };
      } else {
        return {
          delivered: false,
          rocket: await this.rocketService.updateRocketStatus(
            rocketId,
            RocketStatus.PAYLOAD_DELIVERY_FAILED,
          ),
        };
      }
    } else {
      throw new RocketNotStagedException(rocketId);
    }
  }
}
