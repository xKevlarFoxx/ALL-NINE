// services/permissions/PermissionService.ts
import { Platform } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import * as Location from 'expo-location';
import * as Notifications from 'expo-notifications';
import { analyticsService } from '../analytics/AnalyticsService';

export enum PermissionType {
  CAMERA = 'camera',
  PHOTO_LIBRARY = 'photo_library',
  LOCATION = 'location',
  NOTIFICATIONS = 'notifications',
  CONTACTS = 'contacts',
}

interface PermissionStatus {
  granted: boolean;
  canAskAgain: boolean;
}

export class PermissionService {
  private static instance: PermissionService;
  private permissionCache: Map<PermissionType, PermissionStatus> = new Map();

  static getInstance(): PermissionService {
    if (!PermissionService.instance) {
      PermissionService.instance = new PermissionService();
    }
    return PermissionService.instance;
  }

  async checkPermission(type: PermissionType): Promise<PermissionStatus> {
    // Check cache first
    const cached = this.permissionCache.get(type);
    if (cached) return cached;

    const status = await this.getPermissionStatus(type);
    this.permissionCache.set(type, status);
    return status;
  }

  async requestPermission(type: PermissionType): Promise<PermissionStatus> {
    try {
      const status = await this.requestPermissionByType(type);
      this.permissionCache.set(type, status);
      
      analyticsService.track('Permission_Request', {
        type,
        granted: status.granted,
        canAskAgain: status.canAskAgain,
      });

      return status;
    } catch (error) {
      console.error(`Failed to request ${type} permission:`, error);
      throw error;
    }
  }

  private async getPermissionStatus(type: PermissionType): Promise<PermissionStatus> {
    switch (type) {
      case PermissionType.CAMERA:
        return this.getCameraPermissionStatus();
      case PermissionType.PHOTO_LIBRARY:
        return this.getPhotoLibraryPermissionStatus();
      case PermissionType.LOCATION:
        return this.getLocationPermissionStatus();
      case PermissionType.NOTIFICATIONS:
        return this.getNotificationPermissionStatus();
      default:
        throw new Error(`Unknown permission type: ${type}`);
    }
  }

  private async requestPermissionByType(type: PermissionType): Promise<PermissionStatus> {
    switch (type) {
      case PermissionType.CAMERA:
        return this.requestCameraPermission();
      case PermissionType.PHOTO_LIBRARY:
        return this.requestPhotoLibraryPermission();
      case PermissionType.LOCATION:
        return this.requestLocationPermission();
      case PermissionType.NOTIFICATIONS:
        return this.requestNotificationPermission();
      default:
        throw new Error(`Unknown permission type: ${type}`);
    }
  }

  private async getCameraPermissionStatus(): Promise<PermissionStatus> {
    const { status } = await ImagePicker.getCameraPermissionsAsync();
    return {
      granted: status === 'granted',
      canAskAgain: status !== 'denied',
    };
  }

  private async getPhotoLibraryPermissionStatus(): Promise<PermissionStatus> {
    const { status } = await ImagePicker.getMediaLibraryPermissionsAsync();
    return {
      granted: status === 'granted',
      canAskAgain: status !== 'denied',
    };
  }

  private async getLocationPermissionStatus(): Promise<PermissionStatus> {
    const { status } = await Location.getForegroundPermissionsAsync();
    return {
      granted: status === 'granted',
      canAskAgain: status !== 'denied',
    };
  }

  private async getNotificationPermissionStatus(): Promise<PermissionStatus> {
    const { status } = await Notifications.getPermissionsAsync();
    return {
      granted: status === 'granted',
      canAskAgain: status !== 'denied',
    };
  }

  private async requestCameraPermission(): Promise<PermissionStatus> {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    return {
      granted: status === 'granted',
      canAskAgain: status !== 'denied',
    };
  }

  private async requestPhotoLibraryPermission(): Promise<PermissionStatus> {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    return {
      granted: status === 'granted',
      canAskAgain: status !== 'denied',
    };
  }

  private async requestLocationPermission(): Promise<PermissionStatus> {
    const { status } = await Location.requestForegroundPermissionsAsync();
    return {
      granted: status === 'granted',
      canAskAgain: status !== 'denied',
    };
  }

  private async requestNotificationPermission(): Promise<PermissionStatus> {
    const { status } = await Notifications.requestPermissionsAsync();
    return {
      granted: status === 'granted',
      canAskAgain: status !== 'denied',
    };
  }
}

export const permissionService = PermissionService.getInstance();