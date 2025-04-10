/* Refactored Authentication Service
   This service provides a signUp function that simulates an API call, handles secure storage cleanup, and returns a promise.
*/
import AsyncStorage from '@react-native-async-storage/async-storage';
import { deleteItemAsync } from 'expo-secure-store';
import { encryptData } from '@/utils/encryption';
import { SECURE_STORE_KEYS, SUCCESS_MESSAGES, ERROR_MESSAGES } from '@/constants';

export interface SignUpData {
  currentStep: number;
  data: {
    fullName: string;
    email: string;
    phoneNumber: string;
    dateOfBirth: string;
    preferences: any;
    password?: string;
    confirmPassword?: string;
  };
}

export async function signUp(signUpData: SignUpData): Promise<void> {
  try {
    // Simulate a network/API call – in production replace with actual request handler
    await simulateAPICall();

    // Clean up stored data after successful account creation
    await Promise.all([
      AsyncStorage.removeItem(SECURE_STORE_KEYS.FORM_DATA),
      deleteItemAsync(SECURE_STORE_KEYS.SENSITIVE_DATA)
    ]);
  } catch (error) {
    console.error('Account creation failed:', error);
    throw new Error(ERROR_MESSAGES.UNKNOWN_ERROR);
  }
}

async function simulateAPICall(): Promise<void> {
  // Simulate delay; replace with real API call as needed.
  return new Promise(resolve => setTimeout(resolve, 1500));
}