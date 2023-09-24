import { HttpStatus } from '@nestjs/common';

import { ErrorDto } from '../../shared/dto/error.dto';

export class SiteExistsException extends ErrorDto {
  constructor(name: string) {
    super(
      HttpStatus.NOT_FOUND,
      'Site already exists',
      `"site with name ${name}" already exists`,
    );
  }
}