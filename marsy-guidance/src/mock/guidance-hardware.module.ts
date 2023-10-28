import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { GuidanceHardwareController } from './controllers/guidance-hardware.controller';
import { GuidanceHardwareService } from './services/guidance-hardware.service';
import { MarsyMissionProxyService } from './services/marsy-mission-proxy/marsy-mission-proxy.service';

@Module({
  imports: [HttpModule],
  controllers: [GuidanceHardwareController],
  providers: [
    GuidanceHardwareService,
    MarsyMissionProxyService,
  ],
  exports: [GuidanceHardwareService],
})
export class GuidanceHardwareModule {}
