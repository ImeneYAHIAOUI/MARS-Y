import { ApiProperty } from '@nestjs/swagger';

import { RocketStatus } from './rocket-status-enum.schema';

export class Rocket {
  @ApiProperty()
  _id: string;

  @ApiProperty()
  name: string;

  @ApiProperty()
  status: RocketStatus;
}
