// services/notifications/NotificationService.ts
import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
// Removed deprecated expo-permissions import
import { Platform } from 'react-native';
import { store } from '../../store/store';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});

export class NotificationService {
  private static instance: NotificationService;
  private pushToken: string | null = null;

  static getInstance(): NotificationService {
    if (!NotificationService.instance) {
      NotificationService.instance = new NotificationService();
    }
    return NotificationService.instance;
  }

  async initialize() {
    if (!Device.isDevice) {
      return false;
    }

    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;

    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }

    if (finalStatus !== 'granted') {
      return false;
    }

    const token = await this.registerForPushNotifications();
    this.pushToken = token;
    return true;
  }

  private async registerForPushNotifications() {
    try {
      const { data: token } = await Notifications.getExpoPushTokenAsync({
        projectId: 'your-project-id', // Replace with your Expo project ID
      });
      
      if (Platform.OS === 'android') {
        await this.setupAndroidChannel();
      }

      return token;
    } catch (error) {
      console.error('Failed to get push token:', error);
      return null;
    }
  }

  private async setupAndroidChannel() {
    await Notifications.setNotificationChannelAsync('default', {
      name: 'Default',
      importance: Notifications.AndroidImportance.MAX,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: '#FF231F7C',
    });
  }

  async scheduleLocalNotification(content: Notifications.NotificationContentInput, trigger?: Notifications.NotificationTriggerInput) {
    try {
      if (!trigger) {
        throw new Error('Notification trigger is undefined');
      }
      const id = await Notifications.scheduleNotificationAsync({
        content,
        trigger,
      });
      return id;
    } catch (error) {
      console.error('Failed to schedule notification:', error);
      return null;
    }
  }

  async handleNotificationResponse(response: Notifications.NotificationResponse) {
    const data = response.notification.request.content.data;
    // Handle notification response based on data
    switch (data.type) {
      case 'message':
        // Navigate to message screen
        break;
      case 'booking':
        // Navigate to booking screen
        break;
      // Add more cases as needed
    }
  }

  /**
   * Request permissions for notifications.
   */
  static async requestPermissions(): Promise<boolean> {
    const { status } = await Notifications.requestPermissionsAsync();
    return status === 'granted';
  }

  /**
   * Schedule a notification with customizable timing.
   * @param userId - The ID of the user to notify.
   * @param message - The notification message.
   * @param timeBeforeEvent - Time before the event in minutes to send the notification.
   */
  static async scheduleNotification(userId: string, message: string, timeBeforeEvent: number): Promise<void> {
    console.log(`Scheduling notification for user ${userId}: "${message}" ${timeBeforeEvent} minutes before the event.`);
    // Mock implementation: Replace with actual notification scheduling logic.
  }

  /**
   * Send an immediate notification.
   * @param userId - The ID of the user to notify.
   * @param message - The notification message.
   */
  static async sendNotification(userId: string, message: string): Promise<void> {
    console.log(`Sending immediate notification to user ${userId}: "${message}"`);
    // Mock implementation: Replace with actual notification sending logic.
  }

  /**
   * Send an in-app notification.
   * @param message - The message to display.
   */
  static sendInAppNotification(message: string): void {
    console.log(`In-App Notification: ${message}`);
  }

  /**
   * Send an email notification (mock implementation).
   * @param email - The recipient's email address.
   * @param subject - The subject of the email.
   * @param body - The body of the email.
   */
  static async sendEmailNotification(email: string, subject: string, body: string): Promise<void> {
    console.log(`Email sent to ${email} with subject: ${subject}`);
  }
}

export const notificationService = NotificationService.getInstance();