import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { PAYMENT_CONFIG } from '@/constants/config/payments';
import { COMPLIANCE_CONFIG } from '@/constants/config/compliance';
import { analyticsService } from '../analytics/AnalyticsService';
import { generateUniqueId } from '../utils/stringUtils';
import Stripe from 'stripe';

interface PaymentResult {
  success: boolean;
  transactionId?: string;
  receiptNumber?: string;
  error?: string;
}

interface PaymentMethod {
  name: string;
  enabled: boolean;
  minAmount: number;
  maxAmount: number;
  apiEndpoint: any;
}

type PaymentMethods = {
  [key: string]: PaymentMethod;
};

const paymentMethods: PaymentMethods = {
  mpesa: { name: 'Mpesa', enabled: true, minAmount: 10, maxAmount: 1000, apiEndpoint: null },
  tigoPesa: { name: 'TigoPesa', enabled: true, minAmount: 10, maxAmount: 1000, apiEndpoint: null },
  airtelMoney: { name: 'AirtelMoney', enabled: true, minAmount: 10, maxAmount: 1000, apiEndpoint: null },
};

export class PaymentService {
  private static instance: PaymentService;
  private pendingTransactions: Map<string, any> = new Map();
  private stripe: Stripe;

  private constructor() {
    this.stripe = new Stripe('your-stripe-secret-key', {
      apiVersion: '2025-03-31.basil',
    });
  }

  static getInstance(): PaymentService {
    if (!PaymentService.instance) {
      PaymentService.instance = new PaymentService();
    }
    return PaymentService.instance;
  }

  async initializePayment(
    amount: number,
    method: keyof typeof PAYMENT_CONFIG.supportedPaymentMethods,
    provider?: string
  ): Promise<PaymentResult> {
    try {
      const transactionId = generateUniqueId();
      const paymentMethod = PAYMENT_CONFIG.supportedPaymentMethods[method];

      if (!paymentMethod || typeof paymentMethod !== 'object') {
        throw new Error('Invalid payment method');
      }

      if (!paymentMethod?.enabled) {
        throw new Error(`Payment method ${method} is not enabled`);
      }

      if (typeof provider !== 'string' || !paymentMethods[provider]) {
        throw new Error('Invalid payment provider');
      }

      const { minAmount, maxAmount } = paymentMethods[provider];
      if (!provider || !paymentMethods[provider]?.enabled) {
        throw new Error('Payment provider is not enabled');
      }

      if (amount < minAmount || amount > maxAmount) {
        throw new Error(`Amount must be between ${minAmount} and ${maxAmount}`);
      }

      if (method === 'mobileMoney') {
        return await this.processMobileMoneyPayment(
          amount,
          provider,
          transactionId
        );
      }

      if (method === 'stripe') {
        const currency = PAYMENT_CONFIG.defaultCurrency;
        const source = provider; // Assuming provider is the payment source for Stripe
        const stripePayment = await this.processStripePayment(amount, currency, source);
        return {
          success: true,
          transactionId: stripePayment.id,
        };
      }

      // Handle other payment methods...
      throw new Error('Payment method not implemented');
    } catch (error) {
      if (error instanceof Error) {
        console.error(error.message);
      } else {
        console.error('Unknown error occurred');
      }
      analyticsService.track('Payment_Failed', {
        method,
        provider,
        error: error instanceof Error ? error.message : 'Unknown error',
      });
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  async processStripePayment(amount: number, currency: string, source: string): Promise<Stripe.PaymentIntent> {
    return this.stripe.paymentIntents.create({
      amount: amount * 100, // Convert to cents
      currency,
      payment_method: source,
      confirm: true,
    });
  }

  private async processMobileMoneyPayment(
    amount: number,
    provider: string,
    transactionId: string
  ): Promise<PaymentResult> {
    try {
      const providerConfig = PAYMENT_CONFIG.supportedPaymentMethods.mobileMoney[provider];
      
      // Store pending transaction
      await this.storePendingTransaction(transactionId, {
        amount,
        provider,
        timestamp: Date.now(),
      });

      // Initialize provider-specific API
      const response = await fetch(providerConfig.apiEndpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          transactionId,
          amount,
          currency: PAYMENT_CONFIG.defaultCurrency,
          // Add provider-specific fields
        }),
      });

      if (!response.ok) {
        throw new Error('Payment request failed');
      }

      const receiptNumber = await this.generateReceipt(transactionId, amount, provider);

      return {
        success: true,
        transactionId,
        receiptNumber,
      };
    } catch (error) {
      throw new Error(`Mobile money payment failed: ${error.message}`);
    }
  }

  private async generateReceipt(
    transactionId: string,
    amount: number,
    method: string
  ): Promise<string> {
    const { prefix, includeQR, includeTIN } = COMPLIANCE_CONFIG.tra.receiptFormat;
    const receiptNumber = `${prefix}${Date.now()}-${transactionId.slice(-6)}`;

    // Store receipt data for TRA reporting
    await AsyncStorage.setItem(`receipt_${receiptNumber}`, JSON.stringify({
      transactionId,
      amount,
      method,
      timestamp: Date.now(),
      qrCode: includeQR ? await this.generateQRCode(receiptNumber) : null,
      tin: includeTIN ? process.env.TRA_TIN : null,
    }));

    return receiptNumber;
  }

  private async generateQRCode(receiptNumber: string): Promise<string> {
    // Implement QR code generation
    return `data:image/png;base64,...`; // Placeholder
  }

  private async storePendingTransaction(id: string, data: any): Promise<void> {
    this.pendingTransactions.set(id, data);
    await AsyncStorage.setItem('pending_transactions', 
      JSON.stringify(Array.from(this.pendingTransactions.entries()))
    );
  }

  /**
   * Process a deposit for a booking.
   * @param bookingId - The ID of the booking.
   * @param amount - The deposit amount.
   */
  static async processDeposit(bookingId: string, amount: number): Promise<void> {
    console.log(`Processing deposit of ${amount} for booking ${bookingId}`);
    // Mock implementation: Replace with actual payment gateway integration.
  }

  /**
   * Add a tip to a completed booking.
   * @param bookingId - The ID of the booking.
   * @param tipAmount - The tip amount.
   */
  static async addTip(bookingId: string, tipAmount: number): Promise<void> {
    console.log(`Adding tip of ${tipAmount} to booking ${bookingId}`);
    // Mock implementation: Replace with actual payment gateway integration.
  }
}

export const paymentService = PaymentService.getInstance();