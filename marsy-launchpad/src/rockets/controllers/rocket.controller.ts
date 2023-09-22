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

import { RocketService } from '../services/rocket.service';
import { RocketDto } from '../dto/rocket.dto';
import { AddRocketDto } from '../dto/add-rocket.dto';
import { RocketNameNotFoundException } from '../exceptions/rocket-name-not-found.exception';
import { RocketAlreadyExistsException } from '../exceptions/rocket-already-exists.exception';
import { UpdateRocketStatusDto } from '../dto/update-rocket.dto';
import { SendStatusDto } from '../dto/send-status.dto';
import { RocketPollDto } from '../dto/rocket-poll.dto';
import {StageRocketMidFlightDto} from "../../command/dto/stage-rocket-mid-flight.dto";

const logger = new Logger('CommandController');

@ApiTags('rockets')
@Controller('/rockets')
export class RocketController {
  constructor(private readonly rocketService: RocketService) {}

  @ApiOkResponse({ type: RocketDto, isArray: true })
  @Get('all')
  async listAllRockets(): Promise<RocketDto[]> {
    try {
      logger.log('Received request to list all rockets');
      const rockets = await this.rocketService.findAll();
      logger.log('Successfully retrieved the list of all rockets');
      return rockets;
    } catch (error) {
      logger.error('Error while listing all rockets: ', error.message);
      throw error;
    }
  }

  @ApiParam({ name: 'rocketId' })
  @ApiOkResponse({ type: RocketDto })
  @ApiNotFoundResponse({
    type: RocketNameNotFoundException,
    description: 'Rocket not found',
  })
  @Get(':rocketId')
  async getRocket(@Param() params: { rocketId: string }): Promise<RocketDto> {
    try {
      const rocketId = params.rocketId; // Access the 'rocketName' property
      logger.log(`Received request to get rocket by ID: ${rocketId}`);
      return this.rocketService.findRocket(rocketId);
    } catch (error) {
      logger.error(`Error while getting rocket by ID: ${error.message}`);
      throw error;
    }
  }
  @ApiParam({ name: 'rocketId' })
  @ApiOkResponse({ type: SendStatusDto, description: 'The rockets status.' })
  @ApiNotFoundResponse({
    type: RocketNameNotFoundException,
    description: 'Rocket not found',
  })
  @Get(':rocketId/status')
  async retrieveRocketStatus(
    @Param() params: { rocketId: string },
  ): Promise<SendStatusDto> {
    try {
      const rocketId = params.rocketId; // Access the 'rocketId' property
      logger.log(`Received request to get rocket status by ID: ${rocketId}`);
      const status = await this.rocketService.getRocketStatus(rocketId);
      logger.log(
        `Successfully retrieved the status of rocket by ID: ${rocketId}`,
      );
      return SendStatusDto.SendStatusDtoFactory(status);
    } catch (error) {
      logger.error(`Error while getting rocket status by ID: ${error.message}`);
      throw error;
    }
  }

  @ApiBody({ type: AddRocketDto })
  @ApiCreatedResponse({
    type: RocketDto,
    description: 'The rocket has been successfully added.',
  })
  @ApiConflictResponse({
    type: RocketAlreadyExistsException,
    description: 'Rocket already exists',
  })
  @Post()
  async addRocket(@Body() addRocketDto: AddRocketDto): Promise<RocketDto> {
    try {
      logger.log(`Received request to add rocket: ${addRocketDto.name}`);
      return await this.rocketService.createRocket(addRocketDto);
    } catch (error) {
      logger.error(`Error while adding rocket: ${error.message}`);
      throw error;
    }
  }

  @ApiParam({ name: 'rocketId' })
  @ApiBody({ type: UpdateRocketStatusDto })
  @ApiOkResponse({
    type: RocketDto,
    description: 'The rocket status has been successfully updated.',
  })
  @ApiNotFoundResponse({
    type: RocketNameNotFoundException,
    description: 'Rocket not found',
  })
  @Put(':rocketId/status')
  async updateRocketStatus(
    @Param() params: { rocketId: string },
    @Body() updateStatusDto: UpdateRocketStatusDto, // Receive as enum
  ): Promise<RocketDto> {
    try {
      const rocketId = params.rocketId; // Access the 'rocketId' property
      logger.log(`Received request to update rocket status by ID: ${rocketId}`);
      const newStatus = updateStatusDto.status; // Use the enum value
      return await this.rocketService.updateRocketStatus(rocketId, newStatus);
    } catch (error) {
      logger.error(
        `Error while updating rocket status by ID: ${error.message}`,
      );
      throw error;
    }
  }

  @ApiParam({ name: 'rocketId' })
  @ApiCreatedResponse({
    type: RocketPollDto,
    description: 'The rocket poll status.',
  })
  @ApiNotFoundResponse({
    type: RocketNameNotFoundException,
    description: 'Rocket not found',
  })
  @Post(':rocketId/poll')
  async rocketPoll(
    @Param() params: { rocketId: string },
  ): Promise<RocketPollDto> {
    try {
      const rocketId = params.rocketId; // Access the 'rocketId' property
      logger.log(`Received request to poll rocket status by ID: ${rocketId}`);
      const poll = await this.rocketService.rocketPoll(rocketId);
      logger.log(`Successfully polled the status of rocket by ID: ${rocketId}`);
      return RocketPollDto.RocketPollDtoFactory(poll);
    } catch (error) {
      logger.error(`Error while polling rocket status by ID: ${error.message}`);
      throw error;
    }
  }


}
