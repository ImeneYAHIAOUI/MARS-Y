import { Injectable } from '@nestjs/common';
import { EventDto } from '../dto/event.dto';
@Injectable()
export class AppService {

  getService(): string {
    return 'Welcome to the client service!';
  }
    announceEvent(event: EventDto): void {
    }

}
