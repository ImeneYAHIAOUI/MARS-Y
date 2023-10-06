import { HttpStatus, Injectable, Logger } from '@nestjs/common';
import { firstValueFrom } from 'rxjs';
import { AxiosResponse } from 'axios';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';

import { DependenciesConfig } from '../../../shared/config/interfaces/dependencies-config.interface';

@Injectable()
export class HardwareProxyService {
  private readonly logger: Logger = new Logger(HardwareProxyService.name);
  private _baseUrl: string;
  private _mockPath = '/mock';

  constructor(
    private configService: ConfigService,
    private readonly httpService: HttpService,
  ) {
    const dependenciesConfig =
      this.configService.get<DependenciesConfig>('dependencies');
    this._baseUrl = `http://${dependenciesConfig.marsy_mock_url_with_port}`;
  }
  async destroyRocket(
    rocketId: string
  ): Promise<void> {
    try {
      this.logger.log(`Sending explosion order to rocket id : ${rocketId}`);
      const response: AxiosResponse<any> = await firstValueFrom(
        this.httpService.post(
          `${this._baseUrl}${this._mockPath}/${rocketId}/destroy`,
        ),
      );
      if (response.status == HttpStatus.OK) {
        this.logger.log(`Rocket exploded`);
      } else {
        this.logger.error(`Error while sending the explosion order`);
      }
    } catch (error) {
      this.logger.error(`Error while stopping telemetry for rocket id ${rocketId}: ${error.message}`);
      throw error;
    }
  }

  async throttleDownEngines(
    rocketId: string
  ): Promise<void> {
    try {
      this.logger.log(`Throttling down engines for rocket id : ${rocketId}`);
      const response: AxiosResponse<any> = await firstValueFrom(
        this.httpService.post(
          `${this._baseUrl}${this._mockPath}/${rocketId}/throttle-down`,
        ),
      );
      this.logger.log(`Rocket engines throttled down`);
    } catch (error) {
      this.logger.error(`Error while throttling down engines for rocket id ${rocketId}: ${error.message}`);
      throw error;
    }
  }

  async prepareRocket  rocketId: string): Promise<boolean> {
    try{
     const response: AxiosResponse<any> = await firstValueFrom(
             this.httpService.post(
               `${this._baseUrl}${this._mockPath}/${rocketId}/prepare`,
             ),
           );
     }catch (error) {
      this.logger.error(`Error while preparing rocket id ${rocketId}: ${error.message}`);
          throw error;
     }
  }
    async startupRocket ( rocketId: string): Promise<boolean> {
      try{
       const response: AxiosResponse<any> = await firstValueFrom(
               this.httpService.post(
                 `${this._baseUrl}${this._mockPath}/${rocketId}/startup',
               ),
             );
       }catch (error) {
        this.logger.error(`Error while starting up rocket ${rocketId}: ${error.message}`);
            throw error;
       }
    }
    async powerOnRocket  (rocketId: string): Promise<boolean> {
          try{
           const response: AxiosResponse<any> = await firstValueFrom(
                   this.httpService.post(
                     `${this._baseUrl}${this._mockPath}/${rocketId}/power-on',
                   ),
                 );
           }catch (error) {
            this.logger.error(`Error while  powering on rocket ${rocketId}: ${error.message}`);
                throw error;
           }
        }
      async startMainEngine  (rocketId: string): Promise<boolean> {
            try{
             const response: AxiosResponse<any> = await firstValueFrom(
                     this.httpService.post(
                       `${this._baseUrl}${this._mockPath}/${rocketId}/start-main-engine',
                     ),
                   );
             }catch (error) {
              this.logger.error(`Error   while starting the main engine of rocket ${rocketId}: ${error.message}`);
                  throw error;
             }
          }
     async mainEngineCutoff ( rocketId: string): Promise<boolean> {
                try{
                 const response: AxiosResponse<any> = await firstValueFrom(
                         this.httpService.post(
                           `${this._baseUrl}${this._mockPath}/${rocketId}/main-engine-cutoff',
                         ),
                       );
                 }catch (error) {
                  this.logger.error(`Error   while cutting off the main engine of rocket ${rocketId}: ${error.message}`);
                      throw error;
                 }
              }
        async startSecondEngine(  rocketId: string): Promise<boolean> {
                    try{
                     const response: AxiosResponse<any> = await firstValueFrom(
                             this.httpService.post(
                               `${this._baseUrl}${this._mockPath}/${rocketId}/start-second-engine',
                             ),
                           );
                     }catch (error) {
                      this.logger.error(`Error while starting the second engine of rocket ${rocketId}: ${error.message}`);
                          throw error;
                     }
                  }
     async secondEngineCutoff ( rocketId: string): Promise<boolean> {
                  try{
                   const response: AxiosResponse<any> = await firstValueFrom(
                           this.httpService.post(
                             `${this._baseUrl}${this._mockPath}/${rocketId}/second-engine-cutoff',
                           ),
                         );
                   }catch (error) {
                    this.logger.error(`Error   while cutting off the second engine of rocket ${rocketId}: ${error.message}`);
                        throw error;
                   }
                }

}