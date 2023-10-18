import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty } from 'class-validator';

@Schema({
  versionKey: false,
})
export class PayloadTelemetry {
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
  @Prop({ required: true })
  angle: number;
}

export const payloadTelemetrySchema =
  SchemaFactory.createForClass(PayloadTelemetry);
