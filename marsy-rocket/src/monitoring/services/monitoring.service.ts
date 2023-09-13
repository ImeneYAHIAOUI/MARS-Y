import { Injectable } from '@nestjs/common';
import { RocketStatusEnum } from '../schemas/rocket-status-enum.schema';

@Injectable()
export class MonitoringService {
  getRocketStatus(rocketId: number = null): RocketStatusEnum {
    return RocketStatusEnum.READY_FOR_LAUNCH;
  }
}
