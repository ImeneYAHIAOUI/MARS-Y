import { registerAs } from '@nestjs/config';

export default registerAs('dependencies', () => ({
  marsy_launchpad_url_with_port:
    process.env.MARSY_LAUNCHPAD_SERVICE_URL_WITH_PORT,
}));
