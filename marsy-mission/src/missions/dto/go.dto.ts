import { ApiProperty } from '@nestjs/swagger';

export class GoResponseDto {
    @ApiProperty()
    go: boolean;
  }  