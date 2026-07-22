import React, { useEffect, useState, useCallback, useRef } from 'react';
import { Text, View, ScrollView, Alert, SafeAreaView } from 'react-native';
import 'react-native-get-random-values';
import '@ethersproject/shims';
import LottieView from 'lottie-react-native';
import styles from './styles';
// import { useMagic } from '../../providers';
// import { useAuth } from '../../providers';
import { navReset } from '../../Navigation/NavigationFunctions';
import { DButton, Header } from '../../components';
import { Animation, Colors } from '../../Theme';
import { DMobileInput } from '../../components/Dinputs';
import { useLazyQuery, useMutation } from '@apollo/client';
import { SEND_OTP, VERIFY_OTP } from '../../graphql/queries';
import { UserAuth, ExtractedKycInfo, UserData } from '../../utils/type';
import { useApolloClientContext } from '../../providers';
// import { useKycCheck } from '../../providers';
import { useNavigation } from '@react-navigation/native';

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

const LoadingScreen = ({ message }: { message: string }) => (
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
  const navigation = useNavigation();
  // const { magic, setActiveNetwork } = useMagic();
  // const { updateUserData } = useAuth();
  // const { updateClientWithToken } = useApolloClientContext();
  // const { checkKYC, isKycCompleted } = useKycCheck();

  const [isValid, setValid] = useState(false);
  const [userEmail, setUserEmail] = useState('');
  const [loading, setLoading] = useState(false);
  // const [isScreenLoading, setIsScreenLoading] = useState(true);
  const [isKycSkipped, setIsKycSkipped] = useState(false);
  const [kycInProgress, setKycInProgress] = useState(false);

  const callbackExecutedRef = useRef(false);
  const kycCompletionTimeoutRef = useRef<any>(null);
  const kycPollingIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // const [getUserWallet, { data: userData, error: queryError }] = useLazyQuery(
  //   SEND_OTP,
  //   {
  //     fetchPolicy: 'no-cache',
  //   },
  // );

  const [sendOTP, { data: userData, error: queryError }] = useMutation(SEND_OTP);
  const [verifyOTP] = useMutation(VERIFY_OTP);

  useEffect(() => {
    if (userData && !callbackExecutedRef.current && !isKycSkipped) {
      callbackExecutedRef.current = true;

      // handleUserData(userData);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userData, isKycSkipped]);

  useEffect(() => {
    if (queryError) {
      console.error('❌ Error fetching user data:', queryError);
      // setIsScreenLoading(false);
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



  const loginWithPhone = useCallback(async () => {
    try {
      setLoading(true);
      console.log('User Phone Number:', userEmail);
      // await updateClientWithToken();
      const { data } = await sendOTP({
        variables: {
          phoneNumber: userEmail,
        },
      });

      console.log('OTP sent response:', data);

      if (data?.sendOTP.success) {
        navigation.navigate('VerifyOTP', {
          phoneNumber: userEmail,
        });
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [userEmail, sendOTP]);

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
  // useEffect(() => {
  //   if (isKycCompleted && kycInProgress) {
  //     if (kycPollingIntervalRef.current) {
  //       clearInterval(kycPollingIntervalRef.current);
  //       kycPollingIntervalRef.current = null;
  //     }
  //     if (kycCompletionTimeoutRef.current) {
  //       clearTimeout(kycCompletionTimeoutRef.current);
  //       kycCompletionTimeoutRef.current = null;
  //     }

  //     setKycInProgress(false);
  //     setIsKycSkipped(true);
  //     setTimeout(() => navigateToApp(), 500);
  //   }
  // }, [isKycCompleted, kycInProgress, navigateToApp]);

  return (
    <SafeAreaView style={styles.safeAreaContainer}>
      <View style={styles.flexContainer}>

        <View style={styles.loginContent}>

          <Text style={styles.title}>
            Nex
          </Text>

          <Text style={styles.subtitle}>
            Book trusted salon services{"\n"}
            or manage your salon business.
          </Text>

          <View style={styles.emailInputWrapper}>
            <DMobileInput
              inputAccessoryViewID={'sendOtp'}
              setValid={setValid}
              value={userEmail}
              setValue={setUserEmail}
            />
          </View>

          <DButton
            type="primary"
            style={styles.loginBtnStyle}
            disabled={!(userEmail && isValid) || loading}
            onPress={loginWithPhone}
          >
            <Text style={styles.loginText}>
              {loading ? 'Sending...' : 'Continue'}
            </Text>
          </DButton>

        </View>

      </View>
    </SafeAreaView>
  );
}

LoginScreen.navigationOptions = {
  header: null,
};
