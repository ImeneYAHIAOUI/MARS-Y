import {
  Injectable, Logger,
} from '@nestjs/common';
import { TelemetryRecord } from '../schemas/telemetry-record.schema';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { TelemetryRecordDto } from '../dto/telemetry-record.dto';

@Injectable()
export class TelemetryService {
  private readonly logger : Logger = new Logger(TelemetryService.name);

  constructor(
    @InjectModel(TelemetryRecord.name) private telemetryRecordModel : Model<TelemetryRecord>
  ) {}

  async storeTelemetryRecord(telemetryRecordDTO: TelemetryRecordDto): Promise<TelemetryRecord> {
    this.logger.debug(`Storing telemetry record for mission ${telemetryRecordDTO.missionId}`);
    return await this.telemetryRecordModel.create(telemetryRecordDTO);
  }

  async fetchRocketTelemetryRecords(missionId: string): Promise<TelemetryRecord[]> {
    this.logger.debug(`Fetching telemetry records for the rocket of the mission ${missionId}`);
    return await this.telemetryRecordModel.find({ missionId }).lean();
  }

}
