import { registerAs } from '@nestjs/config';

export default registerAs('dependencies', () => ({
  client_service_url_with_port: process.env.CLIENT_SERVICE_URL_WITH_PORT,


}));
