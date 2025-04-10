import AsyncStorage from '@react-native-async-storage/async-storage';
import { COMPLIANCE_CONFIG } from '@/constants/config/compliance';
import { analyticsService } from '../analytics/AnalyticsService';
import { securityService } from '../security/SecurityService';
import { FileManagementService } from '../file/FileManagementService';

interface VerificationRequest {
  userId: string;
  type: 'provider' | 'customer';
  documents: {
    type: string;
    uri: string;
  }[];
}

interface VerificationStatus {
  isVerified: boolean;
  isPremium: boolean;
  verifiedFields: string[];
  pendingFields: string[];
  lastVerified?: Date;
  expiresAt?: Date;
}

export class VerificationService {
  private static instance: VerificationService;
  private fileService: FileManagementService;

  private constructor() {
    this.fileService = FileManagementService.getInstance();
  }

  static getInstance(): VerificationService {
    if (!VerificationService.instance) {
      VerificationService.instance = new VerificationService();
    }
    return VerificationService.instance;
  }

  async initialize(): Promise<void> {
    try {
      // Example setup logic: preload necessary data or configurations
      console.log('VerificationService initialized');
    } catch (error) {
      console.error('Failed to initialize VerificationService:', error);
      throw error;
    }
  }

  async submitVerification(request: VerificationRequest): Promise<boolean> {
    try {
      // Validate required fields
      const requiredFields = COMPLIANCE_CONFIG.verification[request.type].required;
      const missingFields = requiredFields.filter(field => 
        !request.documents.some(doc => doc.type === field)
      );

      if (missingFields.length > 0) {
        throw new Error(`Missing required documents: ${missingFields.join(', ')}`);
      }

      // Process and validate each document
      const processedDocs = await Promise.all(
        request.documents.map(async doc => {
          // Validate file size and type
          const { maxSize, allowedTypes } = COMPLIANCE_CONFIG.verification.methods.documentUpload;
          const fileInfo = await this.fileService.getFileInfo(doc.uri);

          if (fileInfo.size > maxSize) {
            throw new Error(`File ${doc.type} exceeds maximum size of ${maxSize / 1024 / 1024}MB`);
          }

          if (!allowedTypes.includes(fileInfo.type)) {
            throw new Error(`File type ${fileInfo.type} not allowed for ${doc.type}`);
          }

          // Scan for malware if enabled
          if (COMPLIANCE_CONFIG.verification.methods.documentUpload.scanForMalware) {
            const isSafe = await securityService.scanFile(doc.uri);
            if (!isSafe) {
              throw new Error(`File ${doc.type} failed security scan`);
            }
          }

          // Store document securely
          const storedUri = await this.fileService.saveFile(doc.uri, `verifications/${request.userId}`);

          return {
            ...doc,
            uri: storedUri,
            timestamp: new Date(),
          };
        })
      );

      // Store verification request
      await AsyncStorage.setItem(
        `verification_${request.userId}`,
        JSON.stringify({
          type: request.type,
          documents: processedDocs,
          status: 'pending',
          timestamp: new Date(),
        })
      );

      analyticsService.track('Verification_Submitted', {
        userType: request.type,
        documentTypes: request.documents.map(d => d.type),
      });

      // Trigger verification process (would integrate with actual verification service)
      // For now, we'll auto-verify after basic checks
      await this.processVerification(request.userId);

      return true;
    } catch (error) {
      analyticsService.track('Verification_Failed', {
        userType: request.type,
        error: error.message,
      });
      throw error;
    }
  }

  async getVerificationStatus(userId: string): Promise<VerificationStatus> {
    try {
      const stored = await AsyncStorage.getItem(`verification_${userId}`);
      if (!stored) {
        return {
          isVerified: false,
          isPremium: false,
          verifiedFields: [],
          pendingFields: [],
        };
      }

      const verification = JSON.parse(stored);
      const requiredFields = COMPLIANCE_CONFIG.verification[verification.type].required;
      const premiumFields = COMPLIANCE_CONFIG.verification[verification.type].premium?.required || [];

      const verifiedDocs = verification.documents.filter(doc => doc.verified);
      const verifiedFields = verifiedDocs.map(doc => doc.type);

      return {
        isVerified: requiredFields.every(field => verifiedFields.includes(field)),
        isPremium: premiumFields.every(field => verifiedFields.includes(field)),
        verifiedFields,
        pendingFields: requiredFields.filter(field => !verifiedFields.includes(field)),
        lastVerified: verification.lastVerified,
        expiresAt: verification.expiresAt,
      };
    } catch (error) {
      console.error('Failed to get verification status:', error);
      throw error;
    }
  }

  async verifyPhoneNumber(phoneNumber: string, code: string): Promise<boolean> {
    try {
      const { retryLimit, expiryMinutes } = COMPLIANCE_CONFIG.verification.methods.sms;
      
      // Get stored verification attempt
      const stored = await AsyncStorage.getItem(`phone_verification_${phoneNumber}`);
      if (!stored) {
        throw new Error('No verification in progress');
      }

      const verification = JSON.parse(stored);
      
      // Check attempts
      if (verification.attempts >= retryLimit) {
        throw new Error('Maximum verification attempts exceeded');
      }

      // Check expiry
      const expiryTime = verification.timestamp + (expiryMinutes * 60 * 1000);
      if (Date.now() > expiryTime) {
        throw new Error('Verification code expired');
      }

      // Verify code (in production, would call SMS provider's API)
      const isValid = code === verification.code;

      if (!isValid) {
        verification.attempts++;
        await AsyncStorage.setItem(
          `phone_verification_${phoneNumber}`,
          JSON.stringify(verification)
        );
        throw new Error('Invalid verification code');
      }

      // Clear verification data
      await AsyncStorage.removeItem(`phone_verification_${phoneNumber}`);

      return true;
    } catch (error) {
      console.error('Phone verification failed:', error);
      throw error;
    }
  }

  private async processVerification(userId: string): Promise<void> {
    try {
      const stored = await AsyncStorage.getItem(`verification_${userId}`);
      if (!stored) return;

      const verification = JSON.parse(stored);

      // Simulate verification process
      verification.documents = verification.documents.map(doc => ({
        ...doc,
        verified: true,
        verifiedAt: new Date(),
      }));

      verification.status = 'verified';
      verification.lastVerified = new Date();
      verification.expiresAt = new Date(Date.now() + (365 * 24 * 60 * 60 * 1000)); // 1 year

      await AsyncStorage.setItem(
        `verification_${userId}`,
        JSON.stringify(verification)
      );

      analyticsService.track('Verification_Completed', {
        userType: verification.type,
        documentCount: verification.documents.length,
      });
    } catch (error) {
      console.error('Verification processing failed:', error);
      throw error;
    }
  }
}

export const verificationService = VerificationService.getInstance();