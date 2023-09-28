import {
  Controller,
  Param,
  Post,
  Logger,
  HttpCode,
} from '@nestjs/common';
import {
  ApiNotFoundResponse,
  ApiParam,
  ApiTags,
} from '@nestjs/swagger';
import { RocketNotFoundException } from '../exceptions/rocket-not-found.exception';

const logger = new Logger('CommandController');

@ApiTags('payload')
@Controller('/payload')
export class PayloadController {
  @ApiParam({ name: 'rocketId' })
  @ApiNotFoundResponse({
    type: RocketNotFoundException,
    description: 'Rocket not found',
  })
  @Post(':rocketId/telemetry')
  @HttpCode(200)
  async receiveTelemetry(@Param() params: { rocketId: string }) {
    logger.log('telemetry received');
  }
}
