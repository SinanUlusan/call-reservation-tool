import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import {
  ConflictException,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { ReservationService } from './reservation.service';
import { Reservation } from '../../shared/entities/reservation.entity';
import { ReservationStatus } from '../../shared/enums/reservation-status.enum';
import { EmailService } from '../../shared/services/email.service';
import { SmsService } from '../../shared/services/sms.service';
import { PushNotificationService } from '../../shared/services/push-notification.service';

describe('ReservationService', () => {
  let service: ReservationService;

  const mockRepository = {
    create: jest.fn(),
    save: jest.fn(),
    find: jest.fn(),
    findOne: jest.fn(),
  };

  const mockEmailService = {
    sendEmail: jest.fn(),
    sendCancellationNotificationToAdmin: jest.fn(),
    sendCancellationNotificationToUser: jest.fn(),
    sendRejectionNotificationToUser: jest.fn(),
  };

  const mockSmsService = {
    sendSms: jest.fn(),
  };

  const mockPushNotificationService = {
    sendPushNotification: jest.fn(),
    sendCallReminder: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ReservationService,
        {
          provide: getRepositoryToken(Reservation),
          useValue: mockRepository,
        },
        {
          provide: EmailService,
          useValue: mockEmailService,
        },
        {
          provide: SmsService,
          useValue: mockSmsService,
        },
        {
          provide: PushNotificationService,
          useValue: mockPushNotificationService,
        },
      ],
    }).compile();

    service = module.get<ReservationService>(ReservationService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('createReservation', () => {
    const createDto = {
      reservationDate: '2024-01-15',
      startTime: '13:15',
      email: 'test@example.com',
      phone: '+1234567890',
      pushNotificationKey: 'test-push-key',
      receiveEmail: true,
      receiveSmsNotification: true,
      receivePushNotification: true,
    };

    it('should create a reservation successfully', async () => {
      const mockReservation = {
        id: 'test-id',
        startTime: '13:15',
        endTime: '13:45',
        email: 'test@example.com',
        phone: '+1234567890',
        pushNotificationKey: 'test-push-key',
        receiveEmail: true,
        receiveSmsNotification: true,
        receivePushNotification: true,
        status: ReservationStatus.QUEUED,
        reservationDate: '2024-01-01',
        createdTime: new Date(),
        updatedTime: new Date(),
      };

      mockRepository.findOne.mockResolvedValue(null);
      mockRepository.create.mockReturnValue(mockReservation);
      mockRepository.save.mockResolvedValue(mockReservation);

      const result = await service.createReservation(createDto);

      expect(mockRepository.findOne).toHaveBeenCalledWith({
        where: {
          startTime: '13:15',
          reservationDate: '2024-01-15',
          status: ReservationStatus.QUEUED,
        },
      });
      expect(mockRepository.create).toHaveBeenCalled();
      expect(mockRepository.save).toHaveBeenCalled();
      expect(result).toEqual(mockReservation);
    });

    it('should throw ConflictException when time slot is already taken', async () => {
      const existingReservation = {
        id: 'existing-id',
        startTime: '13:15',
        status: ReservationStatus.QUEUED,
      };
      mockRepository.findOne.mockResolvedValue(existingReservation);

      await expect(service.createReservation(createDto)).rejects.toThrow(
        ConflictException
      );
      expect(mockRepository.findOne).toHaveBeenCalled();
      expect(mockRepository.create).not.toHaveBeenCalled();
    });
  });

  describe('getAllReservations', () => {
    it('should return all reservations', async () => {
      const reservations = [
        {
          id: 'test-id',
          startTime: '13:15',
          status: ReservationStatus.QUEUED,
        },
      ];
      mockRepository.find.mockResolvedValue(reservations);

      const result = await service.getAllReservations();

      expect(mockRepository.find).toHaveBeenCalledWith({
        order: {
          createdTime: 'DESC',
        },
      });
      expect(result).toEqual(reservations);
    });
  });

  describe('getReservationById', () => {
    it('should return a reservation by id', async () => {
      const mockReservation = {
        id: 'test-id',
        startTime: '13:15',
        status: ReservationStatus.QUEUED,
      };
      mockRepository.findOne.mockResolvedValue(mockReservation);

      const result = await service.getReservationById('test-id');

      expect(mockRepository.findOne).toHaveBeenCalledWith({
        where: { id: 'test-id' },
      });
      expect(result).toEqual(mockReservation);
    });

    it('should throw NotFoundException when reservation not found', async () => {
      mockRepository.findOne.mockResolvedValue(null);

      await expect(service.getReservationById('non-existent')).rejects.toThrow(
        NotFoundException
      );
    });
  });

  describe('cancelReservation', () => {
    it('should cancel a reservation successfully', async () => {
      const mockReservation = {
        id: 'test-id',
        email: 'test@example.com',
        status: ReservationStatus.QUEUED,
      };
      const updatedReservation = {
        ...mockReservation,
        status: ReservationStatus.CANCELLED,
      };

      mockRepository.findOne.mockResolvedValue(mockReservation);
      mockRepository.save.mockResolvedValue(updatedReservation);

      const result = await service.cancelReservation(
        'test-id',
        'admin@example.com'
      );

      expect(mockRepository.save).toHaveBeenCalledWith({
        ...mockReservation,
        status: ReservationStatus.CANCELLED,
      });
      expect(
        mockEmailService.sendCancellationNotificationToAdmin
      ).toHaveBeenCalledWith(
        'admin@example.com',
        'test-id',
        'test@example.com'
      );
      expect(result).toEqual(updatedReservation);
    });

    it('should throw BadRequestException when reservation is not QUEUED', async () => {
      const cancelledReservation = {
        id: 'test-id',
        status: ReservationStatus.CANCELLED,
      };
      mockRepository.findOne.mockResolvedValue(cancelledReservation);

      await expect(
        service.cancelReservation('test-id', 'admin@example.com')
      ).rejects.toThrow(BadRequestException);
    });

    it('should allow cancelling ACCEPTED reservation', async () => {
      const acceptedReservation = {
        id: 'test-id',
        status: ReservationStatus.ACCEPTED,
        email: 'test@example.com',
      };
      const cancelledReservation = {
        ...acceptedReservation,
        status: ReservationStatus.CANCELLED,
      };

      mockRepository.findOne.mockResolvedValue(acceptedReservation);
      mockRepository.save.mockResolvedValue(cancelledReservation);
      mockEmailService.sendCancellationNotificationToAdmin.mockResolvedValue(
        undefined
      );

      const result = await service.cancelReservation(
        'test-id',
        'admin@example.com'
      );

      expect(mockRepository.save).toHaveBeenCalledWith({
        ...acceptedReservation,
        status: ReservationStatus.CANCELLED,
      });
      expect(
        mockEmailService.sendCancellationNotificationToAdmin
      ).toHaveBeenCalledWith(
        'admin@example.com',
        'test-id',
        'test@example.com'
      );
      expect(result).toEqual(cancelledReservation);
    });
  });

  describe('updateReservationTime', () => {
    const updateDto = { startTime: '14:30' };

    it('should update reservation time successfully', async () => {
      const mockReservation = {
        id: 'test-id',
        startTime: '13:15',
        status: ReservationStatus.QUEUED,
        reservationDate: '2024-01-01',
      };
      const updatedReservation = {
        ...mockReservation,
        startTime: '14:30',
        endTime: '15:00',
      };

      mockRepository.findOne.mockResolvedValueOnce(mockReservation);
      mockRepository.findOne.mockResolvedValueOnce(null);
      mockRepository.save.mockResolvedValue(updatedReservation);

      const result = await service.updateReservationTime('test-id', updateDto);

      expect(mockRepository.save).toHaveBeenCalledWith({
        ...mockReservation,
        startTime: '14:30',
        endTime: '15:00',
      });
      expect(result).toEqual(updatedReservation);
    });

    it('should throw ConflictException when new time slot is taken', async () => {
      const mockReservation = {
        id: 'test-id',
        startTime: '13:15',
        status: ReservationStatus.QUEUED,
        reservationDate: '2024-01-01',
      };

      mockRepository.findOne.mockResolvedValueOnce(mockReservation);
      mockRepository.findOne.mockResolvedValueOnce({
        ...mockReservation,
        id: 'other-id',
      });

      await expect(
        service.updateReservationTime('test-id', updateDto)
      ).rejects.toThrow(ConflictException);
    });

    it('should allow updating ACCEPTED reservation time', async () => {
      const acceptedReservation = {
        id: 'test-id',
        startTime: '13:15',
        status: ReservationStatus.ACCEPTED,
        reservationDate: '2024-01-01',
      };
      const updatedReservation = {
        ...acceptedReservation,
        startTime: '14:30',
        endTime: '15:00',
      };

      mockRepository.findOne.mockResolvedValueOnce(acceptedReservation);
      mockRepository.findOne.mockResolvedValueOnce(null);
      mockRepository.save.mockResolvedValue(updatedReservation);

      const result = await service.updateReservationTime('test-id', updateDto);

      expect(mockRepository.save).toHaveBeenCalledWith({
        ...acceptedReservation,
        startTime: '14:30',
        endTime: '15:00',
      });
      expect(result).toEqual(updatedReservation);
    });
  });

  describe('adminAction', () => {
    it('should accept a reservation', async () => {
      const mockReservation = {
        id: 'test-id',
        status: ReservationStatus.QUEUED,
      };
      const acceptedReservation = {
        ...mockReservation,
        status: ReservationStatus.ACCEPTED,
      };

      mockRepository.findOne.mockResolvedValue(mockReservation);
      mockRepository.save.mockResolvedValue(acceptedReservation);

      const result = await service.adminAction('test-id', 'accept');

      expect(mockRepository.save).toHaveBeenCalledWith({
        ...mockReservation,
        status: ReservationStatus.ACCEPTED,
      });
      expect(result).toEqual(acceptedReservation);
    });

    it('should reject a reservation and notify user', async () => {
      const mockReservation = {
        id: 'test-id',
        email: 'test@example.com',
        status: ReservationStatus.QUEUED,
      };
      const rejectedReservation = {
        ...mockReservation,
        status: ReservationStatus.REJECTED,
      };

      mockRepository.findOne.mockResolvedValue(mockReservation);
      mockRepository.save.mockResolvedValue(rejectedReservation);

      const result = await service.adminAction('test-id', 'reject');

      expect(mockRepository.save).toHaveBeenCalledWith({
        ...mockReservation,
        status: ReservationStatus.REJECTED,
      });
      expect(
        mockEmailService.sendRejectionNotificationToUser
      ).toHaveBeenCalledWith('test@example.com', 'test-id');
      expect(result).toEqual(rejectedReservation);
    });
  });

  describe('markReservationSuccessful', () => {
    it('should mark reservation as successful', async () => {
      const mockReservation = {
        id: 'test-id',
        status: ReservationStatus.QUEUED,
      };
      const successfulReservation = {
        ...mockReservation,
        status: ReservationStatus.SUCCESSFUL,
      };

      mockRepository.findOne.mockResolvedValue(mockReservation);
      mockRepository.save.mockResolvedValue(successfulReservation);

      const result = await service.markReservationSuccessful('test-id');

      expect(mockRepository.save).toHaveBeenCalledWith({
        ...mockReservation,
        status: ReservationStatus.SUCCESSFUL,
      });
      expect(result).toEqual(successfulReservation);
    });

    it('should mark ACCEPTED reservation as successful', async () => {
      const acceptedReservation = {
        id: 'test-id',
        status: ReservationStatus.ACCEPTED,
      };
      const successfulReservation = {
        ...acceptedReservation,
        status: ReservationStatus.SUCCESSFUL,
      };

      mockRepository.findOne.mockResolvedValue(acceptedReservation);
      mockRepository.save.mockResolvedValue(successfulReservation);

      const result = await service.markReservationSuccessful('test-id');

      expect(mockRepository.save).toHaveBeenCalledWith({
        ...acceptedReservation,
        status: ReservationStatus.SUCCESSFUL,
      });
      expect(result).toEqual(successfulReservation);
    });
  });
});
