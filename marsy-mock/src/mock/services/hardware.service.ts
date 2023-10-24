import { Injectable, Logger } from '@nestjs/common';

import { TelemetryRecordDto } from '../dto/telemetry-record.dto';
import { StagingDto } from '../dto/staging.dto';
import * as cron from 'cron';
import { MarsyMissionProxyService } from './marsy-mission-proxy/marsy-mission-proxy.service';
import { BoosterTelemetryRecordDto } from '../dto/booster-telemetry-record.dto';
import { GuidanceHardwareProxyService } from './mock-guidance-proxy.service.ts/guidance-hardware-proxy.service';
import { EventDto, Event } from '../dto/event.dto';
import { Kafka } from 'kafkajs';
import { TelemetryEvent } from '../dto/telemetry.event';
import * as Constants from '../schema/constants';
@Injectable()
export class HardwareService {
  private readonly logger: Logger = new Logger(HardwareService.name);
  private readonly MAX_Q_ALTITUDE: number = 2000;

  private rocketCronJob: any;
  private boosterCronJob: any;
  private rockets: {
    rocketId: string;
    missionId: string;
    staged: boolean;
    throttle: boolean;
    telemetry: TelemetryRecordDto;
  }[] = [];

  private boosters: {
    rocketId: string;
    missionId: string;
    landing: boolean;
    telemetry: BoosterTelemetryRecordDto;
  }[] = [];

  private kafka = new Kafka({
    clientId: 'hardware',
    brokers: ['kafka-service:9092'],
  });

  private asleep = false;

  async postMessageToKafka(event: EventDto) {
    const producer = this.kafka.producer();
    await producer.connect();
    await producer.send({
      topic: 'topic-mission-events',
      messages: [{ value: JSON.stringify(event) }],
    });
    await producer.disconnect();
  }

  async sendTelemetryToKafka(event: TelemetryEvent) {
    const producer = this.kafka.producer();
    await producer.connect();
    await producer.send({
      topic: 'telemetry',
      messages: [{ value: JSON.stringify(event) }],
    });
    await producer.disconnect();
  }

  constructor(
    private readonly marssyMissionProxyService: MarsyMissionProxyService,
    private readonly marsyGuidanceHardwareProxyService: GuidanceHardwareProxyService,
  ) {}

  throttleDown(rocketId: string): boolean {
    this.logger.log(
      `Throttling down the rocket ${rocketId.slice(-3).toUpperCase()}`,
    );
    const rocketTelemetry = this.rockets.find((rocket) => {
      return rocket.rocketId === rocketId;
    });
    rocketTelemetry.throttle = true;
    return true;
  }

  async stageRocket(rocketId: string): Promise<StagingDto> {
    const rocketTelemetry = this.rockets.find((rocket) => {
      return rocket.rocketId === rocketId;
    });
    rocketTelemetry.staged = true;
    this.stopSendingTelemetry(rocketId);
    // 9) Second engine start
    await this.postMessageToKafka({
      rocketId: rocketId,
      event: Event.SECOND_ENGINE_START,
    });
    await this.marsyGuidanceHardwareProxyService.startEmittingStageTwoTelemetry(
      rocketTelemetry.telemetry,
    );

    this.boosters.push({
      rocketId: rocketId,
      missionId: rocketTelemetry.missionId,
      landing: false,
      telemetry: this._getDecentInitialeBoosterTelemetry(
        rocketTelemetry.missionId,
        rocketId,
      ),
    });

    const telemetry = this.boosters.find((booster) => {
      return booster.rocketId === rocketId;
    }).telemetry;
    await this.publishBoosterTelemetry(telemetry, rocketId);

    this.boosterCronJob = new cron.CronJob(
      '*/3 * * * * *',
      async () => {
        const telemetry = this.retrieveBoosterTelemetry(rocketId);
        await this.publishBoosterTelemetry(telemetry, rocketId);
      },
      null,
      true,
      'America/Los_Angeles',
    );
    return {
      _id: rocketId,
      staged: rocketTelemetry.staged,
    };
  }

  async landBooster(rocketId: string): Promise<any> {
    //this.logger.log(`Started landing process of the booster of the rocket ${rocketId.slice(-3).toUpperCase()}`);
    this.postMessageToKafka({
      rocketId: rocketId,
      event: Event.FLIP_MANEUVER,
    });

    await new Promise((r) => setTimeout(r, 1000));

    this.postMessageToKafka({
      rocketId: rocketId,
      event: Event.ENTRY_BURN,
    });

    await new Promise((r) => setTimeout(r, 1000));

    this.postMessageToKafka({
      rocketId: rocketId,
      event: Event.GUIDANCE,
    });

    await new Promise((r) => setTimeout(r, 1000));

    this.postMessageToKafka({
      rocketId: rocketId,
      event: Event.LANDING_BURN,
    });

    await new Promise((r) => setTimeout(r, 1000));

    this.postMessageToKafka({
      rocketId: rocketId,
      event: Event.LANDING_LEG_DEPLOYMENT,
    });

    await new Promise((r) => setTimeout(r, 1000));

    await this.postMessageToKafka({
      rocketId: rocketId,
      event: Event.LANDING,
    });

    const booster = this.boosters.find((booster) => {
      return booster.rocketId === rocketId;
    });
    booster.landing = true;
    return { _id: rocketId, landed: true };
  }

  // before landing speed is zero and we are falling in altitude free fall
  retrieveBoosterTelemetry(rocketId: string): BoosterTelemetryRecordDto {
    this.logger.log(
      `Retrieving telemetry from the booster of the staged rocket ${rocketId
        .slice(-3)
        .toUpperCase()}`,
    );
    const boosterTelemetry = this.boosters.find((booster) => {
      return booster.rocketId === rocketId;
    });

    const newFuel =
      boosterTelemetry.telemetry.fuel - 15 > 0
        ? boosterTelemetry.telemetry.fuel - 15
        : 0;

    boosterTelemetry.telemetry = {
      timestamp: Date.now(),
      longitude:
        boosterTelemetry.telemetry.longitude +
        Math.floor(Math.random() * (5 - 0)),
      altitude:
        boosterTelemetry.telemetry.altitude - 1900 > 0
          ? boosterTelemetry.telemetry.altitude - 1900
          : 0,
      latitude:
        boosterTelemetry.telemetry.latitude +
        Math.floor(Math.random() * (5 - 0)),
      pressure: boosterTelemetry.telemetry.pressure,
      speed: boosterTelemetry.telemetry.speed,
      humidity: boosterTelemetry.telemetry.humidity,
      temperature: boosterTelemetry.telemetry.temperature,
      fuel: boosterTelemetry.landing
        ? newFuel
        : boosterTelemetry.telemetry.fuel,
      missionId: boosterTelemetry.telemetry.missionId,
    };

    if (boosterTelemetry.telemetry.altitude <= 300) {
      this.boosterCronJob.stop();
      this.logger.log(
        `Booster landed for mission id ${rocketId.slice(-3).toUpperCase()}`,
      );
    }

    return boosterTelemetry.telemetry;
  }

  retrieveTelemetry(rocketId: string): TelemetryRecordDto {
    this.logger.log(
      `Sending telemetry from the rocket ${rocketId.slice(-3).toUpperCase()}`,
    );
    const rocketTelemetry = this.rockets.find((rocket) => {
      return rocket.rocketId === rocketId;
    });

    const potentialFuel =
      rocketTelemetry.telemetry.fuel - (rocketTelemetry.throttle ? 50 : 5);
    const newFuel = potentialFuel > 0 ? potentialFuel : 0;

    const throttle = -20;
    const newSpeed = !rocketTelemetry.throttle
      ? rocketTelemetry.telemetry.speed + 5
      : rocketTelemetry.telemetry.speed + throttle > 0
      ? rocketTelemetry.telemetry.speed + throttle
      : 0;

    rocketTelemetry.throttle &&
      this.logger.log(
        `Approaching the max Q altitude with throttled speed ${newSpeed}`,
      );

    rocketTelemetry.telemetry = {
      timestamp: Date.now(),
      longitude:
        rocketTelemetry.telemetry.longitude +
        (Math.random() > 0.5
          ? Math.floor(Math.random() * (2 - 0))
          : -Math.floor(Math.random() * (2 - 0))),
      altitude: rocketTelemetry.telemetry.altitude + 2000,
      latitude:
        rocketTelemetry.telemetry.latitude +
        (Math.random() > 0.5
          ? Math.floor(Math.random() * (2 - 0))
          : -Math.floor(Math.random() * (2 - 0))),
      pressure: rocketTelemetry.telemetry.pressure,
      speed: newSpeed,
      humidity: rocketTelemetry.telemetry.humidity,
      temperature: rocketTelemetry.telemetry.temperature,
      fuel: newFuel,
      missionId: rocketTelemetry.telemetry.missionId,
      rocketId: rocketId,
      angle: rocketTelemetry.telemetry.angle - 1,
      staged: rocketTelemetry.staged,
    };
    return rocketTelemetry.telemetry;
  }

  _getDecentInitialeBoosterTelemetry(
    missionId: string,
    rocketId: string,
  ): BoosterTelemetryRecordDto {
    const originalRocketTelemetry = this.rockets.find((rocket) => {
      return rocket.rocketId === rocketId;
    });
    return {
      missionId: missionId,
      timestamp: Date.now(),
      longitude: originalRocketTelemetry.telemetry.longitude,
      altitude: originalRocketTelemetry.telemetry.altitude,
      latitude: originalRocketTelemetry.telemetry.latitude,
      pressure: 50,
      speed: 0,
      humidity: 30,
      temperature: 70,
      fuel: 30,
    };
  }

  _getDecentInitialeRocketTelemetry(
    missionId: string,
    rocketId: string,
  ): TelemetryRecordDto {
    return {
      missionId: missionId,
      timestamp: Date.now(),
      longitude: Math.floor(Math.random() * 2) + 80,
      altitude: Math.floor(Math.random() * 50) + 50,
      latitude: Math.floor(Math.random() * 5) + 280,
      pressure: 50,
      speed: 100,
      humidity: 30,
      temperature: 70,
      fuel: 100,
      rocketId: rocketId,
      angle: 90,

      staged: false,
    };
  }
  async publishBoosterTelemetry(
    telemetry: BoosterTelemetryRecordDto,
    rocketId: string,
  ) {
    const boosterTelemetryStoring = {
      recipient: 'booster-telemetry-storage',
      telemetry: telemetry,
      rocketId: rocketId,
    };
    const boosterTelemetry = {
      missionId: telemetry.missionId,
      timestamp: telemetry.timestamp,
      latitude: telemetry.latitude,
      longitude: telemetry.longitude,
      altitude: telemetry.altitude,
    };
    const message = {
      recipient: 'booster-telemetry',
      telemetry: boosterTelemetry,
      rocketId: rocketId,
    };
    await this.sendTelemetryToKafka(message);
    await this.sendTelemetryToKafka(boosterTelemetryStoring);
  }
  //3) Startup (T-00:01:00)
  // 4) Main engine start (T-00:00:03)
  // 5) Liftoff/Launch (T+00:00:00)
  async startSendingTelemetry(rocketId: string) {
    await this.postMessageToKafka({
      rocketId: rocketId,
      event: Event.START_UP,
    });
    await this.postMessageToKafka({
      rocketId: rocketId,
      event: Event.MAIN_ENGINE_START,
    });
    await this.postMessageToKafka({ rocketId: rocketId, event: Event.LIFTOFF });
    this.logger.log(
      `Started sending telemetry for the rocket ${rocketId
        .slice(-3)
        .toUpperCase()}`,
    );
    const missionId: string = (
      await this.marssyMissionProxyService.getMission(rocketId)
    )._id;
    this.rockets.push({
      rocketId: rocketId,
      missionId: missionId,
      staged: false,
      throttle: false,
      telemetry: this._getDecentInitialeRocketTelemetry(missionId, rocketId),
    });
    this.rocketCronJob = new cron.CronJob(
      '*/3 * * * * *',
      () => {
        if (!this.asleep) {
          const telemetry = this.retrieveTelemetry(rocketId);
          this.evaluateRocketDestruction(telemetry);

          const telemetryStoring = {
            recipient: 'telemetry-storage',
            telemetry: telemetry,
            rocketId: telemetry.rocketId,
          };
          const missionTelemetry = {
            missionId: telemetry.missionId,
            timestamp: telemetry.timestamp,
            latitude: telemetry.latitude,
            longitude: telemetry.longitude,
            altitude: telemetry.altitude,
            angle: telemetry.angle,
            speed: telemetry.speed,
            pressure: telemetry.pressure,
            temperature: telemetry.temperature,
          };
          const missionMessage = {
            recipient: 'mission-telemetry',
            telemetry: missionTelemetry,
            rocketId: telemetry.rocketId,
          };
          const payloadTelemetry = {
            missionId: telemetry.missionId,
            timestamp: telemetry.timestamp,
            altitude: telemetry.altitude,
            latitude: telemetry.latitude,
            longitude: telemetry.longitude,
            angle: telemetry.angle,
          };
          const payloadMessage = {
            recipient: 'payload-telemetry',
            telemetry: payloadTelemetry,
            rocketId: telemetry.rocketId,
          };
          const controlTelemetry = {
            rocketId: telemetry.rocketId,
            fuel: telemetry.fuel,
            altitude: telemetry.altitude,
          };
          const controlMessage = {
            recipient: 'controlPad-telemetry',
            telemetry: controlTelemetry,
            rocketId: telemetry.rocketId,
          };
          this.sendTelemetryToKafka(missionMessage);
          this.sendTelemetryToKafka(payloadMessage);
          this.sendTelemetryToKafka(controlMessage);
          this.sendTelemetryToKafka(telemetryStoring);
        }
      },
      null,
      true,
      'America/Los_Angeles',
    );
    this.rocketCronJob.start();
    return true;
  }

  async evaluateRocketDestruction(
    telemetryRecord: TelemetryRecordDto,
  ): Promise<void> {
    this.logger.log(
      `Evaluating telemetry for rocket with ID: ${telemetryRecord.rocketId}`,
    );

    if (
      telemetryRecord.angle > Constants.MAX_ANGLE ||
      telemetryRecord.angle < Constants.MIN_ANGLE
    ) {
      this.logger.log(
        `Angle exceeded for rocket ${telemetryRecord.rocketId
          .slice(-3)
          .toUpperCase()}. Angle: ${telemetryRecord.angle}`,
      );
      await this.destroyRocket(telemetryRecord.rocketId, 'Angle exceeded');
      return;
    }

    if (
      telemetryRecord.altitude > Constants.MAX_ALTITUDE ||
      telemetryRecord.speed > Constants.MAX_SPEED
    ) {
      this.logger.log(
        `Critical telemetry exceeded for rocket ${telemetryRecord.rocketId
          .slice(-3)
          .toUpperCase()}. Altitude: ${telemetryRecord.altitude}, Speed: ${
          telemetryRecord.speed
        }`,
      );
      await this.destroyRocket(
        telemetryRecord.rocketId,
        'Critical telemetry exceeded',
      );
      return;
    }

    if (
      telemetryRecord.temperature > Constants.MAX_TEMPERATURE ||
      telemetryRecord.pressure > Constants.MAX_PRESSURE
    ) {
      this.logger.log(
        `Environmental conditions exceeded for rocket ${telemetryRecord.rocketId
          .slice(-3)
          .toUpperCase()}. Temperature: ${
          telemetryRecord.temperature
        }, Pressure: ${telemetryRecord.pressure}`,
      );
      await this.destroyRocket(
        telemetryRecord.rocketId,
        'Environmental conditions exceeded',
      );
      return;
    }
  }
  async destroyRocket(rocketId: string, reason: string): Promise<void> {
    try {
      await this.postMessageToKafka({
        rocketId: rocketId,
        event: Event.START_UP_FAILURE,
        reason: reason,
      });
      const formattedRocketId = rocketId.slice(-3).toUpperCase();
      this.logger.log(
        `Issuing order to destroy rocket ${formattedRocketId}. Reason: ${reason}`,
      );
      await this.postMessageToKafka({
        rocketId: rocketId,
        event: Event.Rocket_Destruction,
      });
      this.stopSendingTelemetry(rocketId);
    } catch (error) {
      this.logger.error(
        `Error while destroying rocket with ID ${rocketId}: ${error.message}`,
      );
      throw error;
    }
  }

  stopSendingTelemetry(rocketId: string): void {
    this.logger.log(`Stopped sending telemetry for the rocket ${rocketId}`);
    this.rocketCronJob.stop();
  }
}
