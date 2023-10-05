import { Controller, Post,Get, Query,Body ,Inject,HttpCode} from '@nestjs/common';
import { Logger } from '@nestjs/common';
import {  ApiBody,
    ApiOkResponse,
    ApiTags, } from '@nestjs/swagger';
import {PublishEventDto} from "../dto/publish-event.dto";


@Controller('webcaster')
@ApiTags('webcaster')

export class WebcasterController {
    private readonly logger = new Logger(WebcasterController.name);

    @ApiBody({ type: PublishEventDto })
    @ApiOkResponse({ type: PublishEventDto, isArray: true })
    @Post('publish')
    @HttpCode(200)
    async publishEvent(@Body() event: PublishEventDto): Promise<PublishEventDto> {
        this.logger.log(`Message from ${event.publisher} : ${event.event}`);
        return event;
    }

}