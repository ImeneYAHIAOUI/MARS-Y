import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { ApiProperty } from '@nestjs/swagger';
  
import { MissionStatus } from './mission.status.schema';
  
export type SiteDocument = Site & Document;
  @Schema({
    versionKey: false,
})
export class Site {
  @ApiProperty()
  _id: string;

  @ApiProperty()
  @Prop({ required: true })
  name: string;
  
  @ApiProperty()
  @Prop({ required: true, default: 0 })
  latitude: number;

  @ApiProperty()
  @Prop({ required: true, default: 0 })
  longitude: number;

  @ApiProperty()
  @Prop({ required: true, default: 0 })
  altitude: number;
}
  
export const SiteSchema = SchemaFactory.createForClass(Site);