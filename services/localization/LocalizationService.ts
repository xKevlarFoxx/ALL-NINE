import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import en from '@/translations/en.json';
import es from '@/translations/es.json';
import fr from '@/translations/fr.json';

export class LocalizationService {
  static initialize() {
    i18n
      .use(initReactI18next)
      .init({
        resources: {
          en: { translation: en },
          es: { translation: es },
          fr: { translation: fr },
        },
        lng: 'en', // Default language
        fallbackLng: 'en',
        interpolation: {
          escapeValue: false, // React already escapes values
        },
      });
  }

  static changeLanguage(language: string) {
    i18n.changeLanguage(language);
  }

  static getCurrentLanguage(): string {
    return i18n.language;
  }
}