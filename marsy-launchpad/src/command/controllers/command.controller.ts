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
    logger.log(`Received telemetry for rocket ID: ${idrocket}`);
    this.commandService.handleTelemetry(idrocket, controlTelemetryDto);
  }

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
      logger.log(`Received request to launch the rocket: ${rocketId.slice(-3).toUpperCase()}`,);
      const launchCommand = await this.commandService.sendLaunchCommand(rocketId,);
      return launchCommand;
    } catch (error) {
      logger.error(
        `Error while processing request for rocket ${params.rocketId} : ${error.message} status : ${error.status}`,
      );
      throw error;
    }
  }

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
      logger.log(`Received request to stage rocket ${rocketId.slice(-3).toUpperCase()} mid flight`,);
      const stage = await this.commandService.stageRocketMidFlight(rocketId);
      return stage;
    } catch (error) {
      logger.error(`Error while staging rocket mid flight: ${error.message}`);
      throw error;
    }
  }

  @ApiParam({ name: 'rocketId' })
  @ApiCreatedResponse({
    type: DeliveryResponseDto,
    description: 'payload delivery command',
  })
  @ApiNotFoundResponse({
    type: RocketNotFoundException,
    description: 'Rocket not found',
  })
  @Post(':rocketId/prepare')
  async prepare(@Param('rocketId') rocketId: string): Promise<void> {
     logger.log(`Preparing rocket ${rocketId.slice(-3).toUpperCase()}`);
     this.commandService.prepareRocket(rocketId);
  }

  @Post(':rocketId/powerOn')
  async powerOnRocket(@Param('rocketId') rocketId: string): Promise<void> {
     logger.log(`Powering on rocket ${rocketId.slice(-3).toUpperCase()}`);
     this.commandService.powerOnRocket(rocketId);
  }

  @Post(':rocketId/payload-delivery')
  @HttpCode(200)
  async deliverPayload(
    @Param() params: { rocketId: string },
  ): Promise<DeliveryResponseDto> {
    try {
      const rocketId = params.rocketId;
      const stage = await this.commandService.sendPayloadDeliveryCommand(rocketId,);
      return stage;
    } catch (error) {
      logger.error(`Error while delivering payload : ${error}`);
      throw error;
    }
  }



}
