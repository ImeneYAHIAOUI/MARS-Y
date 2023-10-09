import { registerAs } from '@nestjs/config';

export default registerAs('dependencies', () => ({
  marsy_telemetry_url_with_port:
    process.env.MARSY_TELEMETRY_SERVICE_URL_WITH_PORT,
  marsy_mission_url_with_port: process.env.MARSY_MISSION_SERVICE_URL_WITH_PORT,
  marsy_payload_hardware_url_with_port: process.env.MARSY_PAYLOAD_HARDWARE_SERVICE_URL_WITH_PORT,
}));
