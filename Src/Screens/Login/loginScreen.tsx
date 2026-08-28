import React, { useState, useCallback, useEffect } from 'react';

import {
  Text,
  View,
  SafeAreaView,
  TouchableOpacity,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Alert,
  Image,
  TextInput,
} from 'react-native';

import 'react-native-get-random-values';
import '@ethersproject/shims';

import { useMutation } from '@apollo/client';
import { useNavigation, useRoute } from '@react-navigation/native';

import styles from './styles';

import { SEND_OTP } from '../../graphql/queries';
import { useUser } from '../../context/UserContext';
import { DMobileInput } from '../../components/Dinputs';
import { DButton, OTPModal } from '../../components';

type LoginMode = 'CUSTOMER' | 'PROVIDER' | 'SIGN_IN';

export default function LoginScreen() {

  const navigation = useNavigation<any>();
  const route = useRoute<any>();

  console.log('========== LOGIN SCREEN ==========');
  console.log('ROUTE PARAMS:', route.params);

  const { setCurrentUser } = useUser();

  const mode: LoginMode =
    route.params?.mode || 'SIGN_IN';

  const hideBackButton =
    route.params?.hideBackButton === true;

  const [showOTP, setShowOTP] = useState(false);
  const [isValid, setValid] = useState(false);
  const [phoneNumber, setPhoneNumber] = useState(
    route.params?.phoneNumber || '',
  );
  const [loading, setLoading] = useState(false);

  const [sendOTP, { error: queryError }] =
    useMutation(SEND_OTP);

  useEffect(() => {
    if (!queryError) return;

    console.error(
      'Send OTP error:',
      queryError,
    );

    setLoading(false);

    Alert.alert(
      'Unable to continue',
      'We could not send the verification code. Please try again.',
    );
  }, [queryError]);
const handleOTPVerified = (result: any) => {
  console.log('OTP VERIFIED:', result);

  setShowOTP(false);

  if (result?.success !== true) {
    Alert.alert(
      'Verification failed',
      result?.message ||
        'OTP verification failed. Please try again.',
    );
    return;
  }

  console.log(
    'OTP verification successful',
  );
};
  const loginWithPhone = useCallback(async () => {
    if (!phoneNumber || !isValid || loading) {
      return;
    }

    try {
      setLoading(true);

      const { data } = await sendOTP({
        variables: {
          phoneNumber,
        },
      });

      console.log('SEND OTP RESULT:', data);

      if (data?.sendOTP?.success) {
        setShowOTP(true);
      } else {
        Alert.alert(
          'Unable to continue',
          data?.sendOTP?.message ||
          'We could not send the verification code.',
        );
      }
    } catch (error) {
      console.error('OTP error:', error);

      Alert.alert(
        'Something went wrong',
        'Please check your internet connection and try again.',
      );
    } finally {
      setLoading(false);
    }
  }, [
    phoneNumber,
    isValid,
    loading,
    sendOTP,
  ]);

  const handleBack = useCallback(() => {
    if (navigation.canGoBack()) {
      navigation.goBack();
      return;
    }

    navigation.navigate('authScreens');
  }, [navigation]);

  const getExistingRole = (user: any) => {
    if (user?.roles?.customer === true) {
      return 'CUSTOMER';
    }

    if (user?.roles?.businessPartner === true) {
      return 'PROVIDER';
    }

    if (user?.activeRole === 'CUSTOMER') {
      return 'CUSTOMER';
    }

    if (user?.activeRole === 'PROVIDER') {
      return 'PROVIDER';
    }

    return null;
  };

  const openExistingAccount = async (user: any) => {
    setCurrentUser(user);

    const existingRole =
      getExistingRole(user);

    console.log(
      '========== EXISTING ACCOUNT ==========',
    );

    console.log(
      'ROLE:',
      existingRole,
    );

    console.log(
      'PROVIDER STATUS:',
      user?.providerStatus,
    );

    console.log(
      'USER:',
      JSON.stringify(
        user,
        null,
        2,
      ),
    );

    console.log(
      '======================================',
    );

    if (existingRole === 'PROVIDER') {
      const providerStatus = String(
        user?.providerStatus ||
        'NOT_REGISTERED',
      )
        .trim()
        .toUpperCase();

      console.log(
        'NORMALIZED PROVIDER STATUS:',
        providerStatus,
      );

      if (
        providerStatus ===
        'NOT_REGISTERED'
      ) {
        navigation.navigate(
          'BecomePartner',
        );
        return;
      }

      if (
        providerStatus === 'PENDING'
      ) {
        navigation.replace(
          'BecomePartner',
          {
            screen:
              'SalonPendingVerification',
          },
        );
        return;
      }

      if (
        providerStatus === 'APPROVED'
      ) {
        navigation.navigate(
          'appScreens',
        );
        return;
      }

      if (
        providerStatus === 'REJECTED'
      ) {
        navigation.navigate(
          'BecomePartner',
        );
        return;
      }

      navigation.navigate(
        'BecomePartner',
      );

      return;
    }

    if (existingRole === 'CUSTOMER') {
      navigation.replace(
        'appScreens',
        {
          screen: 'HomeScreen',
        },
      );

      return;
    }

    console.error(
      'UNKNOWN ACCOUNT ROLE:',
      JSON.stringify(
        user,
        null,
        2,
      ),
    );

    Alert.alert(
      'Account error',
      'We could not determine your account type. Please contact support.',
    );
  };

  /*
   * TEMPORARILY DISABLED:
   * OTPModal is being added back after we confirm
   * the LoginScreen itself works on Web.
   */

  console.log(
    'LOGIN MODE:',
    mode,
  );

  console.log(
    'PHONE:',
    phoneNumber,
  );

  console.log(
    'VALID:',
    isValid,
  );

  console.log(
    'LOADING:',
    loading,
  );
  return (
  <View
    style={{
      flex: 1,
      backgroundColor: 'white',
      padding: 40,
    }}
  >
    <Text
      style={{
        color: 'black',
        fontSize: 30,
        marginBottom: 30,
      }}
    >
      LOGIN PAGE
    </Text>

    <DMobileInput
      setValid={setValid}
      value={phoneNumber}
      setValue={setPhoneNumber}
    />

    <View style={{ marginTop: 30 }}>
      <DButton
        type="primary"
        disabled={!phoneNumber || !isValid || loading}
        onPress={loginWithPhone}
      >
        <Text style={{ color: 'white' }}>
          {loading ? 'Sending code...' : 'Continue'}
        </Text>
      </DButton>
    </View>

    <Text
      style={{
        color: 'black',
        fontSize: 20,
        marginTop: 20,
      }}
    >
      Mode: {mode}
    </Text>

    <OTPModal
      visible={showOTP}
      phoneNumber={phoneNumber}
      onClose={() => setShowOTP(false)}
      onVerified={handleOTPVerified}
    />
  </View>
);
}

LoginScreen.navigationOptions = {
  header: null,
};