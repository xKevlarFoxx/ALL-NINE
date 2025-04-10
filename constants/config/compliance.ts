export const COMPLIANCE_CONFIG = {
  verification: {
    provider: {
      required: ['phoneNumber', 'businessRegistration'],
      optional: ['nidaId'],
      premium: {
        required: ['nidaId', 'businessLicense', 'taxClearance'],
        benefits: ['priorityListing', 'verifiedBadge', 'enhancedSupport'],
      },
    },
    customer: {
      required: ['phoneNumber'],
      optional: ['email', 'nidaId'],
    },
    methods: {
      sms: {
        provider: 'infobip',
        retryLimit: 3,
        expiryMinutes: 10,
      },
      documentUpload: {
        maxSize: 5 * 1024 * 1024, // 5MB
        allowedTypes: ['image/jpeg', 'image/png', 'application/pdf'],
        scanForMalware: true,
      },
    },
  },
  legal: {
    dataRetention: {
      userProfile: 24, // months
      transactions: 60, // months (5 years as per TRA requirements)
      communications: 12, // months
    },
    termsVersion: '1.0.0',
    privacyVersion: '1.0.0',
    requiredConsent: [
      'dataCollection',
      'locationServices',
      'communications',
    ],
    optionalConsent: [
      'marketing',
      'analytics',
    ],
  },
  tra: {
    enabled: true,
    receiptFormat: {
      prefix: 'ALL9-',
      includeQR: true,
      includeTIN: true,
    },
    reportingInterval: 'daily',
  },
  teps: {
    enabled: true,
    environment: process.env.NODE_ENV === 'production' ? 'production' : 'sandbox',
    version: '2.0',
    timeout: 30000, // 30 seconds
  },
};