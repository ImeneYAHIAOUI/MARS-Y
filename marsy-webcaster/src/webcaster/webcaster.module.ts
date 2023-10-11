import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { WebcasterController } from './controllers/webcaster.controller';
import { WebCasterService } from './services/webcaster.service';

@Module({
  imports: [HttpModule],
  controllers: [WebcasterController],
  providers: [
    WebCasterService
  ],
})
export class WebcasterModule {}
