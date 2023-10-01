import { Injectable, Logger } from '@nestjs/common';

import { TelemetryRecordDto } from '../dto/telemetry-record.dto';
import { DeliveryDto } from '../dto/delivery.dto';
import * as cron from 'cron';
import { MarsyTelemetryProxyService } from './marsy-telemetry-proxy/marsy-telemetry-proxy.service';
import { BoosterTelemetryRecordDto } from '../dto/booster-telemetry-record.dto';

@Injectable()
export class GuidanceHardwareService {
  private readonly logger: Logger = new Logger(GuidanceHardwareService.name);
  private readonly MAX_Q_ALTITUDE: number = 2000;
  private rocketCronJob: any;
  private boosterCronJob: any;
  private rockets: {
    rocketId: string;
    missionId: string;
    delivered: boolean;
    throttle: boolean;
    telemetry: TelemetryRecordDto;
  }[] = [];

  private boosters: {
    rocketId: string;
    missionId: string;
    telemetry: BoosterTelemetryRecordDto;
  }[] = [];

  constructor(
    private readonly marsyTelemetryProxyService: MarsyTelemetryProxyService
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

  async deliverRocket(rocketId: string): Promise<DeliveryDto> {
    this.logger.log(`Delivering the payload on the rocket ${rocketId.slice(-3).toUpperCase()}`);
    return {
      _id: rocketId,
      delivered: true,
    };
  }

  retrieveTelemetry(rocketId: string): TelemetryRecordDto {
    let rocketTelemetry = this.rockets.find((rocket) => {
      return rocket.rocketId === rocketId;
    });
    const newFuel = rocketTelemetry.telemetry.fuel - Math.floor(Math.random() * 5) - 30 > 0 ?
      rocketTelemetry.telemetry.fuel - Math.floor(Math.random() * 5) - 30 :
      0;
    const throttle = (-Math.floor(Math.random() * (5 - 0)) -20);
    const newSpeed = !rocketTelemetry.throttle ? (rocketTelemetry.telemetry.speed + Math.floor(Math.random() * (5 - 0))) : 
     (rocketTelemetry.telemetry.speed + throttle > 0 ? rocketTelemetry.telemetry.speed + throttle : 0); 

    rocketTelemetry.throttle && this.logger.log(`Approaching the max Q altitude with throttled speed ${newSpeed}`);

    rocketTelemetry.telemetry = {
      timestamp: Date.now(),
      longitude: rocketTelemetry.telemetry.longitude + (Math.random() > 0.5 ? Math.floor(Math.random() * (2 - 0)) : -Math.floor(Math.random() * (2 - 0))),
      altitude: rocketTelemetry.telemetry.altitude + Math.floor(Math.random() * (20 - 0)) + 600,
      latitude: rocketTelemetry.telemetry.latitude + (Math.random() > 0.5 ? Math.floor(Math.random() * (2 - 0)) : -Math.floor(Math.random() * (2 - 0))),
      pressure: rocketTelemetry.telemetry.pressure,
      speed: newSpeed,
      humidity: rocketTelemetry.telemetry.humidity,
      temperature: rocketTelemetry.telemetry.temperature,
      fuel: newFuel,
      missionId: rocketTelemetry.telemetry.missionId,
      rocketId: rocketId,
      angle: rocketTelemetry.telemetry.angle- 0.05,
      staged: true,
    };
    this.logger.log(`Sending telemetry from the hardware of ${rocketId.slice(-3).toUpperCase()}`);
    return rocketTelemetry.telemetry;
  }

  async startSendingTelemetry(latestTelemetry: TelemetryRecordDto) {
    this.logger.log(`Started sending telemetry for the rocket ${latestTelemetry.rocketId.slice(-3).toUpperCase()}`);
    const rocket = {
      rocketId: latestTelemetry.rocketId,
      missionId: latestTelemetry.missionId,
      delivered: false,
      telemetry: latestTelemetry,
      throttle: false,
    };
    rocket.telemetry.fuel = 100;
    this.rockets.push(rocket);
    this.rocketCronJob = new cron.CronJob('*/3 * * * * *', () => {
      this.marsyTelemetryProxyService.sendTelemetryToApi(
        this.retrieveTelemetry(latestTelemetry.rocketId),
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