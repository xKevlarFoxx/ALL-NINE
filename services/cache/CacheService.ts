// services/cache/CacheService.ts
import AsyncStorage from '@react-native-async-storage/async-storage';
import LRU from 'lru-cache';
import { analyticsService } from '../analytics/AnalyticsService';

interface CacheConfig {
  ttl: number;
  maxSize?: number;
}

interface CacheEntry<T> {
  data: T;
  timestamp: number;
  version: string;
}

export class CacheService {
  private static instance: CacheService;
  private memoryCache: LRU<string, CacheEntry<any>>;
  private version: string = '1.0.0';

  private constructor() {
    this.memoryCache = new LRU({
      max: 500, // Maximum number of items
      maxSize: 5000000, // 5MB max size
      sizeCalculation: (value, key) => {
        return JSON.stringify(value).length + key.length;
      },
      ttl: 1000 * 60 * 60, // 1 hour default TTL
    });
  }

  static getInstance(): CacheService {
    if (!CacheService.instance) {
      CacheService.instance = new CacheService();
    }
    return CacheService.instance;
  }

  async get<T>(key: string, fetcher: () => Promise<T>, config: CacheConfig): Promise<T> {
    try {
      // Try memory cache first
      const memoryItem = this.memoryCache.get(key) as CacheEntry<T> | undefined;
      if (this.isValidCacheEntry(memoryItem)) {
        analyticsService.track('Cache_Hit', { type: 'memory', key });
        return memoryItem.data;
      }

      // Try persistent storage
      const persistedItem = await this.getFromStorage<T>(key);
      if (this.isValidCacheEntry(persistedItem)) {
        analyticsService.track('Cache_Hit', { type: 'storage', key });
        // Update memory cache
        this.memoryCache.set(key, persistedItem);
        return persistedItem.data;
      }

      // Fetch fresh data
      const freshData = await fetcher();
      await this.set(key, freshData, config);
      return freshData;
    } catch (error) {
      console.error('Cache error:', error);
      throw error;
    }
  }

  async set<T>(key: string, data: T, config: CacheConfig): Promise<void> {
    const entry: CacheEntry<T> = {
      data,
      timestamp: Date.now(),
      version: this.version,
    };

    // Update memory cache
    this.memoryCache.set(key, entry, {
      ttl: config.ttl,
    });

    // Update persistent storage
    try {
      await AsyncStorage.setItem(
        this.getStorageKey(key),
        JSON.stringify(entry)
      );
    } catch (error) {
      console.error('Failed to persist cache:', error);
    }
  }

  async invalidate(key: string): Promise<void> {
    this.memoryCache.delete(key);
    try {
      await AsyncStorage.removeItem(this.getStorageKey(key));
    } catch (error) {
      console.error('Failed to invalidate cache:', error);
    }
  }

  async clear(): Promise<void> {
    this.memoryCache.clear();
    try {
      const keys = await AsyncStorage.getAllKeys();
      const cacheKeys = keys.filter(key => key.startsWith('cache:'));
      await AsyncStorage.multiRemove(cacheKeys);
    } catch (error) {
      console.error('Failed to clear cache:', error);
    }
  }

  private async getFromStorage<T>(key: string): Promise<CacheEntry<T> | null> {
    try {
      const data = await AsyncStorage.getItem(this.getStorageKey(key));
      return data ? JSON.parse(data) : null;
    } catch (error) {
      console.error('Failed to read from storage:', error);
      return null;
    }
  }

  private isValidCacheEntry<T>(entry?: CacheEntry<T>): boolean {
    if (!entry) return false;

    const isExpired = Date.now() - entry.timestamp > entry.ttl;
    const isVersionMismatch = entry.version !== this.version;

    return !isExpired && !isVersionMismatch;
  }

  private getStorageKey(key: string): string {
    return `cache:${key}`;
  }
}

export const cacheService = CacheService.getInstance();