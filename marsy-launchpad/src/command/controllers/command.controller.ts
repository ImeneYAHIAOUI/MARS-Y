import {
  Body,
  Controller,
  Get,
  Param,
  Query,
  Post,
  Put,
  Logger,
  HttpCode,
} from '@nestjs/common';
import {
  ApiCreatedResponse,
  ApiNotFoundResponse,
  ApiParam,
  ApiTags,
} from '@nestjs/swagger';
import { CommandService } from '../services/command.service';
import { RocketNotFoundException } from '../../rockets/exceptions/rocket-not-found.exception';
import { CommandDto } from '../dto/command.dto';
import { StageRocketMidFlightDto } from '../dto/stage-rocket-mid-flight.dto';
import {DeliveryResponseDto} from "../dto/delivery-response.dto";
import { ControlTelemetryDto } from 'src/rockets/dto/control-telemetry.dto';

const logger = new Logger('ControlPadController');

@ApiTags('rockets')
@Controller('/rockets')
export class CommandController {
  constructor(private readonly commandService: CommandService) {}

  @Post(':idrocket/telemetry')
  @HttpCode(200)
  @ApiNotFoundResponse({
    type: RocketNotFoundException,
    description: 'Rocket not found',
  })
  async receiveTelemetry(@Body() controlTelemetryDto: ControlTelemetryDto, @Param('idrocket') idrocket: string){
    //logger.log(`Received telemetry for rocket ID: ${idrocket}`);
    this.commandService.handleTelemetry(idrocket, controlTelemetryDto);
  }
  // 4) launch
  @ApiParam({ name: 'rocketId' })
  @ApiCreatedResponse({ type: CommandDto })
  @ApiNotFoundResponse({
    type: RocketNotFoundException,
    description: 'Rocket not found',
  })
  @Post(':rocketId/launch')
  @HttpCode(200)
  async getLaunchCommand(
    @Param() params: { rocketId: string },
  ): Promise<CommandDto> {
    try {
      const rocketId = params.rocketId;
      logger.debug(
        `Received request to launch the rocket: ${rocketId.slice(-3).toUpperCase()}`,
      );
      const launchCommand = await this.commandService.sendLaunchCommand(
        rocketId,
      );
      //logger.log(`Launch command sent for rocket: ${rocketId}`);
      return launchCommand;
    } catch (error) {
      logger.error(
        `Error while processing request for rocket with id ${params.rocketId} : ${error.message} status : ${error.status}`,
      );
      throw error; // You can handle and customize error logging as needed
    }
  }
  // 8) Stage separation
  @ApiParam({ name: 'rocketId' })
  @ApiCreatedResponse({
    type: StageRocketMidFlightDto,
    description: 'rocket staged mid flight',
  })
  @ApiNotFoundResponse({
    type: RocketNotFoundException,
    description: 'Rocket not found',
  })
  @Post(':rocketId/stage')
  @HttpCode(200)
  async stageRocketMidFlight(
    @Param() params: { rocketId: string },
  ): Promise<StageRocketMidFlightDto> {
    try {
      const rocketId = params.rocketId;
      logger.log(
        `Received request to stage rocket with id ${rocketId} mid flight`,
      );
      const stage = await this.commandService.stageRocketMidFlight(rocketId);
      logger.debug(`Successfully staged rocket mid flight`);
      return stage;
    } catch (error) {
      logger.error(`Error while staging rocket mid flight: ${error.message}`);
      throw error;
    }
  }
  // 10) Fairing separation
  @Post(':rocketId/fairingSeparation')
     async fairingSeparation(@Param('rocketId') rocketId: string): Promise<void> {
     this.logger.log(`Fairing separation for rocket ${rocketId}`);
     this.commandService.fairingSeparation(rocketId);
 }

  // 12) Payload separation/deploy
  @ApiParam({ name: 'rocketId' })
  @ApiCreatedResponse({
    type: DeliveryResponseDto,
    description: 'payload delivery command',
  })
  @ApiNotFoundResponse({
    type: RocketNotFoundException,
    description: 'Rocket not found',
  })
  @Post(':rocketId/payload-delivery')
  @HttpCode(200)
  async deliverPayload(
    @Param() params: { rocketId: string },
  ): Promise<DeliveryResponseDto> {
    try {
      const rocketId = params.rocketId;
      logger.debug(
        `Received request to deliver payload of the rocket ${rocketId.slice(-3).toUpperCase()}`,
      );
      const stage = await this.commandService.sendPayloadDeliveryCommand(
        rocketId,
      );
      //logger.log(`${stage}`);
      //logger.log(`Successfully delivered payload for rocket: ${rocketId}`);
      return stage;
    } catch (error) {
      logger.error(`Error while delivering payload : ${error}`);
      throw error;
    }
  }

  @Post(':rocketId/prepare')
  async prepare(@Param('rocketId') rocketId: string): Promise<void> {
     this.logger.log(`Preparing rocket ${rocketId}`);
     this.commandService.prepareRocket(rocketId);
  }

  @Post(':rocketId/powerOn')
  async powerOnRocket(@Param('rocketId') rocketId: string): Promise<void> {
     this.logger.log(`Powering on rocket ${rocketId}`);
     this.commandService.powerOnRocket(rocketId);
  }

  // 3) Startup (T-00:01:00)
  @Post(':rocketId/startup')
  async startup(@Param('rocketId') rocketId: string): Promise<void> {
    this.logger.log(`Starting up rocket ${rocketId} (T-00:01:00)`);
  }
  // 4) Main engine start (T-00:00:03)
  @Post(':rocketId/engineStart')
  async startMainEngine(@Param('rocketId') rocketId: string): Promise<void> {
     this.logger.log(`Starting main engine of rocket ${rocketId} (T-00:00:03)`);
     this.commandService.startMainEngine(rocketId);
  }

     // 6) Max Q
    @Post(':rocketId/maxQ')
    async maxQ(@Param('rocketId') rocketId: string): Promise<void> {
      this.logger.log(`Reaching MaxQ with rocket ${rocketId}`);
    }
    // 7) Main engine cut-off
    @Post(':rocketId/engineCutoff')
    async mainEngineCutoff(@Param('rocketId') rocketId: string): Promise<void> {
      this.logger.log(`Main engine cutoff for rocket ${rocketId}`);
      this.commandService.mainEngineCutoff(rocketId);
    }

    // 9) Second engine start
    @Post(':rocketId/secondEngineStart')
    async startSecondEngine(@Param('rocketId') rocketId: string): Promise<void> {
      this.logger.log(`Starting second engine for rocket ${rocketId}`);
      this.commandService.startSecondEngine(rocketId);
    }

    // 11) Second engine cut-off
    @Post(':rocketId/secondEngineCutoff')
    async secondEngineCutoff(@Param('rocketId') rocketId: string): Promise<void> {
      this.logger.log(`Second engine cutoff for rocket ${rocketId}`);
      this.commandService.secondEngineCutoff(rocketId);
    }




}
