import React, {
  useState,
  useCallback,
  useEffect,
} from 'react';

import {
  Text,
  View,
  SafeAreaView,
  TouchableOpacity,
  Alert,
  Image,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';

import 'react-native-get-random-values';
import '@ethersproject/shims';

import { useMutation } from '@apollo/client';
import { useNavigation, useRoute } from '@react-navigation/native';

import OTPModal from '../../components/OTPModal/OTPModal';

import styles from './styles';

import { DButton } from '../../components';
import { DMobileInput } from '../../components/Dinputs';

import { SEND_OTP } from '../../graphql/queries';

import { useUser } from '../../context/UserContext';

export default function LoginScreen() {

  const navigation = useNavigation<any>();
  const route = useRoute<any>();

  const { setCurrentUser } = useUser();

  /*
   * Mode:
   *
   * CUSTOMER
   * SIGN_IN
   *
   * Both eventually use the same OTP flow.
   */
  const mode =
    route.params?.mode || 'SIGN_IN';

  const [showOTP, setShowOTP] =
    useState(false);

  const [isValid, setValid] =
    useState(false);

  const [phoneNumber, setPhoneNumber] =
    useState(
      route.params?.phoneNumber || '',
    );

  const [loading, setLoading] =
    useState(false);

  const [
    sendOTP,
    { error: queryError },
  ] = useMutation(SEND_OTP);

  /*
   * GraphQL error
   */

  useEffect(() => {

    if (!queryError) {
      return;
    }

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

  /*
   * Send OTP
   */

  const loginWithPhone = useCallback(
    async () => {

      if (
        !phoneNumber ||
        !isValid ||
        loading
      ) {
        return;
      }

      try {

        setLoading(true);

        console.log(
          'User Phone Number:',
          phoneNumber,
        );

        const { data } =
          await sendOTP({
            variables: {
              phoneNumber,
            },
          });

        console.log(
          'OTP response:',
          data,
        );

        if (
          data?.sendOTP?.success
        ) {

          setShowOTP(true);

        } else {

          Alert.alert(
            'Unable to continue',
            data?.sendOTP?.message ||
            'We could not send the verification code.',
          );
        }

      } catch (error) {

        console.error(
          'OTP error:',
          error,
        );

        Alert.alert(
          'Something went wrong',
          'Please check your internet connection and try again.',
        );

      } finally {

        setLoading(false);

      }

    },
    [
      phoneNumber,
      isValid,
      loading,
      sendOTP,
    ],
  );

  /*
   * Back
   */

  const handleBack =
    useCallback(() => {

      if (
        navigation.canGoBack()
      ) {
        navigation.goBack();
        return;
      }

      navigation.navigate(
        'authScreens',
      );

    }, [navigation]);

  /*
   * OTP verification completed
   */

  const handleOTPVerified = (result: any) => {
    setShowOTP(false);

    // Existing user → enter the app
    if (result.isExistingUser && result.user) {
      setCurrentUser(result.user);

      navigation.reset({
        index: 0,
        routes: [
          {
            name: 'appScreens',
          },
        ],
      });

      return;
    }

    // OTP is valid but no account exists
    // → complete customer registration
    navigation.navigate('RegisterUser', {
      phoneNumber,
    });
  };

  return (
    <SafeAreaView
      style={styles.safeAreaContainer}
    >

      <KeyboardAvoidingView
        style={styles.flex}
        behavior={
          Platform.OS === 'ios'
            ? 'padding'
            : undefined
        }
      >

        <ScrollView
          contentContainerStyle={
            styles.scrollContent
          }
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={
            false
          }
        >

          {/* HERO */}

          <View
            style={styles.heroContainer}
          >

            <Image
              source={require(
                '../../assets/logo_badge.png',
              )}
              style={styles.heroImage}
              resizeMode="cover"
            />

            <View
              style={styles.heroOverlay}
            />

            {/* Back */}

            <TouchableOpacity
              onPress={handleBack}
              style={styles.backButton}
              activeOpacity={0.8}
              hitSlop={{
                top: 10,
                bottom: 10,
                left: 10,
                right: 10,
              }}
            >
              <Text style={styles.back}>
                ‹
              </Text>
            </TouchableOpacity>

            <View
              style={styles.heroTextContainer}
            >

              <Text
                style={styles.heroTitle}
              >
                Beauty that feels like you
              </Text>

              <Text
                style={styles.heroSubtitle}
              >
                Discover trusted salons and beauty
                services near you.
              </Text>

            </View>

          </View>

          {/* CONTENT */}

          <View
            style={styles.contentCard}
          >

            <Text style={styles.title}>
              {mode === 'CUSTOMER'
                ? 'Welcome'
                : 'Welcome!'}
            </Text>

            <Text style={styles.subtitle}>
              {mode === 'CUSTOMER'
                ? 'Enter your mobile number to get started.'
                : 'Sign in securely with your mobile number.'}
            </Text>

            {/* MOBILE */}

            <View
              style={styles.inputSection}
            >

              <Text
                style={styles.inputLabel}
              >
                Mobile number
              </Text>

              <View
                style={
                  styles.emailInputWrapper
                }
              >

                <DMobileInput
                  inputAccessoryViewID="sendOtp"
                  setValid={setValid}
                  value={phoneNumber}
                  setValue={setPhoneNumber}
                />

              </View>

            </View>

            {/* CONTINUE */}

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

              <Text
                style={styles.loginText}
              >
                {loading
                  ? 'Sending code...'
                  : 'Continue'}
              </Text>

            </DButton>

            {/* SECURITY */}

            <View
              style={
                styles.securityContainer
              }
            >

              <View
                style={styles.securityIcon}
              >
                <Text
                  style={
                    styles.securityIconText
                  }
                >
                  ✓
                </Text>
              </View>

              <Text
                style={styles.securityText}
              >
                We'll send you an OTP to verify
                your mobile number
              </Text>

            </View>

            {/* TERMS */}

            <View
              style={styles.bottomContainer}
            >

              <Text
                style={styles.bottomText}
              >
                By continuing, you agree to our
              </Text>

              <View
                style={styles.legalRow}
              >

                <TouchableOpacity
                  activeOpacity={0.7}
                >
                  <Text
                    style={
                      styles.legalLink
                    }
                  >
                    Terms of Service
                  </Text>
                </TouchableOpacity>

                <Text
                  style={styles.separator}
                >
                  {'  &  '}
                </Text>

                <TouchableOpacity
                  activeOpacity={0.7}
                >
                  <Text
                    style={
                      styles.legalLink
                    }
                  >
                    Privacy Policy
                  </Text>
                </TouchableOpacity>

              </View>

            </View>

          </View>

        </ScrollView>

      </KeyboardAvoidingView>

      {/* GENERIC OTP MODAL */}

      <OTPModal
        visible={showOTP}
        phoneNumber={phoneNumber}
        onClose={() => {
          setShowOTP(false);
        }}
        onVerified={handleOTPVerified}
      />

    </SafeAreaView>
  );
}

LoginScreen.navigationOptions = {
  header: null,
};