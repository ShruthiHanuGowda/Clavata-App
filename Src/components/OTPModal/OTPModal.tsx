import React, {
  useEffect,
  useRef,
  useState,
} from 'react';

import {
  Modal,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  Pressable,
} from 'react-native';

import BlurView from '../BlurView';

import {
  useMutation,
} from '@apollo/client';

import {
  VERIFY_OTP,
  RESEND_OTP,
} from '../../graphql/queries';

import {
  DButton,
} from '../index';

import styles from './styles';

import {
  COLORS,
} from '../../constants/constants';


// ============================================================
// TYPES
// ============================================================

export type UserRole =
  | 'CUSTOMER'
  | 'PROVIDER';


export type ProviderStatus =
  | 'NOT_REGISTERED'
  | 'PENDING'
  | 'APPROVED'
  | 'REJECTED';


export type ClavataUser = {
  userId: string;

  phoneNumber: string;

  fullName: string;

  role: UserRole;

  providerStatus?: ProviderStatus | null;

  salonId?: string | null;

  createdAt?: string;

  updatedAt?: string;

  preferredPaymentMethod?: string | null;
};


// ============================================================
// OTP RESULT
// ============================================================

export type OTPResult = {
  success: boolean;

  message?: string;

  isExistingUser: boolean;

  user?: ClavataUser | null;
};


// ============================================================
// PROPS
// ============================================================

type OTPModalProps = {
  visible: boolean;

  phoneNumber: string;

  onClose: () => void;

  onVerified: (
    result: OTPResult,
  ) => void;
};


// ============================================================
// COMPONENT
// ============================================================

export default function OTPModal({
  visible,
  phoneNumber,
  onClose,
  onVerified,
}: OTPModalProps) {

  // ==========================================================
  // STATE
  // ==========================================================

  const [
    otp,
    setOtp,
  ] = useState('');

  const [
    error,
    setError,
  ] = useState('');

  const [
    resending,
    setResending,
  ] = useState(false);


  // ==========================================================
  // REFS
  // ==========================================================

  const inputRef =
    useRef<TextInput>(null);


  // ==========================================================
  // VERIFY OTP MUTATION
  // ==========================================================

  const [
    verifyOTP,
    {
      loading: verifying,
    },
  ] = useMutation(
    VERIFY_OTP,
  );


  // ==========================================================
  // RESEND OTP MUTATION
  // ==========================================================

  const [
    resendOTP,
    {
      loading: resendMutationLoading,
    },
  ] = useMutation(
    RESEND_OTP,
  );


  // ==========================================================
  // COMBINED RESEND STATE
  // ==========================================================

  const isResending =
    resending ||
    resendMutationLoading;


  // ==========================================================
  // MODAL OPEN
  // ==========================================================

  useEffect(() => {

    if (!visible) {
      return;
    }


    console.log(
      '====================================================',
    );

    console.log(
      'OTP MODAL OPEN',
    );

    console.log(
      'PHONE:',
      phoneNumber,
    );

    console.log(
      '====================================================',
    );


    setOtp('');

    setError('');


    const timer =
      setTimeout(() => {

        inputRef.current?.focus();

      }, 400);


    return () => {

      clearTimeout(timer);

    };

  }, [
    visible,
    phoneNumber,
  ]);


  // ==========================================================
  // OTP CHANGE
  // ==========================================================

  const handleOtpChange = (
    value: string,
  ) => {

    const numericValue =
      value
        .replace(
          /[^0-9]/g,
          '',
        )
        .slice(
          0,
          6,
        );


    setOtp(
      numericValue,
    );


    if (error) {

      setError('');

    }

  };


  // ==========================================================
  // BUTTON STATE
  // ==========================================================

  const isVerifyEnabled =
    otp.length === 6 &&
    !verifying &&
    !isResending;


  const verifyButtonBackgroundColor =
    isVerifyEnabled
      ? COLORS.themeColor
      : COLORS.black;


  // ==========================================================
  // VERIFY OTP
  // ==========================================================

  const handleVerify =
    async () => {

      // --------------------------------------------------------
      // VALIDATION
      // --------------------------------------------------------

      if (
        otp.length !== 6
      ) {

        setError(
          'Enter the 6-digit code.',
        );

        return;
      }


      if (
        verifying ||
        isResending
      ) {

        return;
      }


      if (
        !phoneNumber?.trim()
      ) {

        setError(
          'Phone number is missing.',
        );

        return;
      }


      try {

        setError('');


        // ------------------------------------------------------
        // LOG
        // ------------------------------------------------------

        console.log(
          '====================================================',
        );

        console.log(
          'VERIFY OTP START',
        );

        console.log(
          'PHONE:',
          phoneNumber,
        );

        console.log(
          'OTP:',
          otp,
        );

        console.log(
          '====================================================',
        );


        // ------------------------------------------------------
        // GRAPHQL
        // ------------------------------------------------------

        const {
          data,
        } =
          await verifyOTP({
            variables: {
              phoneNumber,
              otp,
            },
          });


        // ------------------------------------------------------
        // RESULT
        // ------------------------------------------------------

        const result =
          data?.verifyOTP;


        console.log(
          '====================================================',
        );

        console.log(
          'VERIFY OTP RESULT',
        );

        console.log(
          JSON.stringify(
            result,
            null,
            2,
          ),
        );

        console.log(
          '====================================================',
        );


        // ------------------------------------------------------
        // NO RESULT
        // ------------------------------------------------------

        if (!result) {

          console.error(
            'VERIFY OTP RETURNED NO RESULT',
          );

          setError(
            'Unable to verify the code. Please try again.',
          );

          return;
        }


        // ------------------------------------------------------
        // VERIFICATION FAILED
        // ------------------------------------------------------

        if (
          result.success !== true
        ) {

          console.warn(
            'OTP VERIFICATION FAILED:',
            result.message,
          );


          setError(
            result.message ||
            'Invalid code. Please try again.',
          );


          setOtp('');


          setTimeout(() => {

            inputRef.current?.focus();

          }, 100);


          return;
        }


        // ------------------------------------------------------
        // VALIDATE EXISTING USER FLAG
        // ------------------------------------------------------

        const isExistingUser =
          result.isExistingUser === true;


        // ------------------------------------------------------
        // EXISTING USER
        // ------------------------------------------------------

        if (isExistingUser) {

          const user =
            result.user;


          console.log(
            '====================================================',
          );

          console.log(
            'EXISTING USER FOUND',
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
            '====================================================',
          );


          // ----------------------------------------------------
          // Existing user MUST have a user object.
          // ----------------------------------------------------

          if (!user) {

            console.error(
              'EXISTING USER = TRUE BUT USER = NULL',
            );


            setError(
              'We found your account, but could not load your account details. Please try again.',
            );

            return;
          }


          // ----------------------------------------------------
          // Validate canonical role.
          //
          // ONLY:
          // user.role
          //
          // No activeRole.
          // No roles object.
          // ----------------------------------------------------

          if (
            user.role !==
              'CUSTOMER' &&
            user.role !==
              'PROVIDER'
          ) {

            console.error(
              'INVALID USER ROLE:',
              user.role,
            );


            setError(
              'Unable to determine your account type. Please contact support.',
            );

            return;
          }


          // ----------------------------------------------------
          // Provider status validation.
          //
          // Customer:
          //     providerStatus may be null.
          //
          // Provider:
          //     providerStatus should be one of the four
          //     backend-supported values.
          // ----------------------------------------------------

          if (
            user.role ===
            'PROVIDER'
          ) {

            const validProviderStatuses = [
              'NOT_REGISTERED',
              'PENDING',
              'APPROVED',
              'REJECTED',
            ];


            if (
              user.providerStatus &&
              !validProviderStatuses.includes(
                user.providerStatus,
              )
            ) {

              console.error(
                'INVALID PROVIDER STATUS:',
                user.providerStatus,
              );


              setError(
                'Your provider account has an invalid status. Please contact support.',
              );

              return;
            }

          }

        }


        // ------------------------------------------------------
        // NEW USER
        // ------------------------------------------------------

        if (!isExistingUser) {

          console.log(
            '====================================================',
          );

          console.log(
            'NEW USER - PHONE NUMBER NOT FOUND',
          );

          console.log(
            'The LoginScreen will decide whether to:',
          );

          console.log(
            '1. Return to WelcomeChoiceScreen for SIGN_IN',
          );

          console.log(
            '2. Register as CUSTOMER',
          );

          console.log(
            '3. Register as PROVIDER',
          );

          console.log(
            '====================================================',
          );

        }


        // ------------------------------------------------------
        // PASS RESULT TO LOGIN SCREEN
        //
        // OTPModal DOES NOT decide the role.
        //
        // LoginScreen is responsible for the next step.
        // ------------------------------------------------------

        const normalizedResult: OTPResult = {
          success: true,

          message:
            result.message ||
            'OTP verified.',

          isExistingUser,

          user:
            isExistingUser
              ? result.user
              : null,
        };


        console.log(
          'PASSING OTP RESULT TO LOGIN SCREEN:',
          JSON.stringify(
            normalizedResult,
            null,
            2,
          ),
        );


        onVerified(
          normalizedResult,
        );

      } catch (err) {

        // ------------------------------------------------------
        // ERROR
        // ------------------------------------------------------

        console.error(
          '====================================================',
        );

        console.error(
          'OTP VERIFICATION ERROR',
        );

        console.error(
          err,
        );

        console.error(
          '====================================================',
        );


        setError(
          'Unable to verify the code. Please try again.',
        );

      }

    };


  // ==========================================================
  // RESEND OTP
  // ==========================================================

  const handleResend =
    async () => {

      // --------------------------------------------------------
      // GUARDS
      // --------------------------------------------------------

      if (
        isResending ||
        verifying
      ) {

        return;
      }


      if (
        !phoneNumber?.trim()
      ) {

        setError(
          'Phone number is missing.',
        );

        return;
      }


      try {

        setResending(true);

        setError('');

        setOtp('');


        // ------------------------------------------------------
        // LOG
        // ------------------------------------------------------

        console.log(
          '====================================================',
        );

        console.log(
          'RESEND OTP START',
        );

        console.log(
          'PHONE:',
          phoneNumber,
        );

        console.log(
          '====================================================',
        );


        // ------------------------------------------------------
        // GRAPHQL
        // ------------------------------------------------------

        const {
          data,
        } =
          await resendOTP({
            variables: {
              phoneNumber,
            },
          });


        // ------------------------------------------------------
        // RESULT
        // ------------------------------------------------------

        const result =
          data?.resendOTP;


        console.log(
          '====================================================',
        );

        console.log(
          'RESEND OTP RESULT',
        );

        console.log(
          JSON.stringify(
            result,
            null,
            2,
          ),
        );

        console.log(
          '====================================================',
        );


        // ------------------------------------------------------
        // NO RESULT
        // ------------------------------------------------------

        if (!result) {

          setError(
            'Unable to resend the code. Please try again.',
          );

          return;
        }


        // ------------------------------------------------------
        // FAILED
        // ------------------------------------------------------

        if (
          result.success !== true
        ) {

          setError(
            result.message ||
            'Unable to resend the code.',
          );

          return;
        }


        // ------------------------------------------------------
        // SUCCESS
        // ------------------------------------------------------

        console.log(
          'OTP RESENT SUCCESSFULLY',
        );


        setOtp('');

        setError('');


        setTimeout(() => {

          inputRef.current?.focus();

        }, 100);

      } catch (err) {

        // ------------------------------------------------------
        // ERROR
        // ------------------------------------------------------

        console.error(
          '====================================================',
        );

        console.error(
          'RESEND OTP ERROR',
        );

        console.error(
          err,
        );

        console.error(
          '====================================================',
        );


        setError(
          'Unable to resend the code. Please try again.',
        );

      } finally {

        setResending(false);

      }

    };


  // ==========================================================
  // CLOSE MODAL
  // ==========================================================

  const handleClose =
    () => {

      if (
        verifying ||
        isResending
      ) {

        return;
      }


      console.log(
        'OTP MODAL CLOSED',
      );


      setOtp('');

      setError('');

      onClose();

    };


  // ==========================================================
  // HIDDEN
  // ==========================================================

  if (!visible) {

    return null;

  }


  // ==========================================================
  // UI
  // ==========================================================

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      statusBarTranslucent
      onRequestClose={
        handleClose
      }
    >

      {/* ======================================================
          BACKGROUND BLUR
      ====================================================== */}

      <BlurView
        style={
          styles.blur
        }
        blurType="light"
        blurAmount={16}
        reducedTransparencyFallbackColor="rgba(255,255,255,0.94)"
      />


      <View
        style={
          styles.overlay
        }
      >

        {/* ====================================================
            OUTSIDE PRESS
        ==================================================== */}

        <Pressable
          style={
            styles.outside
          }
          onPress={
            handleClose
          }
          disabled={
            verifying ||
            isResending
          }
        />


        {/* ====================================================
            KEYBOARD
        ==================================================== */}

        <KeyboardAvoidingView
          style={
            styles.keyboard
          }
          behavior={
            Platform.OS === 'ios'
              ? 'padding'
              : undefined
          }
        >

          {/* ==================================================
              CARD
          ================================================== */}

          <View
            style={
              styles.card
            }
          >

            {/* ==================================================
                CLOSE
            ================================================== */}

            <TouchableOpacity
              style={
                styles.closeButton
              }
              onPress={
                handleClose
              }
              activeOpacity={0.7}
              disabled={
                verifying ||
                isResending
              }
            >

              <Text
                style={
                  styles.closeText
                }
              >
                ×
              </Text>

            </TouchableOpacity>


            {/* ==================================================
                TITLE
            ================================================== */}

            <Text
              style={
                styles.title
              }
            >
              Verify number
            </Text>


            {/* ==================================================
                SUBTITLE
            ================================================== */}

            <Text
              style={
                styles.subtitle
              }
            >
              Enter the code sent to
            </Text>


            {/* ==================================================
                PHONE
            ================================================== */}

            <Text
              style={
                styles.phone
              }
            >
              {phoneNumber}
            </Text>


            {/* ==================================================
                OTP INPUT
            ================================================== */}

            <View
              style={
                styles.otpWrapper
              }
            >

              <View
                style={
                  styles.otpBoxes
                }
              >

                {Array
                  .from({
                    length: 6,
                  })
                  .map(
                    (
                      _,
                      index,
                    ) => {

                      const digit =
                        otp[index];


                      const isActive =
                        index ===
                          otp.length &&
                        otp.length <
                          6;


                      return (
                        <View
                          key={`otp-${index}`}
                          style={[
                            styles.otpBox,

                            isActive &&
                              styles.otpBoxActive,

                            error &&
                              styles.otpBoxError,
                          ]}
                        >

                          <Text
                            style={
                              styles.otpDigit
                            }
                          >
                            {digit || ''}
                          </Text>

                        </View>
                      );

                    },
                  )}

              </View>


              {/* =================================================
                  HIDDEN INPUT
              ================================================= */}

              <TextInput
                ref={
                  inputRef
                }
                value={
                  otp
                }
                onChangeText={
                  handleOtpChange
                }
                keyboardType="number-pad"
                maxLength={6}
                autoComplete="sms-otp"
                textContentType="oneTimeCode"
                caretHidden
                selectionColor="transparent"
                style={
                  styles.hiddenInput
                }
                editable={
                  !verifying &&
                  !isResending
                }
              />

            </View>


            {/* ==================================================
                ERROR
            ================================================== */}

            {error ? (

              <Text
                style={
                  styles.error
                }
              >
                {error}
              </Text>

            ) : null}


            {/* ==================================================
                VERIFY BUTTON
            ================================================== */}

            <DButton
              type="primary"
              style={[
                styles.verifyButton,
                {
                  backgroundColor:
                    verifyButtonBackgroundColor,
                },
              ]}
              disabled={
                !isVerifyEnabled
              }
              onPress={
                handleVerify
              }
            >

              <View
                style={
                  styles.verifyButtonContent
                }
              >

                <Text
                  style={
                    styles.buttonText
                  }
                >
                  {verifying
                    ? 'Verifying...'
                    : 'Verify & Continue'}
                </Text>

              </View>

            </DButton>


            {/* ==================================================
                RESEND
            ================================================== */}

            <View
              style={
                styles.resendContainer
              }
            >

              <Text
                style={
                  styles.resendText
                }
              >
                Didn't receive the code?
              </Text>


              <TouchableOpacity
                onPress={
                  handleResend
                }
                disabled={
                  isResending ||
                  verifying
                }
                activeOpacity={0.7}
              >

                <Text
                  style={
                    styles.resendLink
                  }
                >
                  {isResending
                    ? 'Resending...'
                    : 'Resend'}
                </Text>

              </TouchableOpacity>

            </View>

          </View>

        </KeyboardAvoidingView>

      </View>

    </Modal>
  );
}