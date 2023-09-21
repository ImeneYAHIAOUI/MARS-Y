import { HttpStatus } from '@nestjs/common';

import { ErrorDto } from '../../shared/dto/error.dto';

export class RocketNameNotFoundException extends ErrorDto {
  constructor(rocketName: string) {
    super(
      HttpStatus.NOT_FOUND,
      'rocket not found',
      `"${rocketName}" is not a valid rocket name`,
    );
  }
}
