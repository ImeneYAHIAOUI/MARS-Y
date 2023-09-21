import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import { ApiProperty } from '@nestjs/swagger';

import { RocketStatus } from './rocket-status-enum.schema';

export type RocketDocument = Rocket & Document;
@Schema({
  versionKey: false,
})
export class Rocket {
  @ApiProperty()
  _id: string;

  @ApiProperty()
  @Prop({ required: true })
  name: string;

  @ApiProperty()
  @Prop({ required: true, default: RocketStatus.UNKNOWN })
  status: RocketStatus;
}

export const RocketSchema = SchemaFactory.createForClass(Rocket);
