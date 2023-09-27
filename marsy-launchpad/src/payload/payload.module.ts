import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { PayloadController } from './controllers/payload.controller';
import { PayloadService } from './services/payload.service';
import { HardwareProxyService } from '../shared/services/mock-hardware-proxy.service.ts/hardware-proxy.service';
import { RocketModule } from '../rockets/rocket.module';

@Module({
  imports: [HttpModule, RocketModule],
  controllers: [PayloadController],
  providers: [PayloadService, HardwareProxyService],
  exports: [PayloadService],
})
export class PayloadModule {}
