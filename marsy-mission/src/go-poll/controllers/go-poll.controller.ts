import { Controller, Get, Param } from '@nestjs/common';
import { GoPollService } from '../services/go-poll.service';
import { ApiOkResponse, ApiParam, ApiTags } from '@nestjs/swagger';

@ApiTags('Go')
@Controller('/go')
export class GoPollController {
  constructor(private readonly goPollService: GoPollService) {}

  @Get('rocket/:rocketId') 
  @ApiParam({ name: 'rocketId' })
  @ApiOkResponse({ type: Boolean, description: 'Go or Not poll boolean response' })
  goOrNoGo(@Param('rocketId') rocketId: string): Promise<boolean> {
    return this.goPollService.goOrNoGoPoll(rocketId);
  }
}

