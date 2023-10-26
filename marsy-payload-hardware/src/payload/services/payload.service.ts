import { Injectable, Logger } from '@nestjs/common';
import { PayloadTelemetryDto } from '../dto/payload-telemetry.dto';
import * as cron from 'cron';
import { Kafka } from 'kafkajs';

const logger = new Logger('PayloadHardwareService');

@Injectable()
export class PayloadHardwareService {
  private readonly MAX_CRON_RUNS = 3;
  private cronRunCount = 0;
    private cronBroadCastRunCount = 0;
  // eslint-disable-next-line @typescript-eslint/no-empty-function
  constructor() {
    this.hardware();
  }
  private kafka = new Kafka({
    clientId: 'payload-hardware',
    brokers: ['kafka-service:9092'],
  });

  async hardware() {
    const consumer = this.kafka.consumer({ groupId: 'payload-hardware-group' });
    await consumer.connect();
    await consumer.subscribe({
      topic: 'events-web-caster',
      fromBeginning: true,
    });
    await consumer.run({
      eachMessage: async ({ topic, partition, message }) => {
        if(message.value.toString().includes('the rocket deployed its payload')) {
          this.startSendingTelemetry(JSON.parse(message.value.toString()).telemetry);
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


  private readonly logger: Logger = new Logger(PayloadHardwareService.name);
  private telemetries: PayloadTelemetryDto[] = [];
  private rocketCronJob: any;
  private broadCastCronJob: any;

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
async sendDetailsToBroadcastService(rocketId: string) {
    this.cronBroadCastRunCount= 0;
   this.logger.log(`Started sending satellite details of rocket with id ${rocketId.slice(-3).toUpperCase()} to broadcast service`);
   const producer = this.kafka.producer();
    await producer.connect();
    this.broadCastCronJob = new cron.CronJob(
         '*/3 * * * * *',
         async () => {
            try {
               const id = rocketId.slice(-3).toUpperCase();
               const randomLatitude = Math.random() * (90 - (-90)) + (-90);
               const randomLongitude = Math.random() * (180 - (-180)) + (-180);
               const randomSpeed = Math.random() * (5000 - 1000) + 1000;
               const directions = ['north', 'south', 'east', 'west'];
               const randomDirection = directions[Math.floor(Math.random() * directions.length)];
               const satelliteDetails = {
                  messageNumber: this.cronBroadCastRunCount,
                  rocketId: rocketId,
                  latitude: randomLatitude,
                  longitude: randomLongitude,
                  speed: randomSpeed,
                  direction: randomDirection,
               };
               const message = {
                  value: JSON.stringify(satelliteDetails)
               };

               await producer.send({
                  topic: 'broadcast-service',
                  messages: [message]
               });

               this.logger.log(`Satellite Details of rocket with id ${id} sent to broadcast service`);
                this.cronBroadCastRunCount++;
               if (this.cronBroadCastRunCount >= this.MAX_CRON_RUNS) {
                this.broadCastCronJob.stop();
                 await producer.disconnect();
                  setTimeout(async () => {
                     this.logger.log(
                        `Satellite stopped of rocket with id ${id}`,
                     );
                  }, 1000);
               }

            } catch (error) {
               const id = rocketId.slice(-3).toUpperCase();
               this.logger.error(`Error while sending satellite details of rocket with id ${id} to broadcast service:`, error);
            }
         },
         null,
         true,
         'America/Los_Angeles'
      );
      this.broadCastCronJob.start();
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
