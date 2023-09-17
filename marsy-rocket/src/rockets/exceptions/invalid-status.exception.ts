import { HttpStatus } from '@nestjs/common';

import { ErrorDto } from '../../shared/dto/error.dto';

export class InvalidStatusException extends ErrorDto {
  constructor(status: string) {
    super(HttpStatus.BAD_REQUEST, `"${status}" is not valid`);
  }
}
