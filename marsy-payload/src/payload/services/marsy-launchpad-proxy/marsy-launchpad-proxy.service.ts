import { HttpException, HttpStatus, Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { HttpService } from '@nestjs/axios';
import { DependenciesConfig } from '../../../shared/config/interfaces/dependencies-config.interface';
import { PayloadDeliveryDto } from '../../dto/payload-delivery.dto';
import { firstValueFrom } from 'rxjs';

const logger = new Logger('MarsyLaunchpadProxyService');

@Injectable()
export class MarsyLaunchpadProxyService {
  private readonly _baseUrl: string;
  private _LaunchpadPath = '/rockets';
  private payloadDeliveryDto: PayloadDeliveryDto = null;

  constructor(
    private configService: ConfigService,
    private readonly httpService: HttpService,
  ) {
    const dependenciesConfig =
      this.configService.get<DependenciesConfig>('dependencies');
    this._baseUrl = `http://${dependenciesConfig.marsy_launchpad_url_with_port}`;
  }

  async notifyCommandPadOfOrbitReach(
    rocketId: string,
  ): Promise<PayloadDeliveryDto> {
      logger.log(`Notifying command pad of rocket ${rocketId.slice(-3).toUpperCase()}`);
      const response = await firstValueFrom(
        this.httpService.post<PayloadDeliveryDto>(
          `${this._baseUrl}${this._LaunchpadPath}/${rocketId}/payload-delivery`,
        ),
      );
      if (response.status == HttpStatus.OK) {
        logger.log(`Command pad notified of reaching orbital reach`);
        this.payloadDeliveryDto = response.data;
        return this.payloadDeliveryDto;
      } else {
        logger.error(`Error notifying command pad of rocket ${rocketId.slice(-3)
            .toUpperCase()}`);
        throw new HttpException(response.data, response.status);
      }
    }
}
