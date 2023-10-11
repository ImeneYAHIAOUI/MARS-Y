import { Injectable, Logger } from '@nestjs/common';

import { TelemetryRecordDto } from '../dto/telemetry-record.dto';
import { StagingDto } from '../dto/staging.dto';
import * as cron from 'cron';
import { MarsyTelemetryProxyService } from './marsy-telemetry-proxy/marsy-telemetry-proxy.service';
import { MarsyMissionProxyService } from './marsy-mission-proxy/marsy-mission-proxy.service';
import { BoosterTelemetryRecordDto } from '../dto/booster-telemetry-record.dto';
import { GuidanceHardwareProxyService } from './mock-guidance-proxy.service.ts/guidance-hardware-proxy.service';
import { EventDto, Event } from '../dto/event.dto';
import { Kafka } from 'kafkajs';
import { publicDecrypt } from 'crypto';

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
    brokers: ['kafka-service:9092']
  })

  private asleep = false;

  async postMessageToKafka(event: EventDto) {
      const producer = this.kafka.producer()
      await producer.connect()
      await producer.send({
          topic: 'topic-mission-events',
          messages: [
            { value: JSON.stringify(event) },
          ],
        })
      await producer.disconnect()
  }

  constructor(
    private readonly marsyTelemetryProxyService: MarsyTelemetryProxyService,
    private readonly marssyMissionProxyService: MarsyMissionProxyService,
    private readonly marsyGuidanceHardwareProxyService: GuidanceHardwareProxyService,
  ) { }

  throttleDown(rocketId: string): boolean {
    this.logger.log(`Throttling down the rocket ${rocketId.slice(-3).toUpperCase()}`);
    let rocketTelemetry = this.rockets.find((rocket) => {
      return rocket.rocketId === rocketId;
    });
    rocketTelemetry.throttle = true;
    //this.logger.log(`Approaching the max Q altitude`);
    return true;
  }

  async stageRocket(rocketId: string): Promise<StagingDto> {
    this.logger.log(`Staging rocket ${rocketId.slice(-3).toUpperCase()}`);
    let rocketTelemetry = this.rockets.find((rocket) => {
      return rocket.rocketId === rocketId;
    });
    rocketTelemetry.staged = true;
    this.stopSendingTelemetry(rocketId);
    this.marsyGuidanceHardwareProxyService.startEmittingStageTwoTelemetry(rocketTelemetry.telemetry);

    this.boosters.push({
      rocketId: rocketId,
      missionId: rocketTelemetry.missionId,
      landing: false,
      telemetry: this._getDecentInitialeBoosterTelemetry(
        rocketTelemetry.missionId,
        rocketId,
      ),
    });

    this.logger.debug(`Attempting to stage rocket ${rocketId.slice(-3).toUpperCase()} and starting to send booster telemetry`);

    this.marsyTelemetryProxyService.sendBoosterTelemetryToApi(
      this.boosters.find((booster) => {
        return booster.rocketId === rocketId;
      }).telemetry,
      rocketId,
    );

    this.boosterCronJob = new cron.CronJob('*/3 * * * * *', () => {
      this.marsyTelemetryProxyService.sendBoosterTelemetryToApi(
        this.retrieveBoosterTelemetry(rocketId),
        rocketId,
      );
    },
      null,
      true,
      'America/Los_Angeles');
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

    await new Promise(r => setTimeout(r, 1000));

    this.postMessageToKafka({
      rocketId: rocketId,
      event: Event.ENTRY_BURN,
    });

    await new Promise(r => setTimeout(r, 1000));

    this.postMessageToKafka({
      rocketId: rocketId,
      event: Event.GUIDANCE,
    });

    await new Promise(r => setTimeout(r, 1000));

    this.postMessageToKafka({
      rocketId: rocketId,
      event: Event.LANDING_BURN,
    });

    await new Promise(r => setTimeout(r, 1000));

    this.postMessageToKafka({
      rocketId: rocketId,
      event: Event.LANDING_LEG_DEPLOYMENT,
    });

    await new Promise(r => setTimeout(r, 1000));

    this.postMessageToKafka({
      rocketId: rocketId,
      event: Event.LANDING,
    });

    const booster = this.boosters.find((booster) => {
      return booster.rocketId === rocketId;
    });
    booster.landing = true;
    return {_id : rocketId, landed : true };
  }

  // before landing speed is zero and we are falling in altitude free fall
  retrieveBoosterTelemetry(rocketId: string): BoosterTelemetryRecordDto {
    this.logger.log(`Retrieving telemetry from the booster of the staged rocket ${rocketId.slice(-3).toUpperCase()}`);
    let boosterTelemetry = this.boosters.find((booster) => {
      return booster.rocketId === rocketId;
    });

    const newFuel = boosterTelemetry.telemetry.fuel - 15 > 0 ? boosterTelemetry.telemetry.fuel - 15 : 0;

    boosterTelemetry.telemetry = {
      timestamp: Date.now(),
      longitude: boosterTelemetry.telemetry.longitude + Math.floor(Math.random() * (5 - 0)),
      altitude: boosterTelemetry.telemetry.altitude - 1900 > 0 ? boosterTelemetry.telemetry.altitude - 1900 : 0,
      latitude: boosterTelemetry.telemetry.latitude + Math.floor(Math.random() * (5 - 0)),
      pressure: boosterTelemetry.telemetry.pressure,
      speed: boosterTelemetry.telemetry.speed,
      humidity: boosterTelemetry.telemetry.humidity,
      temperature: boosterTelemetry.telemetry.temperature,
      fuel: boosterTelemetry.landing ? newFuel : boosterTelemetry.telemetry.fuel,
      missionId: boosterTelemetry.telemetry.missionId,
    };

    if (boosterTelemetry.telemetry.altitude <= 300) {
      this.boosterCronJob.stop();
      this.logger.log(`Booster landed for mission id ${rocketId}`);
    }

    return boosterTelemetry.telemetry;
  }

  retrieveTelemetry(rocketId: string): TelemetryRecordDto {
    this.logger.log(`Sending telemetry from the rocket ${rocketId.slice(-3).toUpperCase()}`);
    let rocketTelemetry = this.rockets.find((rocket) => {
      return rocket.rocketId === rocketId;
    });

    const potentialFuel = rocketTelemetry.telemetry.fuel - (
      rocketTelemetry.throttle ? 50 : 5
    );
    const newFuel = potentialFuel > 0 ?
      potentialFuel :
      0;

    const throttle = -20;
    const newSpeed = !rocketTelemetry.throttle ? rocketTelemetry.telemetry.speed + 5 : 
       (rocketTelemetry.telemetry.speed + throttle > 0 ? rocketTelemetry.telemetry.speed + throttle : 0); 
  
    rocketTelemetry.throttle && this.logger.log(`Approaching the max Q altitude with throttled speed ${newSpeed}`);

    rocketTelemetry.telemetry = {
      timestamp: Date.now(),
      longitude: rocketTelemetry.telemetry.longitude + (Math.random() > 0.5 ? Math.floor(Math.random() * (2 - 0)) : -Math.floor(Math.random() * (2 - 0))),
      altitude: rocketTelemetry.telemetry.altitude + 2000,
      latitude: rocketTelemetry.telemetry.latitude + (Math.random() > 0.5 ? Math.floor(Math.random() * (2 - 0)) : -Math.floor(Math.random() * (2 - 0))),
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

  async startSendingTelemetry(rocketId: string) {
    this.logger.log(`Started sending telemetry for the rocket ${rocketId.slice(-3).toUpperCase()}`);
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
    this.rocketCronJob = new cron.CronJob('*/3 * * * * *', () => {
      !this.asleep &&
      this.marsyTelemetryProxyService.sendTelemetryToApi(
        this.retrieveTelemetry(rocketId),
      );
    },
      null,
      true,
      'America/Los_Angeles');
    this.rocketCronJob.start();
    return true;
  }

  stopSendingTelemetry(rocketId: string): void {
    //this.logger.log(`Stopped sending telemetry for the rocket ${rocketId}`);
    this.rocketCronJob.stop();
  }
}