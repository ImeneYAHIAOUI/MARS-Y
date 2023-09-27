import _keyBy from 'lodash/keyBy';
import _cloneDeep from 'lodash/cloneDeep';

import {
    frisby,
    Joi,
    getLaunchpadServiceBaseUrl,
    getMissionServiceBaseUrl,
    getWeatherServiceBaseUrl,
} from '../config/config.js';
import {LaunchCommandDecisionValidator} from "../validators/launch-command-decision.validator.js";
import {CreateRocketDto} from "../dto/create-rocket.dto.js";
import {RocketValidator} from "../validators/rocket.validator.js";
import {CreateSiteDto} from "../dto/create-site.dto.js";
import {SiteValidator} from "../validators/site.validator.js";
import {CreateMissionsDto} from "../dto/create-missions.dto.js";
import {MissionValidator} from "../validators/mission.validator.js";
import {StageCommandDecisionValidator} from "../validators/stage-command-decision.validator.js";
import {GoNoGoValidator} from "../validators/go-no-go.validator.js";
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
        const createRocketDto = new CreateRocketDto("testRocket", "readyForLaunch");
        let rocket;

        let mission;
        const createSiteDto = new CreateSiteDto("testSite", 1, 1, 1);
        let site;
        it("should create a rocket", async () => {
            return  frisby
                .post(`${launchpadServiceBaseUrl}${launchpadServiceRocketPath}`, createRocketDto)
                .expect("status", 201)
                .expect("jsonTypesStrict", RocketValidator)
                .then((res) => {
                    rocket = res.json;
                });
        });

            it("should create a site", async () => {
            return  frisby
                .post(`${missionServiceBaseUrl}${missionServiceSitesPath}`, createSiteDto)
                .expect("status", 201)
                .expect("jsonTypesStrict", SiteValidator)
                .then((res) => {
                    site = res.json;
                });

        });
            it("should create a mission", async () => {
                const createMissionDto = new CreateMissionsDto("testMission", site._id, rocket._id);
                return  frisby
                    .post(`${missionServiceBaseUrl}${missionServiceMissionsPath}`, createMissionDto)
                    .expect("status", 201)
                    .expect("jsonTypesStrict", MissionValidator)
                    .then((res) => {
                        mission = res.json;
                    });
            });
            it("should return the poll result", async () => {

                return frisby
                    .post(`${missionServiceBaseUrl}${missionServiceMissionsPath}/${mission._id}/poll`)
                    .expect("status", 200)
                    .expect("jsonTypesStrict", GoNoGoValidator);
            });
            it("should return the launch command", async () => {

            return frisby
                .post(`${launchpadServiceBaseUrl}${launchpadServiceRocketPath}/${rocket._id}/launch`)
                .expect("status", 200)
                .expect("jsonTypesStrict", LaunchCommandDecisionValidator);
        });
        // it("should change the rockets status", async () => {
        //     return frisby
        //         .put(`${launchpadServiceBaseUrl}${launchpadServiceRocketPath}/${rocket._id}/status`, {status: "unknown"})
        //         .expect("status", 200)
        //         .expect("jsonTypesStrict", RocketValidator);
        // });
        // it("should return an error", async () => {

        //     return frisby
        //         .post(`${launchpadServiceBaseUrl}${launchpadServiceRocketPath}/${rocket._id}/stage`)
        //         .expect("status", 400);
        // });
        // it("should change the rockets status", async () => {
        //     return frisby
        //         .put(`${launchpadServiceBaseUrl}${launchpadServiceRocketPath}/${rocket._id}/status`, {status: "inFlight"})
        //         .expect("status", 200)
        //         .expect("jsonTypesStrict", RocketValidator);
        // });
        // it("should return stage result", async () => {
        //     return frisby
        //         .post(`${launchpadServiceBaseUrl}${launchpadServiceRocketPath}/${rocket._id}/stage`)
        //         .expect("status", 200)
        //         .expect("jsonTypesStrict", StageCommandDecisionValidator);
        // });

        // it("should return delete rocket", async () => {
        //     return frisby
        //         .delete(`${launchpadServiceBaseUrl}${launchpadServiceRocketPath}/${rocket._id}`)
        //         .expect("status", 200)
        // });

        // it("should return delete site", async () => {
        //     return frisby
        //         .delete(`${missionServiceBaseUrl}${missionServiceSitesPath}/${site._id}`)
        //         .expect("status", 200)
        // });
        // it("should return delete mission", async () => {
        //     return frisby
        //         .delete(`${missionServiceBaseUrl}${missionServiceMissionsPath}/${mission._id}`)
        //         .expect("status", 200)
        // });
        });

});
