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
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Alert,
  Image,
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
  COLORS,
} from '../../constants/constants';


// ============================================================
// TYPES
// ============================================================

type UserRole =
  | 'CUSTOMER'
  | 'PROVIDER';

type LoginMode =
  | 'CUSTOMER'
  | 'PROVIDER'
  | 'SIGN_IN';

type ProviderStatus =
  | 'NOT_REGISTERED'
  | 'PENDING'
  | 'APPROVED'
  | 'REJECTED';

interface ClavataUser {
  userId?: string;

  phoneNumber?: string;

  fullName?: string;

  role?: UserRole;

  providerStatus?: ProviderStatus | null;

  salonId?: string | null;

  createdAt?: string;

  updatedAt?: string;

  preferredPaymentMethod?: string | null;
}

interface OTPVerificationResult {
  success?: boolean;

  message?: string;

  isExistingUser?: boolean;

  user?: ClavataUser | null;
}


// ============================================================
// ROUTE PARAMS
// ============================================================

interface LoginRouteParams {
  mode?: LoginMode;

  /**
   * Role is only supplied when the user explicitly selected
   * Customer or Service Partner from WelcomeChoiceScreen.
   *
   * SIGN_IN intentionally does not supply a role.
   */
  role?: UserRole;

  phoneNumber?: string;

  hideBackButton?: boolean;
}


// ============================================================
// COMPONENT
// ============================================================

export default function LoginScreen() {

  const navigation =
    useNavigation<any>();

  const route =
    useRoute<any>();


  // ============================================================
  // ROUTE PARAMS
  // ============================================================

  const routeParams =
    (route.params || {}) as LoginRouteParams;

  const mode: LoginMode =
    routeParams.mode ||
    'SIGN_IN';

  const selectedRole =
    routeParams.role;

  const hideBackButton =
    routeParams.hideBackButton === true;


  // ============================================================
  // STATE
  // ============================================================

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
    routeParams.phoneNumber || '',
  );

  const [
    loading,
    setLoading,
  ] = useState(false);


  // ============================================================
  // GRAPHQL
  // ============================================================

  const [
    sendOTP,
    {
      error: queryError,
    },
  ] = useMutation(
    SEND_OTP,
  );


  // ============================================================
  // LOG INITIAL SCREEN STATE
  // ============================================================

  useEffect(() => {

    console.log(
      '====================================================',
    );

    console.log(
      'LOGIN SCREEN',
    );

    console.log(
      'MODE:',
      mode,
    );

    console.log(
      'SELECTED ROLE:',
      selectedRole || 'NONE',
    );

    console.log(
      'PHONE:',
      routeParams.phoneNumber || 'NONE',
    );

    console.log(
      'HIDE BACK:',
      hideBackButton,
    );

    console.log(
      '====================================================',
    );

  }, [
    mode,
    selectedRole,
    routeParams.phoneNumber,
    hideBackButton,
  ]);


  // ============================================================
  // BUTTON STATE
  // ============================================================

  const isButtonEnabled =
    Boolean(
      phoneNumber?.trim(),
    ) &&
    isValid &&
    !loading;


  /**
   * Keep the existing visual behavior:
   * enabled  -> theme color
   * disabled -> black
   */
  const buttonBackgroundColor =
    isButtonEnabled
      ? COLORS.themeColor
      : COLORS.black;


  // ============================================================
  // SEND OTP ERROR
  // ============================================================

  useEffect(() => {

    if (!queryError) {
      return;
    }

    console.error(
      '====================================================',
    );

    console.error(
      'SEND OTP GRAPHQL ERROR',
    );

    console.error(
      queryError,
    );

    console.error(
      'GRAPHQL ERROR MESSAGE:',
      queryError?.message,
    );

    console.error(
      '====================================================',
    );

    setLoading(false);

    Alert.alert(
      'Unable to continue',
      'We could not send the verification code. Please try again.',
    );

  }, [
    queryError,
  ]);


  // ============================================================
  // SEND OTP
  // ============================================================

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
            '====================================================',
          );

          console.log(
            'SEND OTP START',
          );

          console.log(
            'PHONE:',
            phoneNumber,
          );

          console.log(
            'MODE:',
            mode,
          );

          console.log(
            'SELECTED ROLE:',
            selectedRole || 'NONE',
          );

          console.log(
            '====================================================',
          );


          const {
            data,
          } = await sendOTP({
            variables: {
              phoneNumber,
            },
          });


          console.log(
            '====================================================',
          );

          console.log(
            'SEND OTP RESPONSE',
          );

          console.log(
            JSON.stringify(
              data,
              null,
              2,
            ),
          );

          console.log(
            '====================================================',
          );


          if (
            data?.sendOTP?.success
          ) {

            console.log(
              'OTP SENT SUCCESSFULLY',
            );

            setShowOTP(true);

            return;
          }


          console.warn(
            'SEND OTP FAILED:',
            data?.sendOTP?.message,
          );

          Alert.alert(
            'Unable to continue',
            data?.sendOTP?.message ||
              'We could not send the verification code.',
          );

        } catch (error) {

          console.error(
            '====================================================',
          );

          console.error(
            'SEND OTP EXCEPTION',
          );

          console.error(
            error,
          );

          console.error(
            '====================================================',
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
        selectedRole,
      ],
    );


  // ============================================================
  // BACK
  // ============================================================

  const handleBack =
    useCallback(
      () => {

        console.log(
          'LOGIN BACK PRESSED',
        );

        if (
          navigation.canGoBack()
        ) {

          navigation.goBack();

          return;
        }


        /**
         * Fallback.
         *
         * This should normally not be reached because LoginScreen
         * is opened from WelcomeChoiceScreen.
         */
        navigation.navigate(
          'authScreens',
        );

      },
      [
        navigation,
      ],
    );


  // ============================================================
  // GET EXISTING USER ROLE
  //
  // IMPORTANT:
  //
  // There is ONLY one canonical role:
  //
  // user.role
  //
  // Never use:
  // user.activeRole
  // user.roles
  // user.roles.customer
  // user.roles.businessPartner
  // ============================================================

  const getExistingRole =
    useCallback(
      (
        user:
          ClavataUser |
          null |
          undefined,
      ): UserRole | null => {

        if (
          user?.role ===
          'CUSTOMER'
        ) {
          return 'CUSTOMER';
        }

        if (
          user?.role ===
          'PROVIDER'
        ) {
          return 'PROVIDER';
        }

        return null;
      },
      [],
    );


  // ============================================================
  // OPEN EXISTING CUSTOMER / PROVIDER ACCOUNT
  // ============================================================

  const openExistingAccount =
    useCallback(
      (
        user: ClavataUser,
      ) => {

        console.log(
          '====================================================',
        );

        console.log(
          'OPEN EXISTING ACCOUNT',
        );

        console.log(
          'USER ID:',
          user?.userId,
        );

        console.log(
          'PHONE:',
          user?.phoneNumber,
        );

        console.log(
          'FULL NAME:',
          user?.fullName,
        );

        console.log(
          'ROLE:',
          user?.role,
        );

        console.log(
          'PROVIDER STATUS:',
          user?.providerStatus,
        );

        console.log(
          'SALON ID:',
          user?.salonId,
        );

        console.log(
          'FULL USER:',
          JSON.stringify(
            user,
            null,
            2,
          ),
        );

        console.log(
          '====================================================',
        );


        // ========================================================
        // VALIDATE ROLE
        // ========================================================

        const existingRole =
          getExistingRole(user);


        if (!existingRole) {

          console.error(
            'INVALID USER ROLE',
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

          return;
        }


        // ========================================================
        // CUSTOMER
        // ========================================================

        if (
          existingRole ===
          'CUSTOMER'
        ) {

          console.log(
            'CUSTOMER ACCOUNT DETECTED',
          );

          console.log(
            'NAVIGATION → CUSTOMER APP',
          );


          navigation.replace(
            'appScreens',
            {
              screen:
                'HomeScreen',
            },
          );

          return;
        }


        // ========================================================
        // PROVIDER
        // ========================================================

        if (
          existingRole ===
          'PROVIDER'
        ) {

          const providerStatus =
            String(
              user?.providerStatus ||
                'NOT_REGISTERED',
            )
              .trim()
              .toUpperCase() as ProviderStatus;


          console.log(
            'NORMALIZED PROVIDER STATUS:',
            providerStatus,
          );


          // ======================================================
          // PROVIDER - NOT REGISTERED
          // ======================================================

          if (
            providerStatus ===
            'NOT_REGISTERED'
          ) {

            console.log(
              'PROVIDER → BECOME PARTNER',
            );

            navigation.navigate(
              'BecomePartner',
            );

            return;
          }


          // ======================================================
          // PROVIDER - PENDING
          // ======================================================

          if (
            providerStatus ===
            'PENDING'
          ) {

            console.log(
              'PROVIDER → PENDING VERIFICATION',
            );

            navigation.replace(
              'BecomePartner',
              {
                screen:
                  'SalonPendingVerification',
              },
            );

            return;
          }


          // ======================================================
          // PROVIDER - APPROVED
          // ======================================================

          if (
            providerStatus ===
            'APPROVED'
          ) {

            console.log(
              'PROVIDER → PROVIDER APP',
            );

            navigation.replace(
              'appScreens',
            );

            return;
          }


          // ======================================================
          // PROVIDER - REJECTED
          // ======================================================

          if (
            providerStatus ===
            'REJECTED'
          ) {

            console.log(
              'PROVIDER → BECOME PARTNER',
            );

            navigation.navigate(
              'BecomePartner',
            );

            return;
          }


          // ======================================================
          // UNKNOWN PROVIDER STATUS
          // ======================================================

          console.error(
            'UNKNOWN PROVIDER STATUS:',
            providerStatus,
          );

          Alert.alert(
            'Account status unavailable',
            'We could not determine your provider account status. Please contact support.',
          );

          return;
        }


        // ========================================================
        // SAFETY FALLBACK
        // ========================================================

        console.error(
          'UNEXPECTED ACCOUNT ROLE:',
          existingRole,
        );

        Alert.alert(
          'Account error',
          'We could not determine your account type. Please contact support.',
        );

      },
      [
        getExistingRole,
        navigation,
      ],
    );


  // ============================================================
  // OTP VERIFIED
  // ============================================================

  const handleOTPVerified =
    useCallback(
      (
        result:
          OTPVerificationResult,
      ) => {

        console.log(
          '====================================================',
        );

        console.log(
          'OTP LOGIN RESULT',
        );

        console.log(
          'SUCCESS:',
          result?.success,
        );

        console.log(
          'MESSAGE:',
          result?.message,
        );

        console.log(
          'IS EXISTING USER:',
          result?.isExistingUser,
        );

        console.log(
          'ROLE:',
          result?.user?.role,
        );

        console.log(
          'PROVIDER STATUS:',
          result?.user?.providerStatus,
        );

        console.log(
          'USER:',
          JSON.stringify(
            result?.user,
            null,
            2,
          ),
        );

        console.log(
          'LOGIN MODE:',
          mode,
        );

        console.log(
          'SELECTED ROLE:',
          selectedRole || 'NONE',
        );

        console.log(
          'PHONE:',
          phoneNumber,
        );

        console.log(
          '====================================================',
        );


        // ========================================================
        // CLOSE OTP MODAL
        // ========================================================

        setShowOTP(false);


        // ========================================================
        // OTP VERIFICATION FAILED
        // ========================================================

        if (
          result?.success !== true
        ) {

          console.error(
            'OTP VERIFICATION FAILED',
          );

          Alert.alert(
            'Verification failed',
            result?.message ||
              'OTP verification failed. Please try again.',
          );

          return;
        }


        // ========================================================
        // EXISTING USER
        // ========================================================

        if (
          result?.isExistingUser ===
            true
        ) {

          console.log(
            'EXISTING USER FOUND',
          );


          const user =
            result?.user;


          if (!user) {

            console.error(
              'EXISTING USER FLAG IS TRUE BUT USER IS NULL',
            );

            Alert.alert(
              'Account error',
              'We found your account, but could not load your account details. Please try again.',
            );

            return;
          }


          const existingRole =
            getExistingRole(user);


          console.log(
            'EXISTING USER ROLE:',
            existingRole,
          );


          // ======================================================
          // INVALID ROLE
          // ======================================================

          if (!existingRole) {

            console.error(
              'EXISTING USER HAS INVALID ROLE:',
              JSON.stringify(
                user,
                null,
                2,
              ),
            );

            Alert.alert(
              'Account error',
              'Your account does not have a valid account type. Please contact support.',
            );

            return;
          }


          // ======================================================
          // SIGN IN
          //
          // For Sign In, the database role is ALWAYS the source
          // of truth.
          //
          // Do NOT use selectedRole.
          // ======================================================

          if (
            mode ===
            'SIGN_IN'
          ) {

            console.log(
              'SIGN IN → EXISTING ACCOUNT',
            );

            openExistingAccount(
              user,
            );

            return;
          }


          // ======================================================
          // CUSTOMER MODE
          //
          // User explicitly selected Customer on Welcome screen.
          //
          // Existing Customer:
          //     → Open Customer account
          //
          // Existing Provider:
          //     → Do not allow a second account.
          // ======================================================

          if (
            mode ===
            'CUSTOMER'
          ) {

            if (
              existingRole ===
              'CUSTOMER'
            ) {

              console.log(
                'CUSTOMER MODE + EXISTING CUSTOMER',
              );

              openExistingAccount(
                user,
              );

              return;
            }


            console.log(
              'CUSTOMER MODE + EXISTING PROVIDER',
            );


            Alert.alert(
              'Number already registered',
              'This mobile number is already registered as a Service Partner. One mobile number can only have one Clavata account.',
              [
                {
                  text: 'Sign in',
                  onPress: () => {

                    navigation.replace(
                      'LoginScreen',
                      {
                        mode:
                          'SIGN_IN',
                        phoneNumber,
                      },
                    );

                  },
                },

                {
                  text: 'Cancel',
                  style: 'cancel',
                },
              ],
            );

            return;
          }


          // ======================================================
          // PROVIDER MODE
          //
          // User explicitly selected Service Partner.
          //
          // Existing Provider:
          //     → Open Provider account
          //
          // Existing Customer:
          //     → Do not allow a second account.
          // ======================================================

          if (
            mode ===
            'PROVIDER'
          ) {

            if (
              existingRole ===
              'PROVIDER'
            ) {

              console.log(
                'PROVIDER MODE + EXISTING PROVIDER',
              );

              openExistingAccount(
                user,
              );

              return;
            }


            console.log(
              'PROVIDER MODE + EXISTING CUSTOMER',
            );


            Alert.alert(
              'Number already registered',
              'This mobile number is already registered as a Customer. One mobile number can only have one Clavata account.',
              [
                {
                  text: 'Sign in',
                  onPress: () => {

                    navigation.replace(
                      'LoginScreen',
                      {
                        mode:
                          'SIGN_IN',
                        phoneNumber,
                      },
                    );

                  },
                },

                {
                  text: 'Cancel',
                  style: 'cancel',
                },
              ],
            );

            return;
          }


          // ======================================================
          // SAFETY FALLBACK
          // ======================================================

          console.error(
            'UNKNOWN LOGIN MODE:',
            mode,
          );

          Alert.alert(
            'Unable to continue',
            'We could not determine how to open your account. Please try again.',
          );

          return;
        }


        // ========================================================
        // NEW USER
        // ========================================================

        if (
          result?.isExistingUser ===
          false
        ) {

          console.log(
            'NO EXISTING USER FOUND',
          );


          // ======================================================
          // SIGN IN + NEW NUMBER
          //
          // THIS IS THE IMPORTANT FLOW.
          //
          // A user clicked:
          //
          // Welcome
          //    ↓
          // Sign in
          //    ↓
          // New phone number
          //    ↓
          // OTP verified
          //
          // We DO NOT assume Customer.
          // We DO NOT assume Provider.
          // We DO NOT open BecomePartner.
          //
          // Instead, return to WelcomeChoiceScreen so the user
          // chooses their account type.
          // ======================================================

          if (
            mode ===
            'SIGN_IN'
          ) {

            console.log(
              'SIGN IN → NUMBER NOT FOUND',
            );

            console.log(
              'SIGN IN → RETURN TO WELCOME ROLE SELECTION',
            );


            navigation.replace(
              'authScreens',
            );

            return;
          }


          // ======================================================
          // CUSTOMER REGISTRATION
          //
          // New number + Customer selection.
          // ======================================================

          if (
            mode ===
            'CUSTOMER'
          ) {

            console.log(
              'NEW NUMBER → CUSTOMER REGISTRATION',
            );

            console.log(
              'REGISTER ROLE:',
              'CUSTOMER',
            );


            navigation.replace(
              'RegisterUser',
              {
                phoneNumber,
                role:
                  'CUSTOMER',
              },
            );

            return;
          }


          // ======================================================
          // PROVIDER REGISTRATION
          //
          // New number + Service Partner selection.
          // ======================================================

          if (
            mode ===
            'PROVIDER'
          ) {

            console.log(
              'NEW NUMBER → PROVIDER REGISTRATION',
            );

            console.log(
              'REGISTER ROLE:',
              'PROVIDER',
            );


            navigation.replace(
              'RegisterUser',
              {
                phoneNumber,
                role:
                  'PROVIDER',
              },
            );

            return;
          }


          // ======================================================
          // UNKNOWN REGISTRATION MODE
          // ======================================================

          console.error(
            'UNKNOWN NEW USER MODE:',
            mode,
          );

          Alert.alert(
            'Unable to continue',
            'We could not determine your account type. Please return to the welcome screen and try again.',
          );

          return;
        }


        // ========================================================
        // UNKNOWN ACCOUNT STATE
        // ========================================================

        console.error(
          'UNKNOWN OTP ACCOUNT STATE:',
          JSON.stringify(
            result,
            null,
            2,
          ),
        );

        Alert.alert(
          'Unable to continue',
          'We could not determine your account status. Please try again.',
        );

      },
      [
        mode,
        selectedRole,
        phoneNumber,
        navigation,
        getExistingRole,
        openExistingAccount,
      ],
    );


  // ============================================================
  // UI
  // ============================================================

  return (
    <SafeAreaView
      style={
        styles.safeArea
      }
    >

      <KeyboardAvoidingView
        style={
          styles.flex
        }
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

          {/* ==================================================
              HEADER
          ================================================== */}

          <View
            style={
              styles.header
            }
          >

            {!hideBackButton && (

              <TouchableOpacity
                onPress={
                  handleBack
                }
                style={
                  styles.backButton
                }
                activeOpacity={
                  0.7
                }
                hitSlop={{
                  top: 10,
                  bottom: 10,
                  left: 10,
                  right: 10,
                }}
              >

                <Text
                  style={
                    styles.back
                  }
                >
                  ‹
                </Text>

              </TouchableOpacity>

            )}


            <Image
              source={
                require('../../assets/logo-blue.png')
              }
              style={
                styles.heroLogo
              }
              resizeMode="contain"
            />

          </View>


          {/* ==================================================
              PHONE INPUT
          ================================================== */}

          <View
            style={
              styles.content
            }
          >

            <View
              style={
                styles.inputSection
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


            {/* ==================================================
                CONTINUE BUTTON
            ================================================== */}

            <View
              style={
                styles.buttonContainer
              }
            >

              <DButton
                type="primary"
                style={[
                  styles.loginBtnStyle,
                  {
                    backgroundColor:
                      buttonBackgroundColor,
                  },
                ]}
                disabled={
                  !isButtonEnabled
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

            </View>

          </View>


          {/* ==================================================
              FOOTER
          ================================================== */}

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
              Clavata Connects Private Limited
            </Text>

            <Text
              style={
                styles.yearText
              }
            >
              2026
            </Text>

          </View>

        </ScrollView>

      </KeyboardAvoidingView>


      {/* ======================================================
          OTP MODAL
      ====================================================== */}

      <OTPModal
        visible={
          showOTP
        }
        phoneNumber={
          phoneNumber
        }
        onClose={() =>
          setShowOTP(false)
        }
        onVerified={
          handleOTPVerified
        }
      />

    </SafeAreaView>
  );
}


// ============================================================
// NAVIGATION OPTIONS
// ============================================================

LoginScreen.navigationOptions = {
  header: null,
};