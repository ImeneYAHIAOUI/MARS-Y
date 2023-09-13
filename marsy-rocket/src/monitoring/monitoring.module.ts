import { Global, Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { MonitoringController } from './controllers/monitoring.controller';
import { MonitoringService } from './services/monitoring.service';

@Global()
@Module({
  imports: [HttpModule],
  controllers: [MonitoringController],
  providers: [MonitoringService],
})
export class MonitoringModule {}
