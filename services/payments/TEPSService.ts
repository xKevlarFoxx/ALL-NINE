import { COMPLIANCE_CONFIG } from '@/constants/config/compliance';
import { analyticsService } from '../analytics/AnalyticsService';
import { traService } from '../tax/TRAService';

interface TEPSPaymentRequest {
  amount: number;
  currency: string;
  merchantId: string;
  orderId: string;
  description: string;
  customerInfo?: {
    name?: string;
    phone?: string;
    email?: string;
  };
  metadata?: Record<string, any>;
}

interface TEPSPaymentResponse {
  success: boolean;
  transactionId?: string;
  status?: 'pending' | 'completed' | 'failed';
  error?: string;
  receiptNumber?: string;
}

export class TEPSService {
  private static instance: TEPSService;
  private readonly apiEndpoint: string;
  private readonly merchantId: string;
  private readonly apiKey: string;
  private readonly environment: 'sandbox' | 'production';

  private constructor() {
    this.apiEndpoint = process.env.TEPS_API_ENDPOINT || '';
    this.merchantId = process.env.TEPS_MERCHANT_ID || '';
    this.apiKey = process.env.TEPS_API_KEY || '';
    this.environment = (process.env.NODE_ENV === 'production') ? 'production' : 'sandbox';
  }

  static getInstance(): TEPSService {
    if (!TEPSService.instance) {
      TEPSService.instance = new TEPSService();
    }
    return TEPSService.instance;
  }

  async initiatePayment(request: TEPSPaymentRequest): Promise<TEPSPaymentResponse> {
    try {
      // Validate configuration
      if (!COMPLIANCE_CONFIG.teps.enabled) {
        throw new Error('TEPS integration is not enabled');
      }

      // Initialize payment request
      const response = await fetch(`${this.apiEndpoint}/payments`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.apiKey}`,
          'X-Merchant-ID': this.merchantId,
          'X-Environment': this.environment,
          'X-API-Version': COMPLIANCE_CONFIG.teps.version,
        },
        body: JSON.stringify({
          ...request,
          merchantId: this.merchantId,
          timestamp: new Date().toISOString(),
          environment: this.environment,
        }),
      });

      if (!response.ok) {
        throw new Error(`TEPS API returned ${response.status}`);
      }

      const result = await response.json();

      // Track payment initiation
      analyticsService.track('TEPS_Payment_Initiated', {
        amount: request.amount,
        currency: request.currency,
        orderId: request.orderId,
      });

      return {
        success: true,
        transactionId: result.transactionId,
        status: 'pending',
      };
    } catch (error) {
      console.error('TEPS payment initiation failed:', error);
      return {
        success: false,
        error: error.message,
      };
    }
  }

  async checkPaymentStatus(transactionId: string): Promise<TEPSPaymentResponse> {
    try {
      const response = await fetch(
        `${this.apiEndpoint}/payments/${transactionId}/status`,
        {
          headers: {
            'Authorization': `Bearer ${this.apiKey}`,
            'X-Merchant-ID': this.merchantId,
            'X-Environment': this.environment,
          },
        }
      );

      if (!response.ok) {
        throw new Error(`TEPS status check failed: ${response.status}`);
      }

      const result = await response.json();

      // If payment is completed, generate TRA receipt
      if (result.status === 'completed') {
        const receiptNumber = await this.generateReceipt(result);
        return {
          success: true,
          transactionId,
          status: 'completed',
          receiptNumber,
        };
      }

      return {
        success: true,
        transactionId,
        status: result.status as 'pending' | 'completed' | 'failed',
      };
    } catch (error) {
      console.error('TEPS status check failed:', error);
      return {
        success: false,
        error: error.message,
      };
    }
  }

  private async generateReceipt(paymentData: any): Promise<string> {
    try {
      const receiptData = {
        receiptNumber: `TEPS-${paymentData.transactionId}`,
        amount: paymentData.amount,
        items: [
          {
            description: paymentData.description,
            quantity: 1,
            unitPrice: paymentData.amount,
            totalPrice: paymentData.amount,
          },
        ],
        tax: paymentData.amount * 0.18, // 18% VAT
        timestamp: new Date(paymentData.timestamp),
        paymentMethod: 'TEPS',
        businessName: paymentData.merchantName,
        businessTIN: process.env.TRA_TIN || '',
        customerInfo: paymentData.customerInfo,
      };

      const receiptHTML = await traService.generateReceipt(receiptData);
      return receiptData.receiptNumber;
    } catch (error) {
      console.error('Receipt generation failed:', error);
      throw error;
    }
  }

  async validateTransaction(transactionId: string): Promise<boolean> {
    try {
      const response = await fetch(
        `${this.apiEndpoint}/transactions/${transactionId}/validate`,
        {
          headers: {
            'Authorization': `Bearer ${this.apiKey}`,
            'X-Merchant-ID': this.merchantId,
            'X-Environment': this.environment,
          },
        }
      );

      if (!response.ok) {
        throw new Error(`TEPS validation failed: ${response.status}`);
      }

      const result = await response.json();
      return result.valid === true;
    } catch (error) {
      console.error('Transaction validation failed:', error);
      return false;
    }
  }
}

export const tepsService = TEPSService.getInstance();