import { Controller, Get, Param } from '@nestjs/common';
import { GoPollService } from '../services/go-poll.service';
import { ApiOkResponse, ApiParam, ApiTags } from '@nestjs/swagger';
import { GoResponseDto } from '../dto/go.dto';; // Import your DTO

@ApiTags('Go')
@Controller('/go')
export class GoPollController {
  constructor(private readonly goPollService: GoPollService) {}

  @Get('rocket/:rocketId') 
  @ApiParam({ name: 'rocketId' })
  @ApiOkResponse({ type: GoResponseDto, description: 'Go or Not poll response' }) // Use your DTO here
  async goOrNoGo(@Param('rocketId') rocketId: string): Promise<GoResponseDto> {
    const go = await this.goPollService.goOrNoGoPoll(rocketId);
    return { go };
  }
}
