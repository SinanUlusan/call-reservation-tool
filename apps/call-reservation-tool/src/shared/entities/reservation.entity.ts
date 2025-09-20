import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { ReservationStatus } from '../enums/reservation-status.enum';

/**
 * Reservation entity representing a call reservation in the database
 */
@Entity('reservations')
export class Reservation {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 5 })
  startTime: string;

  @Column({ type: 'varchar', length: 5 })
  endTime: string;

  @Column({ type: 'varchar', length: 255 })
  email: string;

  @Column({ type: 'varchar', length: 20 })
  phone: string;

  @Column({ type: 'varchar', length: 255 })
  pushNotificationKey: string;

  @Column({ type: 'boolean', default: false })
  receiveEmail: boolean;

  @Column({ type: 'boolean', default: false })
  receiveSmsNotification: boolean;

  @Column({ type: 'boolean', default: false })
  receivePushNotification: boolean;

  @Column({
    type: 'varchar',
    length: 20,
    default: ReservationStatus.QUEUED,
  })
  status: ReservationStatus;

  @Column({ type: 'date' })
  reservationDate: string;

  @CreateDateColumn()
  createdTime: Date;

  @UpdateDateColumn()
  updatedTime: Date;

  /**
   * Calculate end time based on start time (assuming 30-minute calls)
   */
  static calculateEndTime(startTime: string): string {
    const [hours, minutes] = startTime.split(':').map(Number);
    const startMinutes = hours * 60 + minutes;
    const endMinutes = startMinutes + 30; // 30-minute call duration

    const endHours = Math.floor(endMinutes / 60);
    const endMins = endMinutes % 60;

    return `${endHours.toString().padStart(2, '0')}:${endMins
      .toString()
      .padStart(2, '0')}`;
  }

  /**
   * Get reservation date for today
   */
  static getTodayDate(): string {
    return new Date().toISOString().split('T')[0];
  }
}
