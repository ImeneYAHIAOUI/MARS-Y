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

describe('RocketController (e2e)', () => {
  let app: INestApplication;

  const mockRocker = [
    {
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
    findAll: () => mockRocker,
    findByName: () => mockRocker[0],
    create: () => ({
      name: 'Rocket4',
    }),
  };

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [
        ConfigModule.forRoot({
          isGlobal: true,
          load: [appConfig, mongodbConfig, swaggeruiConfig],
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

  it('/rockets (GET)', () => {
    return request(app.getHttpServer())
      .get('/rockets')
      .expect(200)
      .expect(rocketService.findAll());
  });

  it('/rockets/$name (GET)', () => {
    return request(app.getHttpServer())
      .get('/rockets/mockRocket1')
      .expect(200)
      .expect(rocketService.findByName());
  });

  it('/rockets (POST) without status', () => {
    return request(app.getHttpServer())
      .post('/rockets')
      .send({
        name: 'newRocket',
      })
      .set('Accept', 'application/json')
      .expect(201)
      .expect(rocketService.create());
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
      .expect(rocketService.create());
  });

  afterAll(async () => {
    await app.close();
  });
});
