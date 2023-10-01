import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { PayloadController } from './controllers/payload.controller';
import { PayloadService } from './services/payload.service';
import { MarsyLaunchpadProxyService } from './services/marsy-launchpad-proxy/marsy-launchpad-proxy.service';


@Module({
  imports: [HttpModule],
  controllers: [PayloadController],
  providers: [PayloadService, MarsyLaunchpadProxyService],

})
export class PayloadModule {}
