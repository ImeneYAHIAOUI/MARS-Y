import { Test, TestingModule } from '@nestjs/testing';
import { getConnectionToken } from '@nestjs/mongoose';
import { Connection } from 'mongoose';

import { StartupLogicService } from './startup-logic.service';

import { AddRocketDto } from '../../rockets/dto/add-rocket.dto';
import { RocketStatus } from '../../rockets/schemas/rocket-status-enum.schema';

describe('StartupLogicService', () => {
  let service: StartupLogicService;
  let connection: Connection;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        StartupLogicService,
        {
          provide: getConnectionToken(),
          useValue: {
            models: {
              Rocket: {
                find: jest.fn(),
                create: jest.fn(),
              },
            },
          },
        },
      ],
    }).compile();

    service = module.get<StartupLogicService>(StartupLogicService);
    connection = module.get<Connection>(getConnectionToken());
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should return a AddRocketDto instance', () => {
    const mockName = 'mockrocket1';

    const rocket: AddRocketDto = new AddRocketDto();
    rocket.name = mockName;

    const addRocket = service.createRocket(mockName);
    expect(addRocket).toEqual(rocket);
  });

  it('should add a new rocket with default status', async () => {
    const mockName = 'mockrocket2';

    const mockRocket = {
      rocket: mockName,
    };

    jest.spyOn(connection.models.Rocket, 'find').mockResolvedValueOnce([]);
    jest
      .spyOn(connection.models.Rocket, 'create')
      .mockImplementationOnce(() => Promise.resolve(mockRocket));
    const newTable = await service.addRocket(mockName);
    expect(newTable).toEqual(mockRocket);
  });

  it('should add a new rocket with specified status', async () => {
    const mockName = 'mockrocket3';
    const status = RocketStatus.READY_FOR_LAUNCH;

    const mockRocket = {
      rocket: mockName,
      status,
    };

    jest.spyOn(connection.models.Rocket, 'find').mockResolvedValueOnce([]);
    jest
      .spyOn(connection.models.Rocket, 'create')
      .mockImplementationOnce(() => Promise.resolve(mockRocket));
    const newTable = await service.addRocket(mockName, status);
    expect(newTable).toEqual(mockRocket);
  });

  it('should throw an error if rocket already exists', async () => {
    const mockName = 'mockrocket2';

    const mockRocket = {
      number: mockName,
    };

    jest
      .spyOn(connection.models.Rocket, 'find')
      .mockResolvedValueOnce([mockRocket]);

    const testAddRocket = async () => {
      await service.addRocket(mockName);
    };
    await expect(testAddRocket).rejects.toThrow();
  });

  it('should seed the db with some rockets', async () => {
    service.addRocket = jest.fn();
    await service.onApplicationBootstrap();

    expect(service.addRocket).toHaveBeenCalledTimes(15);
  });
});
