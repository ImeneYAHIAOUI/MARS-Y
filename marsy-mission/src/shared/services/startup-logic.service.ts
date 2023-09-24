import { Logger, OnApplicationBootstrap } from '@nestjs/common';
import { InjectConnection, InjectModel } from '@nestjs/mongoose';
import { Connection, Model, Types } from 'mongoose';
import { AddMissionDto} from 'src/missions/dto/add.mission.dto';
import { AddSiteDto } from 'src/missions/dto/add.site.dto';
import { Mission } from 'src/missions/schema/mission.schema';
import { MissionStatus } from 'src/missions/schema/mission.status.schema';
import { Rocket } from 'src/missions/schema/rocket.schema';
import { Site } from 'src/missions/schema/site.schema';
import { MarsyRocketProxyService } from 'src/missions/services/marsy-rocket-proxy/marsy-rocket-proxy.service';

const logger = new Logger('StartupLogicService');

export class StartupLogicService implements OnApplicationBootstrap {

  sites = [];

  constructor(@InjectConnection() private connection: Connection,
  private readonly marsyRocketProxyService: MarsyRocketProxyService,
  ) {}

  
  async createSite(name : string, latitude : number,  longitude : number , altitude: number){
    const siteModel = this.connection.models['Site'];
    const alreadyExists = await siteModel.find({ name });

    if(alreadyExists.length == 0) {
      const site : AddSiteDto = new AddSiteDto();
      site.name = name;
      site.latitude = latitude;
      site.longitude = longitude;
      site.altitude = altitude;
      const s = await siteModel.create(site);
      this.sites.push(s);
      return s;
    }
    
  }

  async createMission(name: string, status: MissionStatus, siteId: string, rocketId : string): Promise<Mission> {

    const missionModel = this.connection.models['Mission'];

    const alreadyExists = await missionModel.find({ name });

    if(alreadyExists.length == 0) {
      const mission: AddMissionDto = new AddMissionDto();
      mission.name = name;
      mission.status = status;
      mission.site = siteId;
      mission.rocket = rocketId;
      return missionModel.create(mission);;
    }
  }

  async onApplicationBootstrap() {
    
    const totalNumberOfSites = 12;
    const listRockets = await this.marsyRocketProxyService.getAllRocketsFromApi();

    for (let i = 1; i <= totalNumberOfSites; i++) {
      const site = await this.createSite(`site-${i}`, 100 + i, 50, 70 + i);
    }

    if(this.sites.length == totalNumberOfSites) {
    for (let i = 1; i <= totalNumberOfSites; i++) {
      const m = await this.createMission(`mission-${i}`, MissionStatus.NOT_STARTED, this.sites[i-1]._id, listRockets[i-1]._id);
    }
  }
}

}