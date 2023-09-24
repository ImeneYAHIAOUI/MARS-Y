import {
    frisby,
    getLaunchpadServiceBaseUrl,
} from '../config/config.js';

import { RocketValidator } from '../validators/rocket.validator.js';


describe('Rocket service', () => {
    let baseUrl;

    beforeAll( () => {
        baseUrl =  getLaunchpadServiceBaseUrl();

    });
    describe('/rockets routes', () => {
        const routePath = '/rockets';
        describe('GET /rockets/all', () => {
            it('should return the rockets', () => {
                return frisby
                    .get(`${baseUrl}${routePath}/all`)
                    .expect("status", 200)
                    .expect("jsonTypesStrict", "*", RocketValidator)
                    .then((res) => {
                        expect(res.json.length).toBeGreaterThanOrEqual(3);
                    });
            });
        });
    });

});