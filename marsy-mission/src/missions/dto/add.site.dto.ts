import {IsEnum, IsNotEmpty, IsOptional} from 'class-validator';

export class AddSiteDto {
  @IsNotEmpty()
  name: string;

  latitude: number;
  longitude: number;
  altitude: number;
}
