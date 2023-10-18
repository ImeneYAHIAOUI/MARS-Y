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
import { MissionTelemetryDto } from '../dto/mission-telemetry.dto';
import { BoosterStatus } from '../schema/booster.status.schema';
import { MissionBoosterDto } from '../dto/mission.booster.dto';
import { RocketNotFoundException } from '../exceptions/rocket-not-found.exception';
import * as Constants from '../schema/constants';
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
  }

  private kafka = new Kafka({
    clientId: 'missions',
    brokers: ['kafka-service:9092'],
  });

  async evaluateRocketDestruction(
    rocketId: string,
    telemetryRecord: MissionTelemetryDto,
  ): Promise<void> {
    try {
      logger.log(`Evaluating telemetry for rocket with ID: ${rocketId}`);
      const mission = (await this.getMissionByRocketId(rocketId)) as Mission;

      const { altitude, speed, temperature, pressure, angle } = telemetryRecord;

      if (angle > Constants.MAX_ANGLE || angle < Constants.MIN_ANGLE) {
        logger.log(
          `Angle exceeded for rocket ${rocketId
            .slice(-3)
            .toUpperCase()}. Angle: ${angle}`,
        );
        await this.destroyRocket(rocketId, 'Angle exceeded');
        return;
      }

      if (altitude > Constants.MAX_ALTITUDE || speed > Constants.MAX_SPEED) {
        logger.log(
          `Critical telemetry exceeded for rocket ${rocketId
            .slice(-3)
            .toUpperCase()}. Altitude: ${altitude}, Speed: ${speed}`,
        );
        await this.destroyRocket(rocketId, 'Critical telemetry exceeded');
        return;
      }

      if (
        temperature > Constants.MAX_TEMPERATURE ||
        pressure > Constants.MAX_PRESSURE
      ) {
        logger.log(
          `Environmental conditions exceeded for rocket ${rocketId
            .slice(-3)
            .toUpperCase()}. Temperature: ${temperature}, Pressure: ${pressure}`,
        );
        await this.destroyRocket(rocketId, 'Environmental conditions exceeded');
        return;
      }
      if (altitude > Constants.MAX_ALTITUDE_MAIN) {
        const event = {
          rocketId: rocketId,
          event: `Main engine cutoff for rocket ${rocketId
            .slice(-3)
            .toUpperCase()}`,
        };
        const producer = this.kafka.producer();
        await producer.connect();
        await producer.send({
          topic: 'topic-mission-events',
          messages: [
            {
              value: JSON.stringify(event),
            },
          ],
        });
        await producer.disconnect();
      }

      logger.log(
        `Telemetry for rocket with ID ${rocketId} is within safe parameters. No need for destruction.`,
      );
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
    await consumer.subscribe({ topic: 'telemetry', fromBeginning: true });
    await consumer.run({
      eachMessage: async ({ topic, partition, message }) => {
        const responseEvent = JSON.parse(message.value.toString());
        if (responseEvent.recipient === 'mission-telemetry') {
          const telemetry = responseEvent.telemetry;
          const rocketId = responseEvent.rocketId;
          await this.evaluateRocketDestruction(rocketId, telemetry);
        }
      },
    });
  }
}
