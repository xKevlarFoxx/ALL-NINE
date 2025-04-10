import { traService } from '../TRAService';
import { COMPLIANCE_CONFIG } from '@/constants/config/compliance';

describe('TRAService', () => {
  const mockReceiptData = {
    receiptNumber: 'ALL9-20250410-123456',
    amount: 5000,
    items: [
      {
        description: 'Cleaning Service',
        quantity: 1,
        unitPrice: 5000,
        totalPrice: 5000,
      },
    ],
    tax: 900, // 18% VAT
    timestamp: new Date('2025-04-10T12:00:00Z'),
    paymentMethod: 'M-Pesa',
    businessName: 'Test Business',
    businessTIN: '123456789',
    customerInfo: {
      name: 'John Doe',
      phone: '+255123456789',
    },
  };

  describe('generateReceipt', () => {
    it('should generate valid receipt with QR code', async () => {
      const receiptHTML = await traService.generateReceipt(mockReceiptData);

      // Verify receipt structure
      expect(receiptHTML).toContain(mockReceiptData.businessName);
      expect(receiptHTML).toContain(mockReceiptData.businessTIN);
      expect(receiptHTML).toContain(mockReceiptData.receiptNumber);
      expect(receiptHTML).toContain('TSh 5,000/='); // Formatted amount
      expect(receiptHTML).toContain('VAT (18%)');
      expect(receiptHTML).toContain('data:image/png;base64'); // QR code
      expect(receiptHTML).toContain('class="qr"');
    });

    it('should include customer info when provided', async () => {
      const receiptHTML = await traService.generateReceipt(mockReceiptData);
      expect(receiptHTML).toContain(mockReceiptData.customerInfo.name);
      expect(receiptHTML).toContain(mockReceiptData.customerInfo.phone);
    });

    it('should handle missing customer info', async () => {
      const receiptData = {
        ...mockReceiptData,
        customerInfo: undefined,
      };
      const receiptHTML = await traService.generateReceipt(receiptData);
      expect(receiptHTML).not.toContain('Customer:');
    });

    it('should include TRA-required fields', async () => {
      const receiptHTML = await traService.generateReceipt(mockReceiptData);
      
      // Check for required TRA elements
      const requiredElements = [
        'Z Number:',
        'TIN:',
        'This is a valid electronic receipt registered with TRA',
        'Verify at https://verify.tra.go.tz',
      ];

      requiredElements.forEach(element => {
        expect(receiptHTML).toContain(element);
      });
    });
  });

  describe('validateReceipt', () => {
    it('should validate a legitimate receipt', async () => {
      const isValid = await traService.validateReceipt(
        'ALL9-20250410-123456',
        'Z123456789'
      );
      expect(isValid).toBeTruthy();
    });

    it('should reject an invalid receipt', async () => {
      const isValid = await traService.validateReceipt(
        'INVALID-RECEIPT',
        'INVALID-Z'
      );
      expect(isValid).toBeFalsy();
    });
  });

  describe('registerWithTRA', () => {
    it('should successfully register receipt with TRA', async () => {
      const response = await traService.generateReceipt(mockReceiptData);
      expect(response).toBeTruthy();
    });

    it('should handle TRA API errors gracefully', async () => {
      // Simulate API error by using invalid TIN
      const invalidData = {
        ...mockReceiptData,
        businessTIN: 'invalid',
      };

      await expect(
        traService.generateReceipt(invalidData)
      ).rejects.toThrow('TRA registration failed');
    });
  });
});