import { Injectable } from '@nestjs/common';
import { RocketService } from '../../rockets/services/rocket.service';
import { MarsyMissionProxyService } from './marsy-mission-proxy/marsy-mission-proxy.service';
import { CommandDto } from '../dto/command.dto';
import { RocketStatus } from '../../rockets/schemas/rocket-status-enum.schema';

@Injectable()
export class CommandService {
  constructor(
    private readonly marsyMissionProxyService: MarsyMissionProxyService,
    private readonly rocketService: RocketService,
  ) {}

  async sendLaunchCommand(rocketId: string): Promise<CommandDto> {
    const goNogo = await this.marsyMissionProxyService.goOrNoGoPoll(rocketId);
    const commandDto: CommandDto = {
      decision: '', // Initialize with default values
      rocket: null, // Initialize with default values
    };
    await this.rocketService.updateStatusById(
      rocketId,
      RocketStatus.PRELAUNCH_CHECKS,
    );
    if (goNogo) {
      commandDto.decision = 'starting launch';
      commandDto.rocket = await this.rocketService.updateStatusById(
        rocketId,
        RocketStatus.STARTING_LAUNCH,
      );
    } else {
      commandDto.decision = "can't start launch";
      commandDto.rocket = await this.rocketService.updateStatusById(
        rocketId,
        RocketStatus.ABORTED,
      );
    }
    return commandDto;
  }
}
