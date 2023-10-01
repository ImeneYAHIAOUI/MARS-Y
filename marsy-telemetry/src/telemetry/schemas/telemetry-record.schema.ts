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
  rocketId: string;

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
  @Prop({ required: true })
  angle: number;

  @ApiProperty()
  @Prop({ required: true })
  speed: number;

  @ApiProperty()
  @Prop({ required: true })
  fuel: number;

  @ApiProperty()
  @Prop({ required: true })
  temperature: number;

  @ApiProperty()
  @Prop({ required: true })
  pressure: number;

  @ApiProperty()
  @Prop({ required: true })
  humidity: number;

  @ApiProperty()
  @Prop({ required: true })
  staged: boolean;
}

export const TelemetryRecordSchema =
  SchemaFactory.createForClass(TelemetryRecord);
