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

@ApiTags('command')
@Controller('/command')
export class CommandController {
  constructor(private readonly commandService: CommandService) {}

  @ApiQuery({ name: 'name', required: true })
  @ApiOkResponse({ type: CommandDto })
  @ApiNotFoundResponse({
    type: RocketNameNotFoundException,
    description: 'Rocket not found',
  })
  @Get()
  async getLaunchCommand(@Query('name') rocketName: string): Promise<CommandDto> {
    try {
      logger.log(`Received request to get launch command for rocket: ${rocketName}`);
      const launchCommand = await this.commandService.sendLaunchCommand(rocketName);
      logger.log(`Launch command sent for rocket: ${rocketName}`);
      return launchCommand;
    } catch (error) {
      logger.error(`Error while processing request for rocket ${rocketName} : ${error.message}`);
      throw error; // You can handle and customize error logging as needed
    }
  }
}
