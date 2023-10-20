import { Injectable, Logger,Post } from '@nestjs/common';
import { ClientServiceProxy } from './client-service-proxy/client-service-proxy';
import { EventDto } from '../dto/event.dto';
@Injectable()
export class AppService {
  private readonly logger = new Logger(AppService.name);

  constructor(private readonly clientServiceProxy: ClientServiceProxy) {}

  getService(): string {
    return 'Welcome to the broadcast service!';
  }

  requestLaunchDetails(event: EventDto): void {
    try {
      this.logger.log(`Requesting launch details for`);
      this.clientServiceProxy.requestLaunchDetails();
    } catch (error) {
      this.logger.error(`Error requesting launch details: ${error.message}`);
    }
  }
}

