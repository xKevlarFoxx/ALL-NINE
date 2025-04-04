// services/analytics/AnalyticsService.ts
import Analytics from '@segment/analytics-react-native';
import { Platform } from 'react-native';

export enum AnalyticsEvent {
  VIEW_SCREEN = 'View Screen',
  USER_LOGIN = 'User Login',
  USER_SIGNUP = 'User Signup',
  CREATE_PROFILE = 'Create Profile',
  UPDATE_PROFILE = 'Update Profile',
  ADD_SERVICE = 'Add Service',
  BOOK_SERVICE = 'Book Service',
  LEAVE_REVIEW = 'Leave Review',
}

export class AnalyticsService {
  private static instance: AnalyticsService;
  private initialized: boolean = false;

  private constructor() {}

  static getInstance(): AnalyticsService {
    if (!AnalyticsService.instance) {
      AnalyticsService.instance = new AnalyticsService();
    }
    return AnalyticsService.instance;
  }

  async initialize(writeKey: string) {
    if (this.initialized) return;

    try {
      await Analytics.setup(writeKey, {
        recordScreenViews: true,
        trackAppLifecycleEvents: true,
      });
      this.initialized = true;
    } catch (error) {
      console.error('Failed to initialize analytics:', error);
    }
  }

  identify(userId: string, traits?: Record<string, any>) {
    if (!this.initialized) return;

    Analytics.identify(userId, {
      platform: Platform.OS,
      ...traits,
    });
  }

  track(event: AnalyticsEvent, properties?: Record<string, any>) {
    if (!this.initialized) return;

    Analytics.track(event, {
      timestamp: new Date().toISOString(),
      platform: Platform.OS,
      ...properties,
    });
  }

  screen(screenName: string, properties?: Record<string, any>) {
    if (!this.initialized) return;

    Analytics.screen(screenName, {
      timestamp: new Date().toISOString(),
      platform: Platform.OS,
      ...properties,
    });
  }
}

export const analyticsService = AnalyticsService.getInstance();