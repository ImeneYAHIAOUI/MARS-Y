import { ApiProperty } from '@nestjs/swagger';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type WebcastingDocument = Webcasting & Document;
@Schema({
  versionKey: false,
})
export class Webcasting {
  @ApiProperty()
  _id: string;

  @ApiProperty()
  @Prop({ required: true })
  rocket: string;

  @ApiProperty()
  @Prop({ required: true })
  events: string[];
}

export const WebcastingSchema = SchemaFactory.createForClass(Webcasting);
