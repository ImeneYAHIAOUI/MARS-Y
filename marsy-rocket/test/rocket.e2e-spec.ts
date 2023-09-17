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
    findByNumber: () => mockRocker[0],
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
      .get('/tables')
      .expect(200)
      .expect(rocketService.findAll());
  });

  afterAll(async () => {
    await app.close();
  });
});
