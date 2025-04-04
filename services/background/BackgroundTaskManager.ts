// services/background/BackgroundTaskManager.ts
import * as BackgroundFetch from 'expo-background-fetch';
import * as TaskManager from 'expo-task-manager';
import { Platform } from 'react-native';
import * as Notifications from 'expo-notifications';
import NetInfo from '@react-native-community/netinfo';
import { store } from '../state/store';
import { dataManager } from '../data/DataManager';

const SYNC_TASK = 'BACKGROUND_SYNC';
const LOCATION_TASK = 'BACKGROUND_LOCATION';
const NOTIFICATION_TASK = 'BACKGROUND_NOTIFICATION';

export class BackgroundTaskManager {
  private static instance: BackgroundTaskManager;
  private tasks: Map<string, () => Promise<void>> = new Map();
  private taskQueue: Array<{ task: string; data?: any }> = [];
  private isProcessing: boolean = false;

  static getInstance(): BackgroundTaskManager {
    if (!BackgroundTaskManager.instance) {
      BackgroundTaskManager.instance = new BackgroundTaskManager();
    }
    return BackgroundTaskManager.instance;
  }

  async initialize(): Promise<void> {
    await this.registerTasks();
    this.startTaskProcessing();
  }

  private async registerTasks(): Promise<void> {
    // Register background fetch
    TaskManager.defineTask(SYNC_TASK, async () => {
      try {
        const result = await this.performSync();
        return result 
          ? BackgroundFetch.Result.NewData 
          : BackgroundFetch.Result.NoData;
      } catch (error) {
        console.error('Background sync failed:', error);
        return BackgroundFetch.Result.Failed;
      }
    });

    // Register background notification handling
    TaskManager.defineTask(NOTIFICATION_TASK, async ({ data, error, executionInfo }) => {
      if (error) {
        console.error('Background notification task error:', error);
        return;
      }

      await this.handleBackgroundNotification(data);
    });

    // Register location updates if needed
    if (Platform.OS === 'ios') {
      TaskManager.defineTask(LOCATION_TASK, async ({ data: { locations }, error }) => {
        if (error) {
          console.error('Background location task error:', error);
          return;
        }

        await this.handleLocationUpdate(locations[0]);
      });
    }

    // Configure background fetch
    await BackgroundFetch.registerTaskAsync(SYNC_TASK, {
      minimumInterval: 15 * 60, // 15 minutes
      stopOnTerminate: false,
      startOnBoot: true,
    });
  }

  async scheduleTask(taskName: string, data?: any): Promise<void> {
    this.taskQueue.push({ task: taskName, data });
    if (!this.isProcessing) {
      await this.processTaskQueue();
    }
  }

  private async processTaskQueue(): Promise<void> {
    if (this.isProcessing || this.taskQueue.length === 0) return;

    this.isProcessing = true;
    try {
      while (this.taskQueue.length > 0) {
        const { task, data } = this.taskQueue.shift()!;
        const taskFn = this.tasks.get(task);
        if (taskFn) {
          await taskFn.call(this, data);
        }
      }
    } finally {
      this.isProcessing = false;
    }
  }

  private async performSync(): Promise<boolean> {
    const networkState = await NetInfo.fetch();
    if (!networkState.isConnected) return false;

    try {
      // Sync offline data
      const offlineActions = await dataManager.getData('offline_actions', 
        async () => [], 
        { key: 'offline', ttl: Infinity }
      );

      for (const action of offlineActions) {
        await this.processOfflineAction(action);
      }

      // Sync user data
      await store.dispatch({ type: 'SYNC_USER_DATA' });

      // Update local storage
      await dataManager.cacheData('last_sync', new Date().toISOString(), {
        key: 'sync',
        ttl: 24 * 60 * 60 * 1000, // 24 hours
      });

      return true;
    } catch (error) {
      console.error('Sync failed:', error);
      return false;
    }
  }

  private async processOfflineAction(action: any): Promise<void> {
    try {
      switch (action.type) {
        case 'UPDATE_PROFILE':
          await api.updateProfile(action.payload);
          break;
        case 'CREATE_SERVICE':
          await api.createService(action.payload);
          break;
        // Add more cases as needed
      }
    } catch (error) {
      console.error(`Failed to process offline action:`, error);
      // Requeue failed actions
      this.taskQueue.push({ task: 'PROCESS_OFFLINE_ACTION', data: action });
    }
  }

  private async handleBackgroundNotification(data: any): Promise<void> {
    try {
      // Process notification data
      switch (data.type) {
        case 'message':
          await this.processNewMessage(data);
          break;
        case 'booking':
          await this.processNewBooking(data);
          break;
        // Add more cases as needed
      }
    } catch (error) {
      console.error('Failed to handle background notification:', error);
    }
  }

  private async handleLocationUpdate(location: any): Promise<void> {
    try {
      // Update user location
      await store.dispatch({
        type: 'UPDATE_LOCATION',
        payload: location,
      });

      // Check for nearby services/providers
      await this.checkNearbyServices(location);
    } catch (error) {
      console.error('Failed to handle location update:', error);
    }
  }

  // Helper methods
  private async processNewMessage(data: any): Promise<void> {
    // Implement message processing
  }

  private async processNewBooking(data: any): Promise<void> {
    // Implement booking processing
  }

  private async checkNearbyServices(location: any): Promise<void> {
    // Implement nearby services check
  }
}

export const backgroundTaskManager = BackgroundTaskManager.getInstance();