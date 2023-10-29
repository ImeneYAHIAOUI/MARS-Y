import { Injectable, Logger, Post } from '@nestjs/common';
import { EventDto } from '../dto/event.dto';
import { Kafka, EachMessagePayload } from 'kafkajs';
@Injectable()
export class AppService {
  private readonly logger = new Logger(AppService.name);
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
        eachMessage: async ({ message }: EachMessagePayload) => {
          try {
            const responseEvent = JSON.parse(message.value.toString());
            const id = responseEvent.rocketId
              .toString()
              .slice(-3)
              .toUpperCase();
            if (responseEvent.messageNumber === 0) {
              this.logger.log('start broadcasting');
              this.sendEventToClientService(
                'BROADCASTING STARTED',
                responseEvent.rocketId.toString(),
              );
            }

            this.logger.log(
              `New message received with satellite details of rocket ${id}:`,
            );
            const lat = responseEvent.latitude.toString();
            this.logger.log(`- Latitude: ${lat}`);
            const long = responseEvent.longitude.toString();
            this.logger.log(`- Longitude: ${long}`);
            const speed = responseEvent.speed.toString();
            this.logger.log(`- Speed: ${speed}`);
            const direction = responseEvent.direction.toString();
            this.logger.log(`- Direction: ${direction}`);
            if (responseEvent.messageNumber >= 2) {
              this.sendEventToClientService(
                'BROADCASTING TERMINATED',
                responseEvent.rocketId.toString(),
              );
              this.logger.log('broadcasting terminated');
            }
          } catch (error) {
            this.logger.error(
              'Error processing satellite details of rocket ${id}:',
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
  async sendEventToClientService(responseEvent, rocketId) {
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
