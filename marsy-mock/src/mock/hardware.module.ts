import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { HardwareController } from './controllers/hardware.controller';
import { HardwareService } from './services/hardware.service';
import { MarsyTelemetryProxyService } from './services/marsy-telemetry-proxy/marsy-telemetry-proxy.service';
import { MarsyMissionProxyService } from './services/marsy-mission-proxy/marsy-mission-proxy.service';

@Module({
  imports: [HttpModule],
  controllers: [HardwareController],
  providers: [
    HardwareService,
    MarsyTelemetryProxyService,
    MarsyMissionProxyService,
  ],
  exports: [HardwareService],
})
export class HardwareModule {}
