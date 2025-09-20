import { Injectable, Logger } from '@nestjs/common';
import {
  ClientProxy,
  ClientProxyFactory,
  Transport,
} from '@nestjs/microservices';

/**
 * Push notification service using RabbitMQ
 * Sends push notifications via message queue
 */
@Injectable()
export class PushNotificationService {
  private readonly logger = new Logger(PushNotificationService.name);
  private client: ClientProxy;

  constructor() {
    this.client = ClientProxyFactory.create({
      transport: Transport.RMQ,
      options: {
        urls: [process.env.RABBITMQ_URL || 'amqp://localhost:5672'],
        queue: 'push_notifications',
        queueOptions: {
          durable: false,
        },
      },
    });
  }

  /**
   * Send push notification to user
   * @param pushNotificationKey User's push notification key
   * @param title Notification title
   * @param content Notification content
   */
  async sendPushNotification(
    pushNotificationKey: string,
    title: string,
    content: string
  ): Promise<void> {
    const message = {
      pushNotificationKey,
      title,
      content,
      timestamp: new Date().toISOString(),
    };

    this.logger.log(
      `Send Push Notification to ${pushNotificationKey}, title: ${title}, content: ${content}`
    );

    try {
      await this.client.emit('push_notification', message);
    } catch (error) {
      this.logger.error('Failed to send push notification', error);
      // Fallback to console log if RabbitMQ is not available
      console.log(`Push notification message: ${JSON.stringify(message)}`);
    }
  }

  /**
   * Send reminder notification before call
   * @param pushNotificationKey User's push notification key
   * @param minutesBeforeCall Minutes before the call
   */
  async sendCallReminder(
    pushNotificationKey: string,
    minutesBeforeCall: number
  ): Promise<void> {
    const title = 'Call Reminder';
    const content = `Your call is scheduled in ${minutesBeforeCall} minute(s). Please be ready!`;

    await this.sendPushNotification(pushNotificationKey, title, content);
  }
}
