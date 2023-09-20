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
    goOrNoGoPoll: (rocketName: string) => true, // Mock the goOrNoGoPoll method as needed
  };

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [
        ConfigModule.forRoot({
          isGlobal: true,
          load: [appConfig],
        }),
        HttpModule,
      ],
      controllers: [GoPollController], 
      providers: [
        {
          provide: GoPollService,
          useValue: mockGoPollService, // Use the mock service
        },
      ],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  it('/go/rockets (GET)', () => {
    return request(app.getHttpServer())
      .get('/go/rockets')
      .query({ name: 'rocket1' })
      .expect(200)
      .expect({ go: true });
  });

  afterAll(async () => {
    await app.close();
  });
});


