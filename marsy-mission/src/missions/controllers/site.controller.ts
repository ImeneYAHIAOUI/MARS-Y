import {
  Controller,
  Post,
  Param,
  Get,
  Logger,
  Body,
  Delete,
} from '@nestjs/common';

import {
  ApiOkResponse,
  ApiTags,
  ApiNotFoundResponse,
  ApiCreatedResponse,
  ApiConflictResponse,
} from '@nestjs/swagger';

import { SiteService } from '../services/site.service';
import { Site } from '../schema/site.schema';
import { AddSiteDto } from '../dto/add.site.dto';
import { SiteExistsException } from '../exceptions/site-exists.exception';
new Logger('MissionController');
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

  @Delete(':id')
  @ApiOkResponse({ type: Site, description: 'Site deleted' })
  @ApiNotFoundResponse({
    type: SiteExistsException,
    description: 'Site not found',
  })
  async deleteSite(@Param('id') siteId: string): Promise<Site> {
    return this.siteService.deleteSite(siteId);
  }
}
