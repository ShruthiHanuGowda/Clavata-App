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

import {
  useMutation,
} from '@apollo/client';

import {
  useNavigation,
  useRoute,
} from '@react-navigation/native';

import OTPModal from '../../components/OTPModal/OTPModal';

import styles from './styles';

import {
  DButton,
} from '../../components';

import {
  DMobileInput,
} from '../../components/Dinputs';

import {
  SEND_OTP,
} from '../../graphql/queries';

import {
  useUser,
} from '../../context/UserContext';

type LoginMode =
  | 'CUSTOMER'
  | 'PROVIDER'
  | 'SIGN_IN';

/*
 * ----------------------------------------------------------
 * LOGIN SCREEN
 * ----------------------------------------------------------
 */

export default function LoginScreen() {

  const navigation =
    useNavigation<any>();

  const route =
    useRoute<any>();

  const {
    setCurrentUser,
  } = useUser();

  /*
   * --------------------------------------------------------
   * MODE
   * --------------------------------------------------------
   *
   * CUSTOMER
   *   User came from "Find Service"
   *
   * PROVIDER
   *   User came from "Provide Service"
   *
   * SIGN_IN
   *   User explicitly selected "Sign in"
   */

  const mode: LoginMode =
    route.params?.mode ||
    'SIGN_IN';

  const [
    showOTP,
    setShowOTP,
  ] = useState(false);

  const [
    isValid,
    setValid,
  ] = useState(false);

  const [
    phoneNumber,
    setPhoneNumber,
  ] = useState(
    route.params?.phoneNumber || '',
  );

  const [
    loading,
    setLoading,
  ] = useState(false);

  const [
    sendOTP,
    {
      error: queryError,
    },
  ] = useMutation(
    SEND_OTP,
  );

  /*
   * --------------------------------------------------------
   * GRAPHQL ERROR
   * --------------------------------------------------------
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
   * --------------------------------------------------------
   * SEND OTP
   * --------------------------------------------------------
   */

  const loginWithPhone =
    useCallback(
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
            '========== SEND OTP ==========',
          );

          console.log(
            'PHONE:',
            phoneNumber,
          );

          console.log(
            'MODE:',
            mode,
          );

          const {
            data,
          } = await sendOTP({
            variables: {
              phoneNumber,
            },
          });

          console.log(
            'OTP RESPONSE:',
            JSON.stringify(
              data,
              null,
              2,
            ),
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
        mode,
      ],
    );

  /*
   * --------------------------------------------------------
   * BACK
   * --------------------------------------------------------
   */

  const handleBack =
    useCallback(
      () => {

        if (
          navigation.canGoBack()
        ) {

          navigation.goBack();

          return;
        }

        navigation.navigate(
          'authScreens',
        );

      },
      [navigation],
    );

  /*
   * --------------------------------------------------------
   * GET EXISTING USER ROLE
   * --------------------------------------------------------
   */

  const getExistingRole =
    (user: any) => {

      if (
        user?.roles?.customer === true
      ) {
        return 'CUSTOMER';
      }

      if (
        user?.roles?.businessPartner === true
      ) {
        return 'PROVIDER';
      }

      /*
       * Fallback to activeRole if an old record
       * does not contain roles correctly.
       */

      if (
        user?.activeRole === 'CUSTOMER'
      ) {
        return 'CUSTOMER';
      }

      if (
        user?.activeRole === 'PROVIDER'
      ) {
        return 'PROVIDER';
      }

      return null;
    };

  /*
   * --------------------------------------------------------
   * OPEN EXISTING ACCOUNT
   * --------------------------------------------------------
   *
   * Existing partner who has not completed salon
   * registration should continue to SalonRegistration.
   *
   * Otherwise open appScreens.
   */

  const openExistingAccount =
    (user: any) => {

      setCurrentUser(user);

      const existingRole =
        getExistingRole(user);

      if (
        existingRole === 'PROVIDER' &&
        user?.providerStatus ===
        'NOT_REGISTERED'
      ) {

        navigation.reset({
          index: 0,
          routes: [
            {
              name:
                'SalonRegistration',
            },
          ],
        });

        return;
      }

      navigation.reset({
        index: 0,
        routes: [
          {
            name:
              'appScreens',
          },
        ],
      });
    };

  /*
   * --------------------------------------------------------
   * OTP VERIFIED
   * --------------------------------------------------------
   */
  const handleOTPVerified = (result: any) => {
    console.log(
      '========== OTP VERIFIED ==========',
    );

    console.log(
      'OTP RESULT:',
      JSON.stringify(result, null, 2),
    );

    setShowOTP(false);

    /*
     * ======================================================
     * OTP FAILED
     * ======================================================
     */

    if (result?.success !== true) {
      Alert.alert(
        'Verification failed',
        result?.message ||
        'OTP verification failed. Please try again.',
      );

      return;
    }

    /*
     * ======================================================
     * EXISTING USER
     * ======================================================
     */

    if (
      result?.isExistingUser === true &&
      result?.user
    ) {
      const user = result.user;

      const existingRole =
        getExistingRole(user);

      console.log(
        '========== EXISTING USER ==========',
      );

      console.log(
        'EXISTING ROLE:',
        existingRole,
      );

      /*
       * ------------------------------------------------------
       * SIGN IN
       * ------------------------------------------------------
       */

      if (mode === 'SIGN_IN') {
        openExistingAccount(user);
        return;
      }

      /*
       * ------------------------------------------------------
       * CUSTOMER / FIND SERVICE
       * ------------------------------------------------------
       */

      if (mode === 'CUSTOMER') {

        if (existingRole === 'CUSTOMER') {
          openExistingAccount(user);
          return;
        }

        /*
         * Provider trying to use Find Service
         */

        Alert.alert(
          'Number already registered',
          'This mobile number is already registered as a Service Provider. Please sign in.',
          [
            {
              text: 'Sign in',
              onPress: () => {
                navigation.replace(
                  'LoginScreen',
                  {
                    mode: 'SIGN_IN',
                    phoneNumber: phoneNumber,
                  },
                );
              },
            },
          ],
        );

        return;
      }

      /*
       * ------------------------------------------------------
       * PROVIDER / PROVIDE SERVICE
       * ------------------------------------------------------
       */

      if (mode === 'PROVIDER') {

        if (existingRole === 'PROVIDER') {
          openExistingAccount(user);
          return;
        }

        /*
         * Customer trying to become Provider
         */

        Alert.alert(
          'Number already registered',
          'This mobile number is already registered as a customer. Please sign in.',
          [
            {
              text: 'Sign in',
              onPress: () => {
                navigation.replace(
                  'LoginScreen',
                  {
                    mode: 'SIGN_IN',
                    phoneNumber: phoneNumber,
                  },
                );
              },
            },
          ],
        );

        return;
      }

      return;
    }

    /*
     * ======================================================
     * NEW USER
     * ======================================================
     */

    if (result?.isExistingUser === false) {

      console.log(
        '========== NEW USER ==========',
      );

      console.log(
        'MODE:',
        mode,
      );

      console.log(
        'PHONE:',
        phoneNumber,
      );

      /*
       * ------------------------------------------------------
       * SIGN IN + NEW NUMBER
       * ------------------------------------------------------
       */

      if (mode === 'SIGN_IN') {

        Alert.alert(
          'Account not found',
          'No Clavata account exists for this mobile number. Please choose Find Service or Provide Service to create an account.',
          [
            {
              text: 'Choose account type',
              onPress: () => {
                navigation.replace(
                  'authScreens',
                );
              },
            },
          ],
        );

        return;
      }

      /*
       * ------------------------------------------------------
       * NEW CUSTOMER
       * ------------------------------------------------------
       */

      if (mode === 'CUSTOMER') {

        console.log(
          '➡️ NEW CUSTOMER → RegisterUser',
        );

        console.log(
          'PHONE:',
          phoneNumber,
        );

        navigation.replace(
          'RegisterUser',
          {
            phoneNumber: phoneNumber,
            activeRole: 'CUSTOMER',
          },
        );

        return;
      }

      /*
       * ------------------------------------------------------
       * NEW PROVIDER
       * ------------------------------------------------------
       */

      if (mode === 'PROVIDER') {

        console.log(
          '➡️ NEW PROVIDER → RegisterUser',
        );

        console.log(
          'PHONE:',
          phoneNumber,
        );

        navigation.replace(
          'RegisterUser',
          {
            phoneNumber: phoneNumber,
            activeRole: 'PROVIDER',
          },
        );

        return;
      }

      /*
       * ------------------------------------------------------
       * UNKNOWN MODE
       * ------------------------------------------------------
       */

      console.error(
        'UNKNOWN LOGIN MODE:',
        mode,
      );

      Alert.alert(
        'Unable to continue',
        `Unknown account type: ${mode}`,
      );

      return;
    }

    /*
     * ======================================================
     * UNKNOWN OTP RESPONSE
     * ======================================================
     */

    console.error(
      'Unknown OTP verification response:',
      result,
    );

    Alert.alert(
      'Unable to continue',
      'We could not determine your account status. Please try again.',
    );
  };
  /*
   * --------------------------------------------------------
   * RENDER
   * --------------------------------------------------------
   */

  return (
    <SafeAreaView
      style={
        styles.safeAreaContainer
      }
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
            style={
              styles.heroContainer
            }
          >

            <Image
              source={require(
                '../../assets/logo_badge.png',
              )}
              style={
                styles.heroImage
              }
              resizeMode="cover"
            />

            <View
              style={
                styles.heroOverlay
              }
            />

            {/* BACK */}

            <TouchableOpacity
              onPress={
                handleBack
              }
              style={
                styles.backButton
              }
              activeOpacity={0.8}
              hitSlop={{
                top: 10,
                bottom: 10,
                left: 10,
                right: 10,
              }}
            >

              <Text
                style={styles.back}
              >
                ‹
              </Text>

            </TouchableOpacity>

            <View
              style={
                styles.heroTextContainer
              }
            >

              <Text
                style={
                  styles.heroTitle
                }
              >
                Beauty that feels like you
              </Text>

              <Text
                style={
                  styles.heroSubtitle
                }
              >
                Discover trusted salons and beauty
                services near you.
              </Text>

            </View>

          </View>

          {/* CONTENT */}

          <View
            style={
              styles.contentCard
            }
          >

            <Text
              style={styles.title}
            >
              {mode === 'CUSTOMER'
                ? 'Find a Service'
                : mode === 'PROVIDER'
                  ? 'Provide a Service'
                  : 'Welcome back'}
            </Text>

            <Text
              style={styles.subtitle}
            >
              {mode === 'CUSTOMER'
                ? 'Enter your mobile number to get started.'
                : mode === 'PROVIDER'
                  ? 'Enter your mobile number to get started.'
                  : 'Sign in securely with your mobile number.'}
            </Text>

            {/* MOBILE */}

            <View
              style={
                styles.inputSection
              }
            >

              <Text
                style={
                  styles.inputLabel
                }
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
                  setValid={
                    setValid
                  }
                  value={
                    phoneNumber
                  }
                  setValue={
                    setPhoneNumber
                  }
                />

              </View>

            </View>

            {/* CONTINUE */}

            <DButton
              type="primary"
              style={
                styles.loginBtnStyle
              }
              disabled={
                !phoneNumber ||
                !isValid ||
                loading
              }
              onPress={
                loginWithPhone
              }
            >

              <Text
                style={
                  styles.loginText
                }
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
                style={
                  styles.securityIcon
                }
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
                style={
                  styles.securityText
                }
              >
                We'll send you an OTP to verify
                your mobile number
              </Text>

            </View>

            {/* TERMS */}

            <View
              style={
                styles.bottomContainer
              }
            >

              <Text
                style={
                  styles.bottomText
                }
              >
                By continuing, you agree to our
              </Text>

              <View
                style={
                  styles.legalRow
                }
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
                  style={
                    styles.separator
                  }
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

      {/* OTP */}

      <OTPModal
        visible={
          showOTP
        }
        phoneNumber={
          phoneNumber
        }
        onClose={() => {
          setShowOTP(false);
        }}
        onVerified={
          handleOTPVerified
        }
      />

    </SafeAreaView>
  );
}

LoginScreen.navigationOptions = {
  header: null,
};