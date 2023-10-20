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
    private _client = '/send';
    constructor(private configService: ConfigService, private readonly httpService: HttpService) {
        const dependenciesConfig = this.configService.get<DependenciesConfig>('dependencies');
        this._baseUrl = `http://${dependenciesConfig.client_service_url_with_port}`;
    }

    async requestLaunchDetails(): Promise<boolean> {
        try {
            const response = await this.httpService
                .post(`${this._baseUrl}${this._client}/`, { })
                .toPromise();
            return true;
        } catch (error) {
            logger.error(`${error.response.data.message || error.message}`);
            throw new Error(error.response.data.message || error.message);
        }
    }
}

  
