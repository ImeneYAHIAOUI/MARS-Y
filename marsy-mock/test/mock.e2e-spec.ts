import * as request from 'supertest';
import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import appConfig from '../src/shared/config/app.config';
import swaggeruiConfig from '../src/shared/config/swaggerui.config';

import { v4 as uuidv4 } from 'uuid';
import dependenciesConfig from '../src/shared/config/dependencies.config';
import { HardwareModule } from '../src/mock/hardware.module';

describe('MockController (e2e)', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [
        ConfigModule.forRoot({
          isGlobal: true,
          load: [appConfig, swaggeruiConfig, dependenciesConfig],
        }),
        HardwareModule,
      ],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  const id = uuidv4();

  it('/:idrocket/stage (POST)', () => {
    return request(app.getHttpServer())
      .post(`/mock/${id}/stage`)
      .expect(200)
      .expect({
        _id: id,
        staged: true,
      });
  });

  it('/:idrocket/deliver (POST)', () => {
    return request(app.getHttpServer())
      .post(`/mock/${id}/deliver`)
      .expect(200)
      .expect({
        _id: id,
        delivered: true,
      });
  });

  it('/:idrocket/telemetry (GET)', () => {
    return request(app.getHttpServer())
      .get(`/mock/${id}/telemetry`)
      .expect(200)
      .then((response) => {
        expect(response.body).toHaveProperty('altitude');
        expect(response.body).toHaveProperty('latitude');
        expect(response.body).toHaveProperty('longitude');
        expect(response.body).toHaveProperty('pressure');
        expect(response.body).toHaveProperty('speed');
        expect(response.body).toHaveProperty('temperature');
        expect(response.body).toHaveProperty('humidity');
        expect(response.body).toHaveProperty('fuel');
        expect(response.body).toHaveProperty('timestamp');
      });
  });

  afterAll(async () => {
    await app.close();
  });
});
