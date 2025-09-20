import { IsString, IsNotEmpty, IsEmail, Matches } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

/**
 * DTO for updating reservation time
 */
export class UpdateReservationTimeDto {
  @ApiProperty({
    description: 'New start time in HH:mm format (e.g., 14:30)',
    example: '14:30',
    pattern: '^([0-1]?[0-9]|2[0-3]):(00|15|30|45)$',
  })
  @IsString()
  @IsNotEmpty()
  @Matches(/^([0-1]?[0-9]|2[0-3]):(00|15|30|45)$/, {
    message:
      'Start time must be in HH:mm format with minutes only 00, 15, 30, or 45',
  })
  startTime: string;
}

/**
 * DTO for admin actions (accept/reject)
 */
export class AdminActionDto {
  @ApiProperty({
    description: 'Admin action to perform',
    enum: ['accept', 'reject'],
    example: 'accept',
  })
  @IsString()
  @IsNotEmpty()
  @Matches(/^(accept|reject)$/, {
    message: 'Action must be either "accept" or "reject"',
  })
  action: 'accept' | 'reject';

  @ApiProperty({
    description: 'Admin email for notifications',
    example: 'admin@example.com',
  })
  @IsEmail()
  @IsNotEmpty()
  adminEmail: string;
}
