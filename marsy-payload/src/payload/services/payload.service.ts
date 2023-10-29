import { Injectable, Logger } from '@nestjs/common';
import { MarsyLaunchpadProxyService } from './marsy-launchpad-proxy/marsy-launchpad-proxy.service';
import { TelemetryDto } from '../dto/telemetry.dto';
import { PayloadDeliveryDto } from '../dto/payload-delivery.dto';
import { Kafka } from 'kafkajs';

const logger = new Logger('PayloadService');

const latitude = 280;
const longitude = 80;
const altitude = 10000;
const angle = 80;

@Injectable()
export class PayloadService {
  private readonly logger = new Logger(PayloadService.name);

  private kafka = new Kafka({
    clientId: 'payload',
    brokers: ['kafka-service:9092'],
  });
  constructor(
    private readonly marsyLaunchpadProxyService: MarsyLaunchpadProxyService,
  ) {
    this.receiveTelemetryListener();
  }

  async receiveTelemetry(
    rocketId: string,
    telemetry: TelemetryDto,
  ): Promise<PayloadDeliveryDto | void> {
    const rocketCode = rocketId.slice(-3).toUpperCase();
    const rocketInfo = `Rocket ${rocketCode} - altitude: ${
      telemetry.altitude
    } - latitude: ${telemetry.latitude} - longitude: ${
      telemetry.longitude
    } - angle: ${telemetry.angle.toPrecision(2)}`;

    if (
      telemetry.latitude < latitude + 15 &&
      telemetry.latitude > latitude - 15 &&
      telemetry.longitude < longitude + 15 &&
      telemetry.longitude > longitude - 15 &&
      telemetry.altitude > altitude - 150
    ) {
      logger.log(
        `Orbit reached for ${rocketCode} - altitude: ${
          telemetry.altitude
        } - latitude: ${telemetry.latitude} - longitude: ${
          telemetry.longitude
        } - angle: ${telemetry.angle.toPrecision(2)}`,
      );
      const producer = this.kafka.producer();
      try {
        const payload = {
          message: 'DELIVERED',
          rocketId: rocketId,
        };
        await producer.connect();
        await producer.send({
          topic: 'client-service-events',
          messages: [{ value: JSON.stringify(payload) }],
        });
        this.logger.log(
          `Event sent to inform the client service about the payload delivery of rocket ID ${rocketId
            .slice(-3)
            .toUpperCase()}`,
        );
      } finally {
        await producer.disconnect();
      }
      const payloadDelivery =
        await this.marsyLaunchpadProxyService.notifyCommandPadOfOrbitReach(
          rocketId,
        );

      return payloadDelivery;
    }
  }
  receiveTelemetryAfterDelivery(telemetry: TelemetryDto): void | Promise<void> {
    logger.log(
      `Received telemetry after delivery - altitude: ${
        telemetry.altitude
      } - latitude: ${telemetry.latitude} - longitude: ${
        telemetry.longitude
      } - angle: ${telemetry.angle.toPrecision(1)} ** PAYLOAD IN RIGHT ORBIT`,
    );
  }

  async receiveTelemetryListener(): Promise<PayloadDeliveryDto | void> {
    const consumer = this.kafka.consumer({ groupId: 'payload-consumer-group' });
    await consumer.connect();
    await consumer.subscribe({
      topic: 'payload-telemetry',
      fromBeginning: true,
    });
    await consumer.run({
      eachMessage: async ({ message }) => {
        const responseEvent = JSON.parse(message.value.toString());
        if (responseEvent.sender === 'rocket') {
          await this.receiveTelemetry(
            responseEvent.rocketId,
            responseEvent.telemetry,
          );
        }
        if (responseEvent.sender === 'payload-hardware') {
          await this.receiveTelemetryAfterDelivery(responseEvent.telemetry);
        }
      },
    });
  }
}
