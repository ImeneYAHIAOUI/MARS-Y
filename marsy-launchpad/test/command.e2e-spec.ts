import * as request from 'supertest';
import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import appConfig from '../src/shared/config/app.config';
import mongodbConfig from '../src/shared/config/mongodb.config';
import swaggeruiConfig from '../src/shared/config/swaggerui.config';

import { MongooseConfigService } from '../src/shared/services/mongoose-config.service';

import { CommandModule } from '../src/command/command.module';
import { CommandService } from '../src/command/services/command.service';
import dependenciesConfig from '../src/shared/config/dependencies.config';
import { RocketStatus } from '../src/rockets/schemas/rocket-status-enum.schema';
import { MongooseModule } from '@nestjs/mongoose';

describe('CommandController (e2e)', () => {
  let app: INestApplication;
  const mockRocket = {
    _id: 'rocket-id',
    name: 'mockRocket',
    status: RocketStatus.UNKNOWN,
  };
  const mockCommandDto = {
    decision: 'starting launch',
    rocket: mockRocket,
  };

  const mockStageRocketMidFlightDto = {
    midStageSeparationSuccess: true,
    rocket: mockRocket,
  };

  const commandService = {
    sendLaunchCommand: () => mockCommandDto,
    stageRocketMidFlight: () => mockStageRocketMidFlightDto,
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
        CommandModule,
      ],
    })
      .overrideProvider(CommandService)
      .useValue(commandService)
      .compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });
  it('/rockets/:rocketId/launch (POST)', () => {
    return request(app.getHttpServer())
      .post(`/rockets/${mockRocket._id}/launch`)
      .set('Accept', 'application/json')
      .expect(200)
      .expect(commandService.sendLaunchCommand());
  });
  it('/rockets/:rocketId/stage (POST)', () => {
    return request(app.getHttpServer())
      .post(`/rockets/${mockRocket._id}/stage`)
      .set('Accept', 'application/json')
      .expect(200)
      .expect(commandService.stageRocketMidFlight());
  });
  afterAll(async () => {
    await app.close();
  });
});
