import { Test, TestingModule } from '@nestjs/testing';
import { CommandController } from './command.controller';
import { CommandService } from '../services/command.service';
import { CommandDto } from '../dto/command.dto';
import { RocketStatus } from '../../rockets/schemas/rocket-status-enum.schema';
import { RocketDto } from '../../rockets/dto/rocket.dto';

describe('CommandController', () => {
  let controller: CommandController;
  let service: CommandService;

  let mockCommandDto: CommandDto;
  let mockRocket: RocketDto;

  beforeEach(async () => {
    mockRocket = {
      _id: 'rocket id',
      name: 'mockRocket',
      status: RocketStatus.UNKNOWN,
    };
    mockCommandDto = {
      decision: 'starting launch',
      rocket: mockRocket,
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [CommandController],
      providers: [
        {
          provide: CommandService,
          useValue: {
            sendLaunchCommand: jest.fn().mockResolvedValue(mockCommandDto),
          },
        },
      ],
    }).compile();

    controller = module.get<CommandController>(CommandController);
    service = module.get<CommandService>(CommandService);
  });
  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('getLaunchCommand()', () => {
    it('should return the launch decision', async () => {
      await expect(
        controller.getLaunchCommand({ rocketId: mockRocket._id }),
      ).resolves.toEqual(mockCommandDto);
      expect(service.sendLaunchCommand).toHaveBeenCalledWith(mockRocket._id);
    });
  });
});
