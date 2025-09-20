import { Injectable, Logger } from '@nestjs/common';

/**
 * Email notification service
 * Currently logs to console, but can be extended to integrate with actual email providers
 */
@Injectable()
export class EmailService {
  private readonly logger = new Logger(EmailService.name);

  /**
   * Send email notification to user
   * @param receiver Receiver's email address
   * @param subject Email subject
   * @param content Email content
   */
  async sendEmail(
    receiver: string,
    subject: string,
    content: string
  ): Promise<void> {
    this.logger.log(
      `Send Email to ${receiver}, subject: ${subject}, content: ${content}`
    );
    // TODO: Integrate with actual email provider (SendGrid, AWS SES, etc.)
  }

  /**
   * Send cancellation notification to admin
   * @param adminEmail Admin's email address
   * @param reservationId Reservation ID that was cancelled
   * @param userEmail User's email who cancelled
   */
  async sendCancellationNotificationToAdmin(
    adminEmail: string,
    reservationId: string,
    userEmail: string
  ): Promise<void> {
    const subject = 'Reservation Cancellation Notification';
    const content = `
      A reservation has been cancelled by the user.
      
      Reservation ID: ${reservationId}
      User Email: ${userEmail}
      Cancellation Time: ${new Date().toISOString()}
    `;

    await this.sendEmail(adminEmail, subject, content);
  }

  /**
   * Send rejection notification to user
   * @param userEmail User's email address
   * @param reservationId Reservation ID that was rejected
   */
  async sendRejectionNotificationToUser(
    userEmail: string,
    reservationId: string
  ): Promise<void> {
    const subject = 'Reservation Rejected';
    const content = `
      Your reservation has been rejected by our support team.
      
      Reservation ID: ${reservationId}
      Rejection Time: ${new Date().toISOString()}
      
      Please contact support if you have any questions.
    `;

    await this.sendEmail(userEmail, subject, content);
  }
}
