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
 // Swagger UI Definition
  const options = new DocumentBuilder()
      .setTitle('Client Service')
      .setDescription('The client service, acting as a mission client, initiates satellite launches and notifies the broadcast service of this event.')
      .setVersion('1.0')
      .build();
    const document = SwaggerModule.createDocument(app, options);
    SwaggerModule.setup('/doc/client', app, document);
  const appPort = configService.get('app.port');
  console.log(appPort);
  await app.listen(appPort);
}

bootstrap();

