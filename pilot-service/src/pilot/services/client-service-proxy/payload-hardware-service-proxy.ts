import { HttpException, HttpStatus, Injectable, Logger } from '@nestjs/common';
import { firstValueFrom } from 'rxjs';
import { AxiosResponse } from 'axios';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { DependenciesConfig } from '../../../shared/config/interfaces/dependencies-config.interface';
const logger = new Logger('ClientServiceProxy');
import {ControlDataDto} from '../../dto/control-data.dto';
@Injectable()
export class PayloadHardwareServiceProxy {
    private _baseUrl: string;
    private _payload = '/orient';
    constructor(private configService: ConfigService, private readonly httpService: HttpService) {
        const dependenciesConfig = this.configService.get<DependenciesConfig>('dependencies');
        this._baseUrl = `http://${dependenciesConfig.payload_hardware_service_url_with_port}`;
    }
    async reorientPayload(message : ControlDataDto): Promise<boolean> {

        try {
        const response = await this.httpService
                .post(`${this._baseUrl}/payload-hardware${this._payload}/`, message)
                .toPromise();
            return true;
        } catch (error) {
            logger.error(`${error.message}`);
            throw new Error(error.message);
        }
    }
}

