import {IsEnum, IsNotEmpty, IsOptional} from 'class-validator';
import { MissionStatus } from '../schema/mission.status.schema';
import { ApiProperty } from '@nestjs/swagger';

export class AddMissionDto {

  @IsNotEmpty()
  name: string;

  @IsOptional() 
  @ApiProperty()
  @IsEnum(MissionStatus)
  status?: MissionStatus;


  @ApiProperty()
  site: string;

  @ApiProperty()
  rocket: string;
}
