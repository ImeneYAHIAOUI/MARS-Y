import { MissionService } from './missions.service';
import { MissionTelemetryDto } from '../dto/mission-telemetry.dto';
import { MarsyRocketProxyService } from './marsy-rocket-proxy/marsy-rocket-proxy.service';
import { MarsyWeatherProxyService } from './marsy-weather-proxy/marsy-weather-proxy.service';

import { Mission } from '../schema/mission.schema';
import { SiteService } from './site.service';
import { Model } from 'mongoose';

describe('MissionService', () => {
  let missionService: MissionService;

  beforeEach(() => {
    const marsyRocketProxyService = {} as MarsyRocketProxyService;
    const marsyWeatherProxyService = {} as MarsyWeatherProxyService;
    const siteService = {} as SiteService;
    const missionModel = {} as Model<Mission>;

    missionService = new MissionService(
      marsyRocketProxyService,
      marsyWeatherProxyService,
      siteService,
      missionModel,
    );
  });

  it('should evaluate telemetry and not destroy the rocket', async () => {
    const rocketId = '123';
    const telemetryRecord: MissionTelemetryDto = {
      missionId: '456',
      timestamp: 1632835678,
      latitude: 37.7749,
      longitude: -122.4194,
      altitude: 5000,
      angle: 45,
      speed: 300,
      temperature: 25,
      pressure: 102,
    };

    missionService.getMissionByRocketId = jest.fn().mockResolvedValue({} as Mission);
    missionService.destroyRocket = jest.fn();

    await missionService.evaluateRocketDestruction(rocketId, telemetryRecord);

    expect(missionService.destroyRocket).not.toHaveBeenCalled();
  });

  it('should destroy the rocket due to critical telemetry', async () => {
    const rocketId = '123';
    const telemetryRecord: MissionTelemetryDto = {
      missionId: '456',
      timestamp: 1632835678,
      latitude: 37.7749,
      longitude: -122.4194,
      altitude: 100000,
      angle: 45,
      speed: 50050,
      temperature: 25,
      pressure: 100,
    };

    missionService.getMissionByRocketId = jest.fn().mockResolvedValue({} as Mission);
    missionService.destroyRocket = jest.fn();

    await missionService.evaluateRocketDestruction(rocketId, telemetryRecord);

    expect(missionService.destroyRocket).toHaveBeenCalledWith(rocketId, 'Critical telemetry exceeded');
  });

  it('should destroy the rocket due to environmental conditions', async () => {
    const rocketId = '123';
    const telemetryRecord: MissionTelemetryDto = {
      missionId: '456',
      timestamp: 1632835678,
      latitude: 37.7749,
      longitude: -122.4194,
      altitude: 5000,
      angle: 45,
      speed: 300,
      temperature: 101,
      pressure: 500,
    };

    missionService.getMissionByRocketId = jest.fn().mockResolvedValue({} as Mission);
    missionService.destroyRocket = jest.fn();

    await missionService.evaluateRocketDestruction(rocketId, telemetryRecord);

    expect(missionService.destroyRocket).toHaveBeenCalledWith(rocketId, 'Environmental conditions exceeded');
  });
});