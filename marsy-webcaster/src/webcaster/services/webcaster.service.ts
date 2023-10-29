import { Injectable, Logger } from '@nestjs/common';
import { EventDto } from '../dto/event.dto';

@Injectable()
export class WebCasterService {
  private readonly logger: Logger = new Logger(WebCasterService.name);

  constructor() {}

  announceEvent(event: EventDto): void {
    this.logger.debug(
      `News from ${event.rocketId.slice(-3).toUpperCase()} ${event.event}`,
    );
  }
}
