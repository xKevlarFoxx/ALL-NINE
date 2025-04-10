import QRCode from 'qrcode';
import { COMPLIANCE_CONFIG } from '@/constants/config/compliance';
import { analyticsService } from '../analytics/AnalyticsService';
import { localizationService } from '../localization/LocalizationService';

interface ReceiptData {
  receiptNumber: string;
  amount: number;
  items: {
    description: string;
    quantity: number;
    unitPrice: number;
    totalPrice: number;
  }[];
  tax: number;
  timestamp: Date;
  paymentMethod: string;
  businessName: string;
  businessTIN: string;
  customerInfo?: {
    name?: string;
    tin?: string;
    phone?: string;
  };
}

interface TRAResponse {
  success: boolean;
  zNumber?: string;
  error?: string;
}

export class TRAService {
  private static instance: TRAService;
  private readonly apiEndpoint: string;
  private readonly apiKey: string;
  private readonly businessTIN: string;

  private constructor() {
    this.apiEndpoint = process.env.TRA_API_ENDPOINT || '';
    this.apiKey = process.env.TRA_API_KEY || '';
    this.businessTIN = process.env.TRA_TIN || '';
  }

  static getInstance(): TRAService {
    if (!TRAService.instance) {
      TRAService.instance = new TRAService();
    }
    return TRAService.instance;
  }

  async generateReceipt(data: ReceiptData): Promise<string> {
    try {
      // Register receipt with TRA
      const traResponse = await this.registerWithTRA(data);
      if (!traResponse.success) {
        throw new Error(`TRA registration failed: ${traResponse.error}`);
      }

      // Generate receipt HTML
      const receiptHTML = await this.generateReceiptHTML({
        ...data,
        zNumber: traResponse.zNumber,
      });

      // Track for analytics
      analyticsService.track('Receipt_Generated', {
        amount: data.amount,
        paymentMethod: data.paymentMethod,
        zNumber: traResponse.zNumber,
      });

      return receiptHTML;
    } catch (error) {
      console.error('Receipt generation failed:', error);
      throw error;
    }
  }

  private async registerWithTRA(data: ReceiptData): Promise<TRAResponse> {
    try {
      const response = await fetch(`${this.apiEndpoint}/receipts`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.apiKey}`,
          'X-TIN': this.businessTIN,
        },
        body: JSON.stringify({
          receiptNumber: data.receiptNumber,
          timestamp: data.timestamp.toISOString(),
          amount: data.amount,
          tax: data.tax,
          items: data.items,
          paymentMethod: data.paymentMethod,
          businessTIN: this.businessTIN,
          customerTIN: data.customerInfo?.tin,
        }),
      });

      if (!response.ok) {
        throw new Error(`TRA API returned ${response.status}`);
      }

      const result = await response.json();
      return {
        success: true,
        zNumber: result.zNumber,
      };
    } catch (error) {
      console.error('TRA registration failed:', error);
      return {
        success: false,
        error: error.message,
      };
    }
  }

  private async generateReceiptHTML(data: ReceiptData & { zNumber: string }): Promise<string> {
    const qrData = await this.generateQRCode(data);
    const formattedDate = localizationService.formatDate(data.timestamp);
    const formattedAmount = localizationService.formatCurrency(data.amount);
    const formattedTax = localizationService.formatCurrency(data.tax);

    return `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <style>
            body { font-family: Arial, sans-serif; }
            .header { text-align: center; margin-bottom: 20px; }
            .details { margin-bottom: 20px; }
            .items { width: 100%; border-collapse: collapse; }
            .items th, .items td { border: 1px solid #ddd; padding: 8px; }
            .total { margin-top: 20px; text-align: right; }
            .footer { margin-top: 20px; text-align: center; }
            .qr { text-align: center; margin-top: 20px; }
          </style>
        </head>
        <body>
          <div class="header">
            <h2>${data.businessName}</h2>
            <p>TIN: ${data.businessTIN}</p>
          </div>
          
          <div class="details">
            <p>Receipt No: ${data.receiptNumber}</p>
            <p>Date: ${formattedDate}</p>
            <p>Z Number: ${data.zNumber}</p>
            ${data.customerInfo?.name ? `<p>Customer: ${data.customerInfo.name}</p>` : ''}
            ${data.customerInfo?.tin ? `<p>Customer TIN: ${data.customerInfo.tin}</p>` : ''}
          </div>

          <table class="items">
            <tr>
              <th>Description</th>
              <th>Qty</th>
              <th>Unit Price</th>
              <th>Total</th>
            </tr>
            ${data.items.map(item => `
              <tr>
                <td>${item.description}</td>
                <td>${item.quantity}</td>
                <td>${localizationService.formatCurrency(item.unitPrice)}</td>
                <td>${localizationService.formatCurrency(item.totalPrice)}</td>
              </tr>
            `).join('')}
          </table>

          <div class="total">
            <p>Subtotal: ${formattedAmount}</p>
            <p>VAT (18%): ${formattedTax}</p>
            <p><strong>Total: ${localizationService.formatCurrency(data.amount + data.tax)}</strong></p>
          </div>

          <div class="qr">
            <img src="${qrData}" alt="QR Code" />
          </div>

          <div class="footer">
            <p>This is a valid electronic receipt registered with TRA</p>
            <p>Verify at https://verify.tra.go.tz</p>
          </div>
        </body>
      </html>
    `;
  }

  private async generateQRCode(data: ReceiptData & { zNumber: string }): Promise<string> {
    try {
      const qrData = JSON.stringify({
        r: data.receiptNumber,
        z: data.zNumber,
        t: data.businessTIN,
        a: data.amount,
        d: data.timestamp.toISOString(),
      });

      return await QRCode.toDataURL(qrData);
    } catch (error) {
      console.error('QR code generation failed:', error);
      throw error;
    }
  }

  async validateReceipt(receiptNumber: string, zNumber: string): Promise<boolean> {
    try {
      const response = await fetch(
        `${this.apiEndpoint}/verify?receipt=${receiptNumber}&z=${zNumber}`,
        {
          headers: {
            'Authorization': `Bearer ${this.apiKey}`,
            'X-TIN': this.businessTIN,
          },
        }
      );

      if (!response.ok) {
        throw new Error(`TRA verification failed: ${response.status}`);
      }

      const result = await response.json();
      return result.valid === true;
    } catch (error) {
      console.error('Receipt validation failed:', error);
      return false;
    }
  }
}

export const traService = TRAService.getInstance();