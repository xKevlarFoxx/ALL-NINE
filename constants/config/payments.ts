export const PAYMENT_CONFIG = {
  defaultCurrency: 'TZS',
  supportedPaymentMethods: {
    mobileMoney: {
      mpesa: {
        name: 'M-Pesa',
        enabled: true,
        minAmount: 500,
        maxAmount: 3000000,
        apiEndpoint: process.env.MPESA_API_ENDPOINT,
      },
      tigoPesa: {
        name: 'Tigo Pesa',
        enabled: true,
        minAmount: 500,
        maxAmount: 3000000,
        apiEndpoint: process.env.TIGO_API_ENDPOINT,
      },
      airtelMoney: {
        name: 'Airtel Money',
        enabled: true,
        minAmount: 500,
        maxAmount: 3000000,
        apiEndpoint: process.env.AIRTEL_API_ENDPOINT,
      },
    },
    bankTransfer: {
      enabled: true,
      minAmount: 50000, // Higher minimum for bank transfers
      supportedBanks: ['CRDB', 'NMB', 'NBC'],
    },
    cash: {
      enabled: true,
      requiresReceipt: true,
    },
  },
  commission: {
    default: 0.15, // 15% default commission
    tiers: [
      { threshold: 100000, rate: 0.10 }, // 10% for transactions above 100,000 TZS
      { threshold: 500000, rate: 0.08 }, // 8% for transactions above 500,000 TZS
      { threshold: 1000000, rate: 0.05 }, // 5% for transactions above 1,000,000 TZS
    ],
  },
  cancellation: {
    freeCancellationHours: 24,
    partialRefundHours: 12,
    refundPercentage: 50,
  },
};