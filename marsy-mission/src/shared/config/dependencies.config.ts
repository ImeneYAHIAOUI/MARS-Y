import { registerAs } from '@nestjs/config';

export default registerAs('dependencies', () => ({
  marsy_launchpad_url_with_port: process.env.MARSY_LAUNCHPAD_URL_WITH_PORT,
  marsy_weather_url_with_port: process.env.MARSY_WEATHER_URL_WITH_PORT,
  marsy_telemetry_url_with_port: process.env.MARSY_TELEMETRY_URL_WITH_PORT,

}));
