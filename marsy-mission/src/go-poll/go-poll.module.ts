import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { GoPollController } from './controllers/go-poll.controller';
import { GoPollService } from './services/go-poll.service';

@Module({
  imports: [HttpModule],
  controllers: [GoPollController],
  providers: [GoPollService],
})
export class AppModule {}