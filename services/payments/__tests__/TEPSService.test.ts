import { tepsService } from '../TEPSService';
import { COMPLIANCE_CONFIG } from '@/constants/config/compliance';

describe('TEPSService', () => {
  const mockPaymentRequest = {
    amount: 5000,
    currency: 'TZS',
    merchantId: 'TEST_MERCHANT',
    orderId: 'ORDER-123',
    description: 'Test Payment',
    customerInfo: {
      name: 'John Doe',
      phone: '+255123456789',
      email: 'john@example.com',
    },
  };

  beforeEach(() => {
    // Reset any mocks and ensure TEPS is enabled
    jest.clearAllMocks();
    process.env.TEPS_API_ENDPOINT = 'https://api.teps.co.tz/v1';
    process.env.TEPS_MERCHANT_ID = 'TEST_MERCHANT';
    process.env.TEPS_API_KEY = 'test_key';
  });

  describe('initiatePayment', () => {
    it('should initialize TEPS payment successfully', async () => {
      const result = await tepsService.initiatePayment(mockPaymentRequest);

      expect(result.success).toBeTruthy();
      expect(result.transactionId).toBeDefined();
      expect(result.status).toBe('pending');
    });

    it('should fail if TEPS is not enabled', async () => {
      // Temporarily disable TEPS
      const originalConfig = { ...COMPLIANCE_CONFIG.teps };
      COMPLIANCE_CONFIG.teps.enabled = false;

      const result = await tepsService.initiatePayment(mockPaymentRequest);

      expect(result.success).toBeFalsy();
      expect(result.error).toBe('TEPS integration is not enabled');

      // Restore original config
      COMPLIANCE_CONFIG.teps.enabled = originalConfig.enabled;
    });

    it('should handle API errors gracefully', async () => {
      // Simulate API error with invalid merchant ID
      process.env.TEPS_MERCHANT_ID = 'INVALID';

      const result = await tepsService.initiatePayment(mockPaymentRequest);

      expect(result.success).toBeFalsy();
      expect(result.error).toBeDefined();
    });
  });

  describe('checkPaymentStatus', () => {
    const mockTransactionId = 'TEPS-123456';

    it('should return pending status for new transaction', async () => {
      const result = await tepsService.checkPaymentStatus(mockTransactionId);

      expect(result.success).toBeTruthy();
      expect(result.status).toBe('pending');
    });

    it('should return completed status with receipt for completed payment', async () => {
      // First initiate payment
      const initResult = await tepsService.initiatePayment(mockPaymentRequest);
      expect(initResult.success).toBeTruthy();

      // Then check status (simulating completed payment)
      const result = await tepsService.checkPaymentStatus(initResult.transactionId!);

      expect(result.success).toBeTruthy();
      expect(result.status).toBe('completed');
      expect(result.receiptNumber).toBeDefined();
      expect(result.receiptNumber).toMatch(/^TEPS-/);
    });

    it('should handle invalid transaction ID', async () => {
      const result = await tepsService.checkPaymentStatus('INVALID-ID');

      expect(result.success).toBeFalsy();
      expect(result.error).toBeDefined();
    });
  });

  describe('validateTransaction', () => {
    it('should validate legitimate transaction', async () => {
      // First create a transaction
      const initResult = await tepsService.initiatePayment(mockPaymentRequest);
      expect(initResult.success).toBeTruthy();

      // Then validate it
      const isValid = await tepsService.validateTransaction(initResult.transactionId!);
      expect(isValid).toBeTruthy();
    });

    it('should reject invalid transaction', async () => {
      const isValid = await tepsService.validateTransaction('INVALID-TX');
      expect(isValid).toBeFalsy();
    });
  });

  describe('receipt generation', () => {
    it('should generate TRA-compliant receipt for completed payment', async () => {
      // Create and complete a payment
      const initResult = await tepsService.initiatePayment(mockPaymentRequest);
      expect(initResult.success).toBeTruthy();

      const statusResult = await tepsService.checkPaymentStatus(initResult.transactionId!);
      expect(statusResult.success).toBeTruthy();
      expect(statusResult.status).toBe('completed');

      // Verify receipt format
      expect(statusResult.receiptNumber).toMatch(/^TEPS-/);
    });
  });
});