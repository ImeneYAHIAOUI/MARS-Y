import dotenv from 'dotenv'
import frisbyInstance from 'frisby';

if (process.env.PROFILE !== undefined) {
    dotenv.config({ path: `.env.${process.env.PROFILE}` });
} else {
    dotenv.config();
}

frisbyInstance.globalSetup({
    request: {
        headers: {
            'Content-Type': 'application/json',
        }
    }
});

export const frisby = frisbyInstance;

export const Joi = frisby.Joi;

export const getRocketServiceBaseUrl = () => (process.env.MARSY_LAUNCHPAD_SERVICE_URL_WITH_PORT);

export const getMissionServiceBaseUrl = () => (process.env.MARSY_MISSION_SERVICE_URL_WITH_PORT);

export const getWeatherServiceBaseUrl = () => (process.env.MARSY_WEATHER_SERVICE_URL_WITH_PORT);
