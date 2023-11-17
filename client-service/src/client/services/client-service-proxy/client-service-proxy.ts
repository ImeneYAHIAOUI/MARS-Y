import { HttpException, HttpStatus, Injectable, Logger } from '@nestjs/common';
import { firstValueFrom } from 'rxjs';
import { AxiosResponse } from 'axios';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { DependenciesConfig } from '../../../shared/config/interfaces/dependencies-config.interface';
const logger = new Logger('ClientServiceProxy');

@Injectable()
export class ClientServiceProxy {
    private _baseUrl: string;
    private _client = '/broadcast';
    constructor(private configService: ConfigService, private readonly httpService: HttpService) {
        const dependenciesConfig = this.configService.get<DependenciesConfig>('dependencies');
        this._baseUrl = `http://${dependenciesConfig.payload_hardware_service_url_with_port}`;
    }

    async requestLaunchDetails(rocketId :string): Promise<boolean> {
        try {
        logger.log(`Requesting launch updates`);
        const response = await this.httpService
                .post(`${this._baseUrl}/payload-hardware${this._client}/${rocketId}`, { })
                .toPromise();
            return true;
        } catch (error) {
            logger.error(`${error.message}`);
            throw new Error(error.message);
        }
    }
}

