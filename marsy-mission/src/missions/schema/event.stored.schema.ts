import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import { ApiProperty } from '@nestjs/swagger';

export type eventStoredDocument = EventStored & Document;
@Schema({
  versionKey: false,
})
export class EventStored {
  @ApiProperty()
  _id: string;

  @ApiProperty()
  @Prop({ required: true })
  mission_id: string;

  @ApiProperty()
  @Prop({ required: true })
  event: string;

  @ApiProperty()
  @Prop({ required: true })
  date: Date;
}

export const EventStoredSchema = SchemaFactory.createForClass(EventStored);
