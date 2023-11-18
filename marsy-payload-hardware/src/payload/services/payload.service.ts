import { Injectable, Logger } from '@nestjs/common';
import { PayloadTelemetryDto } from '../dto/payload-telemetry.dto';

import { Kafka } from 'kafkajs';
import * as cron from 'cron';

import { ControlDataDto } from '../dto/control-data.dto';
const latitude = 280;
const longitude = 80;
const altitude = 10000;
const angle = 80;

@Injectable()
export class PayloadHardwareService {
  private readonly MAX_CRON_RUNS = 3;
  private cronRunCount = 0;
  private cronBroadCastRunCount = 0;
  private readonly logger: Logger = new Logger(PayloadHardwareService.name);
  private telemetries: PayloadTelemetryDto[] = [];
  private rocketCronJob: any;
  private broadCastCronJob: any;

  private kafka = new Kafka({
    clientId: 'payload',
    brokers: ['kafka-service:9092'],
  });
  constructor() {
    this.hardware();
  }
  async hardware() {
    const consumer = this.kafka.consumer({ groupId: 'payload-hardware-group' });
    await consumer.connect();
    await consumer.subscribe({
      topic: 'events-web-caster',
      fromBeginning: true,
    });
    await consumer.run({
      eachMessage: async ({ message }) => {
        if (
          message.value.toString().includes('the rocket deployed its payload')
        ) {
          this.startSendingTelemetry(
            JSON.parse(message.value.toString()).telemetry,
          );
        }
      },
    });
  }

  async postMessageToKafka(event: any) {
    const producer = this.kafka.producer();
    await producer.connect();
    await producer.send({
      topic: 'topic-mission-events',
      messages: [{ value: JSON.stringify(event) }],
    });
    await producer.disconnect();
  }

  async retrieveTelemetry(missionId: string): Promise<PayloadTelemetryDto> {
    const telemetry = this.telemetries.find((t) => t.missionId === missionId);
    const newTelemetry: PayloadTelemetryDto = {
      missionId,
      timestamp: Date.now(),
      latitude: telemetry.latitude + (Math.random() - 0.5) * 2 * 0.05,
      longitude: telemetry.longitude + (Math.random() - 0.5) * 2 * 0.05,
      altitude: telemetry.altitude + (Math.random() - 0.5) * 2 * 0.5,
      angle: telemetry.angle + (Math.random() - 0.5) * 2,
    };
    this.telemetries.push(newTelemetry);

    // Log the retrieval of telemetry
    this.logger.log(
      `Retrieved telemetry for mission  ${missionId.slice(-3).toUpperCase()}`,
    );

    return telemetry;
  }

  async sendDetailsToBroadcastService(rocketId: string) {
    this.cronBroadCastRunCount = 0;
    this.logger.log(
      `Started sending satellite details of rocket ${rocketId
        .slice(-3)
        .toUpperCase()} to broadcast service`,
    );
    const producer = this.kafka.producer();
    await producer.connect();
    this.broadCastCronJob = new cron.CronJob(
      '*/3 * * * * *',
      async () => {
        try {
          const id = rocketId.slice(-3).toUpperCase();
          const {
            latitude: randomLatitude,
            longitude: randomLongitude,
            speed: randomSpeed,
            direction: randomDirection,
          } = this.orientPayload();
          const satelliteDetails = {
            rocketId: rocketId,
            latitude: randomLatitude,
            longitude: randomLongitude,
            speed: randomSpeed,
            direction: randomDirection,
          };
          let message;
          if (this.cronBroadCastRunCount === 0) {
            message = {
              value: JSON.stringify(satelliteDetails),
              key: 'started',
            };
          } else {
            message = {
              value: JSON.stringify(satelliteDetails),
              key: 'inProgress',
            };
          }
          await producer.send({
            topic: 'broadcast-service',
            messages: [message],
          });

          this.cronBroadCastRunCount++;
          if (this.cronBroadCastRunCount >= this.MAX_CRON_RUNS) {
            const satelliteDetails = {
              rocketId: rocketId,
              latitude: 'undefined',
              longitude: 'undefined',
              speed: 'undefined',
              direction: 'undefined',
            };
            const message = {
              value: JSON.stringify(satelliteDetails),
              key: 'inProgress',
            };
            await producer.send({
              topic: 'broadcast-service',
              messages: [message],
            });
            this.broadCastCronJob.stop();
            await producer.disconnect();
          }
        } catch (error) {
          const id = rocketId.slice(-3).toUpperCase();
          this.logger.error(
            `Error while sending satellite details of rocket with id ${id} to broadcast service:`,
            error,
          );
        }
      },
      null,
      true,
      'America/Los_Angeles',
    );
    this.broadCastCronJob.start();
  }
  async startSendingTelemetry(telemetry: PayloadTelemetryDto): Promise<void> {
    this.logger.log(`Started sending telemetry of delivered payload`);
    this.telemetries.push(telemetry);

    this.rocketCronJob = new cron.CronJob(
      '*/3 * * * * *',
      async () => {
        const payloadTelemetry = await this.retrieveTelemetry(
          telemetry.missionId,
        );
        const message = {
          sender: 'payload-hardware',
          telemetry: payloadTelemetry,
        };
        const producer = this.kafka.producer();
        await producer.connect();
        await producer.send({
          topic: 'telemetry',
          messages: [{ value: JSON.stringify(message) }],
        });
        await producer.disconnect();
        this.cronRunCount++;

        if (this.cronRunCount >= this.MAX_CRON_RUNS) {
          this.rocketCronJob.stop();

          setTimeout(() => {
            this.logger.log(
              'STOPPING SENDING TELEMETRY PAYLOAD - MISSION SUCCESSFUL',
            );
          }, 1000);
        }
      },
      null,
      true,
      'America/Los_Angeles',
    );

    // Log the cron job starting
    this.rocketCronJob.start();
  }

  async delegateControlToPilotService(controlData: ControlDataDto) {
    const id = controlData.rocketId.slice(-3).toUpperCase();
    this.logger.log(
      `Adjusting satellite positioning for rocket with ID ${id
        .slice(-3)
        .toUpperCase()} and transmitting details to broadcast service`,
    );
    try {
      const producer = this.kafka.producer();
      await producer.connect();
      const message = { value: JSON.stringify(controlData), key: 'adjustment' };
      await producer.send({
        topic: 'broadcast-service',
        messages: [message],
      });
      await producer.disconnect();
      this.logger.log(
        `adjustment of satellite of rocket with id ${id
          .slice(-3)
          .toUpperCase()} sent to broadcast service`,
      );
      await this.sendSatelliteDetailsToBroadcastService(
        'inProgress',
        controlData.rocketId,
      );

      await this.sendSatelliteDetailsToBroadcastService(
        'terminated',
        controlData.rocketId,
      );
    } catch (error) {
      const id = controlData.rocketId.slice(-3).toUpperCase();
      this.logger.error(
        `Error while sending satellite details of rocket with id ${id} to broadcast service:`,
        error,
      );
    }
  }

  async sendSatelliteDetailsToBroadcastService(
    keyValue: string,
    rocketId: string,
  ) {
    const id = rocketId.slice(-3).toUpperCase();

    const {
      latitude: randomLatitude,
      longitude: randomLongitude,
      speed: randomSpeed,
      direction: randomDirection,
    } = this.orientPayload();
    const satelliteDetails = {
      rocketId: rocketId,
      latitude: randomLatitude,
      longitude: randomLongitude,
      speed: randomSpeed,
      direction: randomDirection,
    };

    const message = { value: JSON.stringify(satelliteDetails), key: keyValue };
    try {
      const producer = this.kafka.producer();
      await producer.connect();
      await producer.send({
        topic: 'broadcast-service',
        messages: [message],
      });
      this.logger.log(
        `Satellite Details of rocket with id ${id.slice(-3).toUpperCase()} sent to broadcast service`,
      );
      await producer.disconnect();
    } catch (error) {
      this.logger.error(
        `Error while sending satellite details to broadcast service:`,
        error,
      );
    }
  }
  orientPayload() {
    const randomLatitude = Math.random() * (90 - -90) + -90;
    const randomLongitude = Math.random() * (180 - -180) + -180;
    const randomSpeed = Math.random() * (5000 - 1000) + 1000;
    const directions = ['north', 'south', 'east', 'west'];
    const randomDirection =
      directions[Math.floor(Math.random() * directions.length)];
    return {
      latitude: randomLatitude,
      longitude: randomLongitude,
      speed: randomSpeed,
      direction: randomDirection,
    };
  }
}
