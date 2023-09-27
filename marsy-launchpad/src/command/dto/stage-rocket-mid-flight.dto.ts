import { RocketDto } from '../../rockets/dto/rocket.dto';
import { IsBoolean, IsNotEmpty } from 'class-validator';

export class StageRocketMidFlightDto {
  @IsNotEmpty()
  @IsBoolean()
  midStageSeparationSuccess: boolean;

  @IsNotEmpty()
  rocket: RocketDto;
}
