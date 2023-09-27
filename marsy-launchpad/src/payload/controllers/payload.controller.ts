import {
  Body,
  Controller,
  Get,
  Query,
  Post,
  Logger,
  HttpCode,
  Param,
} from '@nestjs/common';
import {
  ApiBody,
  ApiCreatedResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiParam,
  ApiTags,
} from '@nestjs/swagger';

import { PayloadService } from '../services/payload.service';
import { DeliveryDto } from '../dto/delivery.dto';
import { RocketStatus } from '../../rockets/schemas/rocket-status-enum.schema';
import { StageRocketMidFlightDto } from '../../command/dto/stage-rocket-mid-flight.dto';
import { RocketNameNotFoundException } from '../../rockets/exceptions/rocket-name-not-found.exception';
import { DeliveryResponseDto } from '../dto/delivery-response.dto';

@ApiTags('rockets')
@Controller('/rockets')
export class PayloadController {
  private readonly logger: Logger = new Logger(PayloadController.name);

  constructor(private readonly payloadService: PayloadService) {}

  @ApiParam({ name: 'rocketId' })
  @ApiCreatedResponse({
    type: DeliveryResponseDto,
    description: 'payload delivery command',
  })
  @ApiNotFoundResponse({
    type: RocketNameNotFoundException,
    description: 'Rocket not found',
  })
  @Post(':rocketId/payload-delivery')
  @HttpCode(200)
  async deliverPayload(
    @Param() params: { rocketId: string },
  ): Promise<DeliveryResponseDto> {
    try {
      const rocketId = params.rocketId;
      this.logger.log(
        `Received request to deliver payload rocket with id ${rocketId}`,
      );
      const stage = await this.payloadService.sendPayloadDeliveryCommand(
        rocketId,
      );
      this.logger.log(`${stage}`);
      this.logger.log(`Successfully delivered payload for rocket: ${rocketId}`);
      return stage;
    } catch (error) {
      this.logger.error(`Error while delivering payload : ${error.message}`);
      throw error;
    }
  }
}
