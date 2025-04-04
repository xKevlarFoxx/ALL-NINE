// services/location/LocationService.ts
import * as Location from 'expo-location';
import { permissionService, PermissionType } from '../permissions/PermissionService';
import { analyticsService } from '../analytics/AnalyticsService';

interface LocationData {
  latitude: number;
  longitude: number;
  accuracy?: number;
  timestamp: number;
}

interface GeocodeResult {
  address: string;
  city: string;
  region: string;
  country: string;
  postalCode: string;
}

export class LocationService {
  private static instance: LocationService;
  private lastKnownLocation: LocationData | null = null;
  private isTracking: boolean = false;
  private watchId: Location.LocationSubscription | null = null;

  static getInstance(): LocationService {
    if (!LocationService.instance) {
      LocationService.instance = new LocationService();
    }
    return LocationService.instance;
  }

  async getCurrentLocation(highAccuracy: boolean = false): Promise<LocationData> {
    try {
      const permissionStatus = await permissionService.checkPermission(
        PermissionType.LOCATION
      );

      if (!permissionStatus.granted) {
        throw new Error('Location permission not granted');
      }

      const location = await Location.getCurrentPositionAsync({
        accuracy: highAccuracy ? Location.Accuracy.High : Location.Accuracy.Balanced,
      });

      this.lastKnownLocation = {
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
        accuracy: location.coords.accuracy,
        timestamp: location.timestamp,
      };

      analyticsService.track('Location_Updated', {
        accuracy: highAccuracy ? 'high' : 'balanced',
        source: 'getCurrentLocation',
      });

      return this.lastKnownLocation;
    } catch (error) {
      console.error('Failed to get current location:', error);
      throw error;
    }
  }

  async startTracking(
    callback: (location: LocationData) => void,
    options: {
      accuracy?: Location.Accuracy;
      timeInterval?: number;
      distanceInterval?: number;
    } = {}
  ): Promise<void> {
    if (this.isTracking) {
      return;
    }

    try {
      const permissionStatus = await permissionService.checkPermission(
        PermissionType.LOCATION
      );

      if (!permissionStatus.granted) {
        throw new Error('Location permission not granted');
      }

      this.watchId = await Location.watchPositionAsync(
        {
          accuracy: options.accuracy || Location.Accuracy.Balanced,
          timeInterval: options.timeInterval || 5000,
          distanceInterval: options.distanceInterval || 10,
        },
        (location) => {
          const locationData: LocationData = {
            latitude: location.coords.latitude,
            longitude: location.coords.longitude,
            accuracy: location.coords.accuracy,
            timestamp: location.timestamp,
          };

          this.lastKnownLocation = locationData;
          callback(locationData);
        }
      );

      this.isTracking = true;
    } catch (error) {
      console.error('Failed to start location tracking:', error);
      throw error;
    }
  }

  async stopTracking(): Promise<void> {
    if (this.watchId) {
      this.watchId.remove();
      this.watchId = null;
    }
    this.isTracking = false;
  }

  async geocodeLocation(location: LocationData): Promise<GeocodeResult> {
    try {
      const results = await Location.reverseGeocodeAsync({
        latitude: location.latitude,
        longitude: location.longitude,
      });

      if (results.length === 0) {
        throw new Error('No geocoding results found');
      }

      const result = results[0];
      return {
        address: result.street || '',
        city: result.city || '',
        region: result.region || '',
        country: result.country || '',
        postalCode: result.postalCode || '',
      };
    } catch (error) {
      console.error('Geocoding failed:', error);
      throw error;
    }
  }

  async geocodeAddress(address: string): Promise<LocationData> {
    try {
      const results = await Location.geocodeAsync(address);

      if (results.length === 0) {
        throw new Error('No location found for this address');
      }

      return {
        latitude: results[0].latitude,
        longitude: results[0].longitude,
        timestamp: Date.now(),
      };
    } catch (error) {
      console.error('Address geocoding failed:', error);
      throw error;
    }
  }

  getDistance(location1: LocationData, location2: LocationData): number {
    return Location.distanceBetween(
      location1.latitude,
      location1.longitude,
      location2.latitude,
      location2.longitude
    );
  }

  getLastKnownLocation(): LocationData | null {
    return this.lastKnownLocation;
  }

  isLocationTracking(): boolean {
    return this.isTracking;
  }
}

export const locationService = LocationService.getInstance();