// services/data/DataManager.ts
import AsyncStorage from '@react-native-async-storage/async-storage';
import NetInfo from '@react-native-community/netinfo';
import { store } from '../../state/store';

interface CacheConfig {
  key: string;
  ttl: number; // Time to live in milliseconds
  version?: string;
}

interface CacheEntry<T> {
  data: T;
  timestamp: number;
  version: string;
}

export class DataManager {
  private static instance: DataManager;
  private cache: Map<string, CacheEntry<any>> = new Map();
  private prefetchQueue: Set<string> = new Set();
  private currentVersion: string = '1.0.0';

  static getInstance(): DataManager {
    if (!DataManager.instance) {
      DataManager.instance = new DataManager();
    }
    return DataManager.instance;
  }

  async initialize() {
    await this.loadPersistedCache();
    this.setupNetworkListener();
  }

  private setupNetworkListener() {
    NetInfo.addEventListener(state => {
      if (state.isConnected) {
        this.processPrefetchQueue();
      }
    });
  }

  async getData<T>(
    key: string,
    fetchFn: () => Promise<T>,
    config: CacheConfig
  ): Promise<T> {
    // Check cache first
    const cachedData = this.getCachedData<T>(key, config.version);
    if (cachedData) return cachedData;

    try {
      const data = await fetchFn();
      await this.cacheData(key, data, config);
      return data;
    } catch (error) {
      // Fallback to stale cache if available
      const staleData = this.getStaleData<T>(key);
      if (staleData) return staleData;
      throw error;
    }
  }

  private getCachedData<T>(key: string, version?: string): T | null {
    const entry = this.cache.get(key);
    if (!entry) return null;

    const isExpired = Date.now() - entry.timestamp > config.ttl;
    const isVersionMismatch = version && entry.version !== version;

    if (isExpired || isVersionMismatch) {
      this.cache.delete(key);
      return null;
    }

    return entry.data;
  }

  private getStaleData<T>(key: string): T | null {
    const entry = this.cache.get(key);
    return entry ? entry.data : null;
  }

  async cacheData<T>(key: string, data: T, config: CacheConfig): Promise<void> {
    const entry: CacheEntry<T> = {
      data,
      timestamp: Date.now(),
      version: config.version || this.currentVersion,
    };

    this.cache.set(key, entry);
    await this.persistCache();
  }

  async prefetchData(keys: string[]): Promise<void> {
    keys.forEach(key => this.prefetchQueue.add(key));
    await this.processPrefetchQueue();
  }

  private async processPrefetchQueue(): Promise<void> {
    const networkState = await NetInfo.fetch();
    if (!networkState.isConnected) return;

    const promises = Array.from(this.prefetchQueue).map(async key => {
      try {
        // Implement your prefetch logic here
        this.prefetchQueue.delete(key);
      } catch (error) {
        console.error(`Failed to prefetch data for key: ${key}`, error);
      }
    });

    await Promise.all(promises);
  }

  async batchOperation<T>(
    operations: Array<() => Promise<T>>
  ): Promise<Array<T>> {
    const results: T[] = [];
    const batchSize = 3; // Adjust based on your needs

    for (let i = 0; i < operations.length; i += batchSize) {
      const batch = operations.slice(i, i + batchSize);
      const batchResults = await Promise.all(
        batch.map(operation => operation())
      );
      results.push(...batchResults);
    }

    return results;
  }

  private async loadPersistedCache(): Promise<void> {
    try {
      const persistedCache = await AsyncStorage.getItem('data_cache');
      if (persistedCache) {
        const parsed = JSON.parse(persistedCache);
        Object.entries(parsed).forEach(([key, value]) => {
          this.cache.set(key, value as CacheEntry<any>);
        });
      }
    } catch (error) {
      console.error('Failed to load persisted cache:', error);
    }
  }

  private async persistCache(): Promise<void> {
    try {
      const cacheObject = Object.fromEntries(this.cache.entries());
      await AsyncStorage.setItem('data_cache', JSON.stringify(cacheObject));
    } catch (error) {
      console.error('Failed to persist cache:', error);
    }
  }
}

export const dataManager = DataManager.getInstance();