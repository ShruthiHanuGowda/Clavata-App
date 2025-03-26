import React, {useEffect, useState, useCallback} from 'react';
import {
  Text,
  View,
  Image,
  ScrollView,
  ActivityIndicator,
  Alert,
} from 'react-native';
import 'react-native-get-random-values';
import '@ethersproject/shims'; // for ethers.js
import {ethers} from 'ethers';
import styles from './styles';
import {useMagic} from '../../../screens/Provider/MagicProvider';
import {useAuth} from '../../../screens/Provider/authProvider';
import {navReset} from '../../Navigation/NavigationFunctions';
import {DButton, Header} from '../../Componants';
import {Images} from '../../Theme';
import {DEmailInput} from '../../Componants/Dinputs';
import {useLazyQuery} from '@apollo/client';
import {GET_USER_WALLET_ADDRESS} from '../../graphql/queries';
// import {useKyc} fom '../../contexts/KycContextProvider';
import {useKycService} from '../../CustomHooks/KYC/KycServiceProvider';
import KycBottomSheet from '../../CustomHooks/KYC/KycBottomSheet';
import {useKyc} from '../../CustomHooks/KYC/KYCProvider';

export default function LoginScreen() {
  const {magic} = useMagic();
  const {updateUserData, userDetails} = useAuth();
  // console.log('🚀 ~ LoginScreen ~ userDetails:', userDetails);
  const {isKycCompleted, showKycBottomSheet} = useKyc();
  const {launchKycVerification} = useKycService();

  const [isUserLogin, setIsUserLogin] = useState(false);
  const [isValid, setValid] = useState(false);
  const [userEmail, setUserEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [isScreenLoading, setIsScreenLoading] = useState(true);
  const [kycProcessing, setKycProcessing] = useState(false);

  // Query to check if user exists in DB
  const [getUserWallet, {data: userData}] = useLazyQuery(
    GET_USER_WALLET_ADDRESS,
    {
      fetchPolicy: 'network-only',
      onCompleted: data => {
        handleUserData(data);
      },
      onError: error => {
        console.error('Error fetching user data:', error);
        setIsScreenLoading(false);
      },
    },
  );

  // Navigate to main app screens
  const navigateToApp = useCallback(() => {
    console.log('Navigating to app screens');
    navReset('appScreens');
  }, []);

  // Handle starting KYC verification
  const handleStartKyc = useCallback(async () => {
    console.log('Starting KYC verification from handleStartKyc', kycProcessing);
    if (kycProcessing) {
      console.log('KYC already in progress, returning');
      return;
    }

    try {
      setKycProcessing(true);
      console.log('Before launching KYC verification');

      const result = await launchKycVerification();
      console.log('KYC verification result:', result);

      if (result.success) {
        Alert.alert('Success', result.message, [
          {text: 'OK', onPress: navigateToApp},
        ]);
      } else {
        showKycBottomSheet();
        Alert.alert('Verification Not Completed', result.message);
      }
    } catch (error) {
      showKycBottomSheet();
      console.error('KYC verification error:', error);
      Alert.alert(
        'Error',
        'An error occurred during verification. Please try again later.',
      );
    } finally {
      setKycProcessing(false);
    }
  }, [launchKycVerification, navigateToApp, kycProcessing]);

  // Handle skipping KYC verification
  const handleSkipKyc = useCallback(() => {
    console.log('Skipping KYC verification');
    navigateToApp();
  }, [navigateToApp]);

  // Handle user data from query
  const handleUserData = async (data: any) => {
    try {
      if (data?.getUserWalletAddress) {
        // User exists in DB - store data in context
        const apiData = {...data.getUserWalletAddress};
        delete apiData.__typename;
        await updateUserData(apiData, true);
        setIsUserLogin(true);
        const isVerified =
          apiData?.is_verified === true || apiData?.is_verified === 'true';

        // Check if user should be prompted for KYC
        if (!isVerified) {
          console.log('User not KYC verified, will show bottom sheet');
          // Slight delay to ensure UI is ready
          setTimeout(() => {
            showKycBottomSheet();
          }, 500);
        } else {
          console.log('User already KYC verified, navigating to app');
          navigateToApp();
        }
        setLoading(false);
        setIsScreenLoading(false);
      } else {
        // New session but user not in DB - handle in checkUserSession
        console.log('User session active but not found in database');
        prepareNewUserData();
      }
    } catch (error) {
      console.error('Error handling user data:', error);
      setLoading(false);
      setIsScreenLoading(false);
    }
  };

  // Create wallets and prepare user data for new users
  const prepareNewUserData = async () => {
    try {
      const userData = await magic.user.getInfo();
      const ethereumWallet = ethers.Wallet.createRandom();
      const provider = new ethers.JsonRpcProvider('https://rpc.d.energy');
      const denergyWallet = ethers.Wallet.createRandom().connect(provider);
      const walletData = {
        walletAddress: userData.email,
        ethereumWallet: ethereumWallet?.address,
        denergyWallet: denergyWallet?.address,
        userWallet: userData.publicAddress,
        date: new Date().toISOString(),
        is_verified: false,
      };

      // Create Ethereum wallet

      // Store in context and DB
      await updateUserData(walletData, false);
      setLoading(false);
      setIsScreenLoading(false);
      setTimeout(() => {
        showKycBottomSheet();
      }, 500);
    } catch (error) {
      console.error('Error preparing user data:', error);
      throw error;
    }
  };

  // Check if user has an active session
  const checkUserSession = async () => {
    try {
      setIsScreenLoading(true);
      const isLoggedIn = await magic.user.isLoggedIn();

      if (isLoggedIn) {
        // If user is logged in, get metadata and check DB
        const userMetadata = await magic.user.getInfo();
        console.log('User session active, checking database...', userMetadata);

        // Check if user exists in database
        await getUserWallet({
          variables: {walletAddress: userMetadata?.email?.toLowerCase()},
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
  };

  // Check for active session on component mount
  useEffect(() => {
    checkUserSession();
  }, []);

  // Handle login with email OTP
  const loginEmailOTP = async () => {
    try {
      setLoading(true);
      // Login with Magic Link
      await magic.auth.loginWithEmailOTP({email: userEmail});

      await getUserWallet({
        variables: {walletAddress: userEmail.toLowerCase()},
      });
    } catch (err) {
      setLoading(false);
      Alert.alert(
        'Login Failed',
        'Unable to login with the provided email. Please try again.',
      );
    }
  };

  // Show loading screen while checking session
  if (isScreenLoading) {
    return (
      <View
        style={{
          flex: 1,
          justifyContent: 'center',
          alignItems: 'center',
          backgroundColor: '#fff',
        }}>
        <ActivityIndicator size="large" color="#007AFF" />
        <Text style={{marginTop: 20}}>Checking session...</Text>
      </View>
    );
  }

  return (
    <View style={{flex: 1, backgroundColor: '#fff'}}>
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
              disabled={!(userEmail && isValid) || loading}
              onPress={loginEmailOTP}>
              <Text style={[styles.loginText]}>
                {loading ? 'Sending...' : 'Log In'}
              </Text>
            </DButton>
          </View>
        </ScrollView>
      </View>
      <KycBottomSheet onStartKyc={handleStartKyc} onSkipKyc={handleSkipKyc} />
    </View>
  );
}

LoginScreen.navigationOptions = {
  header: null,
};
