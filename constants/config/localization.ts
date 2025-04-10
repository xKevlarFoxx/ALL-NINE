import { Platform } from 'react-native';

export const LOCALIZATION_CONFIG = {
  languages: {
    sw: {
      name: 'Kiswahili',
      default: true,
      direction: 'ltr',
      dateFormat: 'DD/MM/YYYY',
      timeFormat: 'hh:mm a',
      numberFormat: {
        currency: {
          code: 'TZS',
          symbol: 'TSh',
          format: '{symbol} {amount}/=',
          precision: 0,
        },
        decimal: {
          separator: '.',
          delimiter: ',',
        },
      },
    },
    en: {
      name: 'English',
      direction: 'ltr',
      dateFormat: 'DD/MM/YYYY',
      timeFormat: 'hh:mm a',
      numberFormat: {
        currency: {
          code: 'TZS',
          symbol: 'TSh',
          format: '{symbol} {amount}/=',
          precision: 0,
        },
        decimal: {
          separator: '.',
          delimiter: ',',
        },
      },
    },
  },
  regions: {
    dar: {
      name: 'Dar es Salaam',
      areas: ['Kinondoni', 'Ilala', 'Temeke', 'Ubungo', 'Kigamboni'],
      defaultArea: 'Ilala',
    },
    arusha: {
      name: 'Arusha',
      areas: ['Arusha City', 'Meru', 'Karatu', 'Monduli'],
      defaultArea: 'Arusha City',
    },
    mwanza: {
      name: 'Mwanza',
      areas: ['Nyamagana', 'Ilemela', 'Magu', 'Ukerewe'],
      defaultArea: 'Nyamagana',
    },
  },
  deviceSupport: {
    minAndroidVersion: 21, // Android 5.0
    minIOSVersion: '12.0',
    lowBandwidthThreshold: 500, // in Kbps
    offlineMode: {
      enabled: true,
      maxStorageSize: Platform.OS === 'ios' ? 100 * 1024 * 1024 : 50 * 1024 * 1024, // 100MB iOS, 50MB Android
      syncInterval: 15 * 60 * 1000, // 15 minutes
    },
  },
};