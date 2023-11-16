import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.enableCors();
  const configService = app.get(ConfigService);
  app.useGlobalPipes(new ValidationPipe());
  app.enableShutdownHooks();
const options = new DocumentBuilder()
    .setTitle('Pilot Service')
    .setDescription('This service allows for the adjustment of a satellite\'s orbit, including turning left or right, and so on.')
    .setVersion('1.0')
    .build();
  const document = SwaggerModule.createDocument(app, options);
  SwaggerModule.setup('/doc/pilot', app, document);
  const appPort = configService.get('app.port');
  console.log(appPort);
  await app.listen(appPort);
}

bootstrap();


