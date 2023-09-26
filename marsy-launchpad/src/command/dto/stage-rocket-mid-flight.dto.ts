import { RocketDto } from '../../rockets/dto/rocket.dto';
import { IsBoolean, IsEnum, IsNotEmpty } from 'class-validator';
import { RocketStatus } from '../../rockets/schemas/rocket-status-enum.schema';

export class StageRocketMidFlightDto {
  @IsNotEmpty()
  @IsBoolean()
  midStageSeparationSuccess: boolean;

  @IsNotEmpty()
  @IsEnum(RocketStatus) // Use the IsEnum validator
  rocket: RocketDto;
}
