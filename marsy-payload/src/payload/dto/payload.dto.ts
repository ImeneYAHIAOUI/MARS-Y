import { IsBoolean, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class PayloadDto {
  @ApiProperty()
  rocketId: string;

  @ApiProperty()
  content : string;

  @ApiProperty()
  desiredOrbit : OrbitalParameter;

  @ApiProperty()
  delivered : boolean;
}

class OrbitalParameter {
  angle : number;
  altitude : number;
  latitude : number;
  longitude : number;
}