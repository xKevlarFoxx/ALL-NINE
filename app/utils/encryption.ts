import CryptoJS from 'crypto-js';

// In a production environment, store your secret securely (e.g., in environment variables)
const SECRET_KEY = process.env.SECRET_KEY || 'default-secret-key';

/**
 * Encrypts a plain text string using AES encryption.
 *
 * @param plainText The string to encrypt.
 * @returns The encrypted string.
 */
export function encryptData(plainText: string): string {
  try {
    if (typeof plainText !== 'string') {
      throw new Error('Input must be a string');
    }
    // Encrypt the plain text using AES
    return CryptoJS.AES.encrypt(plainText, SECRET_KEY).toString();
  } catch (error) {
    console.error('Error encrypting data:', error);
    throw new Error('Encryption failed');
  }
}

/**
 * Decrypts an AES encrypted string.
 *
 * @param encryptedText The string to decrypt.
 * @returns The decrypted plain text.
 */
export function decryptData(encryptedText: string): string {
  try {
    if (typeof encryptedText !== 'string') {
      throw new Error('Input must be a string');
    }
    const bytes = CryptoJS.AES.decrypt(encryptedText, SECRET_KEY);
    const decryptedData = bytes.toString(CryptoJS.enc.Utf8);
    if (!decryptedData) {
      throw new Error('Decryption produced an empty result');
    }
    return decryptedData;
  } catch (error) {
    console.error('Error decrypting data:', error);
    throw new Error('Decryption failed');
  }
}