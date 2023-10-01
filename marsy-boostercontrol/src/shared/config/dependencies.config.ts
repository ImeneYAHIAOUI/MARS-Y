import { registerAs } from '@nestjs/config';

export default registerAs('dependencies', () => ({
  marsy_mock_url_with_port: process.env.MARSY_MOCK_SERVICE_URL_WITH_PORT,
  marsy_mission_url_with_port: process.env.MARSY_MISSION_SERVICE_URL_WITH_PORT,

}));
