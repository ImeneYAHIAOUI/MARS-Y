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
      logger.error('Error while listing all rockets');
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
  async getRocketById(
      @Param() params: { rocketId: string },
  ): Promise<RocketDto> {
    const rocketId = params.rocketId; // Access the 'rocketName' property
    logger.log(`Received request to get rocket by ID: ${rocketId}`);
    return this.rocketService.findRocketById(rocketId);
  }
  @ApiQuery({ name: 'name', required: true })
  @ApiOkResponse({ type: RocketDto })
  @ApiNotFoundResponse({
    type: RocketNameNotFoundException,
    description: 'Rocket not found',
  })
  @Get()
  async getRocketByName(@Query('name') rocketName: string): Promise<RocketDto> {
    logger.log(`Received request to get rocket by name: ${rocketName}`);
    return this.rocketService.findRocketByName(rocketName);
  }

  @ApiParam({ name: 'rocketId' })
  @ApiOkResponse({ type: SendStatusDto, description: 'The rockets status.' })
  @Get(':rocketId/status')
  async retrieveRocketStatusById(
    @Param() params: { rocketId: string },
  ): Promise<SendStatusDto> {
    const rocketId = params.rocketId; // Access the 'rocketId' property
    logger.log(`Received request to get rocket status by ID: ${rocketId}`);
    const status = await this.rocketService.getRocketStatusById(rocketId);
    logger.log(`Successfully retrieved the status of rocket by ID: ${rocketId}`);
    return SendStatusDto.SendStatusDtoFactory(status);
  }
  /* @ApiQuery({ name: 'name', required: true })
  @ApiOkResponse({ type: SendStatusDto, description: 'The rockets status.' })
  @Get('rocketStatus')
  async retrieveRocketStatus(
    @Query('name') rocketName: string,
  ): Promise<SendStatusDto> {
    console.log(rocketName);
    const status = await this.rocketService.getRocketStatus(rocketName);
    return SendStatusDto.SendStatusDtoFactory(status);
  }*/

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
    logger.log(`Received request to add rocket: ${addRocketDto.name}`);
    return await this.rocketService.create(addRocketDto);
  }

  @ApiQuery({ name: 'name', required: true })
  @ApiBody({ type: UpdateRocketStatusDto })
  @ApiOkResponse({
    type: RocketDto,
    description: 'The rocket status has been successfully updated.',
  })
  @ApiNotFoundResponse({
    type: RocketNameNotFoundException,
    description: 'Rocket not found',
  })
  @Put('status')
  async updateRocketStatus(
    @Query('name') rocketName: string,
    @Body() updateStatusDto: UpdateRocketStatusDto, // Receive as enum
  ): Promise<RocketDto> {
    const newStatus = updateStatusDto.status; // Use the enum value
    logger.log(`Received request to update rocket status: ${rocketName}`);
    return await this.rocketService.updateStatus(rocketName, newStatus);
  }

  @ApiParam({ name: '' })
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
  async updateRocketStatusById(
    @Param() params: { rocketId: string },
    @Body() updateStatusDto: UpdateRocketStatusDto, // Receive as enum
  ): Promise<RocketDto> {
    const rocketId = params.rocketId; // Access the 'rocketId' property
    logger.log(`Received request to update rocket status by ID: ${rocketId}`);
    const newStatus = updateStatusDto.status; // Use the enum value
    return await this.rocketService.updateStatusById(rocketId, newStatus);
  }
}
