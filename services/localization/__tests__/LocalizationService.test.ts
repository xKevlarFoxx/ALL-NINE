import { localizationService } from '../LocalizationService';
import { LOCALIZATION_CONFIG } from '@/constants/config/localization';

describe('LocalizationService', () => {
  beforeEach(async () => {
    // Reset to default state before each test
    await localizationService.initialize();
  });

  describe('language handling', () => {
    it('should set and get language correctly', async () => {
      await localizationService.setLanguage('en');
      const locale = localizationService.getCurrentLocale();
      expect(locale.language).toBe('en');
    });

    it('should throw error for unsupported language', async () => {
      await expect(
        localizationService.setLanguage('fr' as any)
      ).rejects.toThrow('Unsupported language');
    });

    it('should translate text correctly', () => {
      const translatedText = localizationService.translate('common.loading');
      expect(translatedText).toBe('Loading...');
    });

    it('should handle missing translations', () => {
      const missingKey = 'nonexistent.key';
      const result = localizationService.translate(missingKey);
      expect(result).toBe(missingKey);
    });
  });

  describe('region handling', () => {
    it('should set and get region correctly', async () => {
      await localizationService.setRegion('arusha');
      const locale = localizationService.getCurrentLocale();
      expect(locale.region).toBe('arusha');
      expect(locale.area).toBe(LOCALIZATION_CONFIG.regions.arusha.defaultArea);
    });

    it('should set region with specific area', async () => {
      await localizationService.setRegion('dar', 'Kinondoni');
      const locale = localizationService.getCurrentLocale();
      expect(locale.region).toBe('dar');
      expect(locale.area).toBe('Kinondoni');
    });

    it('should throw error for unsupported region', async () => {
      await expect(
        localizationService.setRegion('invalid' as any)
      ).rejects.toThrow('Unsupported region');
    });
  });

  describe('formatting', () => {
    it('should format currency correctly in Swahili', async () => {
      await localizationService.setLanguage('sw');
      const formatted = localizationService.formatCurrency(5000);
      expect(formatted).toBe('TSh 5,000/=');
    });

    it('should format currency correctly in English', async () => {
      await localizationService.setLanguage('en');
      const formatted = localizationService.formatCurrency(5000);
      expect(formatted).toBe('TSh 5,000/=');
    });

    it('should format date correctly in Swahili', async () => {
      await localizationService.setLanguage('sw');
      const date = new Date('2025-04-10');
      const formatted = localizationService.formatDate(date);
      expect(formatted).toBe('10/04/2025');
    });

    it('should format time correctly', async () => {
      const date = new Date('2025-04-10T14:30:00');
      const formatted = localizationService.formatTime(date);
      expect(formatted).toMatch(/02:30 PM/i);
    });
  });
});