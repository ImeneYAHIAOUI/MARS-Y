import {
  Controller,
  Param,
  Post,
  Logger,
  HttpCode,
  Body,
} from '@nestjs/common';
import { ApiNotFoundResponse, ApiParam, ApiTags } from '@nestjs/swagger';
import { RocketNotFoundException } from '../exceptions/rocket-not-found.exception';
import { TelemetryDto } from '../dto/telemetry.dto';
import { PayloadService } from '../services/payload.service';
import { PayloadDeliveryDto } from '../dto/payload-delivery.dto';


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
  async receiveTelemetry(
    @Param() params: { rocketId: string },
    @Body() telemetry: TelemetryDto,
  ): Promise<PayloadDeliveryDto | void> {
    this.logger.log(`Received telemetry for rocket ${params.rocketId}`);
    return await this.payloadService.receiveTelemetry(
      params.rocketId,
      telemetry,
    );

  }
}