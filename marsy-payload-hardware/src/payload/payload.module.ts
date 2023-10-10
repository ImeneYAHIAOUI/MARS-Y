import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { PayloadHardwareController } from './controllers/payload.controller';
import { PayloadHardwareService } from './services/payload.service';
import { MarsyTelemetryProxyService } from './services/marsy-telemetry-proxy/marsy-telemetry-proxy.service';


@Module({
  imports: [HttpModule],
  controllers: [PayloadHardwareController],
  providers: [PayloadHardwareService, MarsyTelemetryProxyService],

})
export class PayloadModule {}
