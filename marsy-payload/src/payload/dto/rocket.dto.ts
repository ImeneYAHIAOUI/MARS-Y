import { IsMongoId, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';


export class RocketDto {
  @ApiProperty()
  @IsMongoId()
  _id: string;

  @ApiProperty()
  @IsNotEmpty()
  name: string;

  @ApiProperty()
  status: string;
}
