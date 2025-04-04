// utils/date/dateUtils.ts
import {
    format,
    formatDistance,
    formatRelative,
    differenceInDays,
    differenceInHours,
    differenceInMinutes,
    isValid,
    parse,
  } from 'date-fns';
  
  export class DateUtils {
    static formatDate(date: Date | string, formatString: string = 'PP'): string {
      try {
        const dateObj = typeof date === 'string' ? new Date(date) : date;
        if (!isValid(dateObj)) {
          throw new Error('Invalid date');
        }
        return format(dateObj, formatString);
      } catch (error) {
        console.error('Date formatting error:', error);
        return 'Invalid date';
      }
    }
  
    static getRelativeTime(date: Date | string): string {
      try {
        const dateObj = typeof date === 'string' ? new Date(date) : date;
        if (!isValid(dateObj)) {
          throw new Error('Invalid date');
        }
        return formatDistance(dateObj, new Date(), { addSuffix: true });
      } catch (error) {
        console.error('Relative time error:', error);
        return 'Invalid date';
      }
    }
  
    static getTimeDifference(
      startDate: Date | string,
      endDate: Date | string
    ): string {
      try {
        const start = typeof startDate === 'string' ? new Date(startDate) : startDate;
        const end = typeof endDate === 'string' ? new Date(endDate) : endDate;
  
        if (!isValid(start) || !isValid(end)) {
          throw new Error('Invalid date');
        }
  
        const days = differenceInDays(end, start);
        if (days > 0) {
          return `${days} day${days === 1 ? '' : 's'}`;
        }
  
        const hours = differenceInHours(end, start);
        if (hours > 0) {
          return `${hours} hour${hours === 1 ? '' : 's'}`;
        }
  
        const minutes = differenceInMinutes(end, start);
        return `${minutes} minute${minutes === 1 ? '' : 's'}`;
      } catch (error) {
        console.error('Time difference error:', error);
        return 'Invalid time range';
      }
    }
  
    static parseDate(
      dateString: string,
      formatString: string,
      referenceDate: Date = new Date()
    ): Date | null {
      try {
        const parsedDate = parse(dateString, formatString, referenceDate);
        return isValid(parsedDate) ? parsedDate : null;
      } catch (error) {
        console.error('Date parsing error:', error);
        return null;
      }
    }
  
    static isValidDate(date: any): boolean {
      if (!date) return false;
      const dateObj = typeof date === 'string' ? new Date(date) : date;
      return isValid(dateObj);
    }
  
    static formatTimeRange(
      startTime: Date | string,
      endTime: Date | string
    ): string {
      try {
        const start = typeof startTime === 'string' ? new Date(startTime) : startTime;
        const end = typeof endTime === 'string' ? new Date(endTime) : endTime;
  
        if (!isValid(start) || !isValid(end)) {
          throw new Error('Invalid date');
        }
  
        return `${format(start, 'h:mm a')} - ${format(end, 'h:mm a')}`;
      } catch (error) {
        console.error('Time range formatting error:', error);
        return 'Invalid time range';
      }
    }
  
    static getDayName(date: Date | string, short: boolean = false): string {
      try {
        const dateObj = typeof date === 'string' ? new Date(date) : date;
        if (!isValid(dateObj)) {
          throw new Error('Invalid date');
        }
        return format(dateObj, short ? 'E' : 'EEEE');
      } catch (error) {
        console.error('Day name error:', error);
        return 'Invalid date';
      }
    }
  
    static getMonthName(date: Date | string, short: boolean = false): string {
      try {
        const dateObj = typeof date === 'string' ? new Date(date) : date;
        if (!isValid(dateObj)) {
          throw new Error('Invalid date');
        }
        return format(dateObj, short ? 'MMM' : 'MMMM');
      } catch (error) {
        console.error('Month name error:', error);
        return 'Invalid date';
      }
    }
  }