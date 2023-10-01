import { IsNotEmpty } from 'class-validator';

export class LaunchDto {
  @IsNotEmpty()
  rocketId: string;
}
