import { HttpStatus } from '@nestjs/common';

import { ErrorDto } from '../../shared/dto/error.dto';

export class RocketAlreadyExistsException extends ErrorDto {
  constructor(rocketName: string) {
    super(
      HttpStatus.CONFLICT,
      'rocket name already exists',
      `"${rocketName}" is already used`,
    );
  }
}
