import { Injectable, Logger } from '@nestjs/common';
import { MarsyRocketProxyService } from './marsy-rocket-proxy/marsy-rocket-proxy.service';
import { MarsyWeatherProxyService } from './marsy-weather-proxy/marsy-weather-proxy.service';
import { MarsyTelemetryProxyService } from './marsy-telemetry-proxy/marsy-telemetry-proxy.service';
import { TelemetryRecordDto } from 'src/missions/dto/telemetry.dto';

import { Model } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import { Mission } from '../schema/mission.schema';
import { SiteService } from './site.service';
import { MissionNotFoundException } from '../exceptions/mission-not-found.exception';
import { MissionStatus } from '../schema/mission.status.schema';
import { MissionExistsException } from '../exceptions/mission-exists.exception';

const logger = new Logger('MissionService');

@Injectable()
export class MissionService {
  constructor(
    private readonly marsyRocketProxyService: MarsyRocketProxyService,
    private readonly marsyWeatherProxyService: MarsyWeatherProxyService,
    private readonly marsyTelemetryProxyService: MarsyTelemetryProxyService,
    private readonly siteService: SiteService,
    @InjectModel(Mission.name) private missionModel: Model<Mission>,
  ) {}
 async getTelemetryForMission(_missionId: string): Promise<TelemetryRecordDto[]> {
   try {
     return await this.marsyTelemetryProxyService.retrieveTelemetry(_missionId);
   } catch (error) {
     logger.error(`Error: Telemetry not received for mission id : ${_missionId}`);
     return null;
   }
 }

 async destroyRocketForMission(_missionId: string): Promise<boolean> {
   try {
     const telemetryRecords = await this.getTelemetryForMission(_missionId);

     if (telemetryRecords !== null) {
       return false;
     } else {
       const mission = await this.getMissionById(_missionId) as Mission
       await this.marsyRocketProxyService.destroyRocket(mission.rocket);
       logger.log(`Telemetry not received. Decision made: initiate rocket destruction for mission id : ${_missionId}`);
       return true;
     }
   } catch (error) {
     logger.error(`Error: ${error.message}`);
     return false;
   }
 }


  async goOrNoGoPoll(_missionId: string): Promise<boolean> {
    logger.log(`Received request for mission id : ${_missionId}`);

    const mission = await this.getMissionById(_missionId);

    if (!mission) {
      throw new MissionNotFoundException(_missionId);
    }
    console.log('mission' + mission);
    const _site = await this.siteService.getSiteById(mission.site.toString());
    const _weatherStatus =
      await this.marsyWeatherProxyService.retrieveWeatherStatus(
        _site.latitude,
        _site.longitude,
      );

    const _rocketId = mission.rocket.toString();
    const _rocketStatus =
      await this.marsyRocketProxyService.retrieveRocketStatus(_rocketId);

    return _rocketStatus && _weatherStatus;
  }

  async saveNewStatus(missionId: string, _status: MissionStatus) {
    const mission = await this.missionModel.findById(missionId).exec();
    mission.status = _status;
    await mission.save();
  }

  async getAllMissions(): Promise<Mission[]> {
    const missions = await this.missionModel.find().exec();
    return missions;
  }


  async getMissionById(id: string): Promise<Mission> {
    const mission = await this.missionModel.findById(id).exec();
    return mission;
  }

  async getMissionByRocketIdAndStatus(
    rocketId: string,
    missionStatus: string,
  ): Promise<Mission> {
    logger.log(
      `Received request for mission with rocketId ${rocketId} and status ${missionStatus}`,
    );
    const mission = await this.missionModel
      .findOne({ rocket: rocketId, status: missionStatus })
      .exec();
    if (!mission) {
      throw new MissionNotFoundException(
        `Mission with rocketId ${rocketId} and status ${missionStatus} not found`,
      );
    }
    logger.log(
      `Returning mission with rocketId ${mission.name} and status ${missionStatus}`,
    );
    return mission;
  }

  async createMission(
    name: string,
    rocketId: string,
    siteId: string,
  ): Promise<Mission> {
    const existingMission = await this.missionModel
      .findOne({ name: name })
      .exec();

    if (existingMission) {
      throw new MissionExistsException(name);
    }

    const newSite = new this.missionModel({
      name,
      status: MissionStatus.NOT_STARTED,
      site: siteId,
      rocket: rocketId,
    });

    return newSite.save();
  }

  async deleteMission(id: string) {
    try {
      const mission = await this.missionModel.findByIdAndDelete(id).exec();
      return mission;
    } catch (error) {
      throw new MissionNotFoundException(id);
    }
  }
}
