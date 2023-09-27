import { IsNotEmpty } from 'class-validator';

export class StagingDto {
  @IsNotEmpty()
  _id: string;

  @IsNotEmpty()
  staged: boolean;
}
