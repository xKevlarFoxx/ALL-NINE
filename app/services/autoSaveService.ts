/* AutoSave Service
   This service encapsulates logic to auto-save the form data.
   It safely persists non-sensitive form data to AsyncStorage and encrypts sensitive information to SecureStore.
*/
import AsyncStorage from '@react-native-async-storage/async-storage';
import { setItemAsync } from 'expo-secure-store';
import { encryptData } from '@/utils/encryption';
import { SECURE_STORE_KEYS, AUTOSAVE_DELAY } from '@/constants';

export interface FormState {
  currentStep: number;
  data: {
    fullName?: string;
    email?: string;
    phoneNumber?: string;
    dateOfBirth?: string;
    preferences?: any;
    password?: string;
    confirmPassword?: string;
  };
}

/**
 * Uses a timeout to auto-save form state after delay.
 *
 * @param state The current form state.
 * @param isOffline The current network status.
 * @returns A promise that resolves with the date-time of the last save.
 */
export async function autoSaveFormData(state: FormState, isOffline: boolean): Promise<Date | null> {
  if (isOffline) return null;

  try {
    const formData = {
      currentStep: state.currentStep,
      data: {
        fullName: state.data.fullName,
        email: state.data.email,
        phoneNumber: state.data.phoneNumber,
        dateOfBirth: state.data.dateOfBirth,
        preferences: state.data.preferences
      }
    };

    await AsyncStorage.setItem(SECURE_STORE_KEYS.FORM_DATA, JSON.stringify(formData));

    if (state.data.password) {
      const sensitiveInfo = {
        password: state.data.password,
        confirmPassword: state.data.confirmPassword
      };
      const encryptedData = encryptData(JSON.stringify(sensitiveInfo));
      await setItemAsync(SECURE_STORE_KEYS.SENSITIVE_DATA, encryptedData);
    }

    return new Date();
  } catch (error) {
    console.error('Error auto-saving:', error);
    return null;
  }
}

/**
 * Sets up an auto-save timeout based on the AUTOSAVE_DELAY.
 *
 * @param state The current form state.
 * @param isOffline Flag to indicate network connectivity.
 * @param callback A callback that receives the last saved date.
 * @returns A timeout ID that can be cleared if needed.
 */
export function setupAutoSave(state: FormState, isOffline: boolean, callback: (lastSaved: Date | null) => void): NodeJS.Timeout {
  return setTimeout(async () => {
    const lastSaved = await autoSaveFormData(state, isOffline);
    callback(lastSaved);
  }, AUTOSAVE_DELAY);
}