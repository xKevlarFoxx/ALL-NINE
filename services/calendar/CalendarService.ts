import { Platform } from 'react-native';
import * as Calendar from 'expo-calendar';

export class CalendarService {
  /**
   * Request permissions to access the device's calendar.
   */
  static async requestCalendarPermissions(): Promise<boolean> {
    const { status } = await Calendar.requestCalendarPermissionsAsync();
    return status === 'granted';
  }

  /**
   * Create a new calendar for the app if it doesn't already exist.
   */
  static async createAppCalendar(): Promise<string | null> {
    if (Platform.OS === 'ios') {
      const calendars = await Calendar.getCalendarsAsync(Calendar.EntityTypes.EVENT);
      const existingCalendar = calendars.find(cal => cal.title === 'ALL-NINE App');
      if (existingCalendar) return existingCalendar.id;

      const defaultCalendarSource = calendars.find(cal => cal.source && cal.source.name === 'Default');
      const newCalendarId = await Calendar.createCalendarAsync({
        title: 'ALL-NINE App',
        color: '#2196F3',
        entityType: Calendar.EntityTypes.EVENT,
        sourceId: defaultCalendarSource?.source.id,
        source: defaultCalendarSource?.source,
        name: 'ALL-NINE App',
        ownerAccount: 'personal',
        accessLevel: Calendar.CalendarAccessLevel.OWNER,
      });
      return newCalendarId;
    }
    return null;
  }

  /**
   * Add an event to the app's calendar.
   * @param title - The title of the event.
   * @param startDate - The start date of the event.
   * @param endDate - The end date of the event.
   */
  static async addEventToCalendar(title: string, startDate: Date, endDate: Date): Promise<string | null> {
    const calendarId = await this.createAppCalendar();
    if (!calendarId) return null;

    const eventId = await Calendar.createEventAsync(calendarId, {
      title,
      startDate,
      endDate,
      timeZone: 'GMT',
      location: 'TBD',
    });
    return eventId;
  }
}