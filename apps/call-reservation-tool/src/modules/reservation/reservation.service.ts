import {
  Injectable,
  Logger,
  ConflictException,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Reservation } from '../../shared/entities/reservation.entity';
import { ReservationStatus } from '../../shared/enums/reservation-status.enum';
import { CreateReservationDto } from '../../shared/dto/create-reservation.dto';
import { UpdateReservationTimeDto } from '../../shared/dto/admin-action.dto';
import { EmailService } from '../../shared/services/email.service';
import { SmsService } from '../../shared/services/sms.service';
import { PushNotificationService } from '../../shared/services/push-notification.service';

/**
 * Reservation service handling all reservation-related business logic
 */
@Injectable()
export class ReservationService {
  private readonly logger = new Logger(ReservationService.name);

  constructor(
    @InjectRepository(Reservation)
    private readonly reservationRepository: Repository<Reservation>,
    private readonly emailService: EmailService,
    private readonly smsService: SmsService,
    private readonly pushNotificationService: PushNotificationService
  ) {}

  /**
   * Create a new reservation
   */
  async createReservation(
    createReservationDto: CreateReservationDto
  ): Promise<Reservation> {
    const {
      reservationDate,
      startTime,
      email,
      phone,
      pushNotificationKey,
      receiveEmail,
      receiveSmsNotification,
      receivePushNotification,
    } = createReservationDto;

    // Calculate end time
    const endTime = Reservation.calculateEndTime(startTime);

    // Check if time slot is already taken
    const existingReservation = await this.reservationRepository.findOne({
      where: {
        startTime,
        reservationDate,
        status: ReservationStatus.QUEUED,
      },
    });

    if (existingReservation) {
      throw new ConflictException(
        `Time slot ${startTime} is already reserved for ${reservationDate}`
      );
    }

    // Create new reservation
    const reservation = this.reservationRepository.create({
      startTime,
      endTime,
      email,
      phone,
      pushNotificationKey,
      receiveEmail,
      receiveSmsNotification,
      receivePushNotification,
      reservationDate,
      status: ReservationStatus.QUEUED,
    });

    const savedReservation = await this.reservationRepository.save(reservation);
    this.logger.log(
      `Created reservation ${savedReservation.id} for ${email} at ${startTime}`
    );

    return savedReservation;
  }

  /**
   * Get all reservations
   */
  async getAllReservations(): Promise<Reservation[]> {
    return this.reservationRepository.find({
      order: {
        createdTime: 'DESC',
      },
    });
  }

  /**
   * Get a single reservation by ID
   */
  async getReservationById(id: string): Promise<Reservation> {
    const reservation = await this.reservationRepository.findOne({
      where: { id },
    });

    if (!reservation) {
      throw new NotFoundException(`Reservation with ID ${id} not found`);
    }

    return reservation;
  }

  /**
   * Cancel a reservation by user
   */
  async cancelReservation(
    id: string,
    adminEmail: string
  ): Promise<Reservation> {
    const reservation = await this.getReservationById(id);

    if (
      reservation.status !== ReservationStatus.QUEUED &&
      reservation.status !== ReservationStatus.ACCEPTED
    ) {
      throw new BadRequestException(
        `Cannot cancel reservation with status ${reservation.status}`
      );
    }

    reservation.status = ReservationStatus.CANCELLED;
    const updatedReservation = await this.reservationRepository.save(
      reservation
    );

    // Notify admin about cancellation
    await this.emailService.sendCancellationNotificationToAdmin(
      adminEmail,
      id,
      reservation.email
    );

    this.logger.log(`Reservation ${id} cancelled by user ${reservation.email}`);
    return updatedReservation;
  }

  /**
   * Update reservation time
   */
  async updateReservationTime(
    id: string,
    updateDto: UpdateReservationTimeDto
  ): Promise<Reservation> {
    const reservation = await this.getReservationById(id);

    if (
      reservation.status !== ReservationStatus.QUEUED &&
      reservation.status !== ReservationStatus.ACCEPTED
    ) {
      throw new BadRequestException(
        `Cannot update reservation with status ${reservation.status}`
      );
    }

    // Check if new time slot is available
    const existingReservation = await this.reservationRepository.findOne({
      where: {
        startTime: updateDto.startTime,
        reservationDate: reservation.reservationDate,
        status: ReservationStatus.QUEUED,
      },
    });

    if (existingReservation && existingReservation.id !== id) {
      throw new ConflictException(
        `Time slot ${updateDto.startTime} is already reserved`
      );
    }

    reservation.startTime = updateDto.startTime;
    reservation.endTime = Reservation.calculateEndTime(updateDto.startTime);

    const updatedReservation = await this.reservationRepository.save(
      reservation
    );
    this.logger.log(`Updated reservation ${id} time to ${updateDto.startTime}`);

    return updatedReservation;
  }

  /**
   * Admin action: accept or reject reservation
   */
  async adminAction(
    id: string,
    action: 'accept' | 'reject'
  ): Promise<Reservation> {
    const reservation = await this.getReservationById(id);

    if (reservation.status !== ReservationStatus.QUEUED) {
      throw new BadRequestException(
        `Cannot perform action on reservation with status ${reservation.status}`
      );
    }

    if (action === 'accept') {
      reservation.status = ReservationStatus.ACCEPTED;
      this.logger.log(`Reservation ${id} accepted by admin`);
    } else {
      reservation.status = ReservationStatus.REJECTED;

      // Notify user about rejection
      await this.emailService.sendRejectionNotificationToUser(
        reservation.email,
        id
      );

      this.logger.log(`Reservation ${id} rejected by admin`);
    }

    return await this.reservationRepository.save(reservation);
  }

  /**
   * Mark reservation as successful (called after call completion)
   */
  async markReservationSuccessful(id: string): Promise<Reservation> {
    const reservation = await this.getReservationById(id);

    if (
      reservation.status !== ReservationStatus.QUEUED &&
      reservation.status !== ReservationStatus.ACCEPTED
    ) {
      throw new BadRequestException(
        `Cannot mark reservation as successful with status ${reservation.status}`
      );
    }

    reservation.status = ReservationStatus.SUCCESSFUL;
    const updatedReservation = await this.reservationRepository.save(
      reservation
    );

    this.logger.log(`Reservation ${id} marked as successful`);
    return updatedReservation;
  }

  /**
   * Send reminder notifications based on reservation settings
   */
  async sendReminderNotifications(): Promise<void> {
    const today = Reservation.getTodayDate();
    const now = new Date();

    // Find reservations that need reminders
    const reservations = await this.reservationRepository.find({
      where: {
        reservationDate: today,
        status: ReservationStatus.QUEUED,
      },
    });

    for (const reservation of reservations) {
      const [startHour, startMinute] = reservation.startTime
        .split(':')
        .map(Number);
      const startTimeMinutes = startHour * 60 + startMinute;
      const currentTimeMinutes = now.getHours() * 60 + now.getMinutes();
      const minutesUntilCall = startTimeMinutes - currentTimeMinutes;

      // Send email reminder 10 minutes before
      if (reservation.receiveEmail && minutesUntilCall === 10) {
        await this.emailService.sendEmail(
          reservation.email,
          'Call Reminder - 10 minutes',
          `Your call is scheduled in 10 minutes at ${reservation.startTime}. Please be ready!`
        );
      }

      // Send SMS reminder 5 minutes before
      if (reservation.receiveSmsNotification && minutesUntilCall === 5) {
        await this.smsService.sendSms(
          reservation.phone,
          `Your call is scheduled in 5 minutes at ${reservation.startTime}. Please be ready!`
        );
      }

      // Send push notification 1 minute before
      if (reservation.receivePushNotification && minutesUntilCall === 1) {
        await this.pushNotificationService.sendCallReminder(
          reservation.pushNotificationKey,
          1
        );
      }
    }
  }
}
