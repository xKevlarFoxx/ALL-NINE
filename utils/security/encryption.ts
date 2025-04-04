// utils/security/encryption.ts
import { NativeModules } from 'react-native';
import CryptoJS from 'crypto-js';
import * as Keychain from 'react-native-keychain';

export class SecurityManager {
  private static instance: SecurityManager;
  private encryptionKey: string | null = null;

  static getInstance(): SecurityManager {
    if (!SecurityManager.instance) {
      SecurityManager.instance = new SecurityManager();
    }
    return SecurityManager.instance;
  }

  async initialize() {
    try {
      // Get device-specific key from secure storage
      const credentials = await Keychain.getGenericPassword('encryption_key');
      if (credentials) {
        this.encryptionKey = credentials.password;
      } else {
        // Generate new key if none exists
        this.encryptionKey = CryptoJS.lib.WordArray.random(256/8).toString();
        await Keychain.setGenericPassword('encryption_key', this.encryptionKey);
      }
    } catch (error) {
      console.error('Failed to initialize security manager:', error);
      throw error;
    }
  }

  encrypt(data: string): string {
    if (!this.encryptionKey) throw new Error('Security manager not initialized');
    return CryptoJS.AES.encrypt(data, this.encryptionKey).toString();
  }

  decrypt(encryptedData: string): string {
    if (!this.encryptionKey) throw new Error('Security manager not initialized');
    const bytes = CryptoJS.AES.decrypt(encryptedData, this.encryptionKey);
    return bytes.toString(CryptoJS.enc.Utf8);
  }
}

// utils/security/secureStorage.ts
export class SecureStorage {
  static async saveSecure(key: string, value: string) {
    try {
      await Keychain.setGenericPassword(key, value);
    } catch (error) {
      console.error('Failed to save to secure storage:', error);
      throw error;
    }
  }

  static async getSecure(key: string): Promise<string | null> {
    try {
      const credentials = await Keychain.getGenericPassword(key);
      return credentials ? credentials.password : null;
    } catch (error) {
      console.error('Failed to get from secure storage:', error);
      throw error;
    }
  }

  static async removeSecure(key: string) {
    try {
      await Keychain.resetGenericPassword(key);
    } catch (error) {
      console.error('Failed to remove from secure storage:', error);
      throw error;
    }
  }
}