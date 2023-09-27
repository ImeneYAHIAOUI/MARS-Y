import { IsNotEmpty } from 'class-validator';

export class TelemetryRecordDto {
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
  speed: number;

  @IsNotEmpty()
  compartmentOnefuel: number;

  @IsNotEmpty()
  compartmentTwofuel: number;

  @IsNotEmpty()
  temperature: number;

  @IsNotEmpty()
  pressure: number;

  @IsNotEmpty()
  humidity: number;
}
