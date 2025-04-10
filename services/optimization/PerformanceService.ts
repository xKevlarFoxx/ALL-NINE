import { Platform, InteractionManager } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as FileSystem from 'expo-file-system';
import { manipulateAsync } from 'expo-image-manipulator';
import NetInfo from '@react-native-community/netinfo';
import { PERFORMANCE_CONFIG } from '@/constants/config/performance';
import { analyticsService } from '../analytics/AnalyticsService';

export class PerformanceService {
  private static instance: PerformanceService;
  private isLowBandwidth: boolean = false;
  private isLowMemory: boolean = false;
  private cacheSize: number = 0;

  private constructor() {
    this.setupNetworkListener();
    this.setupMemoryWarning();
  }

  static getInstance(): PerformanceService {
    if (!PerformanceService.instance) {
      PerformanceService.instance = new PerformanceService();
    }
    return PerformanceService.instance;
  }

  async initialize(): Promise<void> {
    try {
      // Initialize cache tracking
      const cacheInfo = await this.getCacheInfo();
      this.cacheSize = cacheInfo.size;

      // Clean up if needed
      if (this.cacheSize > PERFORMANCE_CONFIG.storage.maxSize) {
        await this.cleanupCache();
      }

      // Warm up critical cache
      await this.warmupCache();
    } catch (error) {
      console.error('Performance service initialization failed:', error);
    }
  }

  async optimizeImage(uri: string): Promise<string> {
    try {
      const config = PERFORMANCE_CONFIG.images.compression;
      
      // Skip optimization for small images
      const fileInfo = await FileSystem.getInfoAsync(uri);
      if (fileInfo.size < 50 * 1024) { // 50KB
        return uri;
      }

      // Apply more aggressive compression for low bandwidth
      const quality = this.isLowBandwidth ? config.quality * 0.8 : config.quality;

      const result = await manipulateAsync(
        uri,
        [
          {
            resize: {
              width: config.maxWidth,
              height: config.maxHeight,
            },
          },
        ],
        {
          compress: quality,
          format: 'jpeg',
        }
      );

      return result.uri;
    } catch (error) {
      console.error('Image optimization failed:', error);
      return uri; // Fall back to original image
    }
  }

  async cacheData<T>(key: string, data: T, ttl?: number): Promise<void> {
    try {
      const cacheConfig = PERFORMANCE_CONFIG.network.caching.data;
      const entry = {
        data,
        timestamp: Date.now(),
        ttl: ttl || cacheConfig.ttl,
      };

      await AsyncStorage.setItem(
        `cache_${key}`,
        JSON.stringify(entry)
      );

      // Update cache size tracking
      this.cacheSize += JSON.stringify(entry).length;
      await this.checkCacheSize();
    } catch (error) {
      console.error('Data caching failed:', error);
    }
  }

  async getCachedData<T>(key: string): Promise<T | null> {
    try {
      const cached = await AsyncStorage.getItem(`cache_${key}`);
      if (!cached) return null;

      const entry = JSON.parse(cached);
      if (Date.now() - entry.timestamp > entry.ttl) {
        await AsyncStorage.removeItem(`cache_${key}`);
        return null;
      }

      return entry.data as T;
    } catch (error) {
      console.error('Cache retrieval failed:', error);
      return null;
    }
  }

  private setupNetworkListener(): void {
    NetInfo.addEventListener(state => {
      // Consider connection type and speed
      this.isLowBandwidth = 
        !state.isConnected ||
        state.type === 'cellular' &&
        state.details?.cellularGeneration !== '4g' ||
        (state.details?.isConnectionExpensive ?? true);

      analyticsService.track('Network_Status_Changed', {
        isConnected: state.isConnected,
        type: state.type,
        isLowBandwidth: this.isLowBandwidth,
      });
    });
  }

  private setupMemoryWarning(): void {
    if (Platform.OS === 'ios') {
      // iOS memory warning listener
    } else {
      // Android memory monitoring
    }
  }

  private async getCacheInfo(): Promise<{ size: number }> {
    try {
      const keys = await AsyncStorage.getAllKeys();
      const cacheKeys = keys.filter(key => key.startsWith('cache_'));
      
      let totalSize = 0;
      for (const key of cacheKeys) {
        const value = await AsyncStorage.getItem(key);
        if (value) {
          totalSize += value.length;
        }
      }

      return { size: totalSize };
    } catch (error) {
      console.error('Failed to get cache info:', error);
      return { size: 0 };
    }
  }

  private async cleanupCache(): Promise<void> {
    try {
      const { cleanup } = PERFORMANCE_CONFIG.storage;
      const keys = await AsyncStorage.getAllKeys();
      const cacheKeys = keys.filter(key => key.startsWith('cache_'));

      // Sort by priority and age
      const cacheItems = await Promise.all(
        cacheKeys.map(async key => {
          const value = await AsyncStorage.getItem(key);
          const entry = value ? JSON.parse(value) : null;
          return {
            key,
            timestamp: entry?.timestamp || 0,
            size: value?.length || 0,
          };
        })
      );

      cacheItems.sort((a, b) => a.timestamp - b.timestamp);

      // Remove old items until under threshold
      for (const item of cacheItems) {
        if (this.cacheSize <= cleanup.threshold * PERFORMANCE_CONFIG.storage.maxSize) {
          break;
        }
        await AsyncStorage.removeItem(item.key);
        this.cacheSize -= item.size;
      }
    } catch (error) {
      console.error('Cache cleanup failed:', error);
    }
  }

  private async warmupCache(): Promise<void> {
    // Implement cache warming logic
    return new Promise(resolve => {
      InteractionManager.runAfterInteractions(() => {
        // Warm up cache in background
        resolve();
      });
    });
  }

  private async checkCacheSize(): Promise<void> {
    if (this.cacheSize > PERFORMANCE_CONFIG.storage.cleanup.threshold * PERFORMANCE_CONFIG.storage.maxSize) {
      await this.cleanupCache();
    }
  }
}

export const performanceService = PerformanceService.getInstance();