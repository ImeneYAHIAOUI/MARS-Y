import {IsNotEmpty} from 'class-validator';

export class TelemetryRecordDto {
  @IsNotEmpty()
  rocketId: string;

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

  @IsNotEmpty()
  staged: boolean;
}
