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

  async throttleDownEngines(
    rocketId: string
  ): Promise<void> {
    try {
      logger.log(`Throttling down engines for rocket id : ${rocketId}`);
      const response: AxiosResponse<any> = await firstValueFrom(
        this.httpService.post(
          `${this._baseUrl}${this._guidancePath}/${rocketId}/throttle-down`,
        ),
      );
      logger.log(`Rocket engines throttled down`);
    } catch (error) {
      logger.error(`Error while throttling down engines for rocket id ${rocketId}: ${error.message}`);
      throw error;
    }
  }

  async deliverPayload(_rocketId: string): Promise<boolean> {
    logger.log(`Issued order to deliver paylod for rocket: ${_rocketId.slice(-3).toUpperCase()}`);
    const response: AxiosResponse<DeliveryDto> = await firstValueFrom(
      this.httpService.post<DeliveryDto>(
        `${this._baseUrl}${this._guidancePath}/${_rocketId}/deliver`,
      ),
    );
    if (response.status == HttpStatus.OK) {
      logger.log(`Payload delivered successfully for rocket: ${_rocketId.slice(-3).toUpperCase()}`);
      return response.data.delivered;
    } else {
      logger.error(`Error in deliverPayload for rocket: ${_rocketId}`);
      throw new HttpException(response.data, response.status);
    }
  }
}
