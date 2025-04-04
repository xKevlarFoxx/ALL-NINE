// utils/validation/ValidationUtils.ts
export class ValidationUtils {
    static EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    static PHONE_REGEX = /^\+?[\d\s-]{10,}$/;
    static URL_REGEX = /^(https?:\/\/)?([\da-z.-]+)\.([a-z.]{2,6})([/\w .-]*)*\/?$/;
  
    static validateEmail(email: string): boolean {
      return this.EMAIL_REGEX.test(email.trim());
    }
  
    static validatePassword(password: string): {
      isValid: boolean;
      errors: string[];
    } {
      const errors: string[] = [];
      
      if (password.length < 8) {
        errors.push('Password must be at least 8 characters long');
      }
      if (!/[A-Z]/.test(password)) {
        errors.push('Password must contain at least one uppercase letter');
      }
      if (!/[a-z]/.test(password)) {
        errors.push('Password must contain at least one lowercase letter');
      }
      if (!/[0-9]/.test(password)) {
        errors.push('Password must contain at least one number');
      }
      if (!/[!@#$%^&*]/.test(password)) {
        errors.push('Password must contain at least one special character (!@#$%^&*)');
      }
  
      return {
        isValid: errors.length === 0,
        errors,
      };
    }
  
    static validatePhone(phone: string): boolean {
      return this.PHONE_REGEX.test(phone.trim());
    }
  
    static validateUrl(url: string): boolean {
      return this.URL_REGEX.test(url.trim());
    }
  
    static validateRequired(value: any): boolean {
      if (typeof value === 'string') {
        return value.trim().length > 0;
      }
      return value !== null && value !== undefined;
    }
  
    static validateLength(value: string, min?: number, max?: number): boolean {
      const length = value.trim().length;
      if (min !== undefined && length < min) return false;
      if (max !== undefined && length > max) return false;
      return true;
    }
  
    static validateNumber(value: any, min?: number, max?: number): boolean {
      const num = Number(value);
      if (isNaN(num)) return false;
      if (min !== undefined && num < min) return false;
      if (max !== undefined && num > max) return false;
      return true;
    }
  
    static validateMatch(value1: any, value2: any): boolean {
      return value1 === value2;
    }
  
    static validateFileSize(size: number, maxSizeInMB: number): boolean {
      return size <= maxSizeInMB * 1024 * 1024;
    }
  
    static validateFileType(filename: string, allowedTypes: string[]): boolean {
      const extension = filename.split('.').pop()?.toLowerCase();
      return extension ? allowedTypes.includes(extension) : false;
    }
  }
  
  // utils/formatting/FormattingUtils.ts
  export class FormattingUtils {
    static formatCurrency(
      amount: number,
      currency: string = 'USD',
      locale: string = 'en-US'
    ): string {
      try {
        return new Intl.NumberFormat(locale, {
          style: 'currency',
          currency,
        }).format(amount);
      } catch (error) {
        console.error('Currency formatting error:', error);
        return `${currency} ${amount}`;
      }
    }
  
    static formatNumber(
      number: number,
      decimals: number = 2,
      locale: string = 'en-US'
    ): string {
      try {
        return new Intl.NumberFormat(locale, {
          minimumFractionDigits: decimals,
          maximumFractionDigits: decimals,
        }).format(number);
      } catch (error) {
        console.error('Number formatting error:', error);
        return number.toFixed(decimals);
      }
    }
  
    static formatPhoneNumber(phone: string): string {
      const cleaned = phone.replace(/\D/g, '');
      const match = cleaned.match(/^(\d{3})(\d{3})(\d{4})$/);
      if (match) {
        return '(' + match[1] + ') ' + match[2] + '-' + match[3];
      }
      return phone;
    }
  
    static formatFileSize(bytes: number): string {
      if (bytes === 0) return '0 Bytes';
      const k = 1024;
      const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
      const i = Math.floor(Math.log(bytes) / Math.log(k));
      return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
    }
  
    static truncateText(text: string, maxLength: number): string {
      if (text.length <= maxLength) return text;
      return text.substring(0, maxLength) + '...';
    }
  
    static capitalizeFirstLetter(text: string): string {
      return text.charAt(0).toUpperCase() + text.slice(1).toLowerCase();
    }
  
    static formatDuration(seconds: number): string {
      const hours = Math.floor(seconds / 3600);
      const minutes = Math.floor((seconds % 3600) / 60);
      const remainingSeconds = seconds % 60;
  
      const parts = [];
      if (hours > 0) parts.push(`${hours}h`);
      if (minutes > 0) parts.push(`${minutes}m`);
      if (remainingSeconds > 0 || parts.length === 0) {
        parts.push(`${remainingSeconds}s`);
      }
  
      return parts.join(' ');
    }
  
    static slugify(text: string): string {
      return text
        .toLowerCase()
        .replace(/\s+/g, '-')
        .replace(/[^\w-]+/g, '')
        .replace(/--+/g, '-')
        .replace(/^-+/, '')
        .replace(/-+$/, '');
    }
  
    static formatPercentage(value: number, decimals: number = 1): string {
      return `${(value * 100).toFixed(decimals)}%`;
    }
  }
  
  // utils/debounce/DebounceUtils.ts
  export class DebounceUtils {
    static debounce<T extends (...args: any[]) => any>(
      func: T,
      wait: number
    ): (...args: Parameters<T>) => void {
      let timeout: NodeJS.Timeout | null = null;
  
      return function executedFunction(...args: Parameters<T>) {
        const later = () => {
          timeout = null;
          func(...args);
        };
  
        if (timeout) {
          clearTimeout(timeout);
        }
        timeout = setTimeout(later, wait);
      };
    }
  
    static throttle<T extends (...args: any[]) => any>(
      func: T,
      limit: number
    ): (...args: Parameters<T>) => void {
      let inThrottle: boolean = false;
  
      return function executedFunction(...args: Parameters<T>) {
        if (!inThrottle) {
          func(...args);
          inThrottle = true;
          setTimeout(() => {
            inThrottle = false;
          }, limit);
        }
      };
    }
  
    static debouncePromise<T extends (...args: any[]) => Promise<any>>(
      func: T,
      wait: number
    ): (...args: Parameters<T>) => Promise<ReturnType<T>> {
      let timeout: NodeJS.Timeout | null = null;
      let currentReject: ((reason?: any) => void) | null = null;
  
      return function executedFunction(
        ...args: Parameters<T>
      ): Promise<ReturnType<T>> {
        if (timeout && currentReject) {
          clearTimeout(timeout);
          currentReject('Debounced');
        }
  
        return new Promise((resolve, reject) => {
          currentReject = reject;
          timeout = setTimeout(() => {
            timeout = null;
            currentReject = null;
            func(...args)
              .then(resolve)
              .catch(reject);
          }, wait);
        });
      };
    }
  }