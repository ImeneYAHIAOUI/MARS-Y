import { IsMongoId, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

import { Rocket } from '../schemas/rocket.schema';
import { RocketStatus } from '../schemas/rocket-status-enum.schema';

export class RocketDto {
  @ApiProperty()
  @IsMongoId()
  _id: string;

  @ApiProperty()
  @IsNotEmpty()
  name: string;

  @ApiProperty()
  status: RocketStatus;

  static RocketDtoFactory(rocket: Rocket): RocketDto {
    const rocketDto: RocketDto = new RocketDto();
    rocketDto._id = rocket._id;
    rocketDto.name = rocket.name;
    rocketDto.status = rocket.status;

    return rocketDto;
  }
}
