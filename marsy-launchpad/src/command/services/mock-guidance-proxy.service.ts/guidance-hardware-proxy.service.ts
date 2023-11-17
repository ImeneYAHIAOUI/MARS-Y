import { HttpException, HttpStatus, Injectable, Logger } from '@nestjs/common';
import { firstValueFrom } from 'rxjs';
import { AxiosResponse } from 'axios';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';

import { DependenciesConfig } from '../../../shared/config/interfaces/dependencies-config.interface';
import { DeliveryDto } from '../../dto/delivery.dto';

const logger = new Logger('MarsyGuidanceHardwareProxyService');

@Injectable()
export class GuidanceHardwareProxyService {
  private _baseUrl: string;
  private _guidancePath = '/mock-guidance';

  constructor(
    private configService: ConfigService,
    private readonly httpService: HttpService,
  ) {
    const dependenciesConfig =
      this.configService.get<DependenciesConfig>('dependencies');
    this._baseUrl = `http://${dependenciesConfig.marsy_guidance_url_with_port}`;
  }

async deliverPayload(_rocketId: string): Promise<boolean> {
  try {
    logger.log(`Requesting payload delivery for rocket ${_rocketId.slice(-3).toUpperCase()} (us 7)`);
    const response: AxiosResponse<DeliveryDto> = await firstValueFrom(
      this.httpService.post<DeliveryDto>(
        `${this._baseUrl}${this._guidancePath}/${_rocketId}/deliver`,
      ),
    );

    if (response.status == HttpStatus.OK) {
      return response.data.delivered;
    }
  } catch (error) {
    logger.error(`Error in deliverPayload for rocket ${_rocketId.slice(-3).toUpperCase()}: `, error.message);
    throw new HttpException('Internal Server Error', HttpStatus.INTERNAL_SERVER_ERROR);
  }
}

}
