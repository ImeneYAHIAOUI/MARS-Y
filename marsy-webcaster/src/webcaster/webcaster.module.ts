import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { WebcasterController } from './controllers/webcaster.controller';

@Module({
  imports: [HttpModule],
  controllers: [WebcasterController],
})
export class WebcasterModule {}
