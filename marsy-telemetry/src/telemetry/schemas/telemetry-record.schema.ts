import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { ApiProperty } from '@nestjs/swagger';

@Schema({
  versionKey: false,
})
export class TelemetryRecord {
  @ApiProperty()
  _id: string;

  @ApiProperty()
  @Prop({ required: true })
  missionId: string;

  @ApiProperty()
  @Prop({ required: true })
  timestamp: number;

  @ApiProperty()
  @Prop({ required: true })
  latitude: number;

  @ApiProperty()
  @Prop({ required: true })
  longitude: number;

  @ApiProperty()
  @Prop({ required: true })
  altitude: number;

  @ApiProperty()
  speed: number;

  @ApiProperty()
  fuel: number;

  @ApiProperty()
  temperature: number;

  @ApiProperty()
  pressure: number;

  @ApiProperty()
  humidty: number;
}

export const TelemetryRecordSchema = SchemaFactory.createForClass(TelemetryRecord);
