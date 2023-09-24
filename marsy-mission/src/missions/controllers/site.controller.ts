import { Controller, Post, Param, Get, Logger, Body } from '@nestjs/common';
import { MissionService } from '../services/missions.service';

import { ApiOkResponse, ApiTags, ApiQuery, ApiNotFoundResponse, ApiServiceUnavailableResponse, ApiCreatedResponse, ApiConflictResponse } from '@nestjs/swagger';
import { GoResponseDto } from '../dto/go.dto';
import { RocketNotFoundException } from '../exceptions/rocket-not-found.exception';
import { RocketServiceUnavailableException } from '../exceptions/rocket-service-error-exception';
import { Mission } from '../schema/mission.schema';
import { SiteService } from '../services/site.service';
import { Site } from '../schema/site.schema';
import { AddSiteDto } from '../dto/add.site.dto';
import { SiteExistsException } from '../exceptions/site-exists.exception';

const logger = new Logger('MissionController'); 

@ApiTags('Sites')
@Controller('/sites')
export class SiteController {
  constructor(private readonly siteService: SiteService) {}

  @Get()
  @ApiOkResponse()
  async getAllMissions(): Promise<Site[]> {
    const missions = await this.siteService.getAllSites();
    return missions;
  }

  @Post()
  @ApiCreatedResponse({ type: Site })
  @ApiConflictResponse({
    type: SiteExistsException,
    description: 'site already exists',
  })
  async createSite(@Body() addSiteDto: AddSiteDto): Promise<Site> {
    return this.siteService.createSite(
      addSiteDto.name,
      addSiteDto.latitude,
      addSiteDto.longitude,
      addSiteDto.altitude,
    );
  }


}
