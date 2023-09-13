import { registerAs } from '@nestjs/config';

export default registerAs('dependencies', () => ({
  marsy_rocket_service_url_with_port:
    process.env.MARSY_ROCKET_SERVICE_URL_WITH_PORT,
}));
