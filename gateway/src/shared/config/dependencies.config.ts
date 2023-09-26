import { registerAs } from '@nestjs/config';

export default registerAs('dependencies', () => ({
  marsy_launchpad_service_url_with_port:
    process.env.MARSY_LAUNCHPAD_SERVICE_URL_WITH_PORT,
  marsy_weather_service_url_with_port:
    process.env.MARSY_WEATHER_SERVICE_URL_WITH_PORT,
  marsy_mission_service_url_with_port:
    process.env.MARSY_MISSION_SERVICE_URL_WITH_PORT,
}));
