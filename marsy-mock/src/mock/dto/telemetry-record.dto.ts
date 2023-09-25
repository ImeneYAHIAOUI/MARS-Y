import {IsNotEmpty} from 'class-validator';

export class TelemetryRecordDto {
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