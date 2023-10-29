import { Injectable } from '@nestjs/common';
import { EventDto } from '../dto/event.dto';
import { ClientServiceProxy } from './client-service-proxy/client-service-proxy';
import { PilotServiceProxy } from './client-service-proxy/pilot-service-proxy';
@Injectable()
export class AppService {
constructor(private readonly clientServiceProxy: ClientServiceProxy,private readonly pilotServiceProxy :PilotServiceProxy) {
  }

  getService(): string {
    return 'Welcome to the client service!';
  }
    announceEvent(rocketId : string): void {
    this.clientServiceProxy.requestLaunchDetails(rocketId);
    }
    requestPilotService(rocketId : string): void {
      this.pilotServiceProxy.requestPilotDetails(rocketId);
    }

}
