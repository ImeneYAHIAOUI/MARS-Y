import { HttpStatus, Injectable } from '@nestjs/common';
import { RocketService } from '../../rockets/services/rocket.service';
import { MarsyMissionProxyService } from './marsy-mission-proxy/marsy-mission-proxy.service';
import { CommandDto } from '../dto/command.dto';
import { RocketStatus } from '../../rockets/schemas/rocket-status-enum.schema';
import { StageRocketMidFlightDto } from '../dto/stage-rocket-mid-flight.dto';
import { HardwareProxyService } from '../../shared/services/mock-hardware-proxy.service.ts/hardware-proxy.service';
import { RocketNotInFlightException } from '../exceptions/rocket-not-in-flight.exception';


@Injectable()
export class CommandService {
  constructor(
    private readonly marsyMissionProxyService: MarsyMissionProxyService,
    private readonly hardwareProxyService: HardwareProxyService,
    private readonly rocketService: RocketService,
  ) {}

  async sendLaunchCommand(rocketd: string): Promise<CommandDto> {
    const goNogo = await this.marsyMissionProxyService.goOrNoGoPoll(rocketd);
    const commandDto: CommandDto = {
      decision: '', // Initialize with default values
      rocket: null, // Initialize with default values
    };
    await this.rocketService.updateRocketStatus(
      rocketd,
      RocketStatus.PRELAUNCH_CHECKS,
    );
    if (goNogo) {
      commandDto.decision = 'starting launch';
      commandDto.rocket = await this.rocketService.updateRocketStatus(
        rocketd,
        RocketStatus.IN_FLIGHT,
      );
    } else {
      commandDto.decision = "can't start launch";
      commandDto.rocket = await this.rocketService.updateRocketStatus(
        rocketd,
        RocketStatus.ABORTED,
      );
    }
    
    await this.hardwareProxyService.startEmittingTelemetry(rocketd);
    return commandDto;
  }

  async stageRocketMidFlight(
    rocketId: string,
  ): Promise<StageRocketMidFlightDto> {
    const rocket = await this.rocketService.findRocket(rocketId);
    const rocketStatus = rocket.status;
    if (rocketStatus === RocketStatus.IN_FLIGHT) {
      if (await this.hardwareProxyService.stageMidFlightFlight(rocketId)) {
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
}
