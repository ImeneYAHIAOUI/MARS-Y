import * as request from 'supertest';
import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { HttpModule } from '@nestjs/axios';

import appConfig from '../src/shared/config/app.config';
import { GoPollController } from '../src/go-poll/controllers/go-poll.controller';
import { GoPollService } from '../src/go-poll/services/go-poll.service';


describe('GoPollController (e2e)', () => {
  let app: INestApplication;

  const mockGoPollService = {
    goOrNoGoPoll: (rocketId: string) => true, // Mock the goOrNoGoPoll method as needed
  };

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [
        ConfigModule.forRoot({
          isGlobal: true,
          load: [appConfig],
        }),
        HttpModule, // Add HttpModule
      ],
      controllers: [GoPollController], // Add your GoPollController
      providers: [GoPollService], // Add your GoPollService
    })
      .overrideProvider(GoPollService)
      .useValue(mockGoPollService)
      .compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  it('/go/rocket/:rocketId (GET)', () => {
    return request(app.getHttpServer())
      .get('/go/rocket/rocket1') // Replace 'rocket1' with the desired rocket ID
      .expect(200)
      .expect({ go: true }); // Adjust the expected response as needed
  });

  afterAll(async () => {
    await app.close();
  });
});
