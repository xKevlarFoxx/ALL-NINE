// services/auth/AuthenticationService.ts
import { Platform } from 'react-native';
import * as SecureStore from 'expo-secure-store';
import * as LocalAuthentication from 'expo-local-authentication';
import { apiService } from '../api/ApiService';
import { analyticsService } from '../analytics/AnalyticsService';
import { store } from '../../state/store';

interface AuthTokens {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
}

interface AuthCredentials {
  email: string;
  password: string;
}

interface AuthState {
  isAuthenticated: boolean;
  userId: string | null;
  email: string | null;
  biometricsEnabled: boolean;
}

export class AuthenticationService {
  private static instance: AuthenticationService;
  private readonly TOKENS_KEY = 'auth_tokens';
  private readonly BIOMETRICS_KEY = 'biometrics_enabled';
  private refreshTokenTimeout?: NodeJS.Timeout;

  static getInstance(): AuthenticationService {
    if (!AuthenticationService.instance) {
      AuthenticationService.instance = new AuthenticationService();
    }
    return AuthenticationService.instance;
  }

  async initialize(): Promise<void> {
    try {
      const tokens = await this.getStoredTokens();
      if (tokens) {
        await this.validateAndSetTokens(tokens);
      }
      await this.setupBiometrics();
    } catch (error) {
      console.error('Auth initialization failed:', error);
      await this.logout();
    }
  }

  async login(credentials: AuthCredentials): Promise<void> {
    try {
      const response = await apiService.post<AuthTokens>('/auth/login', credentials);
      await this.handleAuthSuccess(response);

      analyticsService.track('User_Login', {
        method: 'email',
        userId: store.getState().auth.userId,
      });
    } catch (error) {
      console.error('Login failed:', error);
      throw error;
    }
  }

  async loginWithBiometrics(): Promise<void> {
    try {
      const isAvailable = await this.isBiometricsAvailable();
      if (!isAvailable) {
        throw new Error('Biometric authentication not available');
      }

      const { success } = await LocalAuthentication.authenticateAsync({
        promptMessage: 'Authenticate to continue',
        fallbackLabel: 'Use password',
      });

      if (success) {
        const storedCredentials = await this.getStoredBiometricCredentials();
        if (storedCredentials) {
          await this.login(storedCredentials);
        } else {
          throw new Error('No stored credentials found');
        }
      } else {
        throw new Error('Biometric authentication failed');
      }
    } catch (error) {
      console.error('Biometric login failed:', error);
      throw error;
    }
  }

  async logout(): Promise<void> {
    try {
      await this.clearTokens();
      if (this.refreshTokenTimeout) {
        clearTimeout(this.refreshTokenTimeout);
      }
      store.dispatch({ type: 'auth/logout' });

      analyticsService.track('User_Logout', {
        userId: store.getState().auth.userId,
      });
    } catch (error) {
      console.error('Logout failed:', error);
      throw error;
    }
  }

  async refreshTokens(): Promise<void> {
    try {
      const tokens = await this.getStoredTokens();
      if (!tokens?.refreshToken) {
        throw new Error('No refresh token available');
      }

      const response = await apiService.post<AuthTokens>('/auth/refresh', {
        refreshToken: tokens.refreshToken,
      });

      await this.handleAuthSuccess(response);
    } catch (error) {
      console.error('Token refresh failed:', error);
      await this.logout();
      throw error;
    }
  }

  async enableBiometrics(): Promise<void> {
    try {
      const isAvailable = await this.isBiometricsAvailable();
      if (!isAvailable) {
        throw new Error('Biometric authentication not available');
      }

      const { success } = await LocalAuthentication.authenticateAsync({
        promptMessage: 'Authenticate to enable biometric login',
        fallbackLabel: 'Use password',
      });

      if (success) {
        await SecureStore.setItemAsync(this.BIOMETRICS_KEY, 'true');
        store.dispatch({ type: 'auth/setBiometricsEnabled', payload: true });
      } else {
        throw new Error('Biometric authentication failed');
      }
    } catch (error) {
      console.error('Enable biometrics failed:', error);
      throw error;
    }
  }

  async disableBiometrics(): Promise<void> {
    try {
      await SecureStore.deleteItemAsync(this.BIOMETRICS_KEY);
      await this.clearStoredBiometricCredentials();
      store.dispatch({ type: 'auth/setBiometricsEnabled', payload: false });
    } catch (error) {
      console.error('Disable biometrics failed:', error);
      throw error;
    }
  }

  private async handleAuthSuccess(tokens: AuthTokens): Promise<void> {
    await this.storeTokens(tokens);
    this.setupTokenRefresh(tokens.expiresIn);
    store.dispatch({ type: 'auth/setTokens', payload: tokens });
  }

  private async storeTokens(tokens: AuthTokens): Promise<void> {
    await SecureStore.setItemAsync(
      this.TOKENS_KEY,
      JSON.stringify(tokens)
    );
  }

  private async getStoredTokens(): Promise<AuthTokens | null> {
    const tokens = await SecureStore.getItemAsync(this.TOKENS_KEY);
    return tokens ? JSON.parse(tokens) : null;
  }

  private async clearTokens(): Promise<void> {
    await SecureStore.deleteItemAsync(this.TOKENS_KEY);
  }

  private setupTokenRefresh(expiresIn: number): void {
    if (this.refreshTokenTimeout) {
      clearTimeout(this.refreshTokenTimeout);
    }

    // Refresh token 5 minutes before expiry
    const refreshTime = (expiresIn - 300) * 1000;
    this.refreshTokenTimeout = setTimeout(() => {
      this.refreshTokens();
    }, refreshTime);
  }

  private async isBiometricsAvailable(): Promise<boolean> {
    const hasHardware = await LocalAuthentication.hasHardwareAsync();
    const isEnrolled = await LocalAuthentication.isEnrolledAsync();
    return hasHardware && isEnrolled;
  }

  private async setupBiometrics(): Promise<void> {
    const enabled = await SecureStore.getItemAsync(this.BIOMETRICS_KEY);
    store.dispatch({
      type: 'auth/setBiometricsEnabled',
      payload: enabled === 'true',
    });
  }

  private async getStoredBiometricCredentials(): Promise<AuthCredentials | null> {
    const credentials = await SecureStore.getItemAsync('biometric_credentials');
    return credentials ? JSON.parse(credentials) : null;
  }

  private async clearStoredBiometricCredentials(): Promise<void> {
    await SecureStore.deleteItemAsync('biometric_credentials');
  }
}

export const authenticationService = AuthenticationService.getInstance();