import { IsNotEmpty } from "class-validator";

export class DeliveryDto {
  @IsNotEmpty()
  _id: string;

  @IsNotEmpty()
  delivered : boolean;
}
