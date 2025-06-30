import React, {useEffect, useState, useCallback, useRef} from 'react';
import {
  Text,
  View,
  ScrollView,
  ActivityIndicator,
  Alert,
  SafeAreaView,
  Platform,
} from 'react-native';
import 'react-native-get-random-values';
import '@ethersproject/shims'; // for ethers.js
import {ethers} from 'ethers';
import LottieView from 'lottie-react-native'; // Add this import
import styles from './styles';
import {useMagic} from '../../../screens/Provider/MagicProvider';
import {useAuth} from '../../../screens/Provider/authProvider';
import {navReset} from '../../Navigation/NavigationFunctions';
import {DButton, Header} from '../../Componants';
import {Animation, Colors, Images} from '../../Theme';
import {DEmailInput} from '../../Componants/Dinputs';
import {useLazyQuery} from '@apollo/client';
import {GET_USER_WALLET_ADDRESS} from '../../graphql/queries';
import {UserAuth, ExtractedKycInfo, Address, UserData} from '../../utils/type';
import {useApolloClientContext} from '../../../screens/Provider/GraphQLProvider';

// REPLACE: Import the new global KYC system instead of old providers
import {useKycCheck} from '../../CustomHooks/GlobalKycProvider';

// Import your Lottie JSON file
// import loadingAnimation from '../../assets/animations/loading.json'; // Adjust path as needed

// Keep your existing utility function
export const parseDataAndReturnFixedInfo = (data: any) => {
  try {
    // If data is a string, parse it as JSON
    let parsedData;
    if (typeof data === 'string') {
      parsedData = JSON.parse(data);
    } else if (typeof data === 'object' && data !== null) {
      parsedData = data;
    } else {
      throw new Error('Invalid data type. Expected string or object.');
    }

    // Check if fullResponse exists and contains fixedInfo
    if (parsedData.fullResponse && parsedData.fullResponse.fixedInfo) {
      return parsedData.fullResponse.fixedInfo;
    }

    // Check if fixedInfo exists directly on the data object
    if (parsedData.fixedInfo) {
      return parsedData.fixedInfo;
    }

    // If fixedInfo is not found, return null
    console.warn('fixedInfo not found in the provided data');
    return null;
  } catch (error: any) {
    console.error('Error parsing data:', error.message);
    return null;
  }
};

export default function LoginScreen() {
  const {magic, setActiveNetwork} = useMagic();
  const {updateUserData, userDetails} = useAuth();
  const {updateClientWithToken} = useApolloClientContext();

  // REPLACE: Use the simple global KYC hook instead of multiple providers
  const {checkKYC, isKycCompleted} = useKycCheck();
  console.log('🚀 ~ LoginScreen ~ isKycCompleted:', isKycCompleted);

  // State management
  const [isUserLogin, setIsUserLogin] = useState(false);
  const [isValid, setValid] = useState(false);
  const [userEmail, setUserEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [isScreenLoading, setIsScreenLoading] = useState(true);
  const [isKycSkipped, setIsKycSkipped] = useState(false);

  // NEW: Add KYC tracking state
  const [kycInProgress, setKycInProgress] = useState(false);

  // Use refs to track callback execution and KYC processes
  const callbackExecutedRef = useRef(false);
  const kycCompletionTimeoutRef = useRef<any>(null);
  const kycPollingIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // OPTIMIZED: Query to check if user exists in DB - WITHOUT inline callbacks
  const [
    getUserWallet,
    {data: userData, loading: queryLoading, error: queryError},
  ] = useLazyQuery(GET_USER_WALLET_ADDRESS, {
    fetchPolicy: 'no-cache',
    // Removed onCompleted and onError callbacks to prevent them from running on every state change
  });

  // OPTIMIZED: Handle userData changes with useEffect (runs only when userData actually changes)
  useEffect(() => {
    if (userData && !callbackExecutedRef.current && !isKycSkipped) {
      callbackExecutedRef.current = true; // Prevent multiple executions
      console.log('call getUserMetaData success ✅', userData);
      handleUserData(userData);
    }
  }, [userData, isKycSkipped]);

  // OPTIMIZED: Handle query errors with useEffect
  useEffect(() => {
    if (queryError) {
      console.error('Error fetching user data:', queryError);
      setIsScreenLoading(false);
    }
  }, [queryError]);

  // Navigate to main app screens - memoized to prevent recreation
  const navigateToApp = useCallback(() => {
    console.log('Navigating to app screens');
    navReset('appScreens');
  }, []);

  // NEW: Enhanced KYC process handler with multiple fallback mechanisms
  const handleKycProcess = useCallback(async () => {
    try {
      setKycInProgress(true);

      console.log('🚦 Starting KYC process...');

      await checkKYC({
        onSuccess: () => {
          console.log('✅ KYC completed successfully, navigating to app');
          setKycInProgress(false);
          setIsKycSkipped(true);

          // Clear any polling intervals
          if (kycPollingIntervalRef.current) {
            clearInterval(kycPollingIntervalRef.current);
            kycPollingIntervalRef.current = null;
          }

          // Clear timeout
          if (kycCompletionTimeoutRef.current) {
            clearTimeout(kycCompletionTimeoutRef.current);
            kycCompletionTimeoutRef.current = null;
          }

          // Navigate with a slight delay to ensure state updates
          setTimeout(() => {
            navigateToApp();
          }, 100);
        },
        onSkip: () => {
          console.log('⏭️ KYC skipped, navigating to app');
          setKycInProgress(false);
          setIsKycSkipped(true);

          // Clear any polling intervals
          if (kycPollingIntervalRef.current) {
            clearInterval(kycPollingIntervalRef.current);
            kycPollingIntervalRef.current = null;
          }

          // Clear timeout
          if (kycCompletionTimeoutRef.current) {
            clearTimeout(kycCompletionTimeoutRef.current);
            kycCompletionTimeoutRef.current = null;
          }

          setTimeout(() => {
            navigateToApp();
          }, 100);
        },
        onError: error => {
          console.error('❌ KYC error:', error);
          setKycInProgress(false);

          // Clear any polling intervals
          if (kycPollingIntervalRef.current) {
            clearInterval(kycPollingIntervalRef.current);
            kycPollingIntervalRef.current = null;
          }

          // Clear timeout
          if (kycCompletionTimeoutRef.current) {
            clearTimeout(kycCompletionTimeoutRef.current);
            kycCompletionTimeoutRef.current = null;
          }

          // Optionally navigate anyway or show error
          // setTimeout(() => {
          //   navigateToApp();
          // }, 100);
        },
        showAlerts: false,
      });

      // FALLBACK 1: Add polling mechanism to check KYC status
      // This helps if the KYC provider doesn't immediately update the status
      kycPollingIntervalRef.current = setInterval(async () => {
        try {
          console.log('🔄 Polling KYC status...');

          // Check if KYC status has been updated
          if (isKycCompleted && kycInProgress) {
            console.log('✅ KYC status updated to completed via polling');

            // Clear polling
            if (kycPollingIntervalRef.current) {
              clearInterval(kycPollingIntervalRef.current);
              kycPollingIntervalRef.current = null;
            }

            // Clear timeout
            if (kycCompletionTimeoutRef.current) {
              clearTimeout(kycCompletionTimeoutRef.current);
              kycCompletionTimeoutRef.current = null;
            }

            setKycInProgress(false);
            setIsKycSkipped(true);

            setTimeout(() => {
              navigateToApp();
            }, 100);
          }
        } catch (pollingError) {
          console.error('Error polling KYC status:', pollingError);
        }
      }, 2000); // Check every 2 seconds

      // FALLBACK 2: Add timeout to prevent infinite waiting
      kycCompletionTimeoutRef.current = setTimeout(() => {
        console.log('⏰ KYC process timeout - auto navigating');

        if (kycPollingIntervalRef.current) {
          clearInterval(kycPollingIntervalRef.current);
          kycPollingIntervalRef.current = null;
        }

        setKycInProgress(false);
        setIsKycSkipped(true);
        navigateToApp();
      }, 60000); // 60 seconds timeout
    } catch (error) {
      console.error('Error in KYC process:', error);
      setKycInProgress(false);

      // Clear intervals and timeouts
      if (kycPollingIntervalRef.current) {
        clearInterval(kycPollingIntervalRef.current);
        kycPollingIntervalRef.current = null;
      }
      if (kycCompletionTimeoutRef.current) {
        clearTimeout(kycCompletionTimeoutRef.current);
        kycCompletionTimeoutRef.current = null;
      }
    }
  }, [checkKYC, isKycCompleted, kycInProgress, navigateToApp]);

  // Check if user is logged in to primary network - memoized
  const checkPrimaryNetworkAuth = useCallback(async () => {
    try {
      const isLoggedIn = await magic.user.isLoggedIn();
      console.log('User is logged in:', isLoggedIn);

      if (isLoggedIn) {
        const userData = await magic.user.getInfo();
        await updateClientWithToken();
        return {
          isLoggedIn,
          publicAddress: userData?.publicAddress,
          userData,
        };
      }
      return {isLoggedIn, publicAddress: null, userData: null};
    } catch (error) {
      console.error('Primary network auth error:', error);
      return {isLoggedIn: false, publicAddress: null, userData: null, error};
    }
  }, [magic.user, updateClientWithToken]);

  // Check if user is logged in to Sepolia network - memoized
  const checkSepoliaNetworkAuth = useCallback(async () => {
    try {
      await setActiveNetwork('sepolia');
      const isLoggedIn = await magic.user.isLoggedIn();
      if (isLoggedIn) {
        const userData = await magic.user.getInfo();
        return {
          isLoggedIn,
          publicAddress: userData?.publicAddress,
          userData,
        };
      }

      return {isLoggedIn, publicAddress: null, userData: null};
    } catch (error) {
      console.error(
        'Sepolia network auth error:',
        JSON.stringify(error, null, 2),
      );
      return {isLoggedIn: false, publicAddress: null, userData: null, error};
    }
  }, [magic.user, setActiveNetwork]);

  // Check if user is logged in to Denergy network - memoized
  const checkDenergyNetworkAuth = useCallback(async () => {
    try {
      await setActiveNetwork('denergy');
      console.log('Attempting to get Denergy user info...');

      const isLoggedIn = await magic.user.isLoggedIn();
      console.log('Is user logged in to Denergy?', isLoggedIn);

      if (isLoggedIn) {
        const userData = await magic.user.getInfo();

        return {
          isLoggedIn,
          publicAddress: userData?.publicAddress,
          userData,
        };
      }

      console.log('Need to authenticate on Denergy first');
      return {isLoggedIn, publicAddress: null, userData: null};
    } catch (error) {
      console.error(
        'Denergy network auth error:',
        JSON.stringify(error, null, 2),
      );
      return {isLoggedIn: false, publicAddress: null, userData: null, error};
    }
  }, [magic.user, setActiveNetwork]);

  // Main function to check all networks - memoized
  const checkAllNetworks = useCallback(async () => {
    try {
      // First check primary network
      const primaryNetworkData = await checkPrimaryNetworkAuth();
      console.log('primaryNetworkData', primaryNetworkData);

      // Only proceed if logged in to primary network
      if (!primaryNetworkData.isLoggedIn) {
        console.log(
          'User not logged in to primary network. Please authenticate first.',
        );
        return {
          isLoggedIn: false,
          addresses: {},
        };
      }

      // Check other networks
      // const sepoliaNetworkData = await checkSepoliaNetworkAuth();
      // const denergyNetworkData = await checkDenergyNetworkAuth();

      // Collect all public addresses
      // const addresses = {
      //   primary: primaryNetworkData.publicAddress,
      //   sepolia: sepoliaNetworkData.publicAddress,
      //   denergy: denergyNetworkData.publicAddress,
      // };
      const addresses = {
        primary: primaryNetworkData.publicAddress,
        sepolia: primaryNetworkData.publicAddress,
        denergy: primaryNetworkData.publicAddress,
      };

      console.log('🚀 ~ checkAllNetworks ~ addresses:', addresses);

      return {
        isLoggedIn: true,
        addresses,
        networkData: {
          primary: primaryNetworkData,
          sepolia: primaryNetworkData,
          denergy: primaryNetworkData,
        },
      };
    } catch (error) {
      console.error('Error checking all networks:', error);
      return {
        isLoggedIn: false,
        addresses: {},
        error,
      };
    }
  }, [
    checkPrimaryNetworkAuth,
    checkSepoliaNetworkAuth,
    checkDenergyNetworkAuth,
  ]);

  // ENHANCED: Handle user data from query with improved KYC flow
  const handleUserData = useCallback(
    async (data: UserData): Promise<void> => {
      try {
        if (data?.getUserWalletAddress) {
          const result = await checkAllNetworks();
          console.log('Network check results:', result);

          // User exists in DB - store data in context
          const apiData: UserAuth = {
            date: data.getUserWalletAddress.date || new Date().toISOString(),
            userWallet: data.getUserWalletAddress.userWallet || null,
            emailAddress: data.getUserWalletAddress.emailAddress || null,
            is_verified: data.getUserWalletAddress.is_verified || false,
            kycDetails: data.getUserWalletAddress.kycDetails,
            accessToken: data.getUserWalletAddress.accessToken,
            applicantId: data.getUserWalletAddress.applicantId,
          };

          // Process KYC details if they exist
          if (apiData.kycDetails && typeof apiData.kycDetails === 'string') {
            const kycDetailsParsed = JSON.parse(apiData.kycDetails);

            const extractedKycInfo: ExtractedKycInfo | null =
              parseDataAndReturnFixedInfo(kycDetailsParsed);

            if (extractedKycInfo) {
              console.log('Successfully extracted KYC info:', extractedKycInfo);
              apiData.kycDetails = extractedKycInfo;
            } else {
              console.log(
                'Failed to extract KYC info, keeping original kycDetails',
              );
            }
          }

          await updateUserData(apiData, true);
          setIsUserLogin(true);
          const isVerified: boolean =
            apiData?.is_verified === true || apiData?.is_verified === 'true';
          console.log(
            '🚀 ~ handleUserData ~ isVerified:',
            isVerified,
            'isKycCompleted:',
            isKycCompleted,
            'kycInProgress:',
            kycInProgress,
          );

          // ENHANCED: Better KYC logic with state checking
          if (
            !isVerified &&
            !isKycCompleted &&
            !isKycSkipped &&
            !kycInProgress
          ) {
            console.log('🚦 Starting KYC process for existing user...');

            // Use shorter delay for better UX
            setTimeout(() => {
              handleKycProcess();
            }, 300);
          } else {
            console.log(
              '🎯 User verified or KYC already completed, navigating to app',
            );
            navigateToApp();
          }

          setLoading(false);
          setIsScreenLoading(false);
        } else {
          // New session but user not in DB
          console.log('User session active but not found in database');
          prepareNewUserData();
        }
      } catch (error) {
        console.error('Error handling user data:', error);
        setLoading(false);
        setIsScreenLoading(false);
      }
    },
    [
      checkAllNetworks,
      updateUserData,
      isKycCompleted,
      isKycSkipped,
      kycInProgress,
      handleKycProcess,
      navigateToApp,
    ],
  );

  // ENHANCED: Create wallets and prepare user data for new users
  const prepareNewUserData = useCallback(async () => {
    try {
      const result = await checkAllNetworks();
      setActiveNetwork('sepolia');
      const userData = await magic.user.getInfo();

      const walletData: any = {
        emailAddress: userData.email,
        userWallet: result?.networkData?.primary?.publicAddress,
        date: new Date().toISOString(),
        is_verified: false,
      };

      // Store in context and DB
      await updateUserData(walletData, false);
      setLoading(false);
      setIsScreenLoading(false);

      console.log('🚦 Starting KYC process for new user...');

      // Start KYC for new users
      setTimeout(() => {
        handleKycProcess();
      }, 300);
    } catch (error) {
      console.error('Error preparing user data:', error);
      throw error;
    }
  }, [
    checkAllNetworks,
    setActiveNetwork,
    magic.user,
    updateUserData,
    handleKycProcess,
  ]);

  // OPTIMIZED: Check if user has an active session - memoized
  const checkUserSession = useCallback(async () => {
    try {
      setIsScreenLoading(true);
      callbackExecutedRef.current = false; // Reset callback flag for new session check

      const isLoggedIn = await magic.user.isLoggedIn();

      if (isLoggedIn) {
        // If user is logged in, get metadata and check DB
        const userMetadata = await magic.user.getInfo();
        console.log('User session active, checking database...', userMetadata);
        await updateClientWithToken();
        console.log('call getUserMetaData 1 👍');
        // Check if user exists in database
        await getUserWallet({
          variables: {emailAddress: userMetadata?.email?.toLowerCase()},
        });
      } else {
        // No active session
        setIsScreenLoading(false);
        console.log('No active session found');
      }
    } catch (error) {
      console.error('Error checking user session:', error);
      setIsScreenLoading(false);
    }
  }, [magic.user, updateClientWithToken, getUserWallet]);

  // Check for active session on component mount
  useEffect(() => {
    console.log('Checking user session');
    checkUserSession();
  }, []);

  // OPTIMIZED: Handle login with email OTP - memoized
  const loginEmailOTP = useCallback(async () => {
    try {
      setLoading(true);
      callbackExecutedRef.current = false; // Reset callback flag for new login

      // Login with Magic Link
      const res = await magic.auth.loginWithEmailOTP({email: userEmail});
      console.log(res);
      console.log('call getUserMetaData 2 ✌️');
      callbackExecutedRef.current = false;
      await getUserWallet({
        variables: {emailAddress: userEmail.toLowerCase()},
      });
    } catch (err) {
      setLoading(false);
      Alert.alert(
        'Login Failed',
        'Unable to login with the provided email. Please try again.',
      );
    }
  }, [userEmail, magic.auth, getUserWallet]);

  // NEW: Cleanup intervals and timeouts on component unmount
  useEffect(() => {
    return () => {
      // Cleanup intervals and timeouts when component unmounts
      if (kycPollingIntervalRef.current) {
        clearInterval(kycPollingIntervalRef.current);
      }
      if (kycCompletionTimeoutRef.current) {
        clearTimeout(kycCompletionTimeoutRef.current);
      }
    };
  }, []);

  // NEW: Additional effect to listen for KYC completion changes
  useEffect(() => {
    if (isKycCompleted && kycInProgress) {
      // Clear any ongoing processes
      if (kycPollingIntervalRef.current) {
        clearInterval(kycPollingIntervalRef.current);
        kycPollingIntervalRef.current = null;
      }
      if (kycCompletionTimeoutRef.current) {
        clearTimeout(kycCompletionTimeoutRef.current);
        kycCompletionTimeoutRef.current = null;
      }

      setKycInProgress(false);
      setIsKycSkipped(true);

      setTimeout(() => {
        navigateToApp();
      }, 500);
    }
  }, [isKycCompleted, kycInProgress, navigateToApp]);

  const LoadingScreen = ({message}: {message: string}) => (
    <View
      style={{
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#fff',
        paddingHorizontal: 20,
      }}>
      <LottieView
        source={Animation.loaderAnimation}
        autoPlay
        loop
        style={{
          width: 150,
          height: 150,
        }}
        speed={1}
        colorFilters={[
          {
            keypath: 'layer_name',
            color: Colors?.success || '#4CAF50',
          },
        ]}
      />

      <Text
        style={{
          marginTop: 20,
          fontSize: 16,
          color: '#333',
          textAlign: 'center',
          fontWeight: '500',
        }}>
        {message}
      </Text>

      <Text
        style={{
          marginTop: 8,
          fontSize: 14,
          color: '#666',
          textAlign: 'center',
        }}>
        Please wait...
      </Text>
    </View>
  );

  return (
    <SafeAreaView
      style={{
        flex: 1,
        backgroundColor: '#fff',
        paddingTop: Platform.OS === 'ios' ? 0 : 20,
      }}>
      {isScreenLoading ? (
        <LoadingScreen
          message={kycInProgress ? 'Processing KYC...' : 'Checking session...'}
        />
      ) : (
        <View style={{flex: 1}}>
          <Header headerTitle="Login" hideBorder={true} hideBackIcon={true} />
          <ScrollView>
            <View style={styles.contentContainer}>
              <Text
                style={{
                  ...styles.content,
                  paddingVertical: 15,
                  marginHorizontal: 15,
                }}>
                Welcome
              </Text>
              <View style={styles.emailInputWrapper}>
                <DEmailInput
                  inputAccessoryViewID={'sendOtp'}
                  setValid={setValid}
                  value={userEmail}
                  setValue={setUserEmail}
                />
                {!isValid && userEmail && (
                  <Text style={[styles.errorMessage]}>
                    Please enter a valid email.
                  </Text>
                )}
              </View>
              <DButton
                type="primary"
                style={styles.loginBtnStyle}
                disabled={!(userEmail && isValid) || loading || kycInProgress}
                onPress={loginEmailOTP}>
                <Text style={[styles.loginText]}>
                  {loading
                    ? 'Sending...'
                    : kycInProgress
                    ? 'Processing...'
                    : 'Log In'}
                </Text>
              </DButton>
            </View>
          </ScrollView>
        </View>
      )}
    </SafeAreaView>
  );
}

LoginScreen.navigationOptions = {
  header: null,
};
