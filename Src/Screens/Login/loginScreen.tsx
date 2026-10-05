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

import {
  useUser,
} from '../../context/UserContext';


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

  profileImageUrl?: string | null;

  salonName?: string | null;
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
   * Role is supplied only when the user explicitly selected
   * Customer or Service Partner from the Welcome screen.
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
  // USER CONTEXT
  //
  // IMPORTANT:
  //
  // Existing users must be stored here after OTP verification.
  //
  // This is what allows screens such as:
  //
  // SalonRegistrationScreen
  //
  // to access:
  //
  // currentUser.userId
  // currentUser.phoneNumber
  // currentUser.role
  // currentUser.providerStatus
  // ============================================================

  const {
    currentUser,
    setCurrentUser,
  } = useUser();


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
      '[LoginScreen] SCREEN INITIALIZED',
    );

    console.log(
      '[LoginScreen] MODE:',
      mode,
    );

    console.log(
      '[LoginScreen] SELECTED ROLE:',
      selectedRole || 'NONE',
    );

    console.log(
      '[LoginScreen] PHONE:',
      routeParams.phoneNumber || 'NONE',
    );

    console.log(
      '[LoginScreen] HIDE BACK:',
      hideBackButton,
    );

    console.log(
      '[LoginScreen] CURRENT USER:',
      JSON.stringify(
        currentUser,
        null,
        2,
      ),
    );

    console.log(
      '====================================================',
    );

  }, [
    mode,
    selectedRole,
    routeParams.phoneNumber,
    hideBackButton,
    currentUser,
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
   *
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
      '[LoginScreen] SEND OTP GRAPHQL ERROR',
    );

    console.error(
      queryError,
    );

    console.error(
      '[LoginScreen] GRAPHQL ERROR MESSAGE:',
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
            '[LoginScreen] SEND OTP START',
          );

          console.log(
            '[LoginScreen] PHONE:',
            phoneNumber,
          );

          console.log(
            '[LoginScreen] MODE:',
            mode,
          );

          console.log(
            '[LoginScreen] SELECTED ROLE:',
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
            '[LoginScreen] SEND OTP RESPONSE',
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
              '[LoginScreen] OTP SENT SUCCESSFULLY',
            );

            setShowOTP(true);

            return;
          }


          console.warn(
            '[LoginScreen] SEND OTP FAILED:',
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
            '[LoginScreen] SEND OTP EXCEPTION',
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
          '[LoginScreen] BACK PRESSED',
        );


        if (
          navigation.canGoBack()
        ) {

          navigation.goBack();

          return;
        }


        console.log(
          '[LoginScreen] NO BACK STACK',
        );

        console.log(
          '[LoginScreen] FALLBACK → authScreens',
        );


        navigation.navigate(
          'authScreens',
        );

      },
      [
        navigation,
      ],
    );

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
  // SAVE VERIFIED USER TO USER CONTEXT
  //
  // THIS IS THE IMPORTANT FIX.
  //
  // Previously LoginScreen navigated directly to BecomePartner
  // without putting the backend user into UserContext.
  //
  // Therefore SalonRegistrationScreen received:
  //
  // currentUser === null
  //
  // and displayed:
  //
  // "Your user information is unavailable."
  //
  // We now save the authenticated user BEFORE navigation.
  // ============================================================

  const saveAuthenticatedUser =
    useCallback(
      (
        user:
          ClavataUser |
          null |
          undefined,
      ): boolean => {

        console.log(
          '====================================================',
        );

        console.log(
          '[LoginScreen] SAVE AUTHENTICATED USER',
        );

        console.log(
          '[LoginScreen] USER:',
          JSON.stringify(
            user,
            null,
            2,
          ),
        );

        console.log(
          '====================================================',
        );


        // --------------------------------------------------------
        // USER REQUIRED
        // --------------------------------------------------------

        if (!user) {

          console.error(
            '[LoginScreen] Cannot save null user.',
          );

          return false;
        }


        // --------------------------------------------------------
        // USER ID REQUIRED
        // --------------------------------------------------------

        if (!user.userId) {

          console.error(
            '[LoginScreen] Cannot save user without userId.',
          );

          Alert.alert(
            'Account error',
            'Your account information is incomplete. Please sign in again.',
          );

          return false;
        }


        // --------------------------------------------------------
        // PHONE REQUIRED
        // --------------------------------------------------------

        if (!user.phoneNumber) {

          console.error(
            '[LoginScreen] Cannot save user without phoneNumber.',
          );

          Alert.alert(
            'Account error',
            'Your phone number is missing from your account. Please sign in again.',
          );

          return false;
        }


        // --------------------------------------------------------
        // FULL NAME
        // --------------------------------------------------------

        if (!user.fullName) {

          console.warn(
            '[LoginScreen] User fullName is missing.',
          );
        }


        // --------------------------------------------------------
        // ROLE REQUIRED
        // --------------------------------------------------------

        const role =
          getExistingRole(user);


        if (!role) {

          console.error(
            '[LoginScreen] Cannot save user with invalid role:',
            user.role,
          );

          Alert.alert(
            'Account error',
            'Your account type is invalid. Please contact support.',
          );

          return false;
        }


        // --------------------------------------------------------
        // PROVIDER STATUS
        // --------------------------------------------------------

        let providerStatus:
          ProviderStatus | null =
          null;


        if (
          role ===
          'PROVIDER'
        ) {

          const normalizedStatus =
            String(
              user.providerStatus ||
              'NOT_REGISTERED',
            )
              .trim()
              .toUpperCase();


          if (
            normalizedStatus ===
            'NOT_REGISTERED' ||
            normalizedStatus ===
            'PENDING' ||
            normalizedStatus ===
            'APPROVED' ||
            normalizedStatus ===
            'REJECTED'
          ) {

            providerStatus =
              normalizedStatus as ProviderStatus;

          } else {

            console.warn(
              '[LoginScreen] Unknown provider status:',
              normalizedStatus,
            );

            providerStatus =
              'NOT_REGISTERED';
          }

        } else {

          providerStatus =
            null;
        }


        // --------------------------------------------------------
        // BUILD USER FOR CONTEXT
        //
        // This shape matches the NEW UserContext.
        // --------------------------------------------------------

        const authenticatedUser =
        {
          userId:
            user.userId,

          phoneNumber:
            user.phoneNumber,

          fullName:
            user.fullName || '',

          role,

          providerStatus,

          salonId:
            user.salonId ??
            null,

          salonName:
            user.salonName ??
            null,

          profileImageUrl:
            user.profileImageUrl ??
            null,

          createdAt:
            user.createdAt,

          updatedAt:
            user.updatedAt,

          preferredPaymentMethod:
            user.preferredPaymentMethod ??
            null,
        };


        console.log(
          '====================================================',
        );

        console.log(
          '[LoginScreen] SETTING USER CONTEXT',
        );

        console.log(
          '[LoginScreen] USER ID:',
          authenticatedUser.userId,
        );

        console.log(
          '[LoginScreen] PHONE:',
          authenticatedUser.phoneNumber,
        );

        console.log(
          '[LoginScreen] ROLE:',
          authenticatedUser.role,
        );

        console.log(
          '[LoginScreen] PROVIDER STATUS:',
          authenticatedUser.providerStatus,
        );

        console.log(
          '[LoginScreen] USER CONTEXT PAYLOAD:',
          JSON.stringify(
            authenticatedUser,
            null,
            2,
          ),
        );

        console.log(
          '====================================================',
        );


        // --------------------------------------------------------
        // SAVE TO CONTEXT
        // --------------------------------------------------------

        setCurrentUser(
          authenticatedUser,
        );


        console.log(
          '[LoginScreen] USER SUCCESSFULLY SENT TO USER CONTEXT',
        );


        return true;

      },
      [
        getExistingRole,
        setCurrentUser,
      ],
    );


  // ============================================================
  // OPEN EXISTING CUSTOMER / PROVIDER ACCOUNT
  // ============================================================

  const openExistingAccount =
    useCallback(
      (
        user:
          ClavataUser,
      ) => {

        console.log(
          '====================================================',
        );

        console.log(
          '[LoginScreen] OPEN EXISTING ACCOUNT',
        );

        console.log(
          '[LoginScreen] USER ID:',
          user?.userId,
        );

        console.log(
          '[LoginScreen] PHONE:',
          user?.phoneNumber,
        );

        console.log(
          '[LoginScreen] FULL NAME:',
          user?.fullName,
        );

        console.log(
          '[LoginScreen] ROLE:',
          user?.role,
        );

        console.log(
          '[LoginScreen] PROVIDER STATUS:',
          user?.providerStatus,
        );

        console.log(
          '[LoginScreen] SALON ID:',
          user?.salonId,
        );

        console.log(
          '[LoginScreen] FULL USER:',
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
            '[LoginScreen] INVALID USER ROLE',
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
        // IMPORTANT:
        //
        // SAVE USER TO CONTEXT BEFORE NAVIGATION.
        //
        // This fixes the currentUser === null problem.
        // ========================================================

        const userSaved =
          saveAuthenticatedUser(
            user,
          );


        if (!userSaved) {

          console.error(
            '[LoginScreen] USER COULD NOT BE SAVED TO CONTEXT',
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
            '[LoginScreen] CUSTOMER ACCOUNT DETECTED',
          );

          console.log(
            '[LoginScreen] NAVIGATION → CUSTOMER APP',
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
            '[LoginScreen] NORMALIZED PROVIDER STATUS:',
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
              '[LoginScreen] PROVIDER → BECOME PARTNER',
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
              '[LoginScreen] PROVIDER → PENDING VERIFICATION',
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
              '[LoginScreen] PROVIDER → PROVIDER APP',
            );


            navigation.replace(
              'BecomePartner',
              {
                screen:
                  'SalonApp',
              },
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
              '[LoginScreen] PROVIDER → BECOME PARTNER',
            );


            navigation.replace('BecomePartner', {
              screen: 'RejectedScreen',
            });


            return;
          }


          // ======================================================
          // UNKNOWN PROVIDER STATUS
          // ======================================================

          console.error(
            '[LoginScreen] UNKNOWN PROVIDER STATUS:',
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
          '[LoginScreen] UNEXPECTED ACCOUNT ROLE:',
          existingRole,
        );


        Alert.alert(
          'Account error',
          'We could not determine your account type. Please contact support.',
        );

      },
      [
        getExistingRole,
        saveAuthenticatedUser,
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
          '[LoginScreen] OTP LOGIN RESULT',
        );

        console.log(
          '[LoginScreen] SUCCESS:',
          result?.success,
        );

        console.log(
          '[LoginScreen] MESSAGE:',
          result?.message,
        );

        console.log(
          '[LoginScreen] IS EXISTING USER:',
          result?.isExistingUser,
        );

        console.log(
          '[LoginScreen] ROLE:',
          result?.user?.role,
        );

        console.log(
          '[LoginScreen] PROVIDER STATUS:',
          result?.user?.providerStatus,
        );

        console.log(
          '[LoginScreen] USER:',
          JSON.stringify(
            result?.user,
            null,
            2,
          ),
        );

        console.log(
          '[LoginScreen] LOGIN MODE:',
          mode,
        );

        console.log(
          '[LoginScreen] SELECTED ROLE:',
          selectedRole || 'NONE',
        );

        console.log(
          '[LoginScreen] PHONE:',
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
            '[LoginScreen] OTP VERIFICATION FAILED',
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
            '[LoginScreen] EXISTING USER FOUND',
          );


          const user =
            result?.user;


          if (!user) {

            console.error(
              '[LoginScreen] EXISTING USER FLAG IS TRUE BUT USER IS NULL',
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
            '[LoginScreen] EXISTING USER ROLE:',
            existingRole,
          );


          // ======================================================
          // INVALID ROLE
          // ======================================================

          if (!existingRole) {

            console.error(
              '[LoginScreen] EXISTING USER HAS INVALID ROLE:',
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
          // Database role is the source of truth.
          //
          // selectedRole is intentionally ignored here.
          // ======================================================

          if (
            mode ===
            'SIGN_IN'
          ) {

            console.log(
              '[LoginScreen] SIGN IN → EXISTING ACCOUNT',
            );


            openExistingAccount(
              user,
            );


            return;
          }


          // ======================================================
          // CUSTOMER MODE
          //
          // User explicitly selected Customer.
          // ======================================================

          if (
            mode ===
            'CUSTOMER'
          ) {

            // ----------------------------------------------------
            // Existing Customer
            // ----------------------------------------------------

            if (
              existingRole ===
              'CUSTOMER'
            ) {

              console.log(
                '[LoginScreen] CUSTOMER MODE + EXISTING CUSTOMER',
              );


              openExistingAccount(
                user,
              );


              return;
            }


            // ----------------------------------------------------
            // Existing Provider
            //
            // One phone number = one account.
            // ----------------------------------------------------

            console.log(
              '[LoginScreen] CUSTOMER MODE + EXISTING PROVIDER',
            );


            Alert.alert(
              'Number already registered',
              'This mobile number is already registered as a Service Partner. One mobile number can only have one Clavata account.',
              [
                {
                  text: 'Sign in',

                  onPress: () => {

                    console.log(
                      '[LoginScreen] USER CHOSE SIGN IN',
                    );


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

                  style:
                    'cancel',
                },
              ],
            );


            return;
          }


          // ======================================================
          // PROVIDER MODE
          //
          // User explicitly selected Service Partner.
          // ======================================================

          if (
            mode ===
            'PROVIDER'
          ) {

            // ----------------------------------------------------
            // Existing Provider
            // ----------------------------------------------------

            if (
              existingRole ===
              'PROVIDER'
            ) {

              console.log(
                '[LoginScreen] PROVIDER MODE + EXISTING PROVIDER',
              );


              openExistingAccount(
                user,
              );


              return;
            }


            // ----------------------------------------------------
            // Existing Customer
            //
            // One phone number = one account.
            // ----------------------------------------------------

            console.log(
              '[LoginScreen] PROVIDER MODE + EXISTING CUSTOMER',
            );


            Alert.alert(
              'Number already registered',
              'This mobile number is already registered as a Customer. One mobile number can only have one Clavata account.',
              [
                {
                  text: 'Sign in',

                  onPress: () => {

                    console.log(
                      '[LoginScreen] USER CHOSE SIGN IN',
                    );


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

                  style:
                    'cancel',
                },
              ],
            );


            return;
          }


          // ======================================================
          // SAFETY FALLBACK
          // ======================================================

          console.error(
            '[LoginScreen] UNKNOWN LOGIN MODE:',
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
            '[LoginScreen] NO EXISTING USER FOUND',
          );


          // ======================================================
          // SIGN IN + NEW NUMBER
          //
          // Important:
          //
          // We cannot assume CUSTOMER or PROVIDER.
          //
          // The user must return to the Welcome role selection.
          // ======================================================

          if (
            mode ===
            'SIGN_IN'
          ) {

            console.log(
              '[LoginScreen] SIGN IN → NUMBER NOT FOUND',
            );

            console.log(
              '[LoginScreen] SIGN IN → RETURN TO WELCOME ROLE SELECTION',
            );


            /**
             * IMPORTANT:
             *
             * The exact nested navigation depends on the structure
             * of authScreens.
             *
             * If WelcomeChoiceScreen is directly inside the
             * authScreens navigator, use this nested navigation.
             *
             * Passing phoneNumber allows WelcomeChoiceScreen to
             * preserve the verified number.
             */
            navigation.replace(
              'authScreens',
              {
                screen:
                  'WelcomeChoiceScreen',

                params: {
                  phoneNumber,
                },
              },
            );


            return;
          }


          // ======================================================
          // CUSTOMER REGISTRATION
          // ======================================================

          if (
            mode ===
            'CUSTOMER'
          ) {

            console.log(
              '[LoginScreen] NEW NUMBER → CUSTOMER REGISTRATION',
            );

            console.log(
              '[LoginScreen] REGISTER ROLE:',
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
          // ======================================================

          if (
            mode ===
            'PROVIDER'
          ) {

            console.log(
              '[LoginScreen] NEW NUMBER → PROVIDER REGISTRATION',
            );

            console.log(
              '[LoginScreen] REGISTER ROLE:',
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
            '[LoginScreen] UNKNOWN NEW USER MODE:',
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
          '[LoginScreen] UNKNOWN OTP ACCOUNT STATE:',
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
                require(
                  '../../assets/logo-blue.png',
                )
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