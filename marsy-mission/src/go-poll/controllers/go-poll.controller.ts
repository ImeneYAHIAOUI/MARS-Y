import { Controller, Get, Param, Query, Logger } from '@nestjs/common';
import { GoPollService } from '../services/go-poll.service';
import { ApiOkResponse, ApiParam, ApiTags, ApiQuery } from '@nestjs/swagger';
import { GoResponseDto } from '../dto/go.dto'; // Import your DTO

const logger = new Logger('GoPollController');

@ApiTags('Go')
@Controller('/go')
export class GoPollController {
  constructor(private readonly goPollService: GoPollService) {}

  @Get('rockets')
  @ApiQuery({ name: 'name', required: true })
  @ApiOkResponse({
    type: GoResponseDto,
    description: 'Go or Not poll response',
  })
  async goOrNoGo(@Query('name') rocketName: string): Promise<GoResponseDto> {
    logger.log(`Received request for rocket name: ${rocketName}`);

    const go = await this.goPollService.goOrNoGoPoll(rocketName);
    logger.log(`Response for rocket name: ${rocketName}, Go: ${go}`);
    return { go };
  }
}
