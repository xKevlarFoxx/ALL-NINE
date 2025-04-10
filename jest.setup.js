// Mock Expo modules
jest.mock('expo-file-system', () => ({
  documentDirectory: 'file:///mock/document/directory/',
  cacheDirectory: 'file:///mock/cache/directory/',
  makeDirectoryAsync: jest.fn(),
  getInfoAsync: jest.fn(),
}));

jest.mock('expo-secure-store', () => ({
  getItemAsync: jest.fn(),
  setItemAsync: jest.fn(),
  deleteItemAsync: jest.fn(),
}));

jest.mock('@react-native-async-storage/async-storage', () => ({
  setItem: jest.fn(),
  getItem: jest.fn(),
  removeItem: jest.fn(),
  getAllKeys: jest.fn(),
  multiGet: jest.fn(),
}));

jest.mock('@react-native-community/netinfo', () => ({
  addEventListener: jest.fn(),
  fetch: jest.fn(),
}));

// Mock environment variables
process.env = {
  ...process.env,
  NODE_ENV: 'test',
  MPESA_API_ENDPOINT: 'https://api.mpesa.com/v1',
  TIGO_API_ENDPOINT: 'https://api.tigo.co.tz/v1',
  AIRTEL_API_ENDPOINT: 'https://api.airtel.co.tz/v1',
  TRA_API_ENDPOINT: 'https://api.tra.go.tz/v1',
  TRA_API_KEY: 'test_tra_key',
  TRA_TIN: '123456789',
  TEPS_API_ENDPOINT: 'https://api.teps.co.tz/v1',
  TEPS_MERCHANT_ID: 'TEST_MERCHANT',
  TEPS_API_KEY: 'test_teps_key',
};

// Mock fetch
global.fetch = jest.fn(() =>
  Promise.resolve({
    ok: true,
    json: () => Promise.resolve({}),
  })
);

// Mock Platform
jest.mock('react-native/Libraries/Utilities/Platform', () => ({
  OS: 'ios',
  select: jest.fn(dict => dict.ios),
}));

// Mock NativeModules for localization
jest.mock('react-native', () => {
  const RN = jest.requireActual('react-native');

  RN.NativeModules.SettingsManager = {
    settings: {
      AppleLocale: 'sw_TZ',
      AppleLanguages: ['sw-TZ'],
    },
  };

  return RN;
});