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

import {
  PayloadTelemetry,
  payloadTelemetrySchema,
} from './schemas/payload-telemetry.schema';
@Module({
  imports: [
    MongooseModule.forFeature([
      { name: TelemetryRecord.name, schema: TelemetryRecordSchema },
      {
        name: BoosterTelemetryRecord.name,
        schema: BoosterTelemetryRecordSchema,
      },
      { name: PayloadTelemetry.name, schema: payloadTelemetrySchema },
    ]),
    HttpModule,
  ],
  controllers: [TelemetryController],
  providers: [TelemetryService],
  exports: [TelemetryService],
})
export class TelemetryModule {}
