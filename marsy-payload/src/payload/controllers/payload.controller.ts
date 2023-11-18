import {
  Controller,
  Param,
  Post,
  Logger,
  HttpCode,
  Body,
} from '@nestjs/common';
import { ApiNotFoundResponse, ApiParam, ApiTags } from '@nestjs/swagger/dist';
import { RocketNotFoundException } from '../exceptions/rocket-not-found.exception';
import { TelemetryDto } from '../dto/telemetry.dto';
import { PayloadService } from '../services/payload.service';
import { PayloadDeliveryDto } from '../dto/payload-delivery.dto';

@ApiTags('payload')
@Controller('/payload')
export class PayloadController {
  private readonly logger = new Logger('PayloadController');
  constructor(private readonly payloadService: PayloadService) {}

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
    this.logger.log(
      `Received telemetry for rocket ${params.rocketId
        .slice(-3)
        .toUpperCase()}`,
    );
    return await this.payloadService.receiveTelemetry(
      params.rocketId,
      telemetry,
    );
  }

  @ApiParam({ name: 'rocketId' })
  @ApiNotFoundResponse({
    type: RocketNotFoundException,
    description: 'Rocket not found',
  })
  @Post('telemetry/delivery')
  @HttpCode(200)
  async receiveTelemetryAfterDelivery(
    @Body() telemetry: TelemetryDto,
  ): Promise<void> {
    return await this.payloadService.receiveTelemetryAfterDelivery(telemetry);
  }
}
