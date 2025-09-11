import React, {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
  useRef,
  ReactNode,
} from 'react';
import secureStorage from '../utils/secureStorage';
import {useMutation, gql, TypedDocumentNode} from '@apollo/client';
// @ts-ignore
import SNSMobileSDK from '@sumsub/react-native-mobilesdk-module';
import {useAuth} from '../../screens/Provider/authProvider';
import {useApolloClientContext} from '../../screens/Provider/GraphQLProvider';
import {parseDataAndReturnFixedInfo} from '../Screens/AuthScreens/loginScreen';
import {CREATE_KYC_VERIFICATION} from '../graphql/queries';

// =================== TYPES & INTERFACES ===================
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

export type KycStatusType = (typeof KYC_STATUS)[keyof typeof KYC_STATUS];
export type KycResultType = (typeof KYC_RESULT)[keyof typeof KYC_RESULT];

const KYC_STARTED_KEY = 'kyc_started';

// SumSub SDK Types
interface SumSubResult {
  status: string;
  message?: string;
}

interface SumSubEvent {
  newStatus: string;
  message?: string;
}

interface SumSubLogEvent {
  message: string;
}

interface CreateKycVerificationVariables {
  email: string;
  levelName: string;
}

interface CreateKycVerificationResponse {
  createKYCVerification: {
    response: string | any;
  };
}

interface UpdateKycStatusVariables {
  emailAddress: string;
  is_verified: boolean;
  applicantId?: string;
  accessToken?: string;
  kycDetails?: string;
}

interface UpdateKycStatusResponse {
  updateIsVerified: {
    emailAddress: string;
    is_verified: boolean;
    applicantId?: string;
    accessToken?: string;
    kycDetails?: string;
  };
}

interface GetKycDetailsVariables {
  applicantId: string;
}

interface GetKycDetailsResponse {
  getKycUserDetails: {
    response: any;
  };
}

// KYC Status Object
interface KycStatus {
  status: KycStatusType;
  isCompleted: boolean;
  isInProgress: boolean;
  isNotStarted: boolean;
  isSkipped: boolean;
  isFailed: boolean;
  isProcessing: boolean;
  error: string | null;
}

// Check KYC Options
interface CheckKycOptions {
  onSuccess?: (result?: any) => void;
  onSkip?: () => void;
  onError?: (error: any) => void;
  onCancel?: () => void;
  forceShow?: boolean;
  showAlerts?: boolean;
}

// Verification Result
interface VerificationResult {
  result: KycResultType;
  message: string;
  data?: any;
  error?: string;
}

// Pending Callbacks
interface PendingCallbacks {
  onSuccess?: (result?: any) => void;
  onSkip?: () => void;
  onError?: (error: any) => void;
  onCancel?: () => void;
}

// Context Type
export interface GlobalKycContextType {
  // Status
  kycStatus: KycStatus;

  // Modal/Bottom Sheet
  isKycBottomSheetVisible: boolean;
  showKycBottomSheet: () => void;
  hideKycBottomSheet: () => void;

  // Main Actions
  checkKYC: (options?: CheckKycOptions) => Promise<VerificationResult>;
  startKycVerification: () => Promise<VerificationResult>;
  skipKycVerification: () => Promise<VerificationResult>;

  // Utility
  isKycRequired: () => boolean;
  resetKycState: () => Promise<void>;

  // Constants
  KYC_STATUS: typeof KYC_STATUS;
  KYC_RESULT: typeof KYC_RESULT;
}

// Provider Props
interface GlobalKycProviderProps {
  children: ReactNode;
}

// =================== GRAPHQL QUERIES ===================

const UPDATE_KYC_STATUS = gql`
  mutation updateIsVerified(
    $emailAddress: String!
    $is_verified: Boolean!
    $applicantId: String
    $accessToken: String
    $kycDetails: String
  ) {
    updateIsVerified(
      input: {
        emailAddress: $emailAddress
        is_verified: $is_verified
        applicantId: $applicantId
        accessToken: $accessToken
        kycDetails: $kycDetails
      }
    ) {
      emailAddress
      is_verified
      applicantId
      accessToken
      kycDetails
    }
  }
`;

const GET_COMPANY_DETAILS = gql`
  query getKycUserDetails($applicantId: String!) {
    getKycUserDetails(applicantId: $applicantId) {
      response
    }
  }
`;

// =================== CONTEXT CREATION ===================
const GlobalKycContext = createContext<GlobalKycContextType | null>(null);

// =================== MAIN PROVIDER COMPONENT ===================
export const GlobalKycProvider: React.FC<GlobalKycProviderProps> = ({
  children,
}) => {
  const {userDetails, updateUserData} = useAuth();
  const {client} = useApolloClientContext();

  // =================== STATE ===================
  const [kycInternalStatus, setKycInternalStatus] = useState<KycStatusType>(
    KYC_STATUS.NOT_STARTED,
  );
  const [isKycProcessing, setIsKycProcessing] = useState<boolean>(false);
  const [kycError, setKycError] = useState<string | null>(null);
  const [isKycBottomSheetVisible, setIsKycBottomSheetVisible] =
    useState<boolean>(false);
  const [_isKycStarted, setIsKycStarted] = useState<boolean>(false);

  // Store callbacks for handling results
  const pendingCallbacks = useRef<PendingCallbacks>({});

  // =================== MUTATIONS ===================
  const [createKycVerification] = useMutation<
    CreateKycVerificationResponse,
    CreateKycVerificationVariables
  >(CREATE_KYC_VERIFICATION);

  const [updateKycStatusMutation] = useMutation<
    UpdateKycStatusResponse,
    UpdateKycStatusVariables
  >(UPDATE_KYC_STATUS);

  // =================== UTILITY FUNCTIONS ===================

  // Get KYC details from backend
  const getKYCDetails = useCallback(
    async (applicantId: string): Promise<any> => {
      if (!applicantId || !client) {
        throw new Error('Applicant ID and Apollo client are required');
      }

      try {
        const {data} = await client.query({
          query: GET_COMPANY_DETAILS as TypedDocumentNode<
            GetKycDetailsResponse,
            GetKycDetailsVariables
          >,
          variables: {applicantId},
          errorPolicy: 'all',
          fetchPolicy: 'network-only',
        });

        return data?.getKycUserDetails?.response || [];
      } catch (error) {
        console.error('Failed to fetch KYC data:', error);
        throw error;
      }
    },
    [client],
  );

  // Initialize KYC status from user details
  const initializeKycStatus = useCallback((): void => {
    if (userDetails) {
      const isVerified =
        userDetails?.is_verified === true ||
        userDetails?.is_verified === 'true';

      if (isVerified) {
        setKycInternalStatus(KYC_STATUS.COMPLETED);
      } else if (userDetails?.kycDetails) {
        setKycInternalStatus(KYC_STATUS.IN_PROGRESS);
      } else {
        setKycInternalStatus(KYC_STATUS.NOT_STARTED);
      }
    }
  }, [userDetails]);

  // Load KYC started status from secure storage
  useEffect(() => {
    const loadKycStartedStatus = async (): Promise<void> => {
      try {
        const kycStartedValue = await secureStorage.getItem(KYC_STARTED_KEY);
        if (kycStartedValue !== null) {
          setIsKycStarted(JSON.parse(kycStartedValue));
        }
      } catch (error) {
        console.error('Error loading KYC started status:', error);
      }
    };

    loadKycStartedStatus();
    initializeKycStatus();
  }, [initializeKycStatus]);

  // Update status when user details change
  useEffect(() => {
    initializeKycStatus();
  }, [userDetails, initializeKycStatus]);

  // =================== KYC STATUS OBJECT ===================
  const kycStatus: KycStatus = {
    status: kycInternalStatus,
    isCompleted: kycInternalStatus === KYC_STATUS.COMPLETED,
    isInProgress: kycInternalStatus === KYC_STATUS.IN_PROGRESS,
    isNotStarted: kycInternalStatus === KYC_STATUS.NOT_STARTED,
    isSkipped: kycInternalStatus === KYC_STATUS.SKIPPED,
    isFailed: kycInternalStatus === KYC_STATUS.FAILED,
    isProcessing: isKycProcessing,
    error: kycError,
  };

  // =================== CORE KYC FUNCTIONS ===================
  // Get KYC token from backend
  const handleKYCToken = useCallback(async (): Promise<{
    accessToken: string;
    userId: string | null;
  } | null> => {
    const userEmail = userDetails?.emailAddress;

    if (!userEmail) {
      console.error('No user email available');
      return null;
    }

    try {
      const result = await createKycVerification({
        variables: {
          email: userEmail,
          levelName: 'basic-kyc-level',
        },
      });

      let responseData = result.data?.createKYCVerification?.response;

      if (!responseData) {
        return null;
      }

      // Parse the response data
      let parsedData: any;
      if (typeof responseData === 'string') {
        parsedData = JSON.parse(responseData);
      } else {
        parsedData = responseData;
      }

      // Parse body if needed
      let bodyData: any;
      if (typeof parsedData.body === 'string') {
        bodyData = JSON.parse(parsedData.body);
      } else {
        bodyData = parsedData.body || parsedData;
      }

      const token = bodyData?.accessTokenData?.token || null;
      const userId = bodyData?.applicantId || null;

      if (token) {
        return {accessToken: token, userId};
      } else {
        console.error('Failed to obtain KYC token');
        return null;
      }
    } catch (err) {
      console.error('Verification process failed:', err);
      return null;
    }
  }, [userDetails, createKycVerification]);

  // Update KYC status in backend
  const updateUserKycStatus = useCallback(
    async (
      isVerified: boolean = true,
      applicantId: string | null,
      accessToken: string | null,
    ): Promise<any> => {
      try {
        const userEmail = userDetails?.emailAddress;
        if (!userEmail) {
          throw new Error('No email address available');
        }

        const res = await getKYCDetails(applicantId || '');
        const kycDetails = res;

        const result = await updateKycStatusMutation({
          variables: {
            emailAddress: userEmail.toLowerCase(),
            is_verified: isVerified,
            applicantId: applicantId || '',
            accessToken: accessToken || '',
            kycDetails: JSON.stringify(kycDetails),
          },
        });

        const kycDetailsParsed = JSON.parse(JSON.stringify(kycDetails));
        const extractedKycInfo = parseDataAndReturnFixedInfo(kycDetailsParsed);

        if (extractedKycInfo) {
          updateUserData(
            {
              ...userDetails,
              kycDetails: extractedKycInfo,
              is_verified: isVerified,
              applicantId: applicantId || '',
              accessToken: accessToken || '',
            },
            true,
          );
        }

        return result;
      } catch (error) {
        console.error('Failed to update KYC status:', error);
        throw error;
      }
    },
    [userDetails, getKYCDetails, updateKycStatusMutation, updateUserData],
  );

  // Handle verification completion
  const handleVerificationCompleted = useCallback(
    async (
      applicantId: string | null,
      accessToken: string | null,
    ): Promise<void> => {
      setTimeout(async () => {
        try {
          await updateUserKycStatus(true, applicantId, accessToken);
          setKycInternalStatus(KYC_STATUS.COMPLETED);
        } catch (error) {
          console.error('Error updating KYC status:', error);
          setKycInternalStatus(KYC_STATUS.FAILED);
        }
      }, 2000);
    },
    [updateUserKycStatus],
  );

  // =================== BOTTOM SHEET FUNCTIONS ===================
  const showKycBottomSheet = useCallback((): void => {
    setIsKycBottomSheetVisible(true);
  }, []);

  const hideKycBottomSheet = useCallback((): void => {
    setIsKycBottomSheetVisible(false);
    // Clear callbacks after hiding
    setTimeout(() => {
      pendingCallbacks.current = {};
    }, 300);
  }, []);

  // =================== MAIN KYC VERIFICATION FUNCTION ===================
  const startKycVerification =
    useCallback(async (): Promise<VerificationResult> => {
      if (isKycProcessing) {
        return {result: KYC_RESULT.ERROR, message: 'KYC already in progress'};
      }

      try {
        setIsKycProcessing(true);
        setKycError(null);
        setKycInternalStatus(KYC_STATUS.IN_PROGRESS);

        // Set KYC started flag
        await secureStorage.setItem(KYC_STARTED_KEY, JSON.stringify(true));
        setIsKycStarted(true);

        // Get access token
        const tokenResult = await handleKYCToken();

        if (!tokenResult) {
          throw new Error('Could not obtain verification token');
        }

        const {accessToken, userId} = tokenResult;

        // Initialize SumSub SDK
        let snsMobileSDK = SNSMobileSDK.init(accessToken, async () => {
          const newToken = await handleKYCToken();
          return newToken?.accessToken || '';
        })
          .withHandlers({
            onStatusChanged: async (event: SumSubEvent) => {
              if (
                event.newStatus.toLowerCase() === 'approved' ||
                event.newStatus.toLowerCase() === 'pending'
              ) {
              }
              if (event.newStatus.toLowerCase() === 'approved') {
                handleVerificationCompleted(userId, accessToken);
              }
            },
            onLog: (_event: SumSubLogEvent) => {
              // let applicantId: string | null = null;
              // if (
              //   Platform.OS === 'ios' &&
              //   event.message.includes('sdk.applicant:') &&
              //   event.message.includes('reviewStatus=completed')
              // ) {
              //   const applicantIdMatch = event.message.match(
              //     /applicantId=([a-zA-Z0-9]+)/,
              //   );
              //   if (applicantIdMatch && applicantIdMatch[1]) {
              //     applicantId = applicantIdMatch[1];
              //   }
              // } else if (
              //   Platform.OS === 'android' &&
              //   event.message.includes('On Load Data Success for applicant:')
              // ) {
              //   const applicantIdMatch = event.message.match(
              //     /On Load Data Success for applicant:\s*([a-zA-Z0-9]+)/,
              //   );
              //   if (applicantIdMatch && applicantIdMatch[1]) {
              //     applicantId = applicantIdMatch[1];
              //   }
              // }
              // if (applicantId) {
              //   handleVerificationCompleted(applicantId, accessToken);
              // }
            },
          })
          .withDebug(true)
          .withLocale('en')
          .build();

        const result: SumSubResult = await snsMobileSDK.launch();

        // Process result
        if (
          result.status.toLowerCase() === 'approved' ||
          result.status.toLowerCase() === 'pending'
        ) {
          setKycInternalStatus(KYC_STATUS.COMPLETED);
          hideKycBottomSheet();

          if (pendingCallbacks.current.onSuccess) {
            pendingCallbacks.current.onSuccess(result);
          }

          return {
            result: KYC_RESULT.SUCCESS,
            message: 'Verification completed successfully!',
            data: result,
          };
        } else if (result.status.toLowerCase() === 'cancelled') {
          setKycInternalStatus(KYC_STATUS.NOT_STARTED);

          if (pendingCallbacks.current.onCancel) {
            pendingCallbacks.current.onCancel();
          }

          return {
            result: KYC_RESULT.CANCELLED,
            message: 'Verification was cancelled',
          };
        } else {
          setKycInternalStatus(KYC_STATUS.FAILED);

          if (pendingCallbacks.current.onError) {
            pendingCallbacks.current.onError(result);
          }

          return {
            result: KYC_RESULT.ERROR,
            message: `Verification ended with status: ${result.status}`,
          };
        }
      } catch (error: any) {
        console.error('KYC verification error:', error);
        setKycError(error.message);
        setKycInternalStatus(KYC_STATUS.FAILED);

        if (pendingCallbacks.current.onError) {
          pendingCallbacks.current.onError(error);
        }

        return {
          result: KYC_RESULT.ERROR,
          message: 'An error occurred during verification',
          error: error.message,
        };
      } finally {
        setIsKycProcessing(false);
      }
    }, [
      isKycProcessing,
      handleKYCToken,
      handleVerificationCompleted,
      hideKycBottomSheet,
    ]);

  // =================== SKIP KYC FUNCTION ===================
  const skipKycVerification =
    useCallback(async (): Promise<VerificationResult> => {
      try {
        setKycInternalStatus(KYC_STATUS.SKIPPED);
        hideKycBottomSheet();

        if (pendingCallbacks.current.onSkip) {
          pendingCallbacks.current.onSkip();
        }

        return {
          result: KYC_RESULT.SKIP,
          message: 'KYC verification skipped',
        };
      } catch (error: any) {
        console.error('Error skipping KYC:', error);
        return {
          result: KYC_RESULT.ERROR,
          message: 'Error occurred while skipping KYC',
          error: error.message,
        };
      }
    }, [hideKycBottomSheet]);

  // =================== MAIN CHECK KYC FUNCTION ===================
  const checkKYC = useCallback(
    async (options: CheckKycOptions = {}): Promise<VerificationResult> => {
      const {onSuccess, onSkip, onError, onCancel, forceShow = false} = options;

      // Store callbacks
      pendingCallbacks.current = {onSuccess, onSkip, onError, onCancel};

      // If already completed and not forcing, return success
      if (kycStatus.isCompleted && !forceShow) {
        if (onSuccess) {
          onSuccess();
        }
        return {result: KYC_RESULT.SUCCESS, message: 'KYC already completed'};
      }

      // If already skipped and not forcing, return skip
      // if (kycStatus.isSkipped && !forceShow) {
      //   if (onSkip) onSkip();
      //   return {result: KYC_RESULT.SKIP, message: 'KYC was previously skipped'};
      // }

      // Show the bottom sheet
      showKycBottomSheet();

      return {result: KYC_RESULT.SUCCESS, message: 'KYC modal opened'};
    },
    [kycStatus.isCompleted, showKycBottomSheet],
  );

  // =================== UTILITY FUNCTIONS ===================
  const isKycRequired = useCallback((): boolean => {
    return !kycStatus.isCompleted && !kycStatus.isSkipped;
  }, [kycStatus.isCompleted, kycStatus.isSkipped]);

  const resetKycState = useCallback(async (): Promise<void> => {
    try {
      await secureStorage.removeItem(KYC_STARTED_KEY);
      setIsKycStarted(false);
      setKycInternalStatus(KYC_STATUS.NOT_STARTED);
      setKycError(null);
      setIsKycProcessing(false);
    } catch (error) {
      console.error('Error resetting KYC state:', error);
    }
  }, []);

  // =================== CONTEXT VALUE ===================
  const contextValue: GlobalKycContextType = {
    // Status
    kycStatus,

    // Modal/Bottom Sheet
    isKycBottomSheetVisible,
    showKycBottomSheet,
    hideKycBottomSheet,

    // Main Actions
    checkKYC,
    startKycVerification,
    skipKycVerification,

    // Utility
    isKycRequired,
    resetKycState,

    // Constants
    KYC_STATUS,
    KYC_RESULT,
  };

  return (
    <GlobalKycContext.Provider value={contextValue}>
      {children}
    </GlobalKycContext.Provider>
  );
};

// =================== HOOKS ===================
export const useGlobalKyc = (): GlobalKycContextType => {
  const context = useContext(GlobalKycContext);
  if (!context) {
    throw new Error('useGlobalKyc must be used within a GlobalKycProvider');
  }
  return context;
};

// Simple hook for easy usage
export const useKycCheck = () => {
  const {checkKYC, kycStatus, isKycRequired} = useGlobalKyc();

  return {
    checkKYC,
    kycStatus,
    isKycRequired,
    isKycCompleted: kycStatus.isCompleted,
    isKycSkipped: kycStatus.isSkipped,
    isKycProcessing: kycStatus.isProcessing,
  };
};

// Utility function for non-component usage
let globalKycInstance: GlobalKycContextType | null = null;

export const setGlobalKycInstance = (instance: GlobalKycContextType): void => {
  globalKycInstance = instance;
};

export const checkKYCFromAnywhere = async (
  options: CheckKycOptions = {},
): Promise<VerificationResult> => {
  if (!globalKycInstance) {
    console.error('Global KYC instance not initialized');
    return {result: KYC_RESULT.ERROR, message: 'KYC system not initialized'};
  }

  return await globalKycInstance.checkKYC(options);
};
