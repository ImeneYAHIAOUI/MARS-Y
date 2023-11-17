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
import { EventStored } from '../schema/event.stored.schema';

const logger = new Logger('MissionService');

@Injectable()
export class MissionService {
  constructor(
    private readonly marsyRocketProxyService: MarsyRocketProxyService,
    private readonly marsyWeatherProxyService: MarsyWeatherProxyService,
    private readonly siteService: SiteService,
    @InjectModel(Mission.name) private missionModel: Model<Mission>,
    @InjectModel(EventStored.name) private eventModel: Model<EventStored>,
  ) {
    this.receiveTelemetryListener();
    this.receiveEventListener();
  }

  private kafka = new Kafka({
    clientId: 'missions',
    brokers: ['kafka-service:9092'],
  });

  async destroyRocket(rocketId: string, reason: string): Promise<void> {
    try {
      const formattedRocketId = rocketId.slice(-3).toUpperCase();
      logger.log(
        `Issuing order to destroy rocket ${formattedRocketId}. Reason: ${reason} (us 8)`,
      );
      await this.marsyRocketProxyService.destroyRocket(rocketId);
    } catch (error) {
      logger.error(
        `Error while destroying rocket ${rocketId.slice(-3).toUpperCase()}: ${
          error.message
        }`,
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
      const _rocketId = mission.rocket.toString();

      this.marsyWeatherProxyService.retrieveWeatherStatus(
        _site.latitude,
        _site.longitude,
        _rocketId,
      );
      /*  logger.log(
        `Weather status for mission ${_missionId
          .slice(-3)
          .toUpperCase()}: ${JSON.stringify(_weatherStatus)}`,
      );
      logger.log(
        `Rocket status for mission ${_missionId
          .slice(-3)
          .toUpperCase()}: ${JSON.stringify(_rocketStatus)}`,
      );*/
      return true;
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
        `Mission with rocketId ${rocketId.slice(-3).toUpperCase()} not found`,
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
        `Mission with rocketId ${rocketId
          .slice(-3)
          .toUpperCase()} and status ${missionStatus} not found`,
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
        const mission = await this.getMissionByRocketId(rocketId);
        if (mission.status === MissionStatus.FAILED) {
          logger.log(
            `Received telemetry from malfunctioning rocket ${rocketId
              .slice(-3)
              .toUpperCase()} for failed mission ${mission._id}.`,
          );
          await this.destroyRocket(rocketId, 'Mission failed');
        }
        if (destroyRocket.destroy) {
          await this.destroyRocket(rocketId, destroyRocket.reason);
        }
      },
    });
  }

  async postMessageToKafka(event: any) {
    const producer = this.kafka.producer();
    await producer.connect();
    await producer.send({
      topic: 'topic-mission-events',
      messages: [{ value: JSON.stringify(event) }],
    });
    await producer.disconnect();
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
        const responseEvent = JSON.parse(message.value.toString());
        await this.checkRocketStatus(responseEvent);
        if (!responseEvent.event.includes('PRELAUNCH_CHECKS')) {
          await this.saveEvent(responseEvent.rocketId, responseEvent.event);
          const producer = this.kafka.producer();
          await producer.connect();
          await producer.send({
            topic: 'events-web-caster',
            messages: [{ value: message.value.toString() }],
          });

          await producer.disconnect();
        }
      },
    });
  }

  async checkRocketStatus(responseEvent: any) {
    logger.log(
      `checking rocket ${responseEvent.rocketId
        .slice(-3)
        .toUpperCase()} status`,
    );
    if (responseEvent.rocket_poll != undefined) {
      await this.postMessageToKafka({
        rocketId: responseEvent.rocketId,
        event: 'PRELAUNCH_CHECKS : GO/NOGO Mission',
        mission_poll: responseEvent.rocket_poll,
      });
    }

    if (responseEvent.weather_poll != undefined) {
      if (responseEvent.weather_poll == true) {
        logger.log(
          `weather status OK for rocket ${responseEvent.rocketId
            .slice(-3)
            .toUpperCase()}`,
        );
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

  async saveEvent(mission_id: string, event: string): Promise<void> {
    logger.log(`Saving event  for mission ${mission_id.slice(-3).toUpperCase()} (us 14)`);
    const newEvent = new this.eventModel({
      mission_id,
      date: Date.now(),
      event,
    });
    await newEvent.save();
  }

  async getMissionLogs(id: string): Promise<EventStored[]> {
    const logs = await this.eventModel.find({ mission_id: id }).exec();

    if (logs.length === 0) {
      logger.debug(`No event stored for mission ${id.slice(-3).toUpperCase()}`);
    } else {
      logger.log(`ALL EVENTS STORED FOR MISSION ${id.slice(-3).toUpperCase()}`);
      for (let i = 0; i < logs.length; i++) {
        const event = logs[i];
        const formattedTime = event.date.toLocaleString('fr-FR', {
          year: 'numeric',
          month: 'short',
          day: 'numeric',
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit',
          timeZoneName: 'short',
          timeZone: 'Europe/Paris',
        });
        logger.debug(`${i + 1}- ${formattedTime} => ${event.event}`);
      }
    }

    return logs;
  }
}
