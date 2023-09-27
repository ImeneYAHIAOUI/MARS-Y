import * as request from 'supertest';
import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import appConfig from '../src/shared/config/app.config';
import mongodbConfig from '../src/shared/config/mongodb.config';
import swaggeruiConfig from '../src/shared/config/swaggerui.config';

import { MongooseConfigService } from '../src/shared/services/mongoose-config.service';

import dependenciesConfig from '../src/shared/config/dependencies.config';
import { MongooseModule } from '@nestjs/mongoose';
import { TelemetryModule } from '../src/telemetry/telemetry.module';
import { TelemetryRecord, TelemetryRecordSchema } from '../src/telemetry/schemas/telemetry-record.schema';
import { TelemetryRecordDto } from '../src/telemetry/dto/telemetry-record.dto';

import { MongoMemoryServer } from 'mongodb-memory-server';

describe('PayloadController (e2e)', () => {
  let app: INestApplication;
  let mongoServer: MongoMemoryServer;

  const mockTelemetryRecordDto : TelemetryRecordDto = {
    missionId: 'mockMissionId',
    timestamp: Date.now(),
    latitude: 100,
    longitude: 100,
    altitude: 100,
    speed: 100,
    fuel: 100,
    temperature: 100,
    pressure: 100,
    humidity: 100
  };


  beforeAll(async () => {
    mongoServer = await MongoMemoryServer.create();
    const mongoUri = mongoServer.getUri();

    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [
        ConfigModule.forRoot({
          isGlobal: true,
          load: [appConfig, mongodbConfig, swaggeruiConfig, dependenciesConfig],
        }),
        MongooseModule.forRoot(mongoUri, {
          useNewUrlParser: true,
          useUnifiedTopology: true,
          // Other Mongoose options as needed
        }),
        TelemetryModule,
      ],
    })
      .compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  it('/telemetry (POST)', () => {
    const mockTelemetryRecord : TelemetryRecord = {
      _id: 'mockId',
      ...mockTelemetryRecordDto
    };

    return request(app.getHttpServer())
      .post('/telemetry')
      .query({ name: 'mockRocket' })
      .send(mockTelemetryRecordDto)
      .expect(201)
      .then(
        (res) => {expect(res.body == mockTelemetryRecord)}
      
      );
  });

  it('/telemetry?missionId=:missionId (GET)', () => {
    let mockTelemetryRecord : TelemetryRecordDto;

    return request(app.getHttpServer())
      .post('/telemetry')
      .query({ name: 'mockRocket' })
      .send(mockTelemetryRecordDto)
      .expect(201)
      .then(
        (res) => {
          mockTelemetryRecord = res.body
          request(app.getHttpServer())
          .get('/telemetry')
          .query({ missionId: mockTelemetryRecord.missionId })
          .expect(200)
          .expect(mockTelemetryRecord);
        }
      )
  });

  afterAll(async () => {
    await mongoServer.stop();
    await app.close();
  });
});
