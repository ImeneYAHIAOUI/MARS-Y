import { IsBoolean, IsNotEmpty } from 'class-validator';
import { RocketDto } from '../../rockets/dto/rocket.dto';

export class DeliveryResponseDto {
  @IsNotEmpty()
  @IsBoolean()
  delivered: boolean;

  @IsNotEmpty()
  rocket: RocketDto;
}
