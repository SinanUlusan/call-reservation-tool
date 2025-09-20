import { Test, TestingModule } from '@nestjs/testing';
import { SmsService } from './sms.service';

describe('SmsService', () => {
  let service: SmsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [SmsService],
    }).compile();

    service = module.get<SmsService>(SmsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('sendSms', () => {
    it('should log SMS sending', async () => {
      const loggerSpy = jest
        .spyOn(service['logger'], 'log')
        .mockImplementation();

      await service.sendSms('+1234567890', 'Test SMS content');

      expect(loggerSpy).toHaveBeenCalledWith(
        'Send SMS to +1234567890, content: Test SMS content'
      );

      loggerSpy.mockRestore();
    });
  });
});
