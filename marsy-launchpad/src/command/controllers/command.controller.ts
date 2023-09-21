import {
  Body,
  Controller,
  Get,
  Param,
  Query,
  Post,
  Put,
  Logger,
} from '@nestjs/common';
import {
  ApiBody,
  ApiConflictResponse,
  ApiCreatedResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiParam,
  ApiQuery,
  ApiTags,
} from '@nestjs/swagger';
import { CommandService } from '../services/command.service';
import { RocketNameNotFoundException } from '../../rockets/exceptions/rocket-name-not-found.exception';
import { CommandDto } from '../dto/command.dto';

const logger = new Logger('CommandController');

@ApiTags('rockets')
@Controller('/rockets')
export class CommandController {
  constructor(private readonly commandService: CommandService) {}

  @ApiParam({ name: 'rocketId' })
  @ApiCreatedResponse({ type: CommandDto })
  @ApiNotFoundResponse({
    type: RocketNameNotFoundException,
    description: 'Rocket not found',
  })
  @Post(':rocketId/launch')
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
        `Error while processing request for rocket with id ${params.rocketId} : ${error.message}`,
      );
      throw error; // You can handle and customize error logging as needed
    }
  }
}
