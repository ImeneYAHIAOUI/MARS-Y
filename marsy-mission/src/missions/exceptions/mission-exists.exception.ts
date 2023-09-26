import { HttpStatus } from '@nestjs/common';

import { ErrorDto } from '../../shared/dto/error.dto';

export class MissionExistsException extends ErrorDto {
  constructor(name: string) {
    super(
      HttpStatus.NOT_FOUND,
      'Mission already exists',
      `"Mission with name ${name}" already exists`,
    );
  }
}