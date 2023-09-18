import { Controller, Get, Param } from '@nestjs/common';
import { GoPollService } from '../services/go-poll.service';
import { ApiOkResponse, ApiParam, ApiTags } from '@nestjs/swagger';
import { GoResponseDto } from '../dto/go.dto'; // Import your DTO
import { Logger } from '@nestjs/common'; // Import the Logger

const logger = new Logger('GoPollController');

@ApiTags('Go')
@Controller('/go')
export class GoPollController {
  constructor(private readonly goPollService: GoPollService) {}

  @Get('rocket/:rocketId')
  @ApiParam({ name: 'rocketId' })
  @ApiOkResponse({
    type: GoResponseDto,
    description: 'Go or Not poll response',
  })
  async goOrNoGo(@Param('rocketId') rocketId: string): Promise<GoResponseDto> {
    const logger = new Logger('GoPollController'); // Create a logger instance here if needed
    logger.log(`Received request for rocket name: ${rocketId}`);

    const go = await this.goPollService.goOrNoGoPoll(rocketId);
    logger.log(`Response for rocket ID: ${rocketId}, Go: ${go}`);
    return { go };
  }
}
