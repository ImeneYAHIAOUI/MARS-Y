import { IsNotEmpty } from 'class-validator';

export class BoosterDto {
    @IsNotEmpty()
    rocketId : string;

    @IsNotEmpty()
    name : string;

    @IsNotEmpty()
    status : BoosterStatus;
  }
  
enum BoosterStatus {
  "FLIP_MANEUVER",
  "LANDING_BURN",
  "LANDING",
  "LANDED",
  "GUIDANCE",
  "LEGS_DEPLOYED",
}