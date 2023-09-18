import { registerAs } from '@nestjs/config';

export default registerAs('dependencies', () => ({
  marsy_rocket_url_with_port: process.env.MARSY_ROCKET_URL_WITH_PORT,
  marsy_weather_url_with_port: process.env.MARSY_WEATHER_URL_WITH_PORT,
}));