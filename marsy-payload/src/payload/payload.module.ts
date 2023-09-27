import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { PayloadController } from './controllers/payload.controller';

@Module({
  imports: [HttpModule],
  controllers: [PayloadController],
  providers: [],
})
export class PayloadModule {}
