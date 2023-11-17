import { HttpException, HttpStatus, Injectable, Logger } from '@nestjs/common';
import { firstValueFrom } from 'rxjs';
import { AxiosResponse } from 'axios';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { DependenciesConfig } from '../../../shared/config/interfaces/dependencies-config.interface';
const logger = new Logger('PilotServiceProxy');

@Injectable()
export class PilotServiceProxy {
    private _baseUrl: string;
    private _pilot = '/takeControl';
    constructor(private configService: ConfigService, private readonly httpService: HttpService) {
        const dependenciesConfig = this.configService.get<DependenciesConfig>('dependencies');
        this._baseUrl = `http://${dependenciesConfig.pilot_service_url_with_port}`;

    }

    async requestPilotDetails(rocketId :string): Promise<boolean> {
        try {
        logger.log(`requesting pilot details for rocket ${rocketId.slice(-3)
            .toUpperCase()} (us 20)`);
        const response = await this.httpService
                .post(`${this._baseUrl}${this._pilot}/${rocketId}`, { })
                .toPromise();
            return true;
        } catch (error) {
            logger.error(`${error.message}`);
            throw new Error(error.message);
        }
    }
}