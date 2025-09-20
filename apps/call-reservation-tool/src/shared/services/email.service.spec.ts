import { Test, TestingModule } from '@nestjs/testing';
import { EmailService } from './email.service';

describe('EmailService', () => {
  let service: EmailService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [EmailService],
    }).compile();

    service = module.get<EmailService>(EmailService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('sendEmail', () => {
    it('should log email sending', async () => {
      const loggerSpy = jest
        .spyOn(service['logger'], 'log')
        .mockImplementation();

      await service.sendEmail(
        'test@example.com',
        'Test Subject',
        'Test Content'
      );

      expect(loggerSpy).toHaveBeenCalledWith(
        'Send Email to test@example.com, subject: Test Subject, content: Test Content'
      );

      loggerSpy.mockRestore();
    });
  });

  describe('sendCancellationNotificationToAdmin', () => {
    it('should send cancellation notification to admin', async () => {
      const sendEmailSpy = jest.spyOn(service, 'sendEmail').mockResolvedValue();

      await service.sendCancellationNotificationToAdmin(
        'admin@example.com',
        'reservation-123',
        'user@example.com'
      );

      expect(sendEmailSpy).toHaveBeenCalledWith(
        'admin@example.com',
        'Reservation Cancellation Notification',
        expect.stringContaining('reservation-123')
      );
    });
  });

  describe('sendRejectionNotificationToUser', () => {
    it('should send rejection notification to user', async () => {
      const sendEmailSpy = jest.spyOn(service, 'sendEmail').mockResolvedValue();

      await service.sendRejectionNotificationToUser(
        'user@example.com',
        'reservation-123'
      );

      expect(sendEmailSpy).toHaveBeenCalledWith(
        'user@example.com',
        'Reservation Rejected',
        expect.stringContaining('reservation-123')
      );
    });
  });
});
