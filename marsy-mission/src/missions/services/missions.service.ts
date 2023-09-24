import { Injectable, Logger } from '@nestjs/common';
import { MarsyRocketProxyService } from './marsy-rocket-proxy/marsy-rocket-proxy.service';
import { MarsyWeatherProxyService } from './marsy-weather-proxy/marsy-weather-proxy.service';
import { Model } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import { Mission } from '../schema/mission.schema';
import { get } from 'http';
import { SiteService } from './site.service';
import { MissionNotFoundException } from '../exceptions/mission-not-found.exception';
import { MissionStatus } from '../schema/mission.status.schema';

const logger = new Logger('MissionService');

@Injectable()
export class MissionService {

  constructor(
    private readonly marsyRocketProxyService: MarsyRocketProxyService,
    private readonly marsyWeatherProxyService: MarsyWeatherProxyService,
    private readonly siteService: SiteService,
    @InjectModel(Mission.name) private missionodel: Model<Mission>  
  ) {}

  async goOrNoGoPoll(_missionId : string): Promise<boolean> {
    logger.log(`Received request for mission id : ${_missionId}`);

    const mission = await this.getMissionById(_missionId);

    if(!mission) {
      throw new MissionNotFoundException(_missionId);
    }
    console.log("mission" + mission)
    const _site = await this.siteService.getSiteById(mission.site.toString());
    const _weatherStatus = await this.marsyWeatherProxyService.retrieveWeatherStatus(_site.latitude, _site.longitude);

    const _rocketId = mission.rocket.toString();
    const _rocketStatus = await this.marsyRocketProxyService.retrieveRocketStatus(_rocketId);

    
    return (_rocketStatus && _weatherStatus) ;
  }


  async saveNewStatus(missionId : string, _status : MissionStatus) {
    const mission = await this.missionodel.findById(missionId).exec();
    mission.status = _status;
    await mission.save();
    }

  async getAllMissions(): Promise<Mission[]> {
    const missions = await this.missionodel.find().exec();
    return missions;
  }

  async getMissionById(id: string): Promise<Mission> {
    const mission = await this.missionodel.findById(id).exec();
    return mission;
  }

  async getMissionByRocketIdAndStatus(rocketId: string, missionStatus: string): Promise<Mission> {
    logger.log(`Received request for mission with rocketId ${rocketId} and status ${missionStatus}`);
    const mission = await this.missionodel.findOne({ rocket: rocketId, status: missionStatus}).exec();
    if (!mission) {
      throw new MissionNotFoundException(`Mission with rocketId ${rocketId} and status ${missionStatus} not found`);
    }
    logger.log(`Returning mission with rocketId ${mission.name} and status ${missionStatus}`);
    return mission;
  }


}