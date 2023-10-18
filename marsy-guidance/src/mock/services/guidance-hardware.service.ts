import { Injectable, Logger } from '@nestjs/common';

import { TelemetryRecordDto } from '../dto/telemetry-record.dto';
import { DeliveryDto } from '../dto/delivery.dto';
import * as cron from 'cron';
import { MarsyHardwarePayloadProxyService } from './marsy-payload-hardware-proxy/marsy-payload-hardware-proxy.service';
import { PayloadTelemetryDto } from '../dto/payload-telemetry.dto';
import { Kafka } from 'kafkajs';
import {TelemetryEvent} from "../dto/telemetry.event";

@Injectable()
export class GuidanceHardwareService {
  private readonly logger: Logger = new Logger(GuidanceHardwareService.name);
  private rocketCronJob: any;
  private rockets: {
    rocketId: string;
    missionId: string;
    delivered: boolean;
    throttle: boolean;
    telemetry: TelemetryRecordDto;
  }[] = [];

  constructor(
    private readonly marsyPayloadHardwareProxyService: MarsyHardwarePayloadProxyService,
  ) {}
  private kafka = new Kafka({
    clientId: 'telemetry',
    brokers: ['kafka-service:9092'],
  });
  // throttleDown(rocketId: string): boolean {
  //   this.logger.log(`Throttling down the rocket ${rocketId.slice(-3).toUpperCase()}`);
  //   let rocketTelemetry = this.rockets.find((rocket) => {
  //     return rocket.rocketId === rocketId;
  //   });
  //   rocketTelemetry.throttle = true;
  //   //this.logger.log(`Approaching the max Q altitude`);
  //   return true;
  // }

  async sendTelemetryToKafka(event: TelemetryEvent) {
    const producer = this.kafka.producer();
    await producer.connect();
    await producer.send({
      topic: 'telemetry',
      messages: [{ value: JSON.stringify(event) }],
    });
    await producer.disconnect();
  }
  async deliverRocket(rocketId: string): Promise<DeliveryDto> {
    this.logger.log(
      `Delivering the payload on the rocket ${rocketId
        .slice(-3)
        .toUpperCase()}`,
    );

    this.stopSendingTelemetry(rocketId);
    return {
      _id: rocketId,
      delivered: true,
    };
  }

  retrieveTelemetry(rocketId: string): TelemetryRecordDto {
    const rocketTelemetry = this.rockets.find((rocket) => {
      return rocket.rocketId === rocketId;
    });
    const newFuel =
      rocketTelemetry.telemetry.fuel - Math.floor(Math.random() * 5) - 30 > 0
        ? rocketTelemetry.telemetry.fuel - Math.floor(Math.random() * 5) - 30
        : 0;
    // const throttle = (-Math.floor(Math.random() * (5 - 0)) -20);
    const newSpeed = 0;

    // rocketTelemetry.throttle && this.logger.log(`Approaching the max Q altitude with throttled speed ${newSpeed}`);

    rocketTelemetry.telemetry = {
      timestamp: Date.now(),
      longitude:
        rocketTelemetry.telemetry.longitude +
        (Math.random() > 0.5
          ? Math.floor(Math.random() * (2 - 0))
          : -Math.floor(Math.random() * (2 - 0))),
      altitude:
        rocketTelemetry.telemetry.altitude +
        Math.floor(Math.random() * (20 - 0)) +
        600,
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
      angle: rocketTelemetry.telemetry.angle - 0.05,
      staged: true,
    };
    this.logger.log(
      `Sending telemetry from the hardware of ${rocketId
        .slice(-3)
        .toUpperCase()}`,
    );
    return rocketTelemetry.telemetry;
  }

  async startSendingTelemetry(latestTelemetry: TelemetryRecordDto) {
    this.logger.log(
      `Started sending telemetry for the rocket ${latestTelemetry.rocketId
        .slice(-3)
        .toUpperCase()}`,
    );
    const rocket = {
      rocketId: latestTelemetry.rocketId,
      missionId: latestTelemetry.missionId,
      delivered: false,
      telemetry: latestTelemetry,
      throttle: false,
    };
    rocket.telemetry.fuel = 100;
    this.rockets.push(rocket);
    this.rocketCronJob = new cron.CronJob(
      '*/3 * * * * *',
      () => {
        const telemetry = this.retrieveTelemetry(latestTelemetry.rocketId);
        const telemetryStoring = {
          recipient: 'telemetry',
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
      },
      null,
      true,
      'America/Los_Angeles',
    );
    this.rocketCronJob.start();
    return true;
  }

  stopSendingTelemetry(rocketId: string): void {
    this.logger.log(`Stopped sending telemetry for the rocket ${rocketId}`);
    this.rocketCronJob.stop();
  }

  startSendingPayloadHardwareTelemetry(rocketId: string) {
    this.logger.log(
      `Started sending payload hardware telemetry for the rocket ${rocketId
        .slice(-3)
        .toUpperCase()}`,
    );

    setTimeout(() => {
      const rocketTelemetry = this.rockets.find((rocket) => {
        return rocket.rocketId === rocketId;
      });

      const payloadTelemetry: PayloadTelemetryDto = {
        missionId: rocketTelemetry.telemetry.missionId,
        timestamp: rocketTelemetry.telemetry.timestamp,
        altitude: rocketTelemetry.telemetry.altitude,
        latitude: rocketTelemetry.telemetry.latitude,
        longitude: rocketTelemetry.telemetry.longitude,
        angle: rocketTelemetry.telemetry.angle,
      };
      this.marsyPayloadHardwareProxyService.startEmittingPayloadHardware(
        payloadTelemetry,
      );
    }, 3000);
  }
}
