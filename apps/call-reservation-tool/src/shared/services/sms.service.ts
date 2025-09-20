import { Injectable, Logger } from '@nestjs/common';

/**
 * SMS notification service
 * Currently logs to console, but can be extended to integrate with actual SMS providers
 */
@Injectable()
export class SmsService {
  private readonly logger = new Logger(SmsService.name);

  /**
   * Send SMS notification to user
   * @param receiver Receiver's phone number
   * @param content Text content of SMS message
   */
  async sendSms(receiver: string, content: string): Promise<void> {
    this.logger.log(`Send SMS to ${receiver}, content: ${content}`);
    // TODO: Integrate with actual SMS provider (Twilio, AWS SNS, etc.)
  }
}
