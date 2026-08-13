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

import { BlurView } from '@react-native-community/blur';

import { useMutation } from '@apollo/client';

import {
  VERIFY_OTP,
  SEND_OTP,
} from '../../graphql/queries';

import { DButton } from '../index';

import styles from './styles';

export type OTPResult = {
  success: boolean;
  message?: string;
  isExistingUser?: boolean;
  user?: any;
};

type OTPModalProps = {

  visible: boolean;

  phoneNumber: string;

  onClose: () => void;

  onVerified: (
    result: OTPResult,
  ) => void;
};

export default function OTPModal({
  visible,
  phoneNumber,
  onClose,
  onVerified,
}: OTPModalProps) {

  const [otp, setOtp] =
    useState('');

  const [error, setError] =
    useState('');

  const [resending, setResending] =
    useState(false);

  const inputRef =
    useRef<TextInput>(null);

  const [
    verifyOTP,
    { loading },
  ] = useMutation(
    VERIFY_OTP,
  );

  const [sendOTP] =
    useMutation(
      SEND_OTP,
    );

  /*
   * Reset + focus
   */

  useEffect(() => {

    if (!visible) {
      return;
    }

    setOtp('');
    setError('');

    const timer =
      setTimeout(() => {

        inputRef.current?.focus();

      }, 450);

    return () => {
      clearTimeout(timer);
    };

  }, [visible]);

  /*
   * Verify
   */

  const handleVerify =
    async () => {

      if (
        otp.length !== 6
      ) {

        setError(
          'Please enter the 6-digit OTP.',
        );

        return;
      }

      try {

        setError('');

        const { data } =
          await verifyOTP({
            variables: {
              phoneNumber,
              otp,
            },
          });

        const result =
          data?.verifyOTP;

        if (!result?.success) {

          setError(
            result?.message ||
            'Invalid OTP. Please try again.',
          );

          setOtp('');

          inputRef.current?.focus();

          return;
        }

        /*
         * IMPORTANT:
         *
         * OTPModal does not navigate.
         *
         * Parent decides what happens.
         */

        onVerified(result);

      } catch (err) {

        console.error(
          'OTP verification error:',
          err,
        );

        setError(
          'Unable to verify OTP. Please try again.',
        );
      }
    };

  /*
   * Resend
   */

  const handleResend =
    async () => {

      if (resending) {
        return;
      }

      try {

        setResending(true);
        setError('');
        setOtp('');

        const { data } =
          await sendOTP({
            variables: {
              phoneNumber,
            },
          });

        if (
          !data?.sendOTP?.success
        ) {

          setError(
            data?.sendOTP?.message ||
            'Unable to resend OTP.',
          );
        }

      } catch (err) {

        console.error(
          'Resend OTP error:',
          err,
        );

        setError(
          'Unable to resend OTP.',
        );

      } finally {

        setResending(false);

      }
    };

  if (!visible) {
    return null;
  }

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      statusBarTranslucent
      onRequestClose={onClose}
    >

      {/* BLUR */}

      <BlurView
        style={styles.blur}
        blurType="light"
        blurAmount={18}
        reducedTransparencyFallbackColor={
          'rgba(255,255,255,0.92)'
        }
      />

      <View
        style={styles.overlay}
      >

        {/* OUTSIDE */}

        <Pressable
          style={styles.outside}
          onPress={onClose}
        />

        <KeyboardAvoidingView
          style={styles.keyboard}
          behavior={
            Platform.OS === 'ios'
              ? 'padding'
              : undefined
          }
        >

          {/* CARD */}

          <View
            style={styles.card}
          >

            {/* CLOSE */}

            <TouchableOpacity
              style={styles.closeButton}
              onPress={onClose}
              activeOpacity={0.7}
            >

              <Text
                style={styles.closeText}
              >
                ×
              </Text>

            </TouchableOpacity>

            {/* ICON */}

            <View
              style={
                styles.iconContainer
              }
            >

              <Text
                style={styles.icon}
              >
                ✓
              </Text>

            </View>

            {/* TITLE */}

            <Text
              style={styles.title}
            >
              Verify your number
            </Text>

            <Text
              style={styles.subtitle}
            >
              Enter the 6-digit code sent to
            </Text>

            <Text
              style={styles.phone}
            >
              {phoneNumber}
            </Text>

            {/* OTP */}

            <TextInput
              ref={inputRef}
              value={otp}
              onChangeText={(value) => {

                const numericValue =
                  value
                    .replace(
                      /[^0-9]/g,
                      '',
                    )
                    .slice(0, 6);

                setOtp(
                  numericValue,
                );

                setError('');
              }}
              keyboardType="number-pad"
              maxLength={6}
              autoComplete="sms-otp"
              textContentType="oneTimeCode"
              placeholder="000000"
              placeholderTextColor="#C5C5CD"
              style={[
                styles.otpInput,
                error
                  ? styles.otpInputError
                  : null,
              ]}
            />

            {/* ERROR */}

            {error ? (
              <Text
                style={styles.error}
              >
                {error}
              </Text>
            ) : null}

            {/* VERIFY */}

            <DButton
              type="primary"
              style={
                styles.verifyButton
              }
              disabled={
                loading ||
                otp.length !== 6
              }
              onPress={
                handleVerify
              }
            >

              <Text
                style={
                  styles.buttonText
                }
              >
                {loading
                  ? 'Verifying...'
                  : 'Verify & Continue'}
              </Text>

            </DButton>

            {/* RESEND */}

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
                  resending
                }
                activeOpacity={0.7}
              >

                <Text
                  style={
                    styles.resendLink
                  }
                >
                  {resending
                    ? ' Sending...'
                    : ' Resend OTP'}
                </Text>

              </TouchableOpacity>

            </View>

          </View>

        </KeyboardAvoidingView>

      </View>

    </Modal>
  );
}