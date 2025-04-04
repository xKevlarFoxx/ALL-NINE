// services/connectivity/ConnectivityService.ts
import NetInfo, { NetInfoState } from '@react-native-community/netinfo';
import { BehaviorSubject } from 'rxjs';
import { analyticsService } from '../analytics/AnalyticsService';

interface ConnectionStatus {
  isConnected: boolean;
  type: string;
  isInternetReachable: boolean | null;
  details: any;
}

export class ConnectivityService {
  private static instance: ConnectivityService;
  private connectionStatus = new BehaviorSubject<ConnectionStatus>({
    isConnected: true,
    type: 'unknown',
    isInternetReachable: null,
    details: null,
  });

  private constructor() {
    this.initializeNetworkListener();
  }

  static getInstance(): ConnectivityService {
    if (!ConnectivityService.instance) {
      ConnectivityService.instance = new ConnectivityService();
    }
    return ConnectivityService.instance;
  }

  private initializeNetworkListener() {
    NetInfo.addEventListener(this.handleConnectivityChange.bind(this));
  }

  private handleConnectivityChange(state: NetInfoState) {
    const status: ConnectionStatus = {
      isConnected: state.isConnected ?? false,
      type: state.type,
      isInternetReachable: state.isInternetReachable,
      details: state.details,
    };

    this.connectionStatus.next(status);

    analyticsService.track('Connectivity_Change', {
      isConnected: status.isConnected,
      type: status.type,
      isInternetReachable: status.isInternetReachable,
    });
  }

  async checkConnectivity(): Promise<ConnectionStatus> {
    const state = await NetInfo.fetch();
    return {
      isConnected: state.isConnected ?? false,
      type: state.type,
      isInternetReachable: state.isInternetReachable,
      details: state.details,
    };
  }

  subscribeToConnectivityChanges(
    callback: (status: ConnectionStatus) => void
  ): () => void {
    const subscription = this.connectionStatus.subscribe(callback);
    return () => subscription.unsubscribe();
  }

  isConnected(): boolean {
    return this.connectionStatus.value.isConnected;
  }

  isInternetReachable(): boolean | null {
    return this.connectionStatus.value.isInternetReachable;
  }

  getConnectionType(): string {
    return this.connectionStatus.value.type;
  }

  async waitForConnection(timeout: number = 30000): Promise<boolean> {
    return new Promise((resolve) => {
      if (this.isConnected()) {
        resolve(true);
        return;
      }

      const timeoutId = setTimeout(() => {
        subscription.unsubscribe();
        resolve(false);
      }, timeout);

      const subscription = this.connectionStatus.subscribe((status) => {
        if (status.isConnected) {
          clearTimeout(timeoutId);
          subscription.unsubscribe();
          resolve(true);
        }
      });
    });
  }
}

export const connectivityService = ConnectivityService.getInstance();