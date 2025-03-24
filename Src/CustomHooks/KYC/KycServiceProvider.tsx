import React, {createContext, useContext, useCallback} from 'react';
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
  const handleKYCToken = useCallback(async (): Promise<string | null> => {
    console.log('Getting KYC token');
    const userEmail = userDetails?.walletAddress;
    console.log('User email/wallet:', userEmail);

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
        console.log('KYC token obtained');
        return token;
      } else {
        console.error('Failed to obtain KYC token');
        return null;
      }
    } catch (err) {
      console.error('Verification process failed:', err);
      return null;
    }
  }, [userDetails, initiateKycToken]);

  // Based on your working launchSumSub function
  const launchKycVerification =
    useCallback(async (): Promise<VerificationResult> => {
      console.log('launchKycVerification called');

      try {
        // Get your access token from your backend
        const accessToken = await handleKYCToken();

        if (!accessToken) {
          console.error('Failed to get KYC token');
          return {
            success: false,
            message: 'Could not obtain verification token',
          };
        }

        console.log('Initializing SumSub SDK');
        let snsMobileSDK = SNSMobileSDK.init(accessToken, async () => {
          // This is a token expiration handler, will be called if the provided token is invalid or got expired
          console.log('Token expired, getting a new one');
          return (await handleKYCToken()) || '';
        })
          .withHandlers({
            // Optional callbacks you can use to get notified of the corresponding events
            onStatusChanged: async event => {
              console.log(
                'onStatusChanged: [' +
                  event.prevStatus +
                  '] => [' +
                  event.newStatus +
                  ']',
              );

              // Set KYC completed based on status - using toLowerCase() for case-insensitive comparison
              if (
                event.newStatus.toLowerCase() === 'approved' ||
                event.newStatus.toLowerCase() === 'pending'
              ) {
                console.log('Setting KYC completed based on status');

                // Update KYC status in the backend when status changes to approved or pending
                try {
                  await updateUserKycStatus(true);
                  console.log('KYC status updated in backend');
                } catch (err) {
                  console.error('Failed to update KYC status in backend:', err);
                }
              }
            },
            onLog: event => {
              console.log('onLog: [Idensic] ' + event.message);
            },
          })
          .withDebug(true)
          .withLocale('en') // Optional, for cases when you need to override the system locale
          .build();

        console.log('Launching SumSub SDK');
        const result = await snsMobileSDK.launch();
        console.log('SumSub SDK State: ' + JSON.stringify(result));

        // Process result based on status - using toLowerCase() for case-insensitive comparison
        if (
          result.status.toLowerCase() === 'approved' ||
          result.status.toLowerCase() === 'pending'
        ) {
          console.log('KYC completed successfully');

          // Update KYC status in the backend when verification completes successfully
          try {
            await updateUserKycStatus(true);
            console.log(
              'KYC status updated in backend after successful verification',
            );
          } catch (err) {
            console.error('Failed to update KYC status in backend:', err);
          }

          return {
            success: true,
            message: 'Verification completed successfully!',
            status: result.status,
          };
        } else if (result.status.toLowerCase() === 'cancelled') {
          console.log('KYC cancelled by user');
          return {
            success: false,
            message: 'Verification was cancelled',
            status: result.status,
          };
        } else {
          console.log('KYC ended with status:', result.status);
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
