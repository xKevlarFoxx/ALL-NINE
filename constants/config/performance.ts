import { Platform } from 'react-native';
import { LOCALIZATION_CONFIG } from './localization';

export const PERFORMANCE_CONFIG = {
  network: {
    caching: {
      data: {
        ttl: 15 * 60 * 1000, // 15 minutes
        maxEntries: 100,
      },
      images: {
        ttl: 24 * 60 * 60 * 1000, // 24 hours
        maxEntries: 50,
      },
    },
    offlineMode: {
      enabled: true,
      syncInterval: 15 * 60 * 1000, // 15 minutes
    },
    retryStrategy: {
      maxAttempts: 3,
      initialDelay: 1000,
      maxDelay: 10000,
    },
  },
  storage: {
    maxSize: Platform.OS === 'ios' ? 100 * 1024 * 1024 : 50 * 1024 * 1024, // 100MB iOS, 50MB Android
    cleanup: {
      threshold: 0.9, // Clean when 90% full
      keepPeriod: 7 * 24 * 60 * 60 * 1000, // 7 days
    },
  },
  images: {
    compression: {
      quality: 0.8,
      maxWidth: 1200,
      maxHeight: 1200,
    },
    thumbnails: {
      quality: 0.6,
      width: 150,
      height: 150,
    },
    preload: {
      enabled: true,
      maxConcurrent: 3,
    },
  },
  optimization: {
    lowBandwidth: {
      threshold: LOCALIZATION_CONFIG.deviceSupport.lowBandwidthThreshold,
      imageQuality: 0.6,
      disableAnimations: true,
      limitConcurrentRequests: true,
      maxConcurrentRequests: 2,
    },
    lowMemory: {
      clearImageCache: true,
      disableParallax: true,
      reduceListItems: true,
      maxListItems: 20,
    },
  },
  monitoring: {
    performanceMetrics: {
      enabled: true,
      sampleRate: 0.1, // 10% of users
    },
    errorTracking: {
      enabled: true,
      sampleRate: 1.0, // 100% of errors
    },
    analytics: {
      enabled: true,
      sessionTimeout: 30 * 60 * 1000, // 30 minutes
    },
  },
} as const;