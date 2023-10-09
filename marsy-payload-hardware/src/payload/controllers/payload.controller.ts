import {
  Controller,
  Param,
  Post, Get,
  Logger,
  HttpCode,
  Body,
} from '@nestjs/common';
import { ApiNotFoundResponse, ApiParam, ApiTags } from '@nestjs/swagger';
import { RocketNotFoundException } from '../exceptions/rocket-not-found.exception';
import { PayloadHardwareService } from '../services/payload.service';
import { PayloadTelemetryDto } from '../dto/payload-telemetry.dto';


@ApiTags('payload-hardware')
@Controller('/payload-hardware')
export class PayloadHardwareController {
  private readonly logger = new Logger('PayloadHardwareController');
  constructor(private readonly payloadService: PayloadHardwareService) { }

  @Get()
  async getHello(): Promise<string> {
    return 'Hello';
  }
  
  @ApiNotFoundResponse({
    type: RocketNotFoundException,
    description: 'Rocket not found',
  })
  @Post('/launch')
  @HttpCode(200)
  async receiveTelemetry(
    @Body() telemetry: PayloadTelemetryDto,
  ): Promise<void> {
    return await this.payloadService.startSendingTelemetry(
      telemetry,
    );

  }
 
}
