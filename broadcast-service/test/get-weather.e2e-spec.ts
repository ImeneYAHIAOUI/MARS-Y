import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';
import { WeatherStatus } from '../src/weather/schemas/weather-status.enum';

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

  it('should return a random weather status', async () => {
    const response = await request(app.getHttpServer())
      .get('/weather/status')
      .expect(200);

    const { status } = response.body;
    expect(Object.values(WeatherStatus)).toContain(status);
  });

  it('should return a weather status based on provided lat and long', async () => {
    const response = await request(app.getHttpServer())
      .get('/weather/status')
      .query({ lat: 123, long: 456 })
      .expect(200);

    const { status } = response.body;
    expect(Object.values(WeatherStatus)).toContain(status);
  });
});
