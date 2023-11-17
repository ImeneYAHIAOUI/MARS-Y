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
  Delete,
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
import { RocketNotFoundException } from '../exceptions/rocket-not-found.exception';
import { RocketAlreadyExistsException } from '../exceptions/rocket-already-exists.exception';
import { UpdateRocketStatusDto } from '../dto/update-rocket.dto';
import { SendStatusDto } from '../dto/send-status.dto';
import { RocketPollDto } from '../dto/rocket-poll.dto';
import { StageRocketMidFlightDto } from '../../command/dto/stage-rocket-mid-flight.dto';
import { ControlTelemetryDto } from '../dto/control-telemetry.dto';

const logger = new Logger('ControlPadController');

@ApiTags('rockets')
@Controller('/rockets')
export class RocketController {
  constructor(private readonly rocketService: RocketService) {}

  @ApiOkResponse({ type: RocketDto, isArray: true })
  @Get('all')
  async listAllRockets(): Promise<RocketDto[]> {
    try {
      //logger.log('Received request to list all rockets');
      const rockets = await this.rocketService.findAll();
      //logger.log('Successfully retrieved the list of all rockets');
      return rockets;
    } catch (error) {
      logger.error('Error while listing all rockets: ', error.message);
      throw error;
    }
  }

  @ApiParam({ name: 'rocketId' })
  @ApiOkResponse({ type: RocketDto })
  @ApiNotFoundResponse({
    type: RocketNotFoundException,
    description: 'Rocket not found',
  })
  @Get(':rocketId')
  async getRocket(@Param() params: { rocketId: string }): Promise<RocketDto> {
    try {
      const rocketId = params.rocketId; // Access the 'rocketName' property
      logger.log(`Received request to get rocket by ID: ${rocketId.slice(-3)
          .toUpperCase()}`);
      return this.rocketService.findRocket(rocketId);
    } catch (error) {
      logger.error(`Error while getting rocket by ID: ${error.message}`);
      throw error;
    }
  }
  @ApiParam({ name: 'rocketId' })
  @ApiOkResponse({ type: SendStatusDto, description: 'The rockets status.' })
  @ApiNotFoundResponse({
    type: RocketNotFoundException,
    description: 'Rocket not found',
  })
  @Get(':rocketId/status')
  async retrieveRocketStatus(
    @Param() params: { rocketId: string },
  ): Promise<SendStatusDto> {
    try {
      const rocketId = params.rocketId; // Access the 'rocketId' property
      logger.log(`Received request to get rocket status by ID: ${rocketId.slice(-3)
          .toUpperCase()}`);
      const status = await this.rocketService.getRocketStatus(rocketId);
      logger.log(
        `Successfully retrieved the status of rocket by ID: ${rocketId.slice(-3)
            .toUpperCase()}`,
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
    type: RocketNotFoundException,
    description: 'Rocket not found',
  })
  @Put(':rocketId/status')
  async updateRocketStatus(
    @Param() params: { rocketId: string },
    @Body() updateStatusDto: UpdateRocketStatusDto, // Receive as enum
  ): Promise<RocketDto> {
    
    try {
      const rocketId = params.rocketId; // Access the 'rocketId' property
      logger.log(`Rocket ${rocketId.slice(-3).toUpperCase()} is having its status changed to ${updateStatusDto.status}`);
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
    type: RocketNotFoundException,
    description: 'Rocket not found',
  })
  @Post(':rocketId/poll')
  @HttpCode(200)
  async rocketPoll(
    @Param() params: { rocketId: string },
  ): Promise<RocketPollDto> {
    try {
      const rocketId = params.rocketId;
      const poll = await this.rocketService.rocketPoll(rocketId);
      return RocketPollDto.RocketPollDtoFactory(poll);
    } catch (error) {
      logger.error(`Error while polling rocket status by ID: ${error.message}`);
      throw error;
    }
  }

  @Delete(':rocketId')
  @ApiParam({ name: 'rocketId' })
  @ApiOkResponse({
    type: RocketDto,
    description: 'The rocket has been successfully deleted.',
  })
  @ApiNotFoundResponse({
    type: RocketNotFoundException,
    description: 'Rocket not found',
  })
  async deleteRocket(@Param() params: { rocketId: string }): Promise<void> {
    try {
      const rocketId = params.rocketId; // Access the 'rocketId' property
      logger.log(`Received request to delete rocket by ID: ${rocketId.slice(-3)
          .toUpperCase()}`);
      await this.rocketService.deleteRocket(rocketId);
      logger.log(`Successfully deleted the rocket by ID: ${rocketId.slice(-3)
          .toUpperCase()}`);
    } catch (error) {
      logger.error(`Error while deleting rocket by ID: ${error.message}`);
      throw error;
    }
  }

  // @Post(':idrocket/telemetry')
  // @HttpCode(200)
  // async postTelemetryRecord(
  //   @Param('idrocket') rocketId: string,
  //   @Body() telemetryRecordDto: ControlTelemetryDto,
  // ): Promise<void> {
  //   logger.log(`Received telemetry for rocket ID: ${rocketId}`);
  //   this.rocketService.handleRocketTelemetry(rocketId, telemetryRecordDto);
  // }
}
