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
import LottieView from 'lottie-react-native';
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
import {useKycCheck} from '../../CustomHooks/GlobalKycProvider';

// Keep your existing utility function
export const parseDataAndReturnFixedInfo = (data: any) => {
  try {
    let parsedData;
    if (typeof data === 'string') {
      parsedData = JSON.parse(data);
    } else if (typeof data === 'object' && data !== null) {
      parsedData = data;
    } else {
      throw new Error('Invalid data type. Expected string or object.');
    }

    if (parsedData.fullResponse && parsedData.fullResponse.fixedInfo) {
      return parsedData.fullResponse.fixedInfo;
    }

    if (parsedData.fixedInfo) {
      return parsedData.fixedInfo;
    }

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
  const {checkKYC, isKycCompleted} = useKycCheck();

  // State management
  const [isUserLogin, setIsUserLogin] = useState(false);
  const [isValid, setValid] = useState(false);
  const [userEmail, setUserEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [isScreenLoading, setIsScreenLoading] = useState(true);
  const [isKycSkipped, setIsKycSkipped] = useState(false);
  const [kycInProgress, setKycInProgress] = useState(false);

  // Use refs to track callback execution and KYC processes
  const callbackExecutedRef = useRef(false);
  const kycCompletionTimeoutRef = useRef<any>(null);
  const kycPollingIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // GraphQL query - WITHOUT callbacks to prevent re-execution issues
  const [
    getUserWallet,
    {data: userData, loading: queryLoading, error: queryError},
  ] = useLazyQuery(GET_USER_WALLET_ADDRESS, {
    fetchPolicy: 'no-cache',
  });

  // Handle userData changes
  useEffect(() => {
    if (userData && !callbackExecutedRef.current && !isKycSkipped) {
      callbackExecutedRef.current = true;
      console.log('✅ getUserMetaData success', userData);
      handleUserData(userData);
    }
  }, [userData, isKycSkipped]);

  // Handle query errors
  useEffect(() => {
    if (queryError) {
      console.error('❌ Error fetching user data:', queryError);
      setIsScreenLoading(false);
      setLoading(false);

      // Show user-friendly error
      Alert.alert(
        'Connection Error',
        'Unable to fetch user data. Please check your connection and try again.',
      );
    }
  }, [queryError]);

  // Navigate to main app screens
  const navigateToApp = useCallback(() => {
    console.log('🚀 Navigating to app screens');
    navReset('appScreens');
  }, []);

  // KYC process handler
  const handleKycProcess = useCallback(async () => {
    try {
      setKycInProgress(true);
      console.log('🚦 Starting KYC process...');

      await checkKYC({
        onSuccess: () => {
          console.log('✅ KYC completed successfully');
          setKycInProgress(false);
          setIsKycSkipped(true);

          if (kycPollingIntervalRef.current) {
            clearInterval(kycPollingIntervalRef.current);
            kycPollingIntervalRef.current = null;
          }
          if (kycCompletionTimeoutRef.current) {
            clearTimeout(kycCompletionTimeoutRef.current);
            kycCompletionTimeoutRef.current = null;
          }

          setTimeout(() => navigateToApp(), 100);
        },
        onSkip: () => {
          console.log('⏭️ KYC skipped');
          setKycInProgress(false);
          setIsKycSkipped(true);

          if (kycPollingIntervalRef.current) {
            clearInterval(kycPollingIntervalRef.current);
            kycPollingIntervalRef.current = null;
          }
          if (kycCompletionTimeoutRef.current) {
            clearTimeout(kycCompletionTimeoutRef.current);
            kycCompletionTimeoutRef.current = null;
          }

          setTimeout(() => navigateToApp(), 100);
        },
        onError: error => {
          console.error('❌ KYC error:', error);
          setKycInProgress(false);

          if (kycPollingIntervalRef.current) {
            clearInterval(kycPollingIntervalRef.current);
            kycPollingIntervalRef.current = null;
          }
          if (kycCompletionTimeoutRef.current) {
            clearTimeout(kycCompletionTimeoutRef.current);
            kycCompletionTimeoutRef.current = null;
          }
        },
        showAlerts: false,
      });

      // Polling mechanism
      kycPollingIntervalRef.current = setInterval(async () => {
        try {
          console.log('🔄 Polling KYC status...');
          if (isKycCompleted && kycInProgress) {
            console.log('✅ KYC status updated via polling');

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
            setTimeout(() => navigateToApp(), 100);
          }
        } catch (pollingError) {
          console.error('Error polling KYC status:', pollingError);
        }
      }, 2000);

      // Timeout fallback
      kycCompletionTimeoutRef.current = setTimeout(() => {
        console.log('⏰ KYC process timeout - auto navigating');

        if (kycPollingIntervalRef.current) {
          clearInterval(kycPollingIntervalRef.current);
          kycPollingIntervalRef.current = null;
        }

        setKycInProgress(false);
        setIsKycSkipped(true);
        navigateToApp();
      }, 60000);
    } catch (error) {
      console.error('Error in KYC process:', error);
      setKycInProgress(false);

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

  // Network authentication functions
  const checkPrimaryNetworkAuth = useCallback(async () => {
    try {
      const isLoggedIn = await magic.user.isLoggedIn();
      console.log('🔐 User is logged in:', isLoggedIn);

      if (isLoggedIn) {
        const userData = await magic.user.getInfo();
        // CRITICAL: Update Apollo client with token BEFORE any GraphQL queries
        await updateClientWithToken();
        console.log('🔑 Apollo client updated with auth token');

        return {
          isLoggedIn,
          publicAddress: userData?.publicAddress,
          userData,
        };
      }
      return {isLoggedIn, publicAddress: null, userData: null};
    } catch (error) {
      console.error('❌ Primary network auth error:', error);
      return {isLoggedIn: false, publicAddress: null, userData: null, error};
    }
  }, [magic.user, updateClientWithToken]);

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
      console.error('❌ Sepolia network auth error:', error);
      return {isLoggedIn: false, publicAddress: null, userData: null, error};
    }
  }, [magic.user, setActiveNetwork]);

  const checkDenergyNetworkAuth = useCallback(async () => {
    try {
      await setActiveNetwork('denergy');
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
      console.error('❌ Denergy network auth error:', error);
      return {isLoggedIn: false, publicAddress: null, userData: null, error};
    }
  }, [magic.user, setActiveNetwork]);

  const checkAllNetworks = useCallback(async () => {
    try {
      // CRITICAL: First check primary network (this updates Apollo client token)
      const primaryNetworkData = await checkPrimaryNetworkAuth();
      console.log('🌐 Primary network data:', primaryNetworkData);

      if (!primaryNetworkData.isLoggedIn) {
        console.log('❌ User not logged in to primary network');
        return {isLoggedIn: false, addresses: {}};
      }

      // For simplicity, using primary address for all networks
      // You can uncomment below if you need separate network addresses
      // const sepoliaNetworkData = await checkSepoliaNetworkAuth();
      // const denergyNetworkData = await checkDenergyNetworkAuth();

      const addresses = {
        primary: primaryNetworkData.publicAddress,
        sepolia: primaryNetworkData.publicAddress,
        denergy: primaryNetworkData.publicAddress,
      };

      console.log('🏠 All addresses:', addresses);

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
      console.error('❌ Error checking all networks:', error);
      return {isLoggedIn: false, addresses: {}, error};
    }
  }, [
    checkPrimaryNetworkAuth,
    checkSepoliaNetworkAuth,
    checkDenergyNetworkAuth,
  ]);

  // Handle user data from GraphQL query
  const handleUserData = useCallback(
    async (data: UserData): Promise<void> => {
      try {
        if (data?.getUserWalletAddress) {
          const result = await checkAllNetworks();
          console.log('🌐 Network check results:', result);

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

          // Process KYC details
          if (apiData.kycDetails && typeof apiData.kycDetails === 'string') {
            const kycDetailsParsed = JSON.parse(apiData.kycDetails);
            const extractedKycInfo: ExtractedKycInfo | null =
              parseDataAndReturnFixedInfo(kycDetailsParsed);

            if (extractedKycInfo) {
              console.log('✅ Successfully extracted KYC info');
              apiData.kycDetails = extractedKycInfo;
            }
          }

          await updateUserData(apiData, true);
          setIsUserLogin(true);

          const isVerified: boolean =
            apiData?.is_verified === true || apiData?.is_verified === 'true';

          console.log('🔍 Verification status:', {
            isVerified,
            isKycCompleted,
            isKycSkipped,
            kycInProgress,
          });

          if (
            !isVerified &&
            !isKycCompleted &&
            !isKycSkipped &&
            !kycInProgress
          ) {
            console.log('🚦 Starting KYC process for existing user...');
            setTimeout(() => handleKycProcess(), 300);
          } else {
            console.log('✅ User verified, navigating to app');
            navigateToApp();
          }

          setLoading(false);
          setIsScreenLoading(false);
        } else {
          // User not in DB - prepare new user data
          console.log('👤 New user - not found in database');
          await prepareNewUserData();
        }
      } catch (error) {
        console.error('❌ Error handling user data:', error);
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

  // Prepare data for new users
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

      await updateUserData(walletData, false);
      setLoading(false);
      setIsScreenLoading(false);

      console.log('🚦 Starting KYC process for new user...');
      setTimeout(() => handleKycProcess(), 300);
    } catch (error) {
      console.error('❌ Error preparing user data:', error);
      setLoading(false);
      setIsScreenLoading(false);
      throw error;
    }
  }, [
    checkAllNetworks,
    setActiveNetwork,
    magic.user,
    updateUserData,
    handleKycProcess,
  ]);

  // Check user session on app start
  const checkUserSession = useCallback(async () => {
    try {
      setIsScreenLoading(true);
      callbackExecutedRef.current = false;

      const isLoggedIn = await magic.user.isLoggedIn();

      if (isLoggedIn) {
        const userMetadata = await magic.user.getInfo();
        console.log(
          '🔑 User session active, checking database...',
          userMetadata,
        );

        // CRITICAL: Update Apollo client token FIRST
        await updateClientWithToken();
        console.log('🔑 Apollo client updated with token for existing session');

        // NOW make the GraphQL query
        console.log('📡 Making GraphQL query with authenticated client');
        await getUserWallet({
          variables: {emailAddress: userMetadata?.email?.toLowerCase()},
        });
      } else {
        setIsScreenLoading(false);
        console.log('❌ No active session found');
      }
    } catch (error) {
      console.error('❌ Error checking user session:', error);
      setIsScreenLoading(false);
    }
  }, [magic.user, updateClientWithToken, getUserWallet]);

  // Check for active session on component mount
  useEffect(() => {
    console.log('🔍 Checking user session on mount');
    checkUserSession();
  }, [checkUserSession]);

  // FIXED: Login with email OTP - ensuring token update before GraphQL
  const loginEmailOTP = useCallback(async () => {
    try {
      setLoading(true);
      callbackExecutedRef.current = false;

      console.log('📧 Logging in with email OTP...');

      // Step 1: Magic login
      const res = await magic.auth.loginWithEmailOTP({email: userEmail});
      console.log('✅ Magic login successful:', res);

      // Step 2: CRITICAL - Update Apollo client with new token BEFORE GraphQL query
      await updateClientWithToken();
      console.log('🔑 Apollo client updated with fresh token after login');

      // Step 3: Now make GraphQL query with authenticated client
      console.log('📡 Making authenticated GraphQL query');
      await getUserWallet({
        variables: {emailAddress: userEmail.toLowerCase()},
      });
    } catch (err) {
      console.error('❌ Login failed:', err);
      setLoading(false);
      Alert.alert(
        'Login Failed',
        'Unable to login with the provided email. Please try again.',
      );
    }
  }, [userEmail, magic.auth, updateClientWithToken, getUserWallet]);

  // Cleanup on component unmount
  useEffect(() => {
    return () => {
      if (kycPollingIntervalRef.current) {
        clearInterval(kycPollingIntervalRef.current);
      }
      if (kycCompletionTimeoutRef.current) {
        clearTimeout(kycCompletionTimeoutRef.current);
      }
    };
  }, []);

  // Listen for KYC completion changes
  useEffect(() => {
    if (isKycCompleted && kycInProgress) {
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
      setTimeout(() => navigateToApp(), 500);
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
        style={{width: 150, height: 150}}
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
