// =================== KYC TYPES DEFINITION FILE ===================
// types/kyc.types.ts

import {ReactNode} from 'react';

// =================== CORE ENUMS ===================
export const KYC_STATUS = {
  NOT_STARTED: 'not_started',
  IN_PROGRESS: 'in_progress',
  COMPLETED: 'completed',
  SKIPPED: 'skipped',
  FAILED: 'failed',
} as const;

export const KYC_RESULT = {
  SUCCESS: 'success',
  SKIP: 'skip',
  ERROR: 'error',
  CANCELLED: 'cancelled',
} as const;

// =================== TYPE UNIONS ===================
export type KycStatusType = (typeof KYC_STATUS)[keyof typeof KYC_STATUS];
export type KycResultType = (typeof KYC_RESULT)[keyof typeof KYC_RESULT];

// =================== CORE INTERFACES ===================

/**
 * KYC Status object containing all status information
 */
export interface KycStatus {
  /** Current KYC status */
  status: KycStatusType;
  /** Whether KYC is completed */
  isCompleted: boolean;
  /** Whether KYC is in progress */
  isInProgress: boolean;
  /** Whether KYC has not been started */
  isNotStarted: boolean;
  /** Whether KYC was skipped */
  isSkipped: boolean;
  /** Whether KYC has failed */
  isFailed: boolean;
  /** Whether KYC is currently processing */
  isProcessing: boolean;
  /** Current error message, if any */
  error: string | null;
}

/**
 * Options for the checkKYC function
 */
export interface CheckKycOptions {
  /** Callback when KYC is successfully completed */
  onSuccess?: (result?: any) => void;
  /** Callback when KYC is skipped */
  onSkip?: () => void;
  /** Callback when KYC encounters an error */
  onError?: (error: any) => void;
  /** Callback when KYC is cancelled */
  onCancel?: () => void;
  /** Whether to force show KYC modal even if previously completed/skipped */
  forceShow?: boolean;
  /** Whether to show success/error alerts */
  showAlerts?: boolean;
}

/**
 * Result returned by KYC verification functions
 */
export interface VerificationResult {
  /** Result type */
  result: KycResultType;
  /** Human-readable message */
  message: string;
  /** Additional data, if any */
  data?: any;
  /** Error details, if any */
  error?: string;
}

/**
 * Pending callbacks stored during KYC process
 */
export interface PendingCallbacks {
  onSuccess?: (result?: any) => void;
  onSkip?: () => void;
  onError?: (error: any) => void;
  onCancel?: () => void;
}

// =================== CONTEXT INTERFACES ===================

/**
 * Main Global KYC Context interface
 */
export interface GlobalKycContextType {
  // Status
  /** Current KYC status object */
  kycStatus: KycStatus;

  // Modal/Bottom Sheet
  /** Whether KYC bottom sheet is visible */
  isKycBottomSheetVisible: boolean;
  /** Show KYC bottom sheet */
  showKycBottomSheet: () => void;
  /** Hide KYC bottom sheet */
  hideKycBottomSheet: () => void;

  // Main Actions
  /** Main function to check and initiate KYC */
  checkKYC: (options?: CheckKycOptions) => Promise<VerificationResult>;
  /** Start KYC verification process */
  startKycVerification: () => Promise<VerificationResult>;
  /** Skip KYC verification */
  skipKycVerification: () => Promise<VerificationResult>;

  // Utility
  /** Check if KYC is required */
  isKycRequired: () => boolean;
  /** Reset KYC state */
  resetKycState: () => Promise<void>;

  // Constants
  /** KYC status constants */
  KYC_STATUS: typeof KYC_STATUS;
  /** KYC result constants */
  KYC_RESULT: typeof KYC_RESULT;
}

/**
 * Props for GlobalKycProvider component
 */
export interface GlobalKycProviderProps {
  children: ReactNode;
}

// =================== HOOK RETURN TYPES ===================

/**
 * Return type for useKycCheck hook
 */
export interface UseKycCheckReturn {
  /** Main function to check and initiate KYC */
  checkKYC: (options?: CheckKycOptions) => Promise<VerificationResult>;
  /** Current KYC status object */
  kycStatus: KycStatus;
  /** Check if KYC is required */
  isKycRequired: boolean;
  /** Whether KYC is completed */
  isKycCompleted: boolean;
  /** Whether KYC was skipped */
  isKycSkipped: boolean;
  /** Whether KYC is currently processing */
  isKycProcessing: boolean;
}

/**
 * Return type for useProtectedAction hook
 */
export interface UseProtectedActionReturn {
  /** Execute a protected action with KYC verification */
  executeProtectedAction: <T>(
    action: () => Promise<T>,
    options?: ProtectedActionOptions,
  ) => Promise<T>;
  /** Whether the action is allowed (KYC completed) */
  isActionAllowed: boolean;
}

// =================== COMPONENT PROP INTERFACES ===================

/**
 * Props for transaction-related components
 */
export interface TransactionComponentProps {
  /** Transaction amount */
  amount: number;
  /** Currency code (default: USD) */
  currency?: string;
  /** Callback when transaction is complete */
  onTransactionComplete?: (amount: number, txId: string) => void;
  /** Whether the component is disabled */
  disabled?: boolean;
}

/**
 * Props for FeatureGate component
 */
export interface FeatureGateProps {
  /** Child components to render when unlocked */
  children: ReactNode;
  /** Whether KYC is required (default: true) */
  requireKyc?: boolean;
  /** Name of the feature being gated */
  featureName?: string;
  /** Custom component to show when locked */
  fallbackComponent?: ReactNode;
  /** Callback when feature is unlocked */
  onUnlock?: () => void;
}

/**
 * Props for verification badge components
 */
export interface VerificationBadgeProps {
  /** Size of the badge */
  size?: 'small' | 'medium' | 'large';
  /** Whether to show status text */
  showText?: boolean;
  /** Custom style */
  style?: any;
  /** Callback when badge is pressed */
  onPress?: () => void;
}

// =================== SERVICE INTERFACES ===================

/**
 * Payment data interface
 */
export interface PaymentData {
  /** Payment amount */
  amount: number;
  /** Currency code */
  currency: string;
  /** Recipient identifier */
  recipientId: string;
  /** Optional memo */
  memo?: string;
  /** Additional metadata */
  metadata?: Record<string, any>;
}

/**
 * Payment result interface
 */
export interface PaymentResult {
  /** Whether payment was successful */
  success: boolean;
  /** Transaction ID */
  transactionId: string;
  /** Payment amount */
  amount: number;
  /** Payment timestamp */
  timestamp: Date;
  /** Additional result data */
  data?: any;
}

/**
 * Payment error interface
 */
export interface PaymentError extends Error {
  /** Error code */
  code: string;
  /** Additional error details */
  details?: any;
}

// =================== SUMSUB SDK INTERFACES ===================

/**
 * SumSub SDK result interface
 */
export interface SumSubResult {
  /** Verification status */
  status: string;
  /** Optional message */
  message?: string;
  /** Additional data */
  data?: any;
}

/**
 * SumSub status change event
 */
export interface SumSubEvent {
  /** New status */
  newStatus: string;
  /** Optional message */
  message?: string;
}

/**
 * SumSub log event
 */
export interface SumSubLogEvent {
  /** Log message */
  message: string;
  /** Log level */
  level?: string;
  /** Timestamp */
  timestamp?: string;
}

// =================== GRAPHQL INTERFACES ===================

/**
 * KYC token data from backend
 */
export interface KycTokenData {
  /** Access token */
  token: string | null;
  /** User ID */
  userId: string | null;
  /** Token expiry time */
  expiryTime: number | null;
}

/**
 * Create KYC verification variables
 */
export interface CreateKycVerificationVariables {
  input: {
    email: string;
    levelName: string;
  };
}

/**
 * Create KYC verification response
 */
export interface CreateKycVerificationResponse {
  createKYCVerification: {
    response: string | any;
  };
}

/**
 * Update KYC status variables
 */
export interface UpdateKycStatusVariables {
  /** User email address */
  emailAddress: string;
  /** Whether user is verified */
  is_verified: boolean;
  /** SumSub applicant ID */
  applicantId?: string;
  /** Access token */
  accessToken?: string;
  /** KYC details JSON */
  kycDetails?: string;
}

/**
 * Update KYC status response
 */
export interface UpdateKycStatusResponse {
  updateIsVerified: {
    emailAddress: string;
    is_verified: boolean;
    applicantId?: string;
    accessToken?: string;
    kycDetails?: string;
  };
}

/**
 * Get KYC details variables
 */
export interface GetKycDetailsVariables {
  /** SumSub applicant ID */
  applicantId: string;
}

/**
 * Get KYC details response
 */
export interface GetKycDetailsResponse {
  getKycUserSumsubDetails: {
    response: any;
  };
}

// =================== UTILITY INTERFACES ===================

/**
 * Options for protected actions
 */
export interface ProtectedActionOptions extends CheckKycOptions {
  /** Whether KYC is required for this action */
  requireKyc?: boolean;
}

/**
 * Status display configuration
 */
export interface StatusDisplayConfig {
  /** Status text */
  text: string;
  /** Status color */
  color: string;
  /** Status icon */
  icon: string;
}

/**
 * Content configuration for bottom sheet
 */
export interface ContentConfig {
  /** Title text */
  title: string;
  /** Description text */
  description: string;
  /** Whether to show action buttons */
  showButtons: boolean;
  /** Primary button text */
  primaryButtonText?: string;
  /** Secondary button text */
  secondaryButtonText?: string;
}

// =================== UTILITY FUNCTIONS TYPES ===================

/**
 * Type for status color getter function
 */
export type StatusColorGetter = (status: KycStatusType) => string;

/**
 * Type for status text getter function
 */
export type StatusTextGetter = (status: KycStatus) => string;

/**
 * Type for KYC requirement checker function
 */
export type KycRequirementChecker = (
  userRole?: string,
  featureLevel?: string,
) => boolean;

// =================== EXPORT ALL TYPES ===================
export {
  // Re-export constants
  KYC_STATUS,
  KYC_RESULT,
};

// =================== DEFAULT EXPORT ===================
export default {
  KYC_STATUS,
  KYC_RESULT,
  // Export all interfaces as well
} as const;
