import React, {createContext, useContext, useCallback} from 'react';
import {Platform} from 'react-native';
// @ts-ignore
import SNSMobileSDK from '@sumsub/react-native-mobilesdk-module';
import {useKycVerification} from '../../CustomHooks/useKycVerification';
import {useAuth} from '../../../screens/Provider/authProvider';
import {useKycStatusUpdate} from './useKycStatusUpdate';
import {SumSubEvent, SumSubLogEvent} from '../types/kyc.types';

// Define types for the SumSub verification result
interface VerificationResult {
  success: boolean;
  message: string;
  status?: string;
  error?: any;
}

// Define the context type
type KycServiceContextType = {
  launchKycVerification: () => Promise<VerificationResult>;
};

// Create the context
const KycServiceContext = createContext<KycServiceContextType>({
  launchKycVerification: async () => ({
    success: false,
    message: 'KYC service not initialized',
  }),
});

export const KycServiceProvider: React.FC<{children: React.ReactNode}> = ({
  children,
}) => {
  const {initiateKycToken} = useKycVerification();
  const {userDetails} = useAuth();
  const {updateUserKycStatus} = useKycStatusUpdate();

  // Based on your working handleKYCToken function
  const handleKYCToken = useCallback(async (): Promise<{
    accessToken: string;
    userId: string | null;
  } | null> => {
    const userEmail = userDetails?.emailAddress;

    if (!userEmail) {
      console.error('No user email or wallet address available');
      return null;
    }

    try {
      const {token, userId} = await initiateKycToken(
        userEmail,
        'basic-kyc-level',
      );

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
  }, [userDetails, initiateKycToken]);

  const handleVerificationCompleted = useCallback(async (
    applicantId: string,
    accessToken: string,
  ) => {
    setTimeout(async () => {
      await updateUserKycStatus(true, applicantId, accessToken);
    }, 2000);
  }, [updateUserKycStatus]);

  const launchKycVerification =
    useCallback(async (): Promise<VerificationResult> => {
      try {
        const tokenResult = await handleKYCToken();
        if (!tokenResult) {
          console.error('Failed to get KYC token');
          return {
            success: false,
            message: 'Could not obtain verification token',
          };
        }
        const {accessToken} = tokenResult;

        const snsMobileSDK = SNSMobileSDK.init(accessToken, async () => {
          const newToken = await handleKYCToken();
          return newToken?.accessToken || '';
        })
          .withHandlers({
            // Optional callbacks to get notified of the corresponding events
            onStatusChanged: async (event: SumSubEvent) => {
              if (
                event.newStatus.toLowerCase() === 'approved' ||
                event.newStatus.toLowerCase() === 'pending'
              ) {
                // Update KYC status in the backend when status changes to approved or pending
                try {
                  // KYC status updated in backend
                } catch (err) {
                  console.error('Failed to update KYC status in backend:', err);
                }
              }
            },
            onLog: (event: SumSubLogEvent) => {
              let applicantId: string | null = null;

              if (
                Platform.OS === 'ios' &&
                event.message.includes('sdk.applicant:') &&
                event.message.includes('reviewStatus=completed')
              ) {
                // iOS format: Extract applicant ID from the log message
                const applicantIdMatch = event.message.match(
                  /applicantId=([a-zA-Z0-9]+)/,
                );
                if (applicantIdMatch && applicantIdMatch[1]) {
                  applicantId = applicantIdMatch[1];
                }
              } else if (
                Platform.OS === 'android' &&
                event.message.includes('On Load Data Success for applicant:')
              ) {
                // Android format: Extract applicant ID after "applicant: "
                const applicantIdMatch = event.message.match(
                  /On Load Data Success for applicant:\s*([a-zA-Z0-9]+)/,
                );
                if (applicantIdMatch && applicantIdMatch[1]) {
                  applicantId = applicantIdMatch[1];
                }
              }

              if (applicantId) {
                handleVerificationCompleted(applicantId, accessToken);
              }
            },
          })
          .withDebug(true) // Set to false in production
          .withLocale('en') // Optional: Override system locale if needed
          .build();

        const result = await snsMobileSDK.launch();

        if (
          result.status.toLowerCase() === 'approved' ||
          result.status.toLowerCase() === 'pending'
        ) {
          return {
            success: true,
            message: 'Verification completed successfully!',
            status: result.status,
          };
        } else if (result.status.toLowerCase() === 'cancelled') {
          return {
            success: false,
            message: 'Verification was cancelled',
            status: result.status,
          };
        } else {
          return {
            success: false,
            message: `Verification ended with status: ${result.status}`,
            status: result.status,
          };
        }
      } catch (err) {
        console.error('SumSub SDK Error:', err);
        return {
          success: false,
          message: 'Error during verification process',
          error: err,
        };
      }
    }, [handleKYCToken, handleVerificationCompleted]);

  return (
    <KycServiceContext.Provider value={{launchKycVerification}}>
      {children}
    </KycServiceContext.Provider>
  );
};

// Custom hook to use the KYC service
export const useKycService = () => useContext(KycServiceContext);
