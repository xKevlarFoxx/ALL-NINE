// services/background/BackgroundTaskService.ts
import * as BackgroundFetch from 'expo-background-fetch';
import * as TaskManager from 'expo-task-manager';
import { store } from '../../state/store';
import { notificationService } from '../notifications/NotificationService';

const SYNC_TASK = 'BACKGROUND_SYNC';
const LOCATION_TASK = 'BACKGROUND_LOCATION';

export class BackgroundTaskService {
  private static instance: BackgroundTaskService;

  static getInstance(): BackgroundTaskService {
    if (!BackgroundTaskService.instance) {
      BackgroundTaskService.instance = new BackgroundTaskService();
    }
    return BackgroundTaskService.instance;
  }

  async registerTasks() {
    await this.registerSyncTask();
    await this.registerLocationTask();
  }

  private async registerSyncTask() {
    TaskManager.defineTask(SYNC_TASK, async () => {
      try {
        // Perform background sync
        const result = await this.performSync();
        return result 
          ? BackgroundFetch.Result.NewData
          : BackgroundFetch.Result.NoData;
      } catch (error) {
        return BackgroundFetch.Result.Failed;
      }
    });

    await BackgroundFetch.registerTaskAsync(SYNC_TASK, {
      minimumInterval: 15 * 60, // 15 minutes
      stopOnTerminate: false,
      startOnBoot: true,
    });
  }

  private async performSync() {
    try {
      // Implement your sync logic here
      // For example, sync pending offline actions
      await store.dispatch(syncOfflineActions());
      return true;
    } catch (error) {
      console.error('Background sync failed:', error);
      return false;
    }
  }

  private async registerLocationTask() {
    TaskManager.defineTask(LOCATION_TASK, async ({ data, error }) => {
      if (error) {
        console.error('Background location task error:', error);
        return;
      }

      if (data) {
        const { locations } = data as { locations: any[] };
        // Handle location updates
        await this.handleLocationUpdate(locations[0]);
      }
    });
  }

  private async handleLocationUpdate(location: any) {
    // Implement location handling logic
    // For example, update user's current location
    try {
      await store.dispatch(updateUserLocation(location));
    } catch (error) {
      console.error('Failed to handle location update:', error);
    }
  }
}

export const backgroundTaskService = BackgroundTaskService.getInstance();