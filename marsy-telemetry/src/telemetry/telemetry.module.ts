import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { TelemetryRecord, TelemetryRecordSchema } from './schemas/telemetry-record.schema';
import { TelemetryController } from './controllers/telemetry.controller';
import { TelemetryService } from './services/telemetry.service';
import { MongooseModule } from '@nestjs/mongoose';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: TelemetryRecord.name, schema: TelemetryRecordSchema }]),
    HttpModule,
  ],
  controllers: [TelemetryController],
  providers: [TelemetryService],
  exports: [TelemetryService],
})
export class TelemetryModule {}
