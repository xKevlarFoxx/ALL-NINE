// services/notifications/NotificationService.ts
import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import { Platform } from 'react-native';
import { store } from '../../state/store';

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
}

export const notificationService = NotificationService.getInstance();