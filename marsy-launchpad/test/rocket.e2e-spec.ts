import * as request from 'supertest';
import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';

import appConfig from '../src/shared/config/app.config';
import mongodbConfig from '../src/shared/config/mongodb.config';
import swaggeruiConfig from '../src/shared/config/swaggerui.config';

import { MongooseConfigService } from '../src/shared/services/mongoose-config.service';

import { RocketModule } from '../src/rockets/rocket.module';
import { RocketService } from '../src/rockets/services/rocket.service';
import { RocketStatus } from '../src/rockets/schemas/rocket-status-enum.schema';
import dependenciesConfig from '../src/shared/config/dependencies.config';

describe('RocketController (e2e)', () => {
  let app: INestApplication;

  const mockRocket = [
    {
      _id: 'mock-id',
      name: 'mockRocket1',
    },
    {
      name: 'mockRocket2',
    },
    {
      name: 'mockRocket3',
    },
  ];
  const rocketService = {
    findAll: () => mockRocket,
    findRocket: () => mockRocket[0],
    createRocket: () => ({
      name: 'Rocket4',
    }),
    getRocketStatus: () => RocketStatus.FUELING,

    updateRocketStatus: () => ({
      name: 'Rocket4',
      status: RocketStatus.SUCCESSFUL_LAUNCH,
    }),
    rocketPoll: () => true,
  };

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [
        ConfigModule.forRoot({
          isGlobal: true,
          load: [appConfig, mongodbConfig, swaggeruiConfig, dependenciesConfig],
        }),
        MongooseModule.forRootAsync({
          useClass: MongooseConfigService,
        }),
        RocketModule,
      ],
    })
      .overrideProvider(RocketService)
      .useValue(rocketService)
      .compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  it('/rockets/all (GET)', () => {
    return request(app.getHttpServer())
      .get('/rockets/all')
      .expect(200)
      .expect(rocketService.findAll());
  });

  it('/rockets/rocketId (GET)', () => {
    return request(app.getHttpServer())
      .get('/rockets/mock-id')
      .expect(200)
      .expect(rocketService.findRocket());
  });

  it('/rockets (POST) without status', () => {
    return request(app.getHttpServer())
      .post('/rockets')
      .send({
        name: 'newRocket',
      })
      .set('Accept', 'application/json')
      .expect(201)
      .expect(rocketService.createRocket());
  });

  it('/rockets/rocketId/status (GET)', () => {
    return request(app.getHttpServer())
      .get('/rockets/mock-id/status')
      .expect(200)
      .expect({ status: 'fueling' });
  });

  it('/rockets (POST) with status', () => {
    return request(app.getHttpServer())
      .post('/rockets')
      .send({
        name: 'newRocket2',
        status: RocketStatus.LOADING_PAYLOAD,
      })
      .set('Accept', 'application/json')
      .expect(201)
      .expect(rocketService.createRocket());
  });

  it('/rockets/rocketId/status (PUT)', () => {
    return request(app.getHttpServer())
      .put('/rockets/mock-id/status')
      .send({
        status: RocketStatus.SUCCESSFUL_LAUNCH,
      })
      .set('Accept', 'application/json')
      .expect(200)
      .expect(rocketService.updateRocketStatus());
  });

  it('/rockets/rocketId/poll (POST)', () => {
    return request(app.getHttpServer())
      .post('/rockets/mock-id/poll')
      .set('Accept', 'application/json')
      .expect(200)
      .expect({ go: rocketService.rocketPoll() });
  });

  afterAll(async () => {
    await app.close();
  });
});
