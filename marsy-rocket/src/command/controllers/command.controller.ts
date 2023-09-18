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

  @ApiParam({ name: 'rocketId' })
  @ApiOkResponse({ type: CommandDto })
  @ApiNotFoundResponse({
    type: RocketNameNotFoundException,
    description: 'Rocket not found',
  })
  @Get(':rocketId')
  async getLaunchCommand(
    @Param() params: { rocketId: string },
  ): Promise<CommandDto> {
    const rocketId = params.rocketId; // Access the 'rocketName' property
    return this.commandService.sendLaunchCommand(rocketId);
  }
}
