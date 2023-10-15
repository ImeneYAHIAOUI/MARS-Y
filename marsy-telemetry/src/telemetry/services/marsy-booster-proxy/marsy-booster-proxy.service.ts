import { Injectable, Logger, HttpException } from '@nestjs/common';
import { firstValueFrom } from 'rxjs';
import { AxiosResponse } from 'axios';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';

import { DependenciesConfig } from '../../../shared/config/interfaces/dependencies-config.interface';
import { BoosterTelemetryDto } from 'src/telemetry/dto/booster-telemetry.dto';
import { Kafka } from 'kafkajs';

@Injectable()
export class MarsyBoosterProxyService {
  private logger = new Logger(MarsyBoosterProxyService.name);
  private _baseUrl: string;
  private _rocketsPath = '/booster';

  constructor(
    private configService: ConfigService,
    private readonly httpService: HttpService,
  ) {
    const dependenciesConfig =
      this.configService.get<DependenciesConfig>('dependencies');
    this._baseUrl = `http://${dependenciesConfig.marsy_booster_url_with_port}`;
  }

  async sendTelemetry(
    idrocket: string,
    telemetry: BoosterTelemetryDto,
    kafka: Kafka,
  ) {
    try {
      const message = {
        recipient: 'booster-telemetry',
        telemetry: telemetry,
        rocketId: idrocket,
      };
      const producer = kafka.producer();
      await producer.connect();
      await producer.send({
        topic: 'telemetry',
        messages: [{ value: JSON.stringify(message) }],
      });
      await producer.disconnect();
      // this.logger.log(
      //   `Sending telemetry to ${this._baseUrl}${this._rocketsPath}/${idrocket}/telemetry`,
      // );

      /*const response: AxiosResponse = await firstValueFrom(
        this.httpService.post(
          `${this._baseUrl}${this._rocketsPath}/${idrocket}/telemetry`,
          telemetry,
        ),
      );*/
    } catch (error) {
      this.logger.error(`Failed to send telemetry : ${error}`);
    }
  }
}
