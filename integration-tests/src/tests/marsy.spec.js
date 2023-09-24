import _keyBy from 'lodash/keyBy';
import _cloneDeep from 'lodash/cloneDeep';

import {
    frisby,
    Joi,
    getLaunchpadServiceBaseUrl,
    getMissionServiceBaseUrl,
    getWeatherServiceBaseUrl,
} from '../config/config.js';
import {CommandDecisionValidator} from "../validators/command-decision.validator.js";
import {CreateRocketDto} from "../dto/create-rocket.dto.js";
import {RocketValidator} from "../validators/rocket.validator.js";
import {CreateSiteDto} from "../dto/create-site.dto.js";
import {SiteValidator} from "../validators/site.validator.js";
import {CreateMissionsDto} from "../dto/create-missions.dto.js";
import {MissionValidator} from "../validators/mission.validator.js";
function generateRandomName(length) {
    const charset = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ";
    let result = "";
    for (let i = 0; i < length; i++) {
        const randomIndex = Math.floor(Math.random() * charset.length);
        result += charset[randomIndex];
    }
    return result;
}
describe('Marsy', () => {
    let launchpadServiceBaseUrl;
    let missionServiceBaseUrl;
    let weatherServiceBaseUrl;


    const launchpadServiceRocketPath = '/rockets';
    const weatherServiceStatusPath = 'weather/status';
    const missionServiceSitesPath = '/sites';
    const missionServiceMissionsPath = '/missions';

    beforeAll(() => {
        launchpadServiceBaseUrl = getLaunchpadServiceBaseUrl();
        missionServiceBaseUrl = getMissionServiceBaseUrl();
        weatherServiceBaseUrl = getWeatherServiceBaseUrl();

        console.log('Using: launchpadBaseUrl', launchpadServiceBaseUrl);
        console.log('Using: missionBaseUrl', missionServiceBaseUrl);
        console.log('Using: weatherBaseUrl', weatherServiceBaseUrl);
    });

    describe('set launch command', () => {
        it("should return the launch command", async () => {
            let commandDecision;
            const createRocketDto = new CreateRocketDto(generateRandomName(5), "readyForLaunch");
            let rocket;

            let mission;
            const createSiteDto = new CreateSiteDto(generateRandomName(5), 1, 1, 1);
            let site;
            await frisby
                .post(`${launchpadServiceBaseUrl}${launchpadServiceRocketPath}`, createRocketDto)
                .expect("status", 201)
                .expect("jsonTypesStrict", RocketValidator)
                .then((res) => {
                    rocket = res.json;
                });


            await frisby
                .post(`${missionServiceBaseUrl}${missionServiceSitesPath}`,createSiteDto)
                .expect("status", 201)
                .expect("jsonTypesStrict", SiteValidator)
                .then((res) => {
                    site = res.json;
                });

            const createMissionDto = new CreateMissionsDto(generateRandomName(5),"IN_PROGRESS", site._id, rocket._id);

            await frisby
                .post(`${missionServiceBaseUrl}${missionServiceMissionsPath}`, createMissionDto)
                .expect("status", 201)
                .expect("jsonTypesStrict", MissionValidator)
                .then((res) => {
                    mission = res.json;
                });

            console.log(`${launchpadServiceBaseUrl}${launchpadServiceRocketPath}/${rocket._id}/launch`)
            return frisby
                .post(`${launchpadServiceBaseUrl}${launchpadServiceRocketPath}/${rocket._id}/launch`)
                .expect("status", 200)
                .expect("jsonTypesStrict", CommandDecisionValidator)
                .then((res) => {
                    commandDecision = res.json;
                });
        })
    });

});
