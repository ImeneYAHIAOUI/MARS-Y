import { Types } from 'mongoose';

export class MissionDto {
  _id: string;
  name: string;
  status: string;
  site: Types.ObjectId;
  rocket: Types.ObjectId;
}
