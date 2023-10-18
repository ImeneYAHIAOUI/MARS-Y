import { Injectable, Logger } from '@nestjs/common';
import { TelemetryRecord } from '../schemas/telemetry-record.schema';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { TelemetryRecordDto } from '../dto/telemetry-record.dto';
import { PayloadTelemetryDto } from '../dto/payload-telemetry.dt';
import { BoosterTelemetryRecord } from '../schemas/booster-telemetry-record.schema';
import { BoosterTelemetryRecordDto } from '../dto/booster-telemetry-record.dto';
import { PayloadTelemetry } from '../schemas/payload-telemetry.schema';
import { Kafka } from 'kafkajs';

@Injectable()
export class TelemetryService {
  private readonly logger: Logger = new Logger(TelemetryService.name);

  constructor(
    @InjectModel(TelemetryRecord.name)
    private telemetryRecordModel: Model<TelemetryRecord>,
    @InjectModel(BoosterTelemetryRecord.name)
    private boosterTelemetryRecordModel: Model<BoosterTelemetryRecord>,
    @InjectModel(PayloadTelemetry.name)
    private payloadTelemetryModel: Model<PayloadTelemetry>,
  ) {
    this.receiveTelemetryListener();
  }

  private kafka = new Kafka({
    clientId: 'telemetry',
    brokers: ['kafka-service:9092'],
  });

  async storePayLoadTelemetry(telemetryRecordDto: PayloadTelemetryDto) {
    await this.payloadTelemetryModel.create(telemetryRecordDto);
  }
  async storeTelemetryRecord(
    telemetryRecordDTO: TelemetryRecordDto,
  ): Promise<TelemetryRecord> {
    // this.logger.log(
    //   `Storing rocket telemetry received for mission ${telemetryRecordDTO.missionId.slice(-3).toUpperCase()}`,
    // );
    return await this.telemetryRecordModel.create(telemetryRecordDTO);
  }

  async storeBoosterTelemetryRecord(
    boosterTelemetryRecordDto: BoosterTelemetryRecordDto,
    id: string,
  ): Promise<BoosterTelemetryRecordDto> {
    // this.logger.log(
    //   `Storing booster telemetry record for mission ${boosterTelemetryRecordDto.missionId.slice(-3).toUpperCase()}`,
    // );
    await this.boosterTelemetryRecordModel.create({
      ...boosterTelemetryRecordDto,
      rocketId: id,
    });

    return boosterTelemetryRecordDto;
  }

  async fetchRocketTelemetryRecords(
    missionId: string,
  ): Promise<TelemetryRecord[]> {
    // this.logger.debug(
    //   `Fetching telemetry records for the rocket of the mission ${missionId.slice(-3).toUpperCase()}`,
    // );
    return this.telemetryRecordModel.find({ missionId }).lean();
  }

  async receiveTelemetryListener(): Promise<void> {
    const consumer = this.kafka.consumer({
      groupId: 'telemetry-consumer-group',
    });
    await consumer.connect();
    await consumer.subscribe({
      topic: 'telemetry',
      fromBeginning: true,
    });
    await consumer.run({
      eachMessage: async ({ message }) => {
        const telemetry = JSON.parse(message.value.toString()).telemetry;
        const recipient = JSON.parse(message.value.toString()).recipient;
        if (recipient === 'booster-telemetry-storage') {
          const rocketId = JSON.parse(message.value.toString()).rocketId;
          await this.storeBoosterTelemetryRecord(telemetry, rocketId);
        }
        if (recipient === 'payload-delivery-telemetry') {
          await this.storePayLoadTelemetry(telemetry);
        }
        if (recipient === 'telemetry-storage') {
          await this.storeTelemetryRecord(telemetry);
        }
      },
    });
  }
}
