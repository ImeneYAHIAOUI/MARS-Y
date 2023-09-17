import { HttpStatus } from '@nestjs/common';

import { ErrorDto } from '../../shared/dto/error.dto';

export class RocketNotFoundException extends ErrorDto {
  constructor(status: HttpStatus ,rocketName: string) {
    super(status, 'Rocket name not found', `"${rocketName}" is not a valid rocket name`);
  }
}