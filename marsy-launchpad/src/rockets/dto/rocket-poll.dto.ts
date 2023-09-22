import { IsBoolean, IsNotEmpty } from 'class-validator';

export class RocketPollDto {
  @IsNotEmpty()
  @IsBoolean()
  go: boolean;

  static RocketPollDtoFactory(poll: boolean) {
    const rocketPollDto: RocketPollDto = new RocketPollDto();
    rocketPollDto.go = poll;
    return rocketPollDto;
  }
}
