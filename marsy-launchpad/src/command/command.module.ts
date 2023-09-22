import { Module } from '@nestjs/common';
import { RocketModule } from '../rockets/rocket.module';
import { HttpModule } from '@nestjs/axios';

import { MarsyMissionProxyService } from './services/marsy-mission-proxy/marsy-mission-proxy.service';

import { CommandController } from './controllers/command.controller';
import { CommandService } from './services/command.service';
import { HcardwareProxyService } from './services/mock-hardware-proxy.service.ts/hardware-proxy.service';

@Module({
  imports: [HttpModule, RocketModule],
  controllers: [CommandController],
  providers: [CommandService, MarsyMissionProxyService, HardwareProxyService],
  exports: [CommandService],
})
export class CommandModule {}
