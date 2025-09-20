import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';
import request from 'supertest';
import { ReservationController } from './reservation.controller';
import { ReservationService } from './reservation.service';
import { Reservation } from '../../shared/entities/reservation.entity';
import { ReservationStatus } from '../../shared/enums/reservation-status.enum';
import { EmailService } from '../../shared/services/email.service';
import { SmsService } from '../../shared/services/sms.service';
import { PushNotificationService } from '../../shared/services/push-notification.service';

describe('ReservationController (e2e)', () => {
  let app: INestApplication;
  let reservationService: ReservationService;

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

  const mockEmailService = {
    sendEmail: jest.fn(),
    sendCancellationNotificationToAdmin: jest.fn(),
    sendRejectionNotificationToUser: jest.fn(),
  };

  const mockSmsService = {
    sendSms: jest.fn(),
  };

  const mockPushNotificationService = {
    sendPushNotification: jest.fn(),
    sendCallReminder: jest.fn(),
  };

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [
        ConfigModule.forRoot({
          isGlobal: true,
        }),
        TypeOrmModule.forRoot({
          type: 'sqlite',
          database: ':memory:',
          entities: [Reservation],
          synchronize: true,
        }),
        TypeOrmModule.forFeature([Reservation]),
      ],
      controllers: [ReservationController],
      providers: [
        ReservationService,
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

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
      })
    );

    reservationService =
      moduleFixture.get<ReservationService>(ReservationService);

    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('POST /api/reservation', () => {
    const createReservationDto = {
      startTime: '13:15',
      email: 'test@example.com',
      phone: '+1234567890',
      pushNotificationKey: 'test-push-key',
      receiveEmail: true,
      receiveSmsNotification: true,
      receivePushNotification: true,
    };

    it('should create a reservation successfully', async () => {
      jest
        .spyOn(reservationService, 'createReservation')
        .mockResolvedValue(mockReservation as unknown as Reservation);

      const response = await request(app.getHttpServer())
        .post('/api/reservation')
        .send(createReservationDto)
        .expect(201);

      expect(response.body.status).toBe('success');
      expect(response.body.record).toBeDefined();
      expect(response.body.record.email).toBe('test@example.com');
    });

    it('should return 400 for invalid start time', async () => {
      const invalidDto = {
        ...createReservationDto,
        startTime: '13:20', // Invalid minute
      };

      await request(app.getHttpServer())
        .post('/api/reservation')
        .send(invalidDto)
        .expect(400);
    });

    it('should return 400 for invalid email', async () => {
      const invalidDto = {
        ...createReservationDto,
        email: 'invalid-email',
      };

      await request(app.getHttpServer())
        .post('/api/reservation')
        .send(invalidDto)
        .expect(400);
    });
  });

  describe('GET /api/reservation', () => {
    it('should return all reservations', async () => {
      jest
        .spyOn(reservationService, 'getAllReservations')
        .mockResolvedValue([mockReservation] as unknown as Reservation[]);

      const response = await request(app.getHttpServer())
        .get('/api/reservation')
        .expect(200);

      expect(response.body.records).toBeDefined();
      expect(Array.isArray(response.body.records)).toBe(true);
    });
  });

  describe('GET /api/reservation/:id', () => {
    it('should return a reservation by id', async () => {
      jest
        .spyOn(reservationService, 'getReservationById')
        .mockResolvedValue(mockReservation as unknown as Reservation);

      const response = await request(app.getHttpServer())
        .get('/api/reservation/test-id')
        .expect(200);

      expect(response.body.id).toBe('test-id');
      expect(response.body.email).toBe('test@example.com');
    });

    it('should return 404 for non-existent reservation', async () => {
      jest
        .spyOn(reservationService, 'getReservationById')
        .mockRejectedValue(new Error('Not found'));

      await request(app.getHttpServer())
        .get('/api/reservation/non-existent')
        .expect(500);
    });
  });

  describe('PUT /api/reservation/:id/cancel', () => {
    it('should cancel a reservation successfully', async () => {
      const cancelledReservation = {
        ...mockReservation,
        status: ReservationStatus.CANCELLED,
      };
      jest
        .spyOn(reservationService, 'cancelReservation')
        .mockResolvedValue(cancelledReservation as unknown as Reservation);

      const response = await request(app.getHttpServer())
        .put('/api/reservation/test-id/cancel')
        .send({ adminEmail: 'admin@example.com' })
        .expect(200);

      expect(response.body.status).toBe('success');
      expect(response.body.record.status).toBe(ReservationStatus.CANCELLED);
    });
  });

  describe('PUT /api/reservation/:id/time', () => {
    it('should update reservation time successfully', async () => {
      const updatedReservation = {
        ...mockReservation,
        startTime: '14:30',
        endTime: '15:00',
      };
      jest
        .spyOn(reservationService, 'updateReservationTime')
        .mockResolvedValue(updatedReservation as unknown as Reservation);

      const response = await request(app.getHttpServer())
        .put('/api/reservation/test-id/time')
        .send({ startTime: '14:30' })
        .expect(200);

      expect(response.body.status).toBe('success');
      expect(response.body.record.startTime).toBe('14:30');
    });
  });

  describe('PUT /api/reservation/:id/admin-action', () => {
    it('should accept a reservation', async () => {
      const acceptedReservation = {
        ...mockReservation,
        status: ReservationStatus.ACCEPTED,
      };
      jest
        .spyOn(reservationService, 'adminAction')
        .mockResolvedValue(acceptedReservation as unknown as Reservation);

      const response = await request(app.getHttpServer())
        .put('/api/reservation/test-id/admin-action')
        .send({
          action: 'accept',
          adminEmail: 'admin@example.com',
        })
        .expect(200);

      expect(response.body.status).toBe('success');
      expect(response.body.record.status).toBe(ReservationStatus.ACCEPTED);
    });

    it('should reject a reservation', async () => {
      const rejectedReservation = {
        ...mockReservation,
        status: ReservationStatus.REJECTED,
      };
      jest
        .spyOn(reservationService, 'adminAction')
        .mockResolvedValue(rejectedReservation as unknown as Reservation);

      const response = await request(app.getHttpServer())
        .put('/api/reservation/test-id/admin-action')
        .send({
          action: 'reject',
          adminEmail: 'admin@example.com',
        })
        .expect(200);

      expect(response.body.status).toBe('success');
      expect(response.body.record.status).toBe(ReservationStatus.REJECTED);
    });
  });
});
