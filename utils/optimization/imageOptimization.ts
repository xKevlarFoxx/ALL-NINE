// utils/optimization/imageOptimization.ts
import { Image } from 'react-native';
import { manipulateAsync } from 'expo-image-manipulator';

export class ImageOptimizer {
  static async optimizeImage(uri: string, maxWidth: number = 1024): Promise<string> {
    try {
      const { width, height } = await this.getImageDimensions(uri);
      if (width <= maxWidth) return uri;

      const scaleFactor = maxWidth / width;
      const newHeight = Math.round(height * scaleFactor);

      const result = await manipulateAsync(
        uri,
        [{ resize: { width: maxWidth, height: newHeight } }],
        { compress: 0.8, format: 'jpeg' }
      );

      return result.uri;
    } catch (error) {
      console.error('Failed to optimize image:', error);
      return uri;
    }
  }

  private static getImageDimensions(uri: string): Promise<{ width: number; height: number }> {
    return new Promise((resolve, reject) => {
      Image.getSize(
        uri,
        (width, height) => resolve({ width, height }),
        reject
      );
    });
  }
}

// utils/optimization/caching.ts
import AsyncStorage from '@react-native-async-storage/async-storage';
import LRU from 'lru-cache';

export class CacheManager {
  private static instance: CacheManager;
  private memoryCache: LRU<string, any>;
  
  private constructor() {
    this.memoryCache = new LRU({
      max: 100,
      maxAge: 1000 * 60 * 60, // 1 hour
    });
  }

  static getInstance(): CacheManager {
    if (!CacheManager.instance) {
      CacheManager.instance = new CacheManager();
    }
    return CacheManager.instance;
  }

  async set(key: string, value: any, persist: boolean = false): Promise<void> {
    this.memoryCache.set(key, value);
    if (persist) {
      try {
        await AsyncStorage.setItem(key, JSON.stringify(value));
      } catch (error) {
        console.error('Failed to persist cache:', error);
      }
    }
  }

  async get(key: string, loadPersisted: boolean = false): Promise<any> {
    let value = this.memoryCache.get(key);
    if (!value && loadPersisted) {
      try {
        const persisted = await AsyncStorage.getItem(key);
        if (persisted) {
          value = JSON.parse(persisted);
          this.memoryCache.set(key, value);
        }
      } catch (error) {
        console.error('Failed to load persisted cache:', error);
      }
    }
    return value;
  }
}