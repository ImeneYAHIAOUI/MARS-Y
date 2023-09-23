import { HttpStatus } from '@nestjs/common';

import { ErrorDto } from '../../shared/dto/error.dto';

export class MissionNotFoundException extends ErrorDto {
  constructor(id: string) {
    super(
      HttpStatus.NOT_FOUND,
      'mission not found',
      `"${id}" is not found`,
    );
  }
}