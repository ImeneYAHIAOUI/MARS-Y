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
import { Kafka } from 'kafkajs';

const logger = new Logger('MissionService');

@Injectable()
export class MissionService {
  constructor(
    private readonly marsyRocketProxyService: MarsyRocketProxyService,
    private readonly marsyWeatherProxyService: MarsyWeatherProxyService,
    private readonly siteService: SiteService,
    @InjectModel(Mission.name) private missionModel: Model<Mission>,
  ) {
    this.receiveTelemetryListener();
    this.receiveEventListener();
  }
  private readonly Rocket_Destruction_EVENT =
    'Just in : the rocket is destroyed';
  private kafka = new Kafka({
    clientId: 'missions',
    brokers: ['kafka-service:9092'],
  });

  async destroyRocket(rocketId: string, reason: string): Promise<void> {
    try {
      const formattedRocketId = rocketId.slice(-3).toUpperCase();
      logger.log(
        `Issuing order to destroy rocket ${formattedRocketId}. Reason: ${reason}`,
      );
      await this.marsyRocketProxyService.destroyRocket(rocketId);
    } catch (error) {
      logger.error(
        `Error while destroying rocket with ID ${rocketId}: ${error.message}`,
      );
      throw error;
    }
  }

  async goOrNoGoPoll(_missionId: string): Promise<boolean> {
    try {
      logger.log(
        `Received request to perform a go/no go for mission ${_missionId
          .slice(-3)
          .toUpperCase()}`,
      );
      const mission = await this.getMissionById(_missionId);
      if (!mission) {
        throw new MissionNotFoundException(_missionId);
      }
      const _site = await this.siteService.getSiteById(mission.site.toString());
      const _weatherStatus =
        await this.marsyWeatherProxyService.retrieveWeatherStatus(
          _site.latitude,
          _site.longitude,
        );

      const _rocketId = mission.rocket.toString();
      const _rocketStatus =
        await this.marsyRocketProxyService.retrieveRocketStatus(_rocketId);
      logger.log(
        `Weather status for mission ${_missionId
          .slice(-3)
          .toUpperCase()}: ${JSON.stringify(_weatherStatus)}`,
      );
      logger.log(
        `Rocket status for mission ${_missionId
          .slice(-3)
          .toUpperCase()}: ${JSON.stringify(_rocketStatus)}`,
      );
      return _rocketStatus && _weatherStatus;
    } catch (error) {
      logger.error(
        `Error while performing go/no go poll for mission ${_missionId}: ${error.message}`,
      );
      throw error;
    }
  }

  async saveNewStatus(missionId: string, _status: MissionStatus) {
    const mission = await this.missionModel.findById(missionId).exec();
    mission.status = _status;
    await mission.save();
  }

  async saveNewStatusBooster(missionBoosterDto: MissionBoosterDto) {
    const missionId = missionBoosterDto._id;
    const status = missionBoosterDto.boosterStatus;
    const mission = await this.missionModel.findById(missionId).exec();
    mission.boosterStatus = BoosterStatus[status as keyof typeof BoosterStatus];
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
  async getMissionByRocketId(rocketId: string): Promise<Mission> {
    const mission = await this.missionModel
      .findOne({ rocket: rocketId })
      .exec();
    if (!mission) {
      throw new MissionNotFoundException(
        `Mission with rocketId ${rocketId} not found`,
      );
    }
    return mission;
  }

  async getMissionByRocketIdAndStatus(
    rocketId: string,
    missionStatus: string,
  ): Promise<Mission> {
    const mission = await this.missionModel
      .findOne({ rocket: rocketId, status: missionStatus })
      .exec();
    if (!mission) {
      throw new MissionNotFoundException(
        `Mission with rocketId ${rocketId} and status ${missionStatus} not found`,
      );
    }
    return mission;
  }

  async createMission(
    name: string,
    rocketId: string,
    siteId: string,
  ): Promise<Mission> {
    logger.log(`Received request to add mission name : ${name}`);
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

  async receiveTelemetryListener(): Promise<void> {
    const consumer = this.kafka.consumer({ groupId: 'mission-consumer-group' });
    await consumer.connect();
    await consumer.subscribe({
      topic: 'mission-telemetry',
      fromBeginning: true,
    });
    await consumer.run({
      eachMessage: async ({ message }) => {
        const responseEvent = JSON.parse(message.value.toString());
        const rocketId = responseEvent.rocketId;
        const destroyRocket = responseEvent.destroyRocket;
        if (destroyRocket.destroy) {
          await this.destroyRocket(rocketId, destroyRocket.reason);
        }
      },
    });
  }

  async receiveEventListener(): Promise<void> {
    const consumer = this.kafka.consumer({
      groupId: 'mission-consumer-group2',
    });
    await consumer.connect();
    await consumer.subscribe({
      topic: 'topic-mission-events',
      fromBeginning: true,
    });
    await consumer.run({
      eachMessage: async ({ message }) => {
        const producer = this.kafka.producer();
        await producer.connect();
        await producer.send({
          topic: 'events-web-caster',
          messages: [{ value: message.value.toString() }],
        });
        if (message.value.toString() === this.Rocket_Destruction_EVENT) {
          const responseEvent = JSON.parse(message.value.toString());
          const rocketId = responseEvent.rocketId;
          const reason = responseEvent.reason;
          await this.destroyRocket(rocketId, reason);
        }
        await producer.disconnect();
      },
    });
  }

  async postMessageToKafka(message: any) {
    const producer = this.kafka.producer();
    await producer.connect();
    await producer.send({
      topic: 'topic-mission-events',
      messages: [{ value: JSON.stringify(message) }],
    });
    await producer.disconnect();
  }

  async checkWeatherRocketStatus(responseEvent: any) {
    if (responseEvent.rocket_poll != undefined) {
      logger.log(
        `rocket Id ${responseEvent.rocketId.slice(-3).toUpperCase()} status ${
          responseEvent.rocket_poll
        } for launch`,
      );
      await this.postMessageToKafka({
        rocketId: responseEvent.rocketId,
        event: 'PRELAUNCH_CHECKS : GO/NOGO Mission',
        mission_poll: responseEvent.rocket_poll,
      });
    }

    if (responseEvent.weather_poll != undefined) {
      logger.log(
        `weather for rocket Id ${responseEvent.rocketId
          .slice(-3)
          .toUpperCase()} status ${
          responseEvent.weather_poll
        } checked before launch`,
      );
      if (responseEvent.weather_poll == true) {
        await this.marsyRocketProxyService.retrieveRocketStatus(
          responseEvent.rocketId,
        );
      }
    }
  }
  async missionFailed(rocketId: string): Promise<void> {
    const mission = await this.missionModel
      .findOne({ rocket: rocketId })
      .exec();
    mission.status = MissionStatus.FAILED;
    await mission.save();
    logger.log(
      `Mission of the rocket ${rocketId.slice(-3).toUpperCase()} failed`,
    );
  }
}
