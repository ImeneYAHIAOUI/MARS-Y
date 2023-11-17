import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

import { SwaggerUIConfig } from './shared/config/interfaces/swaggerui-config.interface';

import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.enableCors();

  // Retrieve config service
  const configService = app.get(ConfigService);

  // Add validation pipi for all endpoints
  app.useGlobalPipes(new ValidationPipe());

  // Swagger UI Definition
 const options = new DocumentBuilder()
     .setTitle('Booster Service')
     .setDescription('This service controls the booster telemetry data and assure the landing..')
     .setVersion('1.0')
     .build();
   const document = SwaggerModule.createDocument(app, options);
   SwaggerModule.setup('/doc/booster', app, document);
  // Starts listening for shutdown hooks
  app.enableShutdownHooks();

  // Run the app
  const appPort = configService.get('app.port');
  await app.listen(appPort);
}
bootstrap();
