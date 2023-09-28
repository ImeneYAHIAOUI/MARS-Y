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
import { DeliveryResponseDto } from '../dto/delivery-response.dto';

const logger = new Logger('CommandController');

@ApiTags('rockets')
@Controller('/rockets')
export class CommandController {
  constructor(private readonly commandService: CommandService) {}

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
      logger.log(
        `Received request to get launch command for rocket: ${rocketId}`,
      );
      const launchCommand = await this.commandService.sendLaunchCommand(
        rocketId,
      );
      logger.log(`Launch command sent for rocket: ${rocketId}`);
      return launchCommand;
    } catch (error) {
      logger.error(
        `Error while processing request for rocket with id ${params.rocketId} : ${error.message} status : ${error.status}`,
      );
      throw error; // You can handle and customize error logging as needed
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
      logger.log(
        `Received request to stage rocket with id ${rocketId} mid flight`,
      );
      const stage = await this.commandService.stageRocketMidFlight(rocketId);
      logger.log(`Successfully staged rocket mid flight`);
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
  @Post(':rocketId/payload-delivery')
  @HttpCode(200)
  async deliverPayload(
    @Param() params: { rocketId: string },
  ): Promise<DeliveryResponseDto> {
    try {
      const rocketId = params.rocketId;
      logger.log(
        `Received request to deliver payload rocket with id ${rocketId}`,
      );
      const stage = await this.commandService.sendPayloadDeliveryCommand(
        rocketId,
      );
      logger.log(`${stage}`);
      logger.log(`Successfully delivered payload for rocket: ${rocketId}`);
      return stage;
    } catch (error) {
      logger.error(`Error while delivering payload : ${error.message}`);
      throw error;
    }
  }



}
