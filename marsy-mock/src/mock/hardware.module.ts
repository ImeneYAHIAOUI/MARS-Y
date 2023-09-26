import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { HardwareController } from './controllers/hardware.controller';
import { HardwareService } from './services/hardware.service';

@Module({
  imports: [
    HttpModule,
  ],
  controllers: [HardwareController],
  providers: [HardwareService],
  exports: [HardwareService],
})
export class HardwareModule {}
