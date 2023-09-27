import { Injectable, Logger } from '@nestjs/common';

import { TelemetryRecordDto } from '../dto/telemetry-record.dto';
import { DeliveryDto } from '../dto/delivery.dto';
import { StagingDto } from '../dto/staging.dto';
import * as cron from 'node-cron';
import { MarsyTelemetryProxyService } from './marsy-telemetry-proxy/marsy-telemetry-proxy.service';
import { MarsyMissionProxyService } from './marsy-mission-proxy/marsy-mission-proxy.service';

@Injectable()
export class HardwareService {
  private readonly logger: Logger = new Logger(HardwareService.name);
  private cronJob: cron.ScheduledTask;
  private rockets: {
    rocketId: string;
    missionId: string;
    staged: boolean;
    telemetry: TelemetryRecordDto;
  }[] = [];

  constructor(
    private readonly marsyTelemetryProxyService: MarsyTelemetryProxyService,
    private readonly marssyMissionProxyService: MarsyMissionProxyService,
  ) {}

  async deliverRocket(rocketId: string): Promise<DeliveryDto> {
    this.logger.log(`Delivering rocket ${rocketId}`);
    return {
      _id: rocketId,
      delivered: true,
    };
  }

  async stageRocket(rocketId: string): Promise<StagingDto> {
    this.logger.log(`Staging rocket ${rocketId}`);
    const rocket = this.rockets.find(
      (rocket) => rocket.rocketId === rocketId,
    )[0];
    rocket.staged = rocket.compartmentOnefuel === 0 ? true : false;
    return {
      _id: rocketId,
      staged: rocket.staged,
    };
  }

  async retrieveTelemetry(rocketId: string): Promise<TelemetryRecordDto> {
    this.logger.log(`Retrieving telemetry for the rocket ${rocketId}`);
    const rocketTelemetry = this.rockets.find(
      (rocket) => rocket.rocketId === rocketId,
    )[0];
    rocketTelemetry.telemetry = {
      timestamp: Date.now(),
      longitude: Math.floor(Math.random() * (255 - 0)) + 0,
      altitude: Math.floor(Math.random() * (255 - 0)) + 0,
      latitude: Math.floor(Math.random() * (255 - 0)) + 0,
      pressure: Math.floor(Math.random() * (255 - 0)) + 0,
      speed: Math.floor(Math.random() * (100 - 0)) + 0,
      humidity: Math.floor(Math.random() * (30 - 0)) + 0,
      temperature: Math.floor(Math.random() * (70 - 0)) + 0,
      compartmentOnefuel:
        rocketTelemetry.compartmentOnefuel -
        Math.floor(Math.random() * (10 - 0)) +
        0,
      compartmentTwofuel:
        rocketTelemetry.compartmentOnefuel === 0 && !rocketTelemetry.staged
          ? rocketTelemetry.compartmentTwofuel -
            Math.floor(Math.random() * (10 - 0))
          : 100,
    };
    return rocketTelemetry.telemetry;
  }

  _getInitialeTelemetry(missionId: string): TelemetryRecordDto {
    return {
      missionId: missionId,
      timestamp: Date.now(),
      longitude: Math.floor(Math.random() * (255 - 0)) + 0,
      altitude: Math.floor(Math.random() * (255 - 0)) + 0,
      latitude: Math.floor(Math.random() * (255 - 0)) + 0,
      pressure: 50,
      speed: 100,
      humidity: 30,
      temperature: 70,
      compartmentOnefuel: 100,
      compartmentTwofuel: 100,
    };
  }

  async startSendingTelemetry(rocketId: string) {
    this.logger.log(`Started sending telemetry for the rocket ${rocketId}`);
    const missionId: string = (
      await this.marssyMissionProxyService.getMission(rocketId)
    )._id;
    this.rockets.push({
      rocketId: rocketId,
      missionId: missionId,
      staged: false,
      telemetry: this._getInitialeTelemetry(rocketId),
    });
    this.cronJob = cron.schedule('2 * * * *', async () => {
      this.marsyTelemetryProxyService.sendTelemetryToApi(
        await this.retrieveTelemetry(rocketId),
      );
    });
    this.cronJob.start();
    return true;
  }

  stopSendingTelemetry(rocketId: string): void {
    this.logger.log(`Stopped sending telemetry for the rocket ${rocketId}`);
    this.cronJob.stop();
  }
}
