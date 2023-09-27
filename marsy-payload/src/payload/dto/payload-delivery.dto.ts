import { IsBoolean, IsNotEmpty } from 'class-validator';
import { RocketDto } from './rocket.dto';

export class PayloadDeliveryDto {
  @IsNotEmpty()
  @IsBoolean()
  delivered: boolean;

  @IsNotEmpty()
  rocket: RocketDto;
}
