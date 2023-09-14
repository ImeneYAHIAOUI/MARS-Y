import { Injectable } from '@nestjs/common';
import { RocketStatus } from '../schemas/rocket-status-enum.schema';
import { Rocket } from '../schemas/rocket.schema';

@Injectable()
export class RocketService {
  rockets = [
    {
      _id: 'rocket-1',
      name: 'rocket 1',
      status: RocketStatus.LOADING_PAYLOAD,
    },
    {
      _id: 'rocket-2',
      name: 'rocket 2',
      status: RocketStatus.READY_FOR_LAUNCH,
    },
    {
      _id: 'rocket-3',
      name: 'rocket 3',
      status: RocketStatus.LANDED,
    },
    {
      _id: 'rocket-4',
      name: 'rocket 4',
      status: RocketStatus.ABORTED,
    },
  ];
  getRocketStatus(rocketId: string = null): RocketStatus {
    const rocket: Rocket = this.findRocketById(rocketId);
    return rocket.status;
  }

  // Function to get a rocket by ID
  findRocketById(id: string): Rocket {
    const rocket: Rocket = this.rockets.find((r) => r._id === id);
    return rocket;
  }
}
