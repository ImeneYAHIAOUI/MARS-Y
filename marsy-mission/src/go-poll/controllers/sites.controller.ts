import { Controller, Get } from '@nestjs/common';
import { SiteService } from '../services/site.service';

@Controller('sites')
export class SitesController {
  constructor(private readonly siteService: SiteService) {}

  @Get()
  async findAll() {
    const sites = await this.siteService.getAllSites();
    return sites;
  }
}