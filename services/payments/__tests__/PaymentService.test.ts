import { paymentService } from '../PaymentService';
import { PAYMENT_CONFIG } from '@/constants/config/payments';

describe('PaymentService', () => {
  beforeEach(() => {
    // Clear any stored transactions
    jest.clearAllMocks();
  });

  describe('initializePayment', () => {
    it('should initialize mobile money payment successfully', async () => {
      const result = await paymentService.initializePayment(
        5000, // TSh 5,000
        'mobileMoney',
        'mpesa'
      );

      expect(result.success).toBeTruthy();
      expect(result.transactionId).toBeDefined();
      expect(result.receiptNumber).toBeDefined();
    });

    it('should reject payment below minimum amount', async () => {
      const result = await paymentService.initializePayment(
        100, // Below minimum
        'mobileMoney',
        'mpesa'
      );

      expect(result.success).toBeFalsy();
      expect(result.error).toContain('Amount must be between');
    });

    it('should reject payment above maximum amount', async () => {
      const result = await paymentService.initializePayment(
        5000000, // Above maximum
        'mobileMoney',
        'mpesa'
      );

      expect(result.success).toBeFalsy();
      expect(result.error).toContain('Amount must be between');
    });

    it('should reject invalid payment method', async () => {
      const result = await paymentService.initializePayment(
        5000,
        'invalidMethod' as any,
        'mpesa'
      );

      expect(result.success).toBeFalsy();
      expect(result.error).toContain('not enabled');
    });

    it('should reject invalid mobile money provider', async () => {
      const result = await paymentService.initializePayment(
        5000,
        'mobileMoney',
        'invalid'
      );

      expect(result.success).toBeFalsy();
      expect(result.error).toContain('Invalid or disabled mobile money provider');
    });
  });

  describe('generateReceipt', () => {
    it('should generate valid TRA receipt', async () => {
      const result = await paymentService.initializePayment(
        5000,
        'mobileMoney',
        'mpesa'
      );

      expect(result.success).toBeTruthy();
      expect(result.receiptNumber).toMatch(/^ALL9-\d+-[a-zA-Z0-9]{6}$/);
    });
  });
});