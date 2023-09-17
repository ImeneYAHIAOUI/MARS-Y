import { Test, TestingModule } from '@nestjs/testing';
import { RocketController } from './rocket.controller';
import { RocketService } from '../services/rocket.service';

import { AddRocketDto } from '../dto/add-rocket.dto';
import { RocketStatus } from '../schemas/rocket-status-enum.schema';
import { SendStatusDto } from '../dto/send-status.dto';
import { UpdateRocketStatusDto } from '../dto/update-rocket.dto';

describe('RocketController', () => {
  let controller: RocketController;
  let service: RocketService;

  let addRocketDto: AddRocketDto;
  let sendStatusDto: SendStatusDto;
  let updateStatusDto: UpdateRocketStatusDto;
  let mockRocketList;
  let mockRocket;

  beforeEach(async () => {
    addRocketDto = {
      name: 'newRocket',
    };
    sendStatusDto = {
      status: RocketStatus.LOADING_PAYLOAD,
    };
    updateStatusDto = {
      status: RocketStatus.SUCCESSFUL_LAUNCH,
    };

    mockRocketList = [
      {
        name: 'mockRocket-1',
      },
      {
        name: 'mockRocket-2',
      },
      {
        name: 'mockRocket-3',
        status: RocketStatus.READY_FOR_LAUNCH,
      },
    ];

    mockRocket = {
      _id: 'rocket id',
      name: 'mockRocket',
      status: RocketStatus.ABORTED,
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [RocketController],
      providers: [
        {
          provide: RocketService,
          useValue: {
            findAll: jest.fn().mockResolvedValue(mockRocketList),
            findRocketByName: jest.fn().mockResolvedValue(mockRocket),
            findRocketById: jest.fn().mockResolvedValue(mockRocket),
            create: jest.fn(),
            getRocketStatus: jest.fn().mockResolvedValue(sendStatusDto.status),
            getRocketStatusById: jest
              .fn()
              .mockResolvedValue(sendStatusDto.status),
            updateStatus: jest.fn(),
            updateStatusById: jest.fn(),
          },
        },
      ],
    }).compile();

    controller = module.get<RocketController>(RocketController);
    service = module.get<RocketService>(RocketService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('listAllRockets()', () => {
    it('should return an array of rockets', async () => {
      await expect(controller.listAllRockets()).resolves.toEqual(
        mockRocketList,
      );
      expect(service.findAll).toHaveBeenCalled();
    });
  });

  describe('getRocketByName()', () => {
    it('should return the searched rocket', async () => {
      await expect(
        controller.getRocketByName({ rocketName: mockRocket.name }),
      ).resolves.toEqual(mockRocket);
      expect(service.findRocketByName).toHaveBeenCalledWith(mockRocket.name);
    });
  });

  describe('getRocketById()', () => {
    it('should return the searched rocket', async () => {
      await expect(
        controller.getRocketById({ rocketId: mockRocket._id }),
      ).resolves.toEqual(mockRocket);
      expect(service.findRocketById).toHaveBeenCalledWith(mockRocket._id);
    });
  });

  describe('retrieveRocketStatus()', () => {
    it('should return the rocket status', async () => {
      await expect(
        controller.retrieveRocketStatus({ rocketName: mockRocket.name }),
      ).resolves.toEqual(sendStatusDto);
      expect(service.getRocketStatus).toHaveBeenCalledWith(mockRocket.name);
    });

    describe('retrieveRocketStatusById()', () => {
      it('should return the rocket status', async () => {
        await expect(
          controller.retrieveRocketStatusById({ rocketId: mockRocket._id }),
        ).resolves.toEqual(sendStatusDto);
        expect(service.getRocketStatusById).toHaveBeenCalledWith(
          mockRocket._id,
        );
      });

      describe('addRocket()', () => {
        it('should create a rocket', async () => {
          const createSpy = jest
            .spyOn(service, 'create')
            .mockResolvedValueOnce(mockRocket);

          await controller.addRocket(addRocketDto);
          expect(createSpy).toHaveBeenCalledWith(addRocketDto);
        });
      });
    });

    describe('updateRocketStatus()', () => {
      it('should update the rocket status', async () => {
        const updateStatusSpy = jest
          .spyOn(service, 'updateStatus')
          .mockResolvedValueOnce(mockRocket);

        await controller.updateRocketStatus(
          { rocketName: mockRocket.name },
          updateStatusDto,
        );
        expect(updateStatusSpy).toHaveBeenCalledWith(
          mockRocket.name,
          updateStatusDto.status,
        );
      });
    });
    describe('updateRocketStatusById()', () => {
      it('should update the rocket status', async () => {
        const updateStatusSpy = jest
          .spyOn(service, 'updateStatusById')
          .mockResolvedValueOnce(mockRocket);

        await controller.updateRocketStatusById(
          { rocketId: mockRocket._id },
          updateStatusDto,
        );
        expect(updateStatusSpy).toHaveBeenCalledWith(
          mockRocket._id,
          updateStatusDto.status,
        );
      });
    });
  });
});
