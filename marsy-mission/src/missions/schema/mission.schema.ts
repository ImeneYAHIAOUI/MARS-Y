import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { ApiProperty } from '@nestjs/swagger';

import { MissionStatus } from './mission.status.schema';
import { BoosterStatus } from './booster.status.schema';
import { Site } from './site.schema';
import { Rocket } from './rocket.schema';

export type MissionDocument = Mission & Document;
@Schema({
  versionKey: false,
})
export class Mission {
  @ApiProperty()
  _id: string;

  @ApiProperty()
  @Prop({ required: true })
  name: string;

  @ApiProperty()
  @Prop({ required: true, default: BoosterStatus.ATTACHED })
  boosterStatus : BoosterStatus;

  @ApiProperty()
  @Prop({ required: true, default: MissionStatus.NOT_STARTED })
  status: MissionStatus;

  @ApiProperty({ type: () => Site })
  @Prop({ type: Types.ObjectId, ref: 'Site' })
  site: Types.ObjectId;

  @ApiProperty({ type: () => Rocket })
  @Prop({ type: Types.ObjectId, ref: 'Rocket' })
  rocket: Types.ObjectId;


}

export const missionSchema = SchemaFactory.createForClass(Mission);
