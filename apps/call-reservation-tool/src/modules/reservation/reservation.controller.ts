import {
  Controller,
  Get,
  Post,
  Put,
  Param,
  Body,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiBody,
} from '@nestjs/swagger';
import { ReservationService } from './reservation.service';
import { CreateReservationDto } from '../../shared/dto/create-reservation.dto';
import {
  UpdateReservationTimeDto,
  AdminActionDto,
} from '../../shared/dto/admin-action.dto';

/**
 * Reservation controller handling all reservation-related endpoints
 */
@ApiTags('reservations')
@Controller('reservation')
export class ReservationController {
  constructor(private readonly reservationService: ReservationService) {}

  /**
   * Create a new reservation
   */
  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create a new reservation' })
  @ApiBody({ type: CreateReservationDto })
  @ApiResponse({ status: 201, description: 'Reservation created successfully' })
  @ApiResponse({ status: 409, description: 'Time slot already reserved' })
  @ApiResponse({ status: 400, description: 'Invalid input data' })
  async createReservation(@Body() createReservationDto: CreateReservationDto) {
    const record = await this.reservationService.createReservation(
      createReservationDto
    );

    return {
      status: 'success',
      record: {
        id: record.id,
        reservationDate: record.reservationDate,
        startTime: record.startTime,
        email: record.email,
        phone: record.phone,
        pushNotificationKey: record.pushNotificationKey,
        endTime: record.endTime,
        status: record.status,
        createdTime: record.createdTime.toISOString(),
      },
    };
  }

  /**
   * Get all reservations
   */
  @Get()
  @ApiOperation({ summary: 'Get all reservations' })
  @ApiResponse({ status: 200, description: 'List of all reservations' })
  async getAllReservations() {
    const records = await this.reservationService.getAllReservations();

    return {
      records: records.map((record) => ({
        id: record.id,
        reservationDate: record.reservationDate,
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
   * Get a single reservation by ID
   */
  @Get(':id')
  @ApiOperation({ summary: 'Get a single reservation by ID' })
  @ApiParam({ name: 'id', description: 'Reservation ID' })
  @ApiResponse({ status: 200, description: 'Reservation found' })
  @ApiResponse({ status: 404, description: 'Reservation not found' })
  async getReservationById(@Param('id') id: string) {
    const record = await this.reservationService.getReservationById(id);

    return {
      id: record.id,
      reservationDate: record.reservationDate,
      startTime: record.startTime,
      email: record.email,
      phone: record.phone,
      pushNotificationKey: record.pushNotificationKey,
      endTime: record.endTime,
      status: record.status,
      createdTime: record.createdTime.toISOString(),
    };
  }

  /**
   * Cancel a reservation by user
   */
  @Put(':id/cancel')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Cancel a reservation by user' })
  @ApiParam({ name: 'id', description: 'Reservation ID' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        adminEmail: { type: 'string', format: 'email' },
      },
      required: ['adminEmail'],
    },
  })
  @ApiResponse({
    status: 200,
    description: 'Reservation cancelled successfully',
  })
  @ApiResponse({ status: 404, description: 'Reservation not found' })
  @ApiResponse({ status: 400, description: 'Cannot cancel reservation' })
  async cancelReservation(
    @Param('id') id: string,
    @Body('adminEmail') adminEmail: string
  ) {
    const record = await this.reservationService.cancelReservation(
      id,
      adminEmail
    );

    return {
      status: 'success',
      record: {
        id: record.id,
        reservationDate: record.reservationDate,
        startTime: record.startTime,
        email: record.email,
        phone: record.phone,
        pushNotificationKey: record.pushNotificationKey,
        endTime: record.endTime,
        status: record.status,
        createdTime: record.createdTime.toISOString(),
      },
    };
  }

  /**
   * Update reservation time
   */
  @Put(':id/time')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Update reservation time' })
  @ApiParam({ name: 'id', description: 'Reservation ID' })
  @ApiBody({ type: UpdateReservationTimeDto })
  @ApiResponse({
    status: 200,
    description: 'Reservation time updated successfully',
  })
  @ApiResponse({ status: 404, description: 'Reservation not found' })
  @ApiResponse({ status: 409, description: 'New time slot already reserved' })
  @ApiResponse({ status: 400, description: 'Cannot update reservation' })
  async updateReservationTime(
    @Param('id') id: string,
    @Body() updateDto: UpdateReservationTimeDto
  ) {
    const record = await this.reservationService.updateReservationTime(
      id,
      updateDto
    );

    return {
      status: 'success',
      record: {
        id: record.id,
        reservationDate: record.reservationDate,
        startTime: record.startTime,
        email: record.email,
        phone: record.phone,
        pushNotificationKey: record.pushNotificationKey,
        endTime: record.endTime,
        status: record.status,
        createdTime: record.createdTime.toISOString(),
      },
    };
  }

  /**
   * Admin action: accept or reject reservation
   */
  @Put(':id/admin-action')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Admin action: accept or reject reservation' })
  @ApiParam({ name: 'id', description: 'Reservation ID' })
  @ApiBody({ type: AdminActionDto })
  @ApiResponse({
    status: 200,
    description: 'Admin action completed successfully',
  })
  @ApiResponse({ status: 404, description: 'Reservation not found' })
  @ApiResponse({
    status: 400,
    description: 'Cannot perform action on reservation',
  })
  async adminAction(
    @Param('id') id: string,
    @Body() adminActionDto: AdminActionDto
  ) {
    const record = await this.reservationService.adminAction(
      id,
      adminActionDto.action
    );

    return {
      status: 'success',
      record: {
        id: record.id,
        reservationDate: record.reservationDate,
        startTime: record.startTime,
        email: record.email,
        phone: record.phone,
        pushNotificationKey: record.pushNotificationKey,
        endTime: record.endTime,
        status: record.status,
        createdTime: record.createdTime.toISOString(),
      },
    };
  }

  /**
   * Mark reservation as successful (internal endpoint)
   */
  @Put(':id/successful')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Mark reservation as successful' })
  @ApiParam({ name: 'id', description: 'Reservation ID' })
  @ApiResponse({ status: 200, description: 'Reservation marked as successful' })
  @ApiResponse({ status: 404, description: 'Reservation not found' })
  @ApiResponse({
    status: 400,
    description: 'Cannot mark reservation as successful',
  })
  async markReservationSuccessful(@Param('id') id: string) {
    const record = await this.reservationService.markReservationSuccessful(id);

    return {
      status: 'success',
      record: {
        id: record.id,
        reservationDate: record.reservationDate,
        startTime: record.startTime,
        email: record.email,
        phone: record.phone,
        pushNotificationKey: record.pushNotificationKey,
        endTime: record.endTime,
        status: record.status,
        createdTime: record.createdTime.toISOString(),
      },
    };
  }
}
