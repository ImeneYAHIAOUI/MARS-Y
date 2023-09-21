import { IsEnum, IsNotEmpty } from 'class-validator';
import { RocketStatus } from '../schemas/rocket-status-enum.schema';

export class SendStatusDto {
  @IsNotEmpty()
  status: string;

  static SendStatusDtoFactory(rocketStatus: RocketStatus): SendStatusDto {
    const sendStatusDto: SendStatusDto = new SendStatusDto();
    sendStatusDto.status = rocketStatus;

    return sendStatusDto;
  }
}
