import React, { useState, useCallback, useEffect } from 'react';
import {
  Text,
  View,
  SafeAreaView,
  TouchableOpacity,
  Alert,
} from 'react-native';

import 'react-native-get-random-values';
import '@ethersproject/shims';

import { useMutation } from '@apollo/client';
import { useNavigation } from '@react-navigation/native';

import styles from './styles';
import { DButton } from '../../components';
import { DMobileInput } from '../../components/Dinputs';
import { SEND_OTP } from '../../graphql/queries';

export default function LoginScreen() {
  // ALL HOOKS MUST BE CALLED BEFORE ANY RETURN
  const navigation = useNavigation<any>();

  const [isValid, setValid] = useState(false);
  const [phoneNumber, setPhoneNumber] = useState('');
  const [loading, setLoading] = useState(false);

  const [sendOTP, { error: queryError }] = useMutation(SEND_OTP);

  useEffect(() => {
    if (queryError) {
      console.error('Send OTP error:', queryError);

      setLoading(false);

      Alert.alert(
        'Unable to continue',
        'We could not send the verification code. Please try again.',
      );
    }
  }, [queryError]);

  const loginWithPhone = useCallback(async () => {
    if (!phoneNumber || !isValid || loading) {
      return;
    }

    try {
      setLoading(true);

      console.log('User Phone Number:', phoneNumber);

      const { data } = await sendOTP({
        variables: {
          phoneNumber: phoneNumber,
        },
      });

      console.log('OTP response:', data);

      if (data?.sendOTP?.success) {
        navigation.navigate('VerifyOTP', {
          phoneNumber: phoneNumber,
        });
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
    navigation,
  ]);

  const handleBack = useCallback(() => {
    navigation.goBack();
  }, [navigation]);

  return (
    <SafeAreaView style={styles.safeAreaContainer}>
      <View style={styles.container}>

        {/* Back button */}
        <TouchableOpacity
          onPress={handleBack}
          style={styles.backButton}
          activeOpacity={0.7}
          hitSlop={{
            top: 10,
            bottom: 10,
            left: 10,
            right: 10,
          }}
        >
          <Text style={styles.back}>‹</Text>
        </TouchableOpacity>

        <View style={styles.loginContent}>

          {/* Brand */}
          <View style={styles.brandContainer}>
            <Text style={styles.brand}>
              Clavata
            </Text>
            <View style={styles.brandLine} />
          </View>

          {/* Heading */}
          <View style={styles.headingContainer}>
            <Text style={styles.subtitle}>
              Sign in to continue to your
              {'\n'}
              Clavata experience.
            </Text>
          </View>

          {/* Mobile number */}
          <View style={styles.inputSection}>

            <Text style={styles.inputLabel}>
              Mobile number
            </Text>

            <View style={styles.emailInputWrapper}>
              <DMobileInput
                inputAccessoryViewID="sendOtp"
                setValid={setValid}
                value={phoneNumber}
                setValue={setPhoneNumber}
              />
            </View>

            <Text style={styles.helperText}>
              We'll send you a one-time verification code.
            </Text>

          </View>

          {/* Continue */}
          <DButton
            type="primary"
            style={styles.loginBtnStyle}
            disabled={
              !phoneNumber ||
              !isValid ||
              loading
            }
            onPress={loginWithPhone}
          >
            <Text style={styles.loginText}>
              {loading
                ? 'Sending code...'
                : 'Continue'}
            </Text>
          </DButton>

        </View>

        {/* Legal */}
        <View style={styles.bottomContainer}>
          <Text style={styles.bottomText}>
            By continuing, you agree to Clavata's
          </Text>

          <View style={styles.legalRow}>
            <TouchableOpacity activeOpacity={0.7}>
              <Text style={styles.legalLink}>
                Terms of Service
              </Text>
            </TouchableOpacity>

            <Text style={styles.separator}>
              {' • '}
            </Text>

            <TouchableOpacity activeOpacity={0.7}>
              <Text style={styles.legalLink}>
                Privacy Policy
              </Text>
            </TouchableOpacity>
          </View>
        </View>

      </View>
    </SafeAreaView>
  );
}

LoginScreen.navigationOptions = {
  header: null,
};