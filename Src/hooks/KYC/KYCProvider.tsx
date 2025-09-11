import React, {createContext, useState, useContext, useEffect} from 'react';
import secureStorage from '../../utils/secureStorage';
import {useAuth} from '../../../screens/Provider/authProvider';

// Define our context types
export type KycContextType = {
  isKycCompleted: boolean;
  isKycStarted: boolean;
  setKycStarted: (started: boolean) => void;
  refreshKycStatus: () => void;
  resetKycStatus: () => void;
  isKycBottomSheetVisible: boolean;
  showKycBottomSheet: () => void;
  hideKycBottomSheet: () => void;
};

// Create the context with default values
export const KycContext = createContext<KycContextType>({
  isKycCompleted: false,
  isKycStarted: false,
  setKycStarted: () => {},
  refreshKycStatus: () => {},
  resetKycStatus: () => {},
  isKycBottomSheetVisible: false,
  showKycBottomSheet: () => {},
  hideKycBottomSheet: () => {},
});

// Storage key for KYC started status only
const KYC_STARTED_KEY = 'kyc_started';

export const KycProvider: React.FC<{children: React.ReactNode}> = ({
  children,
}) => {
  const {userDetails} = useAuth(); // Get userDetails from Auth context

  // State for KYC completed status derived from userDetails
  const [isKycCompleted, setIsKycCompleted] = useState<boolean>(false);
  const [isKycStarted, setIsKycStarted] = useState<boolean>(false);
  const [isKycBottomSheetVisible, setIsKycBottomSheetVisible] =
    useState<boolean>(false);

  // Update isKycCompleted whenever userDetails changes
  useEffect(() => {
    const isVerified = userDetails?.is_verified;
    setIsKycCompleted(isVerified === true || isVerified === 'true');
  }, [userDetails]);

  // Load KYC started status from secure storage on mount
  useEffect(() => {
    const loadKycStartedStatus = async () => {
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
  }, []);

  // Set KYC started status and save to secure storage
  const setKycStarted = async (started: boolean) => {
    try {
      await secureStorage.setItem(KYC_STARTED_KEY, JSON.stringify(started));
      setIsKycStarted(started);
    } catch (error) {
      console.error('Error saving KYC started status:', error);
    }
  };

  // Function to manually refresh KYC status from userDetails
  const refreshKycStatus = () => {
    const isVerified = userDetails?.is_verified;
    setIsKycCompleted(isVerified === true || isVerified === 'true');
  };

  // Reset KYC status (only for started status in secure storage)
  const resetKycStatus = async () => {
    try {
      await secureStorage.removeItem(KYC_STARTED_KEY);
      setIsKycStarted(false);
    } catch (error) {
      console.error('Error resetting KYC status:', error);
    }
  };

  // Show KYC bottom sheet
  const showKycBottomSheet = () => {
    setIsKycBottomSheetVisible(true);
  };

  // Hide KYC bottom sheet
  const hideKycBottomSheet = () => {
    setIsKycBottomSheetVisible(false);
  };

  return (
    <KycContext.Provider
      value={{
        isKycCompleted,
        isKycStarted,
        setKycStarted,
        refreshKycStatus,
        resetKycStatus,
        isKycBottomSheetVisible,
        showKycBottomSheet,
        hideKycBottomSheet,
      }}>
      {children}
    </KycContext.Provider>
  );
};

// Custom hook to use the KYC context - ensure this is exported
export const useKyc = () => {
  const context = useContext(KycContext);
  if (context === undefined) {
    throw new Error('useKyc must be used within a KycProvider');
  }
  return context;
};

// Export all necessary items
export default {
  KycContext,
  KycProvider,
  useKyc,
};
