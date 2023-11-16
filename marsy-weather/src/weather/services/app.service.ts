import { Injectable } from '@nestjs/common';

@Injectable()
export class AppService {

  getService(): string {
    return 'Welcome to the weather service!';
  }

}
