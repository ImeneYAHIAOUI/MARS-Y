import { Injectable, Logger } from '@nestjs/common';
import { PayloadTelemetryDto } from '../dto/payload-telemetry.dto';
import * as cron from 'cron';
import { Kafka } from 'kafkajs';

const logger = new Logger('PayloadHardwareService');

@Injectable()
export class PayloadHardwareService {
  private readonly MAX_CRON_RUNS = 3;
  private cronRunCount = 0;
  // eslint-disable-next-line @typescript-eslint/no-empty-function
  constructor() {}
  private kafka = new Kafka({
    clientId: 'payload-hardware',
    brokers: ['kafka-service:9092'],
  });
  private readonly logger: Logger = new Logger(PayloadHardwareService.name);
  private telemetries: PayloadTelemetryDto[] = [];
  private rocketCronJob: any;

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
          recipient: 'payload-delivery-telemetry',
          telemetry: payloadTelemetry,
        };
        this.logger.debug('sending telemetry to kafka 3');
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
            logger.log(
              'STOPPING SENDING TELEMETRY PAYLOAD - EVERYTHING AS EXPECTED',
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
    this.logger.log(`Retrieved telemetry for mission ID ${missionId}`);

    return telemetry;
  }
}
