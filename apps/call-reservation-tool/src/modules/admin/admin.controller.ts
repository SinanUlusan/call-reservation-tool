import { Controller, Get, Put, HttpCode, HttpStatus } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { ReservationService } from '../reservation/reservation.service';

/**
 * Admin controller for admin-specific operations
 */
@ApiTags('admin')
@Controller('admin')
export class AdminController {
  constructor(private readonly reservationService: ReservationService) {}

  /**
   * Get all reservations for admin view
   */
  @Get('reservations')
  @ApiOperation({ summary: 'Get all reservations for admin' })
  @ApiResponse({ status: 200, description: 'List of all reservations' })
  async getAllReservations() {
    return this.reservationService.getAllReservations();
  }

  /**
   * Get pending reservations (QUEUED status)
   */
  @Get('reservations/pending')
  @ApiOperation({ summary: 'Get pending reservations' })
  @ApiResponse({ status: 200, description: 'List of pending reservations' })
  async getPendingReservations() {
    const allReservations = await this.reservationService.getAllReservations();
    const pendingReservations = allReservations.filter(
      (reservation) => reservation.status === 'QUEUED'
    );

    return {
      records: pendingReservations.map((record) => ({
        id: record.id,
        startTime: record.startTime,
        email: record.email,
        phone: record.phone,
        pushNotificationKey: record.pushNotificationKey,
        endTime: record.endTime,
        status: record.status,
        createdTime: record.createdTime.toISOString(),
      })),
    };
  }

  /**
   * Send reminder notifications (admin can trigger manually)
   */
  @Put('send-reminders')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Send reminder notifications' })
  @ApiResponse({ status: 200, description: 'Reminder notifications sent' })
  async sendReminderNotifications() {
    await this.reservationService.sendReminderNotifications();
    return {
      status: 'success',
      message: 'Reminder notifications sent successfully',
    };
  }
}
