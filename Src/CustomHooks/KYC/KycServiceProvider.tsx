import React, {createContext, useContext, useCallback, useState} from 'react';
// @ts-ignore
import SNSMobileSDK from '@sumsub/react-native-mobilesdk-module';
import {useKycVerification} from '../../CustomHooks/useKycVerification';
import {useAuth} from '../../../screens/Provider/authProvider';
import {useKycStatusUpdate} from './useKycStatusUpdate'; // Import the new hook

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
  const {updateUserKycStatus} = useKycStatusUpdate(); // Use the KYC status update hook

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
      const {token, userId, expiryTime} = await initiateKycToken(
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

  const handleVerificationCompleted = async (applicantId, accessToken) => {
    console.log(
      '🟢 ~ handleVerificationCompleted ~ applicantId, accessToken:',
      applicantId,
      accessToken,
    );
    await updateUserKycStatus(true, applicantId, accessToken);
  };

  // Based on your working launchSumSub function
  const launchKycVerification =
    useCallback(async (): Promise<VerificationResult> => {
      try {
        // Get your access token from your backend
        const tokenResult = await handleKYCToken();
        if (!tokenResult) {
          console.error('Failed to get KYC token');
          return {
            success: false,
            message: 'Could not obtain verification token',
          };
        }
        const {accessToken, userId} = tokenResult;

        let snsMobileSDK = SNSMobileSDK.init(accessToken, async () => {
          // This is a token expiration handler, will be called if the provided token is invalid or got expired
          const newToken = await handleKYCToken();
          return newToken?.accessToken || '';
        })
          .withHandlers({
            // Optional callbacks you can use to get notified of the corresponding events
            onStatusChanged: async event => {
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

            onLog: event => {
              if (
                event.message.includes('sdk.applicant:') &&
                event.message.includes('reviewStatus=completed')
              ) {
                // Extract applicant ID from the log message
                const applicantIdMatch = event.message.match(
                  /applicantId=([a-zA-Z0-9]+)/,
                );

                if (applicantIdMatch && applicantIdMatch[1]) {
                  const applicantId = applicantIdMatch[1];

                  handleVerificationCompleted(applicantId, accessToken);
                }
              }
            },
          })
          .withDebug(true) // Changed to false for production
          .withLocale('en') // Optional, for cases when you need to override the system locale
          .build();

        const result = await snsMobileSDK.launch();

        // Process result based on status - using toLowerCase() for case-insensitive comparison
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
    }, [handleKYCToken, updateUserKycStatus]); // Added updateUserKycStatus to dependencies

  return (
    <KycServiceContext.Provider value={{launchKycVerification}}>
      {children}
    </KycServiceContext.Provider>
  );
};

// Custom hook to use the KYC service
export const useKycService = () => useContext(KycServiceContext);
