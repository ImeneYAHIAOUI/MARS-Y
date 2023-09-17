import { IsEnum, IsNotEmpty } from 'class-validator';

import { RocketStatus } from '../schemas/rocket-status-enum.schema';

export class UpdateRocketStatusDto {
  @IsNotEmpty()
  @IsEnum(RocketStatus) // Use the IsEnum validator
  status: RocketStatus;
}
