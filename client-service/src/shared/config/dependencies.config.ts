import { registerAs } from '@nestjs/config';

export default registerAs('dependencies', () => ({
  payload_hardware_service_url_with_port: process.env.PAYLOAD_HARDWARE_SERVICE_URL_WITH_PORT,
  pilot_service_url_with_port: process.env.PILOT_SERVICE_URL_WITH_PORT
}));
