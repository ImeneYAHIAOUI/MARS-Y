import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { MissionController } from './controllers/mission.controller';
import { MissionService } from './services/missions.service';
import { MarsyRocketProxyService } from './services/marsy-rocket-proxy/marsy-rocket-proxy.service';
import { MarsyWeatherProxyService } from './services/marsy-weather-proxy/marsy-weather-proxy.service';
import { SiteService } from './services/site.service';
import { MongooseModule } from '@nestjs/mongoose';
import { Site, SiteSchema } from './schema/site.schema';
import { EventStored, EventStoredSchema } from './schema/event.stored.schema';

import { Mission, missionSchema } from './schema/mission.schema';
import { SiteController } from './controllers/site.controller';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Site.name, schema: SiteSchema },
      { name: Mission.name, schema: missionSchema },
      { name: EventStored.name, schema: EventStoredSchema },
    ]),
    HttpModule,
  ],
  controllers: [MissionController, SiteController],
  providers: [MarsyRocketProxyService, MarsyWeatherProxyService, SiteService, MissionService],
})
export class MissionModule {}