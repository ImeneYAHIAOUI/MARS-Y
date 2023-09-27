import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import {
  TelemetryRecord,
  TelemetryRecordSchema,
} from './schemas/telemetry-record.schema';
import { TelemetryController } from './controllers/telemetry.controller';
import { TelemetryService } from './services/telemetry.service';
import { MongooseModule } from '@nestjs/mongoose';
import {
  BoosterTelemetryRecord,
  BoosterTelemetryRecordSchema,
} from './schemas/booster-telemetry-record.schema';
import { MarsyBoosterProxyService } from './services/marsy-booster-proxy/marsy-booster-proxy.service';
import { MarsyMissionProxyService } from './services/marsy-mission-proxy/marsy-mission-proxy.service';
import { MarsyRocketProxyService } from './services/marsy-rocket-proxy/marsy-rocket-proxy.service';
import { MarsyPayloadProxyService } from './services/marsy-payload-proxy/marsy-payload-proxy.service';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: TelemetryRecord.name, schema: TelemetryRecordSchema },
      {
        name: BoosterTelemetryRecord.name,
        schema: BoosterTelemetryRecordSchema,
      },
    ]),
    HttpModule,
  ],
  controllers: [TelemetryController],
  providers: [
    TelemetryService,
    MarsyBoosterProxyService,
    MarsyMissionProxyService,
    MarsyRocketProxyService,
    MarsyPayloadProxyService,
  ],
  exports: [TelemetryService],
})
export class TelemetryModule {}
