import {IsNotEmpty} from 'class-validator';

export class ControlTelemetryDto {
  @IsNotEmpty()
  rocketId: string;

  @IsNotEmpty()
  fuel: number;

  @IsNotEmpty()
  altitude: number;
}
