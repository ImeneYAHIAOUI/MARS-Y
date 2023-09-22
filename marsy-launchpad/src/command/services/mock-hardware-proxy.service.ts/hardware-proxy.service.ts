import { Injectable, Logger } from '@nestjs/common';

const logger = new Logger('MarsyMissionProxyService');

@Injectable()
export class HardwareProxyService {
  async stageMidFlightFlight(_rocketId: string): Promise<boolean> {
    //randomly return true or false 70/30 chance
    return Math.random() < 0.7;
  }
}
