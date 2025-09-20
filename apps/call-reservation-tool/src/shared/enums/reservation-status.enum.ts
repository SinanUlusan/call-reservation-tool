/**
 * Reservation status enum
 * Defines all possible states of a reservation
 */
export enum ReservationStatus {
  /**
   * Waiting for the reservation time
   */
  QUEUED = 'QUEUED',

  /**
   * Reservation time passed successfully
   */
  SUCCESSFUL = 'SUCCESSFUL',

  /**
   * Reservation cancelled by user
   */
  CANCELLED = 'CANCELLED',

  /**
   * Reservation rejected by admin
   */
  REJECTED = 'REJECTED',

  /**
   * Reservation accepted by admin
   */
  ACCEPTED = 'ACCEPTED',
}
