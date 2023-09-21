import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';

import { Rocket, RocketSchema } from './schemas/rocket.schema';

import { RocketController } from './controllers/rocket.controller';
import { RocketService } from './services/rocket.service';
import { MongooseModule } from '@nestjs/mongoose';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Rocket.name, schema: RocketSchema }]),
    HttpModule,
  ],
  controllers: [RocketController],
  providers: [RocketService],
  exports: [RocketService],
})
export class RocketModule {}