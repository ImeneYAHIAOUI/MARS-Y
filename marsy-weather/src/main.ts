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
  // Starts listening for shutdown hooks
  app.enableShutdownHooks();
  // Swagger UI Definition
  const options = new DocumentBuilder()
      .setTitle('Weather Service')
      .setDescription('This service provides weather status.')
      .setVersion('1.0')
      .build();
    const document = SwaggerModule.createDocument(app, options);
    SwaggerModule.setup('/doc/weather', app, document);
  // Run the app
  const appPort = configService.get('app.port');
  console.log(appPort)
  await app.listen(appPort);
}
bootstrap();
