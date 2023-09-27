import { Injectable, Logger } from '@nestjs/common';
import { TelemetryRecord } from '../schemas/telemetry-record.schema';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { TelemetryRecordDto } from '../dto/telemetry-record.dto';
import { MarsyPayloadProxyService } from './marsy-payload-proxy/marsy-payload-proxy.service';
import { MissionTelemetryDto } from '../dto/mission-telemetry.dto';
import { PayloadTelemetryDto } from '../dto/payload-telemetry.dt';
import { MarsyRocketProxyService } from './marsy-rocket-proxy/marsy-rocket-proxy.service';
import { MarsyMissionProxyService } from './marsy-mission-proxy/marsy-mission-proxy.service';
import { MarsyBoosterProxyService } from './marsy-booster-proxy/marsy-booster-proxy.service';
import { ControlTelemetryDto } from '../dto/control-telemetry.dto';
import { BoosterTelemetryDto } from '../dto/booster-telemetry.dto';
import { BoosterTelemetryRecord } from '../schemas/booster-telemetry-record.schema';
import { BoosterTelemetryRecordDto } from '../dto/booster-telemetry-record.dto';

@Injectable()
export class TelemetryService {
  private readonly logger: Logger = new Logger(TelemetryService.name);

  constructor(
    @InjectModel(TelemetryRecord.name)
    private telemetryRecordModel: Model<TelemetryRecord>,
    @InjectModel(BoosterTelemetryRecord.name)
    private boosterTelemetryRecordModel: Model<BoosterTelemetryRecord>,
    private readonly marsyBoosterProxyService: MarsyBoosterProxyService,
    private readonly marsyMissionProxyService: MarsyMissionProxyService,
    private readonly marsyRocketProxyService: MarsyRocketProxyService,
    private readonly marsyPayloadProxyService: MarsyPayloadProxyService,
  ) {}

  async storeTelemetryRecord(
    telemetryRecordDTO: TelemetryRecordDto,
  ): Promise<TelemetryRecord> {
    this.logger.debug(
      `Storing telemetry record for mission ${telemetryRecordDTO.missionId}`,
    );
    const telemetry: TelemetryRecord = await this.telemetryRecordModel.create(
      telemetryRecordDTO,
    );

    const missionTelemetry: MissionTelemetryDto = {
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

    await this.marsyMissionProxyService.sendTelemetry(
      telemetry.rocketId,
      missionTelemetry,
    );

    const payloadTelemetry: PayloadTelemetryDto = {
      missionId: telemetry.missionId,
      timestamp: telemetry.timestamp,
      altitude: telemetry.altitude,
      latitude: telemetry.latitude,
      longitude: telemetry.longitude,
      angle: telemetry.angle,
    };

    await this.marsyPayloadProxyService.sendTelemetry(
      telemetry.rocketId,
      payloadTelemetry,
    );

    if (!telemetry.staged) {
      const controlTelemetry: ControlTelemetryDto = {
        rocketId: telemetry.rocketId,
        fuel: telemetry.fuel,
      };
      await this.marsyRocketProxyService.sendTelemetry(
        telemetry.rocketId,
        controlTelemetry,
      );
    }

    return telemetry;
  }

  async storeBoosterTelemetryRecord(
    boosterTelemetryRecordDto: BoosterTelemetryRecordDto,
  ): Promise<BoosterTelemetryDto> {
    this.logger.debug(
      `Storing booster telemetry record for mission ${boosterTelemetryRecordDto.missionId}`,
    );
    const telemetry: BoosterTelemetryRecord =
      await this.boosterTelemetryRecordModel.create(boosterTelemetryRecordDto);

    const boosterTelemetry: BoosterTelemetryDto = {
      missionId: telemetry.missionId,
      timestamp: telemetry.timestamp,
      latitude: telemetry.latitude,
      longitude: telemetry.longitude,
      altitude: telemetry.altitude,
    };

    await this.marsyBoosterProxyService.sendTelemetry(
      telemetry.rocketId,
      boosterTelemetry,
    );

    return boosterTelemetryRecordDto;
  }

  async fetchRocketTelemetryRecords(
    missionId: string,
  ): Promise<TelemetryRecord[]> {
    this.logger.debug(
      `Fetching telemetry records for the rocket of the mission ${missionId}`,
    );
    return await this.telemetryRecordModel.find({ missionId }).lean();
  }
}
