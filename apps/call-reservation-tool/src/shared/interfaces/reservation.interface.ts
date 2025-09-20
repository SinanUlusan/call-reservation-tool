import { ReservationStatus } from '../enums/reservation-status.enum';

/**
 * Request interface for creating a reservation
 */
export interface CreateReservationRequest {
  /**
   * The date for the reservation in YYYY-MM-DD format
   */
  reservationDate: string;

  /**
   * The time which call begins,
   * it should be in HH:mm format, Sample: '13:15'
   * for the minute part only 00, 15, 30, 45 values are acceptable (one call each 15 minutes)
   *
   * Start time is unique for each day,
   * If a user reserves a start time, another shouldn't be able to reserve an appointment for that time
   */
  startTime: string;

  email: string;
  phone: string;

  /**
   * This ID is generated for user by another micro-service,
   * In order to send a push notification to user, developer should put a message on RabbitMQ containing this id and message content
   */
  pushNotificationKey: string;

  /**
   * If true, 10 minute before call an email should be sent to the user
   */
  receiveEmail: boolean;

  /**
   * If true, 5 minute before call an SMS should be sent to the user's phone
   */
  receiveSmsNotification: boolean;

  /**
   * If true, one minute before call a push notification should be sent to the user
   */
  receivePushNotification: boolean;
}

/**
 * Response interface for getting a single reservation
 */
export interface GetSingleReservationResponse {
  id: string;
  reservationDate: string;
  startTime: string;
  email: string;
  phone: string;
  pushNotificationKey: string;
  endTime: string;
  status: ReservationStatus;

  /**
   * Time of creating this record in database
   */
  createdTime: string;
}

/**
 * Response interface for creating a reservation
 */
export interface CreateReservationResponse {
  status: 'success' | 'error';

  record: GetSingleReservationResponse;

  /**
   * Only in case of error status, return the error in this field
   */
  message?: string;
}

/**
 * Response interface for getting all reservations
 */
export interface GetReservationsResponse {
  records: GetSingleReservationResponse[];
}
