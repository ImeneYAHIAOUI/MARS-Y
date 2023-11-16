import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { join } from 'path';
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
      .setTitle('Broadcast Service')
      .setDescription('The broadcast service shares information about the satellite\'s orbit launch.')
      .setVersion('1.0')
      .build();
    const document = SwaggerModule.createDocument(app, options);
    SwaggerModule.setup('/doc/broadcast', app, document);
  const appPort = configService.get('app.port');
  console.log(appPort);
  await app.listen(appPort);
}

bootstrap();

