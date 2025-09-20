import {
  IsString,
  IsEmail,
  IsBoolean,
  Matches,
  IsNotEmpty,
  IsDateString,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

/**
 * DTO for creating a reservation
 */
export class CreateReservationDto {
  @ApiProperty({
    description: 'The date for the reservation in YYYY-MM-DD format',
    example: '2024-01-15',
  })
  @IsDateString()
  @IsNotEmpty()
  reservationDate: string;

  @ApiProperty({
    description: 'The time which call begins in HH:mm format (e.g., 13:15)',
    example: '13:15',
    pattern: '^([0-1]?\\d|2[0-3]):(00|15|30|45)$',
  })
  @IsString()
  @IsNotEmpty()
  @Matches(/^([0-1]?\d|2[0-3]):(00|15|30|45)$/, {
    message:
      'Start time must be in HH:mm format with minutes only 00, 15, 30, or 45',
  })
  startTime: string;

  @ApiProperty({
    description: 'User email address',
    example: 'user@example.com',
  })
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @ApiProperty({
    description: 'User phone number',
    example: '+1234567890',
  })
  @IsString()
  @IsNotEmpty()
  phone: string;

  @ApiProperty({
    description: 'Push notification key for the user',
    example: 'user-push-key-123',
  })
  @IsString()
  @IsNotEmpty()
  pushNotificationKey: string;

  @ApiProperty({
    description: 'Whether to send email notification 10 minutes before call',
    example: true,
  })
  @IsBoolean()
  receiveEmail: boolean;

  @ApiProperty({
    description: 'Whether to send SMS notification 5 minutes before call',
    example: true,
  })
  @IsBoolean()
  receiveSmsNotification: boolean;

  @ApiProperty({
    description: 'Whether to send push notification 1 minute before call',
    example: true,
  })
  @IsBoolean()
  receivePushNotification: boolean;
}
