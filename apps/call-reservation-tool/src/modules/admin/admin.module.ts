import { Module } from '@nestjs/common';
import { AdminController } from './admin.controller';
import { ReservationModule } from '../reservation/reservation.module';

/**
 * Admin module for admin-specific functionality
 */
@Module({
  imports: [ReservationModule],
  controllers: [AdminController],
})
export class AdminModule {}
