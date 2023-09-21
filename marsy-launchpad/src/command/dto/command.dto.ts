import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty } from 'class-validator';
import { RocketDto } from '../../rockets/dto/rocket.dto';

export class CommandDto {
  @ApiProperty()
  @IsNotEmpty()
  decision: string;

  @ApiProperty()
  rocket: RocketDto;
}
