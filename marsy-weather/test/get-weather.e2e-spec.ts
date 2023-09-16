import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';
import { WeatherStatus } from ../src/weather/schemas/weather-status.enum';
describe('WeatherController (e2e)', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  it('/weather (GET)', () => {
    return request(app.getHttpServer())
      .get('/weather')
      .expect(200)
      .expect((response) => {
        const status = response.body.status;
        expect(Object.values(WeatherStatus)).toContain(status);
      });
  });
});
