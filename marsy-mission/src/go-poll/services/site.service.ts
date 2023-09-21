import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Site } from '../schema/site.schema';


@Injectable()
export class SiteService {
  constructor(@InjectModel(Site.name) private siteModel: Model<Site>) {}

  async getAllSites(): Promise<Site[]> {
    const sites = await this.siteModel.find().exec();
    return sites;
  }

  //find site by id
  async getSiteById(id: string): Promise<Site> {
    const site = await this.siteModel.findById(id).exec();
    return site;
  }

}