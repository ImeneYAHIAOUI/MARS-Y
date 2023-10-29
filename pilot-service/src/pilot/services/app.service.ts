import { Injectable,Logger } from '@nestjs/common';
import { EventDto } from '../dto/event.dto';
import { PayloadHardwareServiceProxy } from './client-service-proxy/payload-hardware-service-proxy';
import * as cron from 'cron';
import {ControlDataDto} from '../dto/control-data.dto';

@Injectable()
export class AppService {

  private readonly MAX_CRON_RUNS = 3;
  private cronBroadCastRunCount = 0;
    private broadCastCronJob: any;
  private readonly logger: Logger = new Logger(AppService.name);

constructor(private readonly clientServiceProxy: PayloadHardwareServiceProxy) {
  }

  getService(): string {
    return 'Welcome to the pilot service!';
  }
    reorientPayload(rocketId : string): void {

                    try {
                       const id = rocketId.slice(-3).toUpperCase();
                       const randomLatitude = Math.random() * (90 - (-90)) + (-90);
                       const randomLongitude = Math.random() * (180 - (-180)) + (-180);
                       const randomSpeed = Math.random() * (5000 - 1000) + 1000;
                       const directions = ['north', 'south', 'east', 'west'];
                       const randomDirection = directions[Math.floor(Math.random() * directions.length)];
                       const controlData = new ControlDataDto();
                        controlData.rocketId = rocketId;
                        controlData.latitude = randomLatitude;
                        controlData.longitude = randomLongitude;
                        controlData.speed = randomSpeed;
                        controlData.direction = randomDirection;
                       this.clientServiceProxy.reorientPayload( controlData);

                    } catch (error) {
                       const id = rocketId.slice(-3).toUpperCase();
                       //this.logger.error(`Error while sending satellite details of rocket with id ${id} to broadcast service:`, error);
                    }

    }

}
