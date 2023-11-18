import { Injectable, Logger } from '@nestjs/common';
import { BoosterTelemetryDto } from '../dtos/booster.telemetry.dto';
import { HardwareProxyService } from './proxies/hardware-proxy.service';
import { MarsyMissionProxyService } from './proxies/mission-proxy.service';
import { MissionBoosterDto } from '../dtos/mission.booster.dto';
import { Kafka } from 'kafkajs';

const logger = new Logger('BoosterControlService');

const altitudeThreshold = 600;

@Injectable()
export class BoosterService {
  constructor(
    private readonly hardwareProxyService: HardwareProxyService,
    private readonly missionProxyService: MarsyMissionProxyService,
  ) {
    this.receiveTelemetryListener();
  }

  private kafka = new Kafka({
    clientId: 'booster',
    brokers: ['kafka-service:9092'],
  });

  receiveBoosterData(
    boosterTelemetryDto: BoosterTelemetryDto,
    rocketId: string,
  ) {
    try {
      if (
        boosterTelemetryDto.altitude < altitudeThreshold &&
        boosterTelemetryDto.altitude > 300
      ) {
        logger.log(
          `Booster has reached the altitude to initiate landing - Altitude: ${boosterTelemetryDto.altitude} meters. (us 9)`,
        );
        const result = this.hardwareProxyService.callHardwareToLand(rocketId);

        if (result) {
          const missionBoosterDto = new MissionBoosterDto();
          missionBoosterDto._id = boosterTelemetryDto.missionId;
          missionBoosterDto.boosterStatus = 'IS_LANDING';

          const res = this.missionProxyService.updateMission(missionBoosterDto);
          if (res) {
            logger.log(
              `Booster is landing for mission ${missionBoosterDto._id.slice(-3).toUpperCase()} at latitude ${boosterTelemetryDto.latitude} and longitude ${boosterTelemetryDto.longitude}.`,
            );
          }
        }
      }

      if (boosterTelemetryDto.altitude < 300) {
        const missionBoosterDto = new MissionBoosterDto();
        missionBoosterDto._id = boosterTelemetryDto.missionId;
        missionBoosterDto.boosterStatus = 'LANDED';

        this.missionProxyService.updateMission(missionBoosterDto);
        logger.log(
          `Booster has landed successfully for mission ${missionBoosterDto._id
            .slice(-3)
            .toUpperCase()} at latitude ${
            boosterTelemetryDto.latitude
          } and longitude ${boosterTelemetryDto.longitude}.`,
        );
      }
    } catch (e) {
      logger.error(`Error while handling booster telemetry data: ${e.message}`);
    }

    return 'Booster telemetry received!';
  }
  async receiveTelemetryListener(): Promise<void> {
    const consumer = this.kafka.consumer({ groupId: 'booster-consumer-group' });
    await consumer.connect();
    await consumer.subscribe({
      topic: 'booster-telemetry',
      fromBeginning: true,
    });
    await consumer.run({
      eachMessage: async ({ message }) => {
        const responseEvent = JSON.parse(message.value.toString());
        this.receiveBoosterData(
          responseEvent.telemetry,
          responseEvent.rocketId,
        );
      },
    });
  }
}
