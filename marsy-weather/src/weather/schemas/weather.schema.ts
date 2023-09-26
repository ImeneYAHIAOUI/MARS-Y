import { ApiProperty } from '@nestjs/swagger';

import { WeatherStatus } from './weather-status.enum';

export class Weather {

  @ApiProperty()
  status: WeatherStatus;
}
