import {
  Controller,
  Get,
  Param,
  Post,
  Logger,
  HttpCode,
  Body,
} from '@nestjs/common';
import {
  ApiBody,
  ApiCreatedResponse,
  ApiOkResponse,
  ApiTags,ApiOperation, ApiResponse
} from '@nestjs/swagger';



import { DeliveryDto } from '../dto/delivery.dto';
import { TelemetryRecordDto } from '../dto/telemetry-record.dto';
import { GuidanceHardwareService } from '../services/guidance-hardware.service';

@ApiTags('mock-guidance')
@Controller('/mock-guidance')
export class GuidanceHardwareController {
  private readonly logger: Logger = new Logger(GuidanceHardwareController.name);
  constructor(private readonly hardwareService: GuidanceHardwareService) {}
  @ApiOkResponse({
    type: DeliveryDto,
    description: 'The delivery status of the rocket guidance',
  })
  @Post(':idrocket/deliver')
  @HttpCode(200)
  async deliverRocket(@Param('idrocket') id: string): Promise<DeliveryDto> {
    this.logger.log(`Received request to deliver payload on the rocket guidance : ${id}`);
    const deliveryDto = await this.hardwareService.deliverRocket(id);
    this.logger.log('Stopping sending telemetry');
    this.hardwareService.stopSendingTelemetry(id);
    this.logger.log('Start sending payload hardware telemetry')
    this.hardwareService.startSendingPayloadHardwareTelemetry(id);
    return deliveryDto;
  }
  @Get()
    @ApiOperation({ summary: 'Get guidance service information', description: 'Retrieve information about the guidance service.' })
    @ApiResponse({ status: 200, description: 'Successful operation', type: String })
  getHello(): string {
    return this.hardwareService.getHello();
  }
  @Post('launch')
  @ApiOkResponse({
    description: 'Starts sending guidance telemetry data',
  })
  @HttpCode(200)
  async startSendingTelemetry(@Body() launchDto: TelemetryRecordDto): Promise<boolean> {
    //this.logger.log(`Received request to start sending guidance telemetry in stage two`);
    return await this.hardwareService.startSendingTelemetry(launchDto);
  }

}
