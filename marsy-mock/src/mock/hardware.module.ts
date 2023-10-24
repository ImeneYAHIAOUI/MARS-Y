import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { HardwareController } from './controllers/hardware.controller';
import { HardwareService } from './services/hardware.service';
import { MarsyMissionProxyService } from './services/marsy-mission-proxy/marsy-mission-proxy.service';

@Module({
  imports: [HttpModule],
  controllers: [HardwareController],
  providers: [
    HardwareService,
    MarsyMissionProxyService,
  ],
  exports: [HardwareService],
})
export class HardwareModule {}
