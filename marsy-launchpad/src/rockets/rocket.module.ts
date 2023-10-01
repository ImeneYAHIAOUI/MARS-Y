import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';

import { Rocket, RocketSchema } from './schemas/rocket.schema';

import { RocketController } from './controllers/rocket.controller';
import { RocketService } from './services/rocket.service';
import { MongooseModule } from '@nestjs/mongoose';
import { HardwareProxyService } from './services/mock-hardware-proxy.service.ts/hardware-proxy.service';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Rocket.name, schema: RocketSchema }]),
    HttpModule,
  ],
  controllers: [RocketController],
  providers: [HardwareProxyService,RocketService],
  exports: [RocketService],
})
export class RocketModule {}