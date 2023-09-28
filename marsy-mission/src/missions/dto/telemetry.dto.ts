import {IsNotEmpty} from 'class-validator';

export class MissionTelemetryDto {
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
  temperature: number;

  @IsNotEmpty()
  pressure: number;
}

