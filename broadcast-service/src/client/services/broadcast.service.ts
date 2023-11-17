import { Injectable, Logger } from '@nestjs/common';
import { Kafka, EachMessagePayload } from 'kafkajs';

@Injectable()
export class BroadcastService {
  private readonly logger = new Logger(BroadcastService.name);
  private kafka = new Kafka({
    clientId: 'broadcast',
    brokers: ['kafka-service:9092'],
  });

  constructor() {
    this.launch_events_listener();
  }

  getService(): string {
    return 'Welcome to the broadcast service!';
  }

  async launch_events_listener() {
    const consumer = this.kafka.consumer({ groupId: 'broadcast-group' });

    try {
      await consumer.connect();
      await consumer.subscribe({
        topic: 'broadcast-service',
        fromBeginning: true,
      });

      await consumer.run({
        eachMessage: async ({
          topic,
          partition,
          message,
        }: EachMessagePayload) => {
          try {
            const responseEvent = JSON.parse(message.value.toString());
            const id = responseEvent.rocketId
              .toString()
              .slice(-3)
              .toUpperCase();

            if (message?.key.toString() === 'started') {
              this.logger.log('start broadcasting');
              this.sendEventToClientService(
                'BROADCASTING STARTED',
                responseEvent.rocketId.toString(),
              );
            }

            if (message?.key.toString() === 'adjustment') {
              this.logger.log(`broadcasting resumed of rocket  ${id}:`);
              this.sendEventToClientService(
                'BROADCASTING RESUMED',
                responseEvent.rocketId.toString(),
              );
            }

            this.logger.log(
              `New message received with satellite details of rocket ${id} (us 19)`,
            );

            const lat = responseEvent.latitude.toString();
            this.logger.log(`- Latitude: ${lat}`);
            const long = responseEvent.longitude.toString();
            this.logger.log(`- Longitude: ${long}`);
            const speed = responseEvent.speed.toString();
            this.logger.log(`- Speed: ${speed}`);
            const direction = responseEvent.direction.toString();
            this.logger.log(`- Direction: ${direction}`);

            if (
              lat === 'undefined' ||
              long === 'undefined' ||
              speed === 'undefined' ||
              direction === 'undefined'
            ) {
              this.logger.log('broadcasting disturbed');
              this.sendEventToClientService(
                'BROADCASTING DISTURBED',
                responseEvent.rocketId.toString(),
              );
            }

            if (message?.key.toString() === 'terminated') {
              this.sendEventToClientService(
                'BROADCASTING TERMINATED',
                responseEvent.rocketId.toString(),
              );
              this.logger.log('broadcasting terminated');
            }
          } catch (error) {
            const id = JSON.parse(message.value.toString())
              .rocketId.toString()
              .slice(-3)
              .toUpperCase();
            this.logger.error(
              `Error processing satellite details of rocket ${id}:`,
              error,
            );
          }
        },
      });
    } catch (error) {
      this.logger.error('Error connecting to Kafka:', error);
      await consumer.disconnect();
    }
  }

  async sendEventToClientService(responseEvent: any, rocketId: string) {
    const producer = this.kafka.producer();

    try {
      const payload = {
        message: responseEvent,
        rocketId: rocketId,
      };

      await producer.connect();
      await producer.send({
        topic: 'client-service-events',
        messages: [{ value: JSON.stringify(payload) }],
      });
    } finally {
      await producer.disconnect();
    }
  }
}
