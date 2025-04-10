// services/analytics/AnalyticsService.ts
import { createClient } from '@segment/analytics-react-native';
import { Platform } from 'react-native';
import mixpanel from 'mixpanel-browser';
import { writeFileSync } from 'fs';
import { jsPDF } from 'jspdf';

// Ensure the required modules are installed
// Note: Run `npm install @segment/analytics-react-native jspdf` to resolve missing modules.

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
  private analyticsClient = createClient();

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
      await this.analyticsClient.setup(writeKey, {
        recordScreenViews: true,
        trackAppLifecycleEvents: true,
      });
      mixpanel.init('YOUR_MIXPANEL_PROJECT_TOKEN');
      this.initialized = true;
    } catch (error) {
      console.error('Failed to initialize analytics:', error);
    }
  }

  async identify(userId: string, traits?: Record<string, any>) {
    if (!this.initialized) return;

    await this.analyticsClient.identify({
      userId,
      traits: {
        platform: Platform.OS,
        ...traits,
      },
    });

    mixpanel.identify(userId);
    if (traits) {
      mixpanel.people.set(traits);
    }
  }

  async track(event: AnalyticsEvent, properties?: Record<string, any>) {
    if (!this.initialized) return;

    await this.analyticsClient.track({
      event,
      properties: {
        timestamp: new Date().toISOString(),
        platform: Platform.OS,
        ...properties,
      },
    });

    mixpanel.track(event, properties);
  }

  async screen(screenName: string, properties?: Record<string, any>) {
    if (!this.initialized) return;

    await this.analyticsClient.screen({
      name: screenName,
      properties: {
        timestamp: new Date().toISOString(),
        platform: Platform.OS,
        ...properties,
      },
    });
  }

  /**
   * Export analytics data to a CSV file.
   * @param data - The analytics data to export.
   * @param filePath - The file path to save the CSV.
   */
  static exportToCSV(data: Array<Record<string, any>>, filePath: string): void {
    const headers = Object.keys(data[0]).join(',');
    const rows = data.map(row => Object.values(row).join(','));
    const csvContent = [headers, ...rows].join('\n');

    writeFileSync(filePath, csvContent);
    console.log(`CSV exported to ${filePath}`);
  }

  /**
   * Export analytics data to a PDF file.
   * @param data - The analytics data to export.
   * @param filePath - The file path to save the PDF.
   */
  static exportToPDF(data: Array<Record<string, any>>, filePath: string): void {
    const doc = new jsPDF();
    let y = 10;

    data.forEach((row, index) => {
      const rowText = Object.values(row).join(' | ');
      doc.text(rowText, 10, y);
      y += 10;

      if (y > 280) {
        doc.addPage();
        y = 10;
      }
    });

    doc.save(filePath);
    console.log(`PDF exported to ${filePath}`);
  }
}

export const analyticsService = AnalyticsService.getInstance();