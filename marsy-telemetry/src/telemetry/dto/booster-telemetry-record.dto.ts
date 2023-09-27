import {IsNotEmpty} from 'class-validator';

export class BoosterTelemetryRecordDto {
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
  fuel: number;

  @IsNotEmpty()
  temperature: number;

  @IsNotEmpty()
  pressure: number;

  @IsNotEmpty()
  humidity: number;
}
