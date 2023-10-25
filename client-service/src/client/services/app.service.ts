import { Injectable } from '@nestjs/common';
import { EventDto } from '../dto/event.dto';
import { ClientServiceProxy } from './client-service-proxy/client-service-proxy';

@Injectable()
export class AppService {
constructor(private readonly clientServiceProxy: ClientServiceProxy) {
  }

  getService(): string {
    return 'Welcome to the client service!';
  }
    announceEvent(event: EventDto): void {
    this.clientServiceProxy.requestLaunchDetails();
    }

}
