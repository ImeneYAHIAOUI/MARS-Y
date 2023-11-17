import { Controller, Get,Post,Logger } from '@nestjs/common';
import { BroadcastService } from '../services/broadcast.service';
import {EventDto} from '../dto/event.dto';
import {Event} from '../dto/event.dto';
@Controller()
export class AppController {
  private readonly logger = new Logger(AppController.name);


  constructor(private readonly appService: BroadcastService) {
      //this.appService.launch_events_listener();
}

  @Get()
  getService(): string {
    return this.appService.getService();
  }





}
