import { Injectable, Logger } from '@nestjs/common';
import { MarsyRocketProxyService } from './marsy-rocket-proxy/marsy-rocket-proxy.service';
import { MarsyWeatherProxyService } from './marsy-weather-proxy/marsy-weather-proxy.service';
import { TelemetryRecordDto } from 'src/missions/dto/telemetry.dto';

import { Model } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import { Mission } from '../schema/mission.schema';
import { SiteService } from './site.service';
import { MissionNotFoundException } from '../exceptions/mission-not-found.exception';
import { MissionStatus } from '../schema/mission.status.schema';
import { MissionExistsException } from '../exceptions/mission-exists.exception';
import { RocketNotFoundException } from 'src/missions/exceptions/rocket-not-found.exception';

const logger = new Logger('MissionService');

@Injectable()
export class MissionService {
  constructor(
    private readonly marsyRocketProxyService: MarsyRocketProxyService,
    private readonly marsyWeatherProxyService: MarsyWeatherProxyService,
    private readonly siteService: SiteService,
    export const MAX_ALTITUDE = 100000;
    export const MAX_SPEED = 5000;
    export const MIN_FUEL = 10;
    export const MAX_TEMPERATURE = 100;
    export const MAX_PRESSURE = 200;
    export const MAX_HUMIDITY = 80;

    @InjectModel(Mission.name) private missionModel: Model<Mission>,
  ) {}
 async evaluateRocketDestruction(rocketId: string, telemetryRecord: TelemetryRecordDto): Promise<void> {
   try {
     logger.log(`Evaluating destruction for rocket with ID: ${rocketId}`);
     const mission = await this.getMissionByRocketId(rocketId) as Mission;
     const { altitude, speed, fuel, temperature, pressure, humidity } = telemetryRecord;

     if (altitude > MAX_ALTITUDE || speed > MAX_SPEED || fuel <= MIN_FUEL) {
       await this.marsyRocketProxyService.destroyRocket(rocketId);
       logger.log(`Rocket with ID ${rocketId} destroyed due to critical telemetry.`);
     }

     if (temperature > MAX_TEMPERATURE || pressure > MAX_PRESSURE || humidity > MAX_HUMIDITY) {
       await this.marsyRocketProxyService.destroyRocket(rocketId);
       logger.log(`Rocket with ID ${rocketId} destroyed due to environmental conditions.`);
     }
   } catch (error) {
     if (error instanceof MissionNotFoundException) {
       logger.log(`Mission with rocketId ${rocketId} not found`);
     } else if (error instanceof RocketNotFoundException) {
       logger.log(`Rocket with ID ${rocketId} not found`);
     } else {
       logger.error(`Error: ${error.message}`);
     }
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
  async getMissionByRocketId(
    rocketId: string,
  ): Promise<Mission> {
    logger.log(
      `Received request for mission with rocketId ${rocketId}`,
    );

    const mission = await this.missionModel
      .findOne({ rocket: rocketId })
      .exec();

    if (!mission) {
      throw new MissionNotFoundException(
        `Mission with rocketId ${rocketId} not found`,
      );
    }

    logger.log(
      `Returning mission with rocketId ${mission.name}`,
    );

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
