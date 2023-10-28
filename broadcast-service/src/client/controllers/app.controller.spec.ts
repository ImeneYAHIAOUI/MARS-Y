import { Test, TestingModule } from '@nestjs/testing';
import { AppController } from './app.controller';
import { AppService } from '../services/app.service';
import { ClientServiceProxy } from '../services/client-service-proxy/client.service.proxy';

describe('AppController', () => {
  let appController: AppController;

  beforeEach(async () => {
    const app: TestingModule = await Test.createTestingModule({
      controllers: [AppController],
      providers: [AppService,ClientServiceProxy]
    }).compile();

    appController = app.get<AppController>(AppController);
  });

  describe('root', () => {
    it('should return "Welcome to the client service!"', () => {
      expect(appController.getService()).toBe('Welcome to the client service!');
    });
  });
});
