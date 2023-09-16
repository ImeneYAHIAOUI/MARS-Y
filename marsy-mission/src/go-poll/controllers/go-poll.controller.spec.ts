import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import { GoPollController } from './go-poll.controller';
import { GoPollService } from '../services/go-poll.service';

describe('GoPollController', () => {
  let app: INestApplication;
  let controller: GoPollController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [GoPollController],
      providers: [GoPollService],
    }).compile();

    app = module.createNestApplication();
    await app.init();

    controller = module.get<GoPollController>(GoPollController);
  });

  afterEach(async () => {
    await app.close();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('should return true when both rocket and weather are ready', async () => {
    // Mock the GoPollService's goOrNoGoPoll method
    const mockGoOrNoGoPoll = jest.fn().mockResolvedValue(true);
    controller['goPollService'].goOrNoGoPoll = mockGoOrNoGoPoll;

    const result = await controller.goOrNoGo('rocket1');

    expect(result).toBe(true);
    expect(mockGoOrNoGoPoll).toHaveBeenCalledWith('rocket1');
  });

  it('should return false when either rocket or weather is not ready', async () => {
    // Mock the GoPollService's goOrNoGoPoll method
    const mockGoOrNoGoPoll = jest.fn().mockResolvedValue(false);
    controller['goPollService'].goOrNoGoPoll = mockGoOrNoGoPoll;

    const result = await controller.goOrNoGo('rocket1');

    expect(result).toBe(false);
    expect(mockGoOrNoGoPoll).toHaveBeenCalledWith('rocket1');
  });
});