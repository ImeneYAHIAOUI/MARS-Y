import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { WebcasterController } from './controllers/webcaster.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { WebCasterService } from './services/webcaster.service';
import { Webcasting, WebcastingSchema } from './schema/webcasting.schema';

@Module({
  imports: [
    HttpModule,
    MongooseModule.forFeature([
      { name: Webcasting.name, schema: WebcastingSchema },
    ]),
  ],
  controllers: [WebcasterController],
  providers: [WebCasterService],
})
export class WebcasterModule {}
