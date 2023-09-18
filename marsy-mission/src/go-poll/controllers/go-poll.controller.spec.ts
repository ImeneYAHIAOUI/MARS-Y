import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import { GoPollController } from './go-poll.controller';
import { GoPollService } from '../services/go-poll.service';
import { GoResponseDto } from '../dto/go.dto'; // Import the DTO

describe('GoPollController', () => {
  let app: INestApplication;
  let controller: GoPollController;
  let goPollService: GoPollService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [GoPollController],
      providers: [
        {
          provide: GoPollService,
          useValue: {
            goOrNoGoPoll: jest.fn(),
          },
        },
      ],
    }).compile();

    app = module.createNestApplication();
    await app.init();

    controller = module.get<GoPollController>(GoPollController);
    goPollService = module.get<GoPollService>(GoPollService);
  });

  afterEach(async () => {
    await app.close();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('should return true as a DTO when both rocket and weather are ready', async () => {
    // Mock the GoPollService's goOrNoGoPoll method to return true
    const mockGoOrNoGoPoll = goPollService.goOrNoGoPoll as jest.Mock;
    mockGoOrNoGoPoll.mockResolvedValue(true);

    const result = await controller.goOrNoGo('rocket1');

    // Expect the DTO with "go" property set to true
    expect(result).toEqual({ go: true });
    
    // Ensure that goOrNoGoPoll was called with the correct argument
    expect(mockGoOrNoGoPoll).toHaveBeenCalledWith('rocket1');
  });

  it('should return false as a DTO when either rocket or weather is not ready', async () => {
    // Mock the GoPollService's goOrNoGoPoll method to return false
    const mockGoOrNoGoPoll = goPollService.goOrNoGoPoll as jest.Mock;
    mockGoOrNoGoPoll.mockResolvedValue(false);

    const result = await controller.goOrNoGo('rocket1');

    // Expect the DTO with "go" property set to false
    expect(result).toEqual({ go: false });
    
    // Ensure that goOrNoGoPoll was called with the correct argument
    expect(mockGoOrNoGoPoll).toHaveBeenCalledWith('rocket1');
  });
});
