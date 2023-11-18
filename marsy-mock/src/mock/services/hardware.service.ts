import { Injectable, Logger, HttpException, HttpStatus } from '@nestjs/common';

import { TelemetryRecordDto } from '../dto/telemetry-record.dto';
import { StagingDto } from '../dto/staging.dto';
import * as cron from 'cron';
import { MarsyMissionProxyService } from './marsy-mission-proxy/marsy-mission-proxy.service';
import { BoosterTelemetryRecordDto } from '../dto/booster-telemetry-record.dto';
import { EventDto, Event } from '../dto/event.dto';
import { Kafka } from 'kafkajs';
import { TelemetryEvent } from '../dto/telemetry.event';
import * as Constants from '../schema/constants';
@Injectable()
export class HardwareService {
  private runtimes = 0;
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

  async postMessageToKafka(event: any) {
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
    private readonly marsyMissionProxyService: MarsyMissionProxyService,
  ) {}

  throttleDown(rocketId: string): boolean {
    if (this.asleep) {
      throw new HttpException(
        'An error was encoutered while connecting to the Hardware.',
        HttpStatus.BAD_REQUEST,
      );
    }
    this.logger.log(
      `Throttling down the rocket ${rocketId.slice(-3).toUpperCase()}`,
    );
    const rocketTelemetry = this.rockets.find((rocket) => {
      return rocket.rocketId === rocketId;
    });
    rocketTelemetry.throttle = true;
    this.postMessageToKafka({
      rocketId: rocketId,
      event: Event.MAXQ,
    });
    return true;
  }

  async stageRocket(rocketId: string): Promise<StagingDto> {
    const rocketTelemetry = this.rockets.find((rocket) => {
      return rocket.rocketId === rocketId;
    });
    rocketTelemetry.staged = true;
    this.stopSendingTelemetry(rocketId);

    await this.postMessageToKafka({
      rocketId: rocketId,
      event: Event.STAGE_SEPARATION,
      telemetry: rocketTelemetry.telemetry,
    });
    await this.postMessageToKafka({
      rocketId: rocketId,
      event: Event.MAIN_ENGINE_CUTOFF,
    });
    await this.postMessageToKafka({
      rocketId: rocketId,
      event: Event.SECOND_ENGINE_START,
    });

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

    rocketTelemetry.throttle;

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
    const boosterTelemetry = {
      sender: 'booster',
      telemetry: telemetry,
      rocketId: rocketId,
    };
    await this.sendTelemetryToKafka(boosterTelemetry);
  }

  async startSendingTelemetry(rocketId: string) {
    this.runtimes++;
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
        .toUpperCase()} (us 5)`,
    );
    const missionId: string = (
      await this.marsyMissionProxyService.getMission(rocketId)
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

          const telemetryMessage = {
            sender: 'rocket',
            telemetry: telemetry,
            rocketId: telemetry.rocketId,
          };
          this.sendTelemetryToKafka(telemetryMessage);
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
        `Issuing order to destroy rocket ${formattedRocketId}. Reason: ${reason} (us 18)`,
      );
      await this.postMessageToKafka({
        rocketId: rocketId,
        event: Event.ROCKET_DESTRUCTION,
      });
      this.stopSendingTelemetry(rocketId);
    } catch (error) {
      this.logger.error(
        `Error while destroying rocket ${rocketId.slice(-3).toUpperCase()}: ${
          error.message
        }`,
      );
      throw error;
    }
  }

  sleep(): void {
    this.asleep = true;
  }

  wake(): void {
    this.logger.debug(`Rebooted : Resending telemetry`);
    this.asleep = false;
  }

  stopSendingTelemetry(rocketId: string): void {

    this.rocketCronJob.stop();
  }
}
