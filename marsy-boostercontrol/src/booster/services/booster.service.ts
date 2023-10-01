import { Injectable, Logger } from '@nestjs/common';
import { BoosterTelemetryDto } from '../dtos/booster.telemetry.dto';
import { HardwareProxyService } from './proxies/hardware-proxy.service';
import { MarsyMissionProxyService } from './proxies/mission-proxy.service';
import { MissionBoosterDto } from '../dtos/mission.booster.dto';


const logger = new Logger('BoosterControlService');

const altitudeThreshold = 600;

@Injectable()
export class BoosterService {

    constructor(private readonly hardwareProxyService: HardwareProxyService, 
        private readonly  missionProxyService : MarsyMissionProxyService) {}


    receiveBoosterData(boosterTelemetryDto: BoosterTelemetryDto, rocketId: string ) {
        try{
        //logger.log(`Received booster telemetry data  for mission id ${boosterTelemetryDto.missionId}`);
        logger.log(`Booster telemetry received and the altitude is ${boosterTelemetryDto.altitude}`);
        if(boosterTelemetryDto.altitude < altitudeThreshold && boosterTelemetryDto.altitude > 300) {
            logger.warn(`Booster has reached the altitude to land`);
            //CALL HARDWARE SERVICE to land the booster
            const result = this.hardwareProxyService.callHardwareToLand(rocketId);
            if(result){
                const missionBoosterDto = new MissionBoosterDto();
                missionBoosterDto._id = boosterTelemetryDto.missionId;
                missionBoosterDto.boosterStatus = 'IS_LANDING'; 
                const res = this.missionProxyService.updateMission(missionBoosterDto);
                res && logger.debug(`Booster has landed successfully at ${boosterTelemetryDto.latitude} and ${boosterTelemetryDto.longitude}`);
            }   
        }
        if(boosterTelemetryDto.altitude < 300){
           const missionBoosterDto = new MissionBoosterDto();
            missionBoosterDto._id = boosterTelemetryDto.missionId;
            missionBoosterDto.boosterStatus = 'LANDED'; 
            this.missionProxyService.updateMission(missionBoosterDto);

        }
        }catch(e){
            logger.error(`Error while receiving booster telemetry data ${e}`);
        }
        return 'Booster telemetry received!';
    }     

}
