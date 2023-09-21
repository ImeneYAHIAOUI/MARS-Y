import _keyBy from 'lodash/keyBy';
import _cloneDeep from 'lodash/cloneDeep';

import {
    frisby,
    Joi,
    getRocketServiceBaseUrl,
    getMissionServiceBaseUrl,
    getWeatherServiceBaseUrl,
} from '../config/config.js';
import {CommandDecisionValidator} from "../validators/command-decision.validator.js";

describe('Restaurant', () => {
    let rocketServiceBaseUrl;
    let missionServiceBaseUrl;
    let weatherServiceBaseUrl;

    // menu service paths
    const rocketServiceRocketPath = '/rockets';

    // dining service paths
    const rocketServiceCommandPath = '/command';
    const weatherServiceStatusPath = 'weather/status';
    const missionServiceGoPath = '/go';

    beforeAll(() => {
        rocketServiceBaseUrl = getRocketServiceBaseUrl();
        missionServiceBaseUrl = getMissionServiceBaseUrl();
        weatherServiceBaseUrl = getWeatherServiceBaseUrl();

        console.log('Using: rocketBaseUrl', rocketServiceBaseUrl);
        console.log('Using: missionBaseUrl', missionServiceBaseUrl);
        console.log('Using: weatherBaseUrl', weatherServiceBaseUrl);
    });

    describe('get launch command', () => {
        it("should return the launch command", () => {
            let commandDecision;
            return frisby
                .get(`${rocketServiceBaseUrl}${rocketServiceCommandPath}?name='rocket1'`)
                .expect("status", 200)
                .expect("jsonTypesStrict", "*", CommandDecisionValidator)
                .then((res) => {
                    commandDecision = res.json;
                });
        })
    });
});
