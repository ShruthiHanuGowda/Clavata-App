import React, {useEffect, useState} from 'react';
import {
  Text,
  View,
  Image,
  ScrollView,
  ActivityIndicator,
  Button,
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
import {
  CREATE_KYC_VERIFICATION,
  GET_USER_WALLET_ADDRESS,
} from '../../graphql/queries';
import {useKycVerification} from '../../CustomHooks/useKycVerification';
import SNSMobileSDK from '@sumsub/react-native-mobilesdk-module';

export default function LoginScreen() {
  const {initiateKycToken, KYCTokenLoading, KYCTokenError} =
    useKycVerification();
  const {magic} = useMagic();
  const {updateUserData, userDetails} = useAuth();

  const [KYCAuthToken, setKYCAuthToken] = useState<String | null>(null);

  const [isUserLogin, setIsUserLogin] = useState(false);

  const [isValid, setValid] = useState(false);
  const [userEmail, setUserEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [isScreenLoading, setIsScreenLoading] = useState(true);

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

  //REVIEW - handle KYC Auth Token

  const handleKYCToken = async () => {
    const userEmail = userDetails?.email ?? userDetails?.walletAddress;
    console.log('🚀 ~ handleKYCToken ~ userEmail:', userEmail);

    try {
      const {token, userId, expiryTime} = await initiateKycToken(
        userEmail,
        'basic-kyc-level',
      );

      if (token) {
        setKYCAuthToken(token);
        return token;
        // console.log('Access Token:', token);
        // console.log('User ID:', userId);
        // console.log('Expiry Time:', new Date(expiryTime).toLocaleString());

        // Use the token here
        // For example, store it in state or use it for the next API call
      } else {
        console.error('Failed to obtain KYC token');
      }
    } catch (err) {
      console.error('Verification process failed:', err);
    }
  };

  const launchSumSub = async () => {
    try {
      // Get your access token from your backend
      const accessToken = await handleKYCToken();

      let snsMobileSDK = SNSMobileSDK.init(accessToken, async () => {
        // This is a token expiration handler, will be called if the provided token is invalid or got expired
        // Instead of using fetch, now using handleKYCToken to get a fresh token
        return await handleKYCToken();
      })
        .withHandlers({
          // Optional callbacks you can use to get notified of the corresponding events
          onStatusChanged: event => {
            console.log(
              'onStatusChanged: [' +
                event.prevStatus +
                '] => [' +
                event.newStatus +
                ']',
            );
          },
          onLog: event => {
            console.log('onLog: [Idensic] ' + event.message);
          },
        })
        .withDebug(true)
        .withLocale('en') // Optional, for cases when you need to override the system locale
        .build();

      const result = await snsMobileSDK.launch();
      console.log('SumSub SDK State: ' + JSON.stringify(result));
      return result;
    } catch (err) {
      console.log('SumSub SDK Error: ' + JSON.stringify(err));
      throw err;
    }
  };

  // Handle user data from query
  const handleUserData = async data => {
    try {
      if (data?.getUserWalletAddress) {
        // User exists in DB - store data in context
        const apiData = {...data.getUserWalletAddress};
        delete apiData.__typename;
        await updateUserData(apiData, true);
        setIsUserLogin(true);
        // navReset('appScreens');
      } else {
        // New session but user not in DB - handle in checkUserSession
        console.log('User session active but not found in database');
      }
      setLoading(false);
      setIsScreenLoading(false);
    } catch (error) {
      console.error('Error handling user data:', error);
      setLoading(false);
      setIsScreenLoading(false);
    }
  };

  // Create wallets and prepare user data for new users
  const prepareNewUserData = async user => {
    try {
      const userData = {...user};
      // Create Ethereum wallet
      const ethereumWallet = ethers.Wallet.createRandom();
      userData.ethAddress = ethereumWallet?.address;

      // Create Denergy wallet
      const provider = new ethers.JsonRpcProvider('https://rpc.d.energy');
      const denergyWallet = ethers.Wallet.createRandom().connect(provider);
      userData.dEnergyAddress = denergyWallet?.address;

      // Store in context and DB
      await updateUserData(userData, false);
      return userData;
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

        // If user not found in DB, handleUserData will handle creating a new user
        if (!userData?.getUserWalletAddress) {
          await prepareNewUserData(userMetadata);
          setIsUserLogin(true);
          // navReset('appScreens');
        }
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
      const userMetadata = await magic.user.getInfo();

      // Check if user exists in database
      await getUserWallet({
        variables: {walletAddress: userEmail.toLowerCase()},
      });

      // If user not found in DB after query completes
      if (!userData?.getUserWalletAddress) {
        await prepareNewUserData(userMetadata);
        setIsUserLogin(true);
        // navReset('appScreens');
      }
      // If user found, handleUserData will handle navigation
    } catch (err) {
      setLoading(false);
      console.error('Login error:', err);
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

  if (!isUserLogin) {
    return (
      <View style={{flex: 1, backgroundColor: '#fff'}}>
        <View style={{zIndex: 1, flex: 1}}>
          <Header headerTitle="Login" hideBorder={true} hideBackIcon={true} />
          <ScrollView>
            <View style={styles.contentContainer}>
              <Image
                style={{marginHorizontal: 15, marginTop: 50}}
                source={Images.logoBlueNew}
              />
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
      </View>
    );
  }
  if (isUserLogin) {
    return (
      <View style={{flex: 1, justifyContent: 'center', alignItems: 'center'}}>
        <Button title="KYC" onPress={() => launchSumSub()} />
      </View>
    );
  }
}

LoginScreen.navigationOptions = {
  header: null,
};
