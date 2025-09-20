import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ReservationController } from './reservation.controller';
import { ReservationService } from './reservation.service';
import { Reservation } from '../../shared/entities/reservation.entity';
import { EmailService } from '../../shared/services/email.service';
import { SmsService } from '../../shared/services/sms.service';
import { PushNotificationService } from '../../shared/services/push-notification.service';

/**
 * Reservation module containing all reservation-related functionality
 */
@Module({
  imports: [TypeOrmModule.forFeature([Reservation])],
  controllers: [ReservationController],
  providers: [
    ReservationService,
    EmailService,
    SmsService,
    PushNotificationService,
  ],
  exports: [ReservationService],
})
export class ReservationModule {}
