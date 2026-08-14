import React, { useEffect, useRef, useState } from 'react';
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
import { VERIFY_OTP, SEND_OTP } from '../../graphql/queries';
import { DButton } from '../index';
import {
  COLORS,
  FONTS,
  FONT_SIZES,
  SPACING,
  RADIUS,
} from '../../constants/constants';
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
  onVerified: (result: OTPResult) => void;
};

export default function OTPModal({
  visible,
  phoneNumber,
  onClose,
  onVerified,
}: OTPModalProps) {

  const [otp, setOtp] = useState('');
  const [error, setError] = useState('');
  const [resending, setResending] = useState(false);
  const inputRef = useRef<TextInput>(null);

  const [verifyOTP, { loading }] = useMutation(VERIFY_OTP);
  const [sendOTP] = useMutation(SEND_OTP);

  useEffect(() => {
    if (!visible) return;
    setOtp('');
    setError('');
    const timer = setTimeout(() => {
      inputRef.current?.focus();
    }, 400);
    return () => clearTimeout(timer);
  }, [visible]);

  const handleOtpChange = (value: string) => {
    const numericValue = value.replace(/[^0-9]/g, '').slice(0, 6);
    setOtp(numericValue);
    setError('');
  };

  const handleVerify = async () => {
    if (otp.length !== 6) {
      setError('Enter the 6-digit code.');
      return;
    }

    try {
      setError('');

      const { data } = await verifyOTP({
        variables: {
          phoneNumber,
          otp,
        },
      });

      const result = data?.verifyOTP;

      if (!result?.success) {
        setError(
          result?.message ||
          'Invalid code. Please try again.',
        );
        setOtp('');
        inputRef.current?.focus();
        return;
      }

      onVerified(result);
    } catch (err) {
      console.error('OTP verification error:', err);
      setError('Unable to verify the code. Please try again.');
    }
  };

  const handleResend = async () => {
    if (resending) return;

    try {
      setResending(true);
      setError('');
      setOtp('');

      const { data } = await sendOTP({
        variables: {
          phoneNumber,
        },
      });

      if (!data?.sendOTP?.success) {
        setError(
          data?.sendOTP?.message ||
          'Unable to resend the code.',
        );
      } else {
        setTimeout(() => {
          inputRef.current?.focus();
        }, 100);
      }
    } catch (err) {
      console.error('Resend OTP error:', err);
      setError('Unable to resend the code.');
    } finally {
      setResending(false);
    }
  };

  if (!visible) return null;

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      statusBarTranslucent
      onRequestClose={onClose}
    >
      <BlurView
        style={styles.blur}
        blurType="light"
        blurAmount={16}
        reducedTransparencyFallbackColor="rgba(255,255,255,0.94)"
      />

      <View style={styles.overlay}>
        <Pressable style={styles.outside} onPress={onClose} />

        <KeyboardAvoidingView
          style={styles.keyboard}
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        >
          <View style={styles.card}>

            <TouchableOpacity
              style={styles.closeButton}
              onPress={onClose}
              activeOpacity={0.7}
            >
              <Text style={styles.closeText}>×</Text>
            </TouchableOpacity>

            <View style={styles.iconContainer}>
              <Text style={styles.icon}>✓</Text>
            </View>

            <Text style={styles.title}>Verify number</Text>

            <Text style={styles.subtitle}>
              Enter the code sent to
            </Text>

            <Text style={styles.phone}>
              {phoneNumber}
            </Text>

            <View style={styles.otpWrapper}>
              <View style={styles.otpBoxes}>
                {Array.from({ length: 6 }).map((_, index) => {
                  const digit = otp[index];
                  const isActive = index === otp.length;

                  return (
                    <View
                      key={index}
                      style={[
                        styles.otpBox,
                        isActive && styles.otpBoxActive,
                        error && styles.otpBoxError,
                      ]}
                    >
                      <Text style={styles.otpDigit}>
                        {digit || ''}
                      </Text>
                    </View>
                  );
                })}
              </View>

              <TextInput
                ref={inputRef}
                value={otp}
                onChangeText={handleOtpChange}
                keyboardType="number-pad"
                maxLength={6}
                autoComplete="sms-otp"
                textContentType="oneTimeCode"
                caretHidden
                selectionColor="transparent"
                style={styles.hiddenInput}
              />
            </View>

            {error ? (
              <Text style={styles.error}>
                {error}
              </Text>
            ) : null}

            <DButton
              type="primary"
              style={styles.verifyButton}
              disabled={loading || otp.length !== 6}
              onPress={handleVerify}
            >
              <View style={styles.verifyButtonContent}>
                <Text style={styles.buttonText}>
                  {loading ? 'Verifying...' : 'Verify & Continue'}
                </Text>
              </View>
            </DButton>

            <View style={styles.resendContainer}>
              <Text style={styles.resendText}>
                Didn't receive the code?
              </Text>

              <TouchableOpacity
                onPress={handleResend}
                disabled={resending}
                activeOpacity={0.7}
              >
                <Text style={styles.resendLink}>
                  {resending ? 'Resending...' : 'Resend'}
                </Text>
              </TouchableOpacity>
            </View>

          </View>
        </KeyboardAvoidingView>
      </View>
    </Modal>
  );
}