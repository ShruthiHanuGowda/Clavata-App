import React, {useEffect, useState, useCallback, useRef} from 'react';
import {Text, View, ScrollView, Alert, SafeAreaView} from 'react-native';
import 'react-native-get-random-values';
import '@ethersproject/shims';
import LottieView from 'lottie-react-native';
import styles from './styles';
import {useMagic} from '../../../screens/Provider/MagicProvider';
import {useAuth} from '../../../screens/Provider/authProvider';
import {navReset} from '../../Navigation/NavigationFunctions';
import {DButton, Header} from '../../components';
import {Animation, Colors} from '../../Theme';
import {DEmailInput} from '../../components/Dinputs';
import {useLazyQuery} from '@apollo/client';
import {GET_USER_WALLET_ADDRESS} from '../../graphql/queries';
import {UserAuth, ExtractedKycInfo, UserData} from '../../utils/type';
import {useApolloClientContext} from '../../../screens/Provider/GraphQLProvider';
import {useKycCheck} from '../../hooks/GlobalKycProvider';

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

const LoadingScreen = ({message}: {message: string}) => (
  <View style={styles.loadingContainer}>
    <LottieView
      source={Animation.loaderAnimation}
      autoPlay
      loop
      style={styles.lottieAnimation}
      speed={1}
      colorFilters={[
        {
          keypath: 'layer_name',
          color: Colors?.success || '#4CAF50',
        },
      ]}
    />

    <Text style={styles.loadingMessage}>{message}</Text>

    <Text style={styles.loadingSubtitle}>Please wait...</Text>
  </View>
);

export default function LoginScreen() {
  const {magic, setActiveNetwork} = useMagic();
  const {updateUserData} = useAuth();
  const {updateClientWithToken} = useApolloClientContext();
  const {checkKYC, isKycCompleted} = useKycCheck();

  const [isValid, setValid] = useState(false);
  const [userEmail, setUserEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [isScreenLoading, setIsScreenLoading] = useState(true);
  const [isKycSkipped, setIsKycSkipped] = useState(false);
  const [kycInProgress, setKycInProgress] = useState(false);

  const callbackExecutedRef = useRef(false);
  const kycCompletionTimeoutRef = useRef<any>(null);
  const kycPollingIntervalRef = useRef<NodeJS.Timeout | null>(null);

  const [getUserWallet, {data: userData, error: queryError}] = useLazyQuery(
    GET_USER_WALLET_ADDRESS,
    {
      fetchPolicy: 'no-cache',
    },
  );

  useEffect(() => {
    if (userData && !callbackExecutedRef.current && !isKycSkipped) {
      callbackExecutedRef.current = true;

      handleUserData(userData);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userData, isKycSkipped]);

  useEffect(() => {
    if (queryError) {
      console.error('❌ Error fetching user data:', queryError);
      setIsScreenLoading(false);
      setLoading(false);

      Alert.alert(
        'Connection Error',
        'Unable to fetch user data. Please check your connection and try again.',
      );
    }
  }, [queryError]);

  const navigateToApp = useCallback(() => {
    (navReset as any)('appScreens');
  }, []);

  const handleKycProcess = useCallback(async () => {
    try {
      setKycInProgress(true);

      await checkKYC({
        onSuccess: () => {
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
            setTimeout(() => navigateToApp(), 100);
          }
        } catch (pollingError) {
          console.error('Error polling KYC status:', pollingError);
        }
      }, 2000);

      // Timeout fallback
      kycCompletionTimeoutRef.current = setTimeout(() => {
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

      if (isLoggedIn) {
        const userInfo = await magic.user.getInfo();
        // CRITICAL: Update Apollo client with token BEFORE any GraphQL queries
        await updateClientWithToken();

        return {
          isLoggedIn,
          publicAddress: userInfo?.publicAddress,
          userData: userInfo,
        };
      }
      return {isLoggedIn, publicAddress: null, userData: null};
    } catch (error) {
      console.error('❌ Primary network auth error:', error);
      return {isLoggedIn: false, publicAddress: null, userData: null, error};
    }
  }, [magic.user, updateClientWithToken]);

  const checkAllNetworks = useCallback(async () => {
    try {
      // CRITICAL: First check primary network (this updates Apollo client token)
      const primaryNetworkData = await checkPrimaryNetworkAuth();

      if (!primaryNetworkData.isLoggedIn) {
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
  }, [checkPrimaryNetworkAuth]);

  // Handle user data from GraphQL query
  const handleUserData = useCallback(
    async (data: UserData): Promise<void> => {
      try {
        if (data?.getUserWalletAddress) {
          await checkAllNetworks();

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
              apiData.kycDetails = extractedKycInfo;
            }
          }

          await updateUserData(apiData, true);

          const isVerified: boolean =
            apiData?.is_verified === true || apiData?.is_verified === 'true';

          if (
            !isVerified &&
            !isKycCompleted &&
            !isKycSkipped &&
            !kycInProgress
          ) {
            setTimeout(() => handleKycProcess(), 300);
          } else {
            navigateToApp();
          }

          setLoading(false);
          setIsScreenLoading(false);
        } else {
          // User not in DB - prepare new user data
          await prepareNewUserData();
        }
      } catch (error) {
        console.error('❌ Error handling user data:', error);
        setLoading(false);
        setIsScreenLoading(false);
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
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
      const userInfo = await magic.user.getInfo();

      const walletData: any = {
        emailAddress: userInfo.email,
        userWallet: result?.networkData?.primary?.publicAddress,
        date: new Date().toISOString(),
        is_verified: false,
      };

      await updateUserData(walletData, false);
      setLoading(false);
      setIsScreenLoading(false);

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

        await updateClientWithToken();

        await getUserWallet({
          variables: {emailAddress: userMetadata?.email?.toLowerCase()},
        });
      } else {
        setIsScreenLoading(false);
      }
    } catch (error) {
      console.error('❌ Error checking user session:', error);
      setIsScreenLoading(false);
    }
  }, [magic.user, updateClientWithToken, getUserWallet]);

  // Check for active session on component mount
  useEffect(() => {
    checkUserSession();
  }, [checkUserSession]);

  // FIXED: Login with email OTP - ensuring token update before GraphQL
  const loginEmailOTP = useCallback(async () => {
    try {
      setLoading(true);
      callbackExecutedRef.current = false;

      await magic.auth.loginWithEmailOTP({email: userEmail});

      await updateClientWithToken();

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

  return (
    <SafeAreaView style={styles.safeAreaContainer}>
      {isScreenLoading ? (
        <LoadingScreen
          message={kycInProgress ? 'Processing KYC...' : 'Checking session...'}
        />
      ) : (
        <View style={styles.flexContainer}>
          <Header headerTitle="Login" hideBorder={true} hideBackIcon={true} />
          <ScrollView>
            <View style={styles.contentContainer}>
              <Text style={[styles.content, styles.welcomeText]}>Welcome</Text>
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
