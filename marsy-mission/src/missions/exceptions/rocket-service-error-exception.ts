import { HttpStatus } from '@nestjs/common';

import { ErrorDto } from '../../shared/dto/error.dto';

export class RocketServiceUnavailableException extends ErrorDto {
  constructor(msg : string) {
    super(
      HttpStatus.SERVICE_UNAVAILABLE,
      'rocket marsy service unavailable',
      msg,
    );
  }
}