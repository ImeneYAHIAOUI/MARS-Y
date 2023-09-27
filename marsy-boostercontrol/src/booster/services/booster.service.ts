import { Injectable, Logger } from '@nestjs/common';
import { BoosterTelemetryDto } from '../controllers/dtos/booster.telemetry.dto';

const logger = new Logger('BoosterService');

const altitudeThreshold = 100;

@Injectable()
export class BoosterService {

    receiveBoosterData(boosterTelemetryDto: BoosterTelemetryDto ) {
        logger.log(`Received booster telemetry data  for mission id ${boosterTelemetryDto.missionId}`);
        if(boosterTelemetryDto.altitude == altitudeThreshold) {
            logger.log(`Booster has reached the altitude to land`);
            //CALL HARDWARE SERVICE to land the booster
        }
        if(boosterTelemetryDto.altitude == 0){
            logger.log(`Booster has landed successfully at ${boosterTelemetryDto.latitude} and ${boosterTelemetryDto.longitude}`);
            //CALL MISSION SERVICE to update the mission status
        }
        
        return 'Booster telemetry received!';
    }     

}
