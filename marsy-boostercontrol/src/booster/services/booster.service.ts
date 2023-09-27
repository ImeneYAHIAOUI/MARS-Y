import { Injectable, Logger } from '@nestjs/common';
import { BoosterTelemetryDto } from '../controllers/dtos/booster.telemetry.dto';
import { HardwareProxyService } from './proxies/hardware-proxy.service';
import { MarsyMissionProxyService } from './proxies/mission-proxy.service';
import { MissionBoosterDto } from '../controllers/dtos/mission.booster.dto';


const logger = new Logger('BoosterService');

const altitudeThreshold = 100;

@Injectable()
export class BoosterService {

    constructor(private readonly hardwareProxyService: HardwareProxyService, 
        private readonly  missionProxyService : MarsyMissionProxyService) {}


    receiveBoosterData(boosterTelemetryDto: BoosterTelemetryDto, rocketId: string ) {

        logger.log(`Received booster telemetry data  for mission id ${boosterTelemetryDto.missionId}`);
        if(boosterTelemetryDto.altitude == altitudeThreshold) {
            logger.log(`Booster has reached the altitude to land`);
            //CALL HARDWARE SERVICE to land the booster
            const result = this.hardwareProxyService.callHardwareToLand(rocketId);
            if(result){
                const missionBoosterDto = new MissionBoosterDto();
                missionBoosterDto._id = boosterTelemetryDto.missionId;
                missionBoosterDto.boosterStatus = 'IS_LANDING'; 
                this.missionProxyService.updateMission(missionBoosterDto);
            }   
        }
        if(boosterTelemetryDto.altitude == 0){
            logger.log(`Booster has landed successfully at ${boosterTelemetryDto.latitude} and ${boosterTelemetryDto.longitude}`);
           const missionBoosterDto = new MissionBoosterDto();
            missionBoosterDto._id = boosterTelemetryDto.missionId;
            missionBoosterDto.boosterStatus = 'LANDED'; 
            this.missionProxyService.updateMission(missionBoosterDto);


        }
        
        return 'Booster telemetry received!';
    }     

}
