import { Injectable, Logger } from '@nestjs/common';
import { MarsyRocketProxyService } from './marsy-rocket-proxy/marsy-rocket-proxy.service';
import { MarsyWeatherProxyService } from './marsy-weather-proxy/marsy-weather-proxy.service';
import { Model } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import { Mission } from '../schema/mission.schema';
import { SiteService } from './site.service';
import { MissionNotFoundException } from '../exceptions/mission-not-found.exception';
import { MissionStatus } from '../schema/mission.status.schema';
import { MissionExistsException } from '../exceptions/mission-exists.exception';
import { BoosterStatus } from '../schema/booster.status.schema';
import { MissionBoosterDto } from '../dto/mission.booster.dto';

const logger = new Logger('MissionService');

@Injectable()
export class MissionService {
  constructor(
    private readonly marsyRocketProxyService: MarsyRocketProxyService,
    private readonly marsyWeatherProxyService: MarsyWeatherProxyService,
    private readonly siteService: SiteService,
    @InjectModel(Mission.name) private missionModel: Model<Mission>,
  ) {}

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

  async saveNewStatusBooster(missionBoosterDto : MissionBoosterDto) {
    const missionId = missionBoosterDto._id;
    const status = missionBoosterDto.boosterStatus;
    const mission = await this.missionModel.findById(missionId).exec();
    mission.boosterStatus = BoosterStatus[status as keyof typeof BoosterStatus];;
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
