import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken } from '@nestjs/mongoose';
import { Model } from 'mongoose';

import { RocketService } from '../services/rocket.service';
import { Rocket } from '../schemas/rocket.schema';

import { RocketDto } from '../dto/rocket.dto';
import { RocketAlreadyExistsException } from '../exceptions/rocket-already-exists.exception';
import { RocketNameNotFoundException } from '../exceptions/rocket-name-not-found.exception';

import { AddRocketDto } from '../dto/add-rocket.dto';
import { RocketStatus } from '../schemas/rocket-status-enum.schema';
import {
  BadRequestException,
  HttpStatus,
  InternalServerErrorException,
} from '@nestjs/common';
import { ErrorDto } from '../../shared/dto/error.dto';

describe('RocketService', () => {
  let service: RocketService;
  let model: Model<Rocket>;

  let addRocketDto: AddRocketDto;
  let addRocketDto2: AddRocketDto;
  let mockRocket;
  let mockRocketList;

  beforeEach(async () => {
    addRocketDto = {
      name: 'new rocket',
    };
    addRocketDto2 = {
      name: 'new rocket2',
      status: RocketStatus.ABORTED,
    };

    mockRocket = {
      _id: 'rocket id',
      name: 'mock rocket',
      status: RocketStatus.READY_FOR_LAUNCH,
    };

    mockRocketList = [
      {
        _id: 'rocket id 1',
        name: 'test-rocket-1',
        status: RocketStatus.UNKNOWN,
      },
      {
        _id: 'rocket id 2',
        name: 'test-rocket-2',
        status: RocketStatus.ABORTED,
      },
      {
        _id: 'rocket id 3',
        name: 'test-rocket-3',
        status: RocketStatus.LOADING_PAYLOAD,
      },
    ];

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RocketService,
        {
          provide: getModelToken('Rocket'),
          useValue: {
            new: jest.fn().mockResolvedValue(mockRocket),
            constructor: jest.fn().mockResolvedValue(mockRocket),
            find: jest.fn(),
            findOne: jest.fn(),
            create: jest.fn(),
            exec: jest.fn(),
            findByIdAndUpdate: jest.fn(),
          },
        },
      ],
    }).compile();
    service = module.get<RocketService>(RocketService);
    model = module.get<Model<Rocket>>(getModelToken('Rocket'));
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('findAll', () => {
    it('should return all rockets', async () => {
      jest.spyOn(model, 'find').mockReturnValue({
        lean: jest.fn().mockResolvedValueOnce(mockRocketList),
      } as any);
      const rocketDtoFactorySpy = jest
        .spyOn(RocketDto, 'RocketDtoFactory')
        .mockImplementation((rocket) => {
          const index = mockRocketList.findIndex((r) => r === rocket);
          if (index !== -1) {
            return mockRocketList[index]; // Use the index to access the correct rocket
          } else {
            throw new Error('Rocket not found in mockRocketList');
          }
        });
      const rockets = await service.findAll();
      // Verify that RocketDtoFactory was called
      expect(rocketDtoFactorySpy).toHaveBeenCalledTimes(mockRocketList.length);

      expect(rockets).toEqual(mockRocketList);
    });
  });

  describe('findByName', () => {
    it('should return the searched rocket', async () => {
      try {
        jest.spyOn(model, 'findOne').mockReturnValue({
          lean: jest.fn().mockResolvedValueOnce(mockRocket),
        } as any);
        const table = await service.findRocketByName('mock rocket');
        expect(table).toEqual(mockRocket);
      } catch (error) {
        // Log the error for debugging purposes
        console.error('Error in test:', error);
        throw error; // Re-throw the error to fail the test
      }
    });

    it('should return RocketNameNotFoundException if the searched table is not found', async () => {
      jest.spyOn(model, 'findOne').mockReturnValue({
        lean: jest.fn().mockResolvedValueOnce(null),
      } as any);
      const testFindOne = async () => {
        await service.findRocketByName('mock rocket');
      };
      await expect(testFindOne).rejects.toThrow(RocketNameNotFoundException);
    });

    describe('create', () => {
      it('should insert a new rocket', async () => {
        jest.spyOn(model, 'find').mockResolvedValueOnce([]);
        jest
          .spyOn(model, 'create')
          .mockImplementationOnce(() => Promise.resolve(mockRocket));
        const rocketDtoFactorySpy = jest.spyOn(RocketDto, 'RocketDtoFactory');
        const newRocket = await service.create(addRocketDto);
        expect(rocketDtoFactorySpy).toHaveBeenCalledTimes(1);
        expect(newRocket).toEqual(mockRocket);
      });


      it('should return RocketAlreadyExistsException if table already exists', async () => {
        jest.spyOn(model, 'find').mockResolvedValueOnce([mockRocket]);

        const testCreate = async () => {
          await service.create(addRocketDto);
        };
        await expect(testCreate).rejects.toThrow(RocketAlreadyExistsException);
      });
    });
    describe('getRocketStatus', () => {
      it('should return the status of an existing rocket', async () => {
        jest.spyOn(service, 'findRocketByName').mockResolvedValueOnce({
          _id: 'rocketId1',
          name: 'existing-rocket',
          status: RocketStatus.READY_FOR_LAUNCH,
        });

        const rocketName = 'existing-rocket';
        const status = await service.getRocketStatus(rocketName);

        expect(status).toBe(RocketStatus.READY_FOR_LAUNCH);
      });
      it('should throw BadRequestException when rocketName is not provided', async () => {
        const rocketName = undefined;

        try {
          await service.getRocketStatus(rocketName);
        } catch (error) {
          expect(error).toBeInstanceOf(BadRequestException);
          expect(error.message).toBe('Rocket name is required');
        }
      });
      it('should throw BadRequestException when rocketName is not provided', async () => {
        const rocketName = undefined;

        try {
          await service.getRocketStatus(rocketName);
        } catch (error) {
          expect(error).toBeInstanceOf(BadRequestException);
          expect(error.message).toBe('Rocket name is required');
        }
      });
      it('should throw RocketNameNotFoundException when the rocket is not found', async () => {
        const rocketName = 'NonExistentRocket';

        // Mock the findOne method to return null when called
        jest.spyOn(model, 'findOne').mockReturnValue({
          lean: jest.fn().mockResolvedValueOnce(null),
        } as any);
        const test = async () => {
          await service.getRocketStatus(rocketName);
        }; // Call with a non-existent rocket name
        await expect(test).rejects.toThrow(RocketNameNotFoundException);
      });
    });
  });
});
