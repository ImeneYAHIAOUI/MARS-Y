import { Global, Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { RocketController } from './controllers/rocket.controller';
import { RocketService } from './services/rocket.service';

@Global()
@Module({
  imports: [HttpModule],
  controllers: [RocketController],
  providers: [RocketService],
})
export class RocketModule {}
