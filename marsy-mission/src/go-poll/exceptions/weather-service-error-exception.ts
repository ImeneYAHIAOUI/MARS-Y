import { HttpStatus } from '@nestjs/common';

import { ErrorDto } from '../../shared/dto/error.dto';

export class WeatherServiceUnavailableException extends ErrorDto {
  constructor(msg : string) {
    super(
      HttpStatus.SERVICE_UNAVAILABLE,
      'weather marsy service unavailable',
      msg,
    );
  }
}