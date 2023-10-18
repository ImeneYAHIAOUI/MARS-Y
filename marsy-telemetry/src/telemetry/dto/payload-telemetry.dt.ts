import { IsNotEmpty } from 'class-validator';

export class PayloadTelemetryDto {
  @IsNotEmpty()
  missionId: string;

  @IsNotEmpty()
  timestamp: number;

  @IsNotEmpty()
  latitude: number;

  @IsNotEmpty()
  longitude: number;

  @IsNotEmpty()
  altitude: number;

  @IsNotEmpty()
  angle: number;
}
