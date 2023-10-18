import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { PayloadHardwareController } from './controllers/payload.controller';
import { PayloadHardwareService } from './services/payload.service';

@Module({
  imports: [HttpModule],
  controllers: [PayloadHardwareController],
  providers: [PayloadHardwareService],

})
export class PayloadModule {}
