import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { GuidanceHardwareController } from './controllers/guidance-hardware.controller';
import { GuidanceHardwareService } from './services/guidance-hardware.service';
import { MarsyMissionProxyService } from './services/marsy-mission-proxy/marsy-mission-proxy.service';
import { MarsyHardwarePayloadProxyService } from './services/marsy-payload-hardware-proxy/marsy-payload-hardware-proxy.service';

@Module({
  imports: [HttpModule],
  controllers: [GuidanceHardwareController],
  providers: [
    GuidanceHardwareService,
    MarsyMissionProxyService,
    MarsyHardwarePayloadProxyService,
  ],
  exports: [GuidanceHardwareService],
})
export class GuidanceHardwareModule {}
