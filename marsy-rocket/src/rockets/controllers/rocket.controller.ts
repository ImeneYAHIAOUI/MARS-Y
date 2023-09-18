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

const logger = new Logger('RocketController');

import { RocketService } from '../services/rocket.service';
import { RocketDto } from '../dto/rocket.dto';
import { AddRocketDto } from '../dto/add-rocket.dto';
import { RocketNameNotFoundException } from '../exceptions/rocket-name-not-found.exception';
import { RocketAlreadyExistsException } from '../exceptions/rocket-already-exists.exception';
import { UpdateRocketStatusDto } from '../dto/update-rocket.dto';
import { SendStatusDto } from '../dto/send-status.dto';

@ApiTags('rockets')
@Controller('/rockets')
export class RocketController {
  constructor(private readonly rocketService: RocketService) {}

  @ApiOkResponse({ type: RocketDto, isArray: true })
  @Get('all')
  async listAllRockets(): Promise<RocketDto[]> {
    return this.rocketService.findAll();
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
    return this.rocketService.findRocketByName(rocketName);
  }

  @ApiParam({ name: 'rocketId' })
  @ApiOkResponse({ type: SendStatusDto, description: 'The rockets status.' })
  @Get(':rocketId/status')
  async retrieveRocketStatusById(
    @Param() params: { rocketId: string },
  ): Promise<SendStatusDto> {
    const rocketId = params.rocketId; // Access the 'rocketId' property
    const status = await this.rocketService.getRocketStatusById(rocketId);
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
  @Put('')
  async updateRocketStatus(
    @Query('name') rocketName: string,
    @Body() updateStatusDto: UpdateRocketStatusDto, // Receive as enum
  ): Promise<RocketDto> {
    const newStatus = updateStatusDto.status; // Use the enum value
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
    const newStatus = updateStatusDto.status; // Use the enum value
    return await this.rocketService.updateStatusById(rocketId, newStatus);
  }
}
