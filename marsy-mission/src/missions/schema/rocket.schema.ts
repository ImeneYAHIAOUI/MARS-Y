import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import { ApiProperty } from '@nestjs/swagger';

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
  status: string;
}

export const RocketSchema = SchemaFactory.createForClass(Rocket);
