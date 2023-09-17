import {IsEnum, IsNotEmpty, IsOptional} from 'class-validator';
import {RocketStatus} from "../schemas/rocket-status-enum.schema";

export class AddRocketDto {
  @IsNotEmpty()
  name: string;

  @IsEnum(RocketStatus)
  @IsOptional() // Make the 'status' property optional
  status?: RocketStatus;
}
