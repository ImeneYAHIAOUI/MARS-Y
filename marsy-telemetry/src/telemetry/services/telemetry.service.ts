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
import * as Constants from '../schemas/constants';

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
  async publishTelemetry(telemetry: TelemetryRecordDto): Promise<void> {
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
      telemetry: missionTelemetry,
      rocketId: telemetry.rocketId,
      destroyRocket: this.evaluateRocketDestruction(telemetry),
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
      telemetry: payloadTelemetry,
      rocketId: telemetry.rocketId,
      sender: 'rocket',
    };
    const controlTelemetry = {
      rocketId: telemetry.rocketId,
      fuel: telemetry.fuel,
      altitude: telemetry.altitude,
    };
    const controlMessage = {
      telemetry: controlTelemetry,
      rocketId: telemetry.rocketId,
    };
    await this.sendTelemetryToKafka('controlpad-telemetry', controlMessage);
    await this.sendTelemetryToKafka('payload-telemetry', payloadMessage);
    await this.sendTelemetryToKafka('mission-telemetry', missionMessage);
  }

  async publishBoosterTelemetry(
    telemetry: BoosterTelemetryRecordDto,
    rocketId: string,
  ): Promise<void> {
    const boosterTelemetry = {
      missionId: telemetry.missionId,
      timestamp: telemetry.timestamp,
      latitude: telemetry.latitude,
      longitude: telemetry.longitude,
      altitude: telemetry.altitude,
    };
    const message = {
      telemetry: boosterTelemetry,
      rocketId: rocketId,
    };
    await this.sendTelemetryToKafka('booster-telemetry', message);
  }

  async publishPayloadTelemetry(
    telemetry: PayloadTelemetryDto,
    rocketId: string,
  ): Promise<void> {
    const message = {
      telemetry: telemetry,
      rocketId: rocketId,
      sender: 'payload-hardware',
    };
    await this.sendTelemetryToKafka('payload-telemetry', message);
  }

  evaluateRocketDestruction(telemetryRecord: TelemetryRecordDto): {
    destroy: boolean;
    reason?: string;
  } {
    const rocketId = telemetryRecord.rocketId;
    this.logger.log(
      `Evaluating telemetry for rocket: ${rocketId.slice(-3).toUpperCase()}`,
    );

    const { altitude, speed, temperature, pressure, angle } = telemetryRecord;

    if (angle > Constants.MAX_ANGLE || angle < Constants.MIN_ANGLE) {
      this.logger.log(
        `Angle exceeded for rocket ${rocketId
          .slice(-3)
          .toUpperCase()}. Angle: ${angle}`,
      );
      return { destroy: true, reason: 'Angle exceeded' };
    }

    if (altitude > Constants.MAX_ALTITUDE || speed > Constants.MAX_SPEED) {
      this.logger.log(
        `Critical telemetry exceeded for rocket ${rocketId
          .slice(-3)
          .toUpperCase()}. Altitude: ${altitude}, Speed: ${speed}`,
      );
      return { destroy: true, reason: 'Critical telemetry exceeded' };
    }

    if (
      temperature > Constants.MAX_TEMPERATURE ||
      pressure > Constants.MAX_PRESSURE
    ) {
      this.logger.log(
        `Environmental conditions exceeded for rocket ${rocketId
          .slice(-3)
          .toUpperCase()}. Temperature: ${temperature}, Pressure: ${pressure}`,
      );
      return { destroy: true, reason: 'Environmental conditions exceeded' };
    }

    this.logger.log(
      `Telemetry for rocket ${rocketId
        .slice(-3)
        .toUpperCase()} is within safe parameters. No need for destruction.`,
    );
    return { destroy: false };
  }

  async sendTelemetryToKafka(topic: string, message: any) {
    const producer = this.kafka.producer();
    await producer.connect();
    await producer.send({
      topic: topic,
      messages: [{ value: JSON.stringify(message) }],
    });
    await producer.disconnect();
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
        const sender = JSON.parse(message.value.toString()).sender;
        if (sender === 'booster') {
          const rocketId = JSON.parse(message.value.toString()).rocketId;
          this.logger.log(
            `Retrieving telemetry from the booster of the staged rocket (us 10)`,
          );
          await this.storeBoosterTelemetryRecord(telemetry, rocketId);
          await this.publishBoosterTelemetry(telemetry, rocketId);
        }
        if (sender === 'payload-hardware') {
          const rocketId = JSON.parse(message.value.toString()).rocketId;
          this.logger.log(
            `Retrieving telemetry from the payload of the staged rocket (us 11)`,
          );
          await this.storePayLoadTelemetry(telemetry);
          await this.publishPayloadTelemetry(telemetry, rocketId);
        }
        if (sender === 'rocket') {
          await this.publishTelemetry(telemetry);
          await this.storeTelemetryRecord(telemetry);
        }
      },
    });
  }
}
