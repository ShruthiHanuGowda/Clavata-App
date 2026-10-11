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
  StyleSheet,
} from 'react-native';

import BlurView from '../BlurView';
import AppGradient from '../../common/AppGradient';

import { useMutation } from '@apollo/client';

import {
  VERIFY_OTP,
  RESEND_OTP,
} from '../../graphql/queries';

import styles from './styles';

// ============================================================
// TYPES
// ============================================================

export type UserRole = 'CUSTOMER' | 'PROVIDER';

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

export type OTPResult = {
  success: boolean;
  message?: string;
  isExistingUser: boolean;
  user?: ClavataUser | null;
};

type OTPModalProps = {
  visible: boolean;
  phoneNumber: string;
  onClose: () => void;
  onVerified: (result: OTPResult) => void;
};

// ============================================================
// GRADIENT
// ============================================================

const BUTTON_GRADIENT: [string, ...string[]] = [
  '#C084FC',
  '#A78BFA',
  '#8B5CF6',
];

// ============================================================
// COMPONENT
// ============================================================

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

  // ==========================================================
  // MUTATIONS
  // ==========================================================

  const [
    verifyOTP,
    { loading: verifying },
  ] = useMutation(VERIFY_OTP);

  const [
    resendOTP,
    { loading: resendMutationLoading },
  ] = useMutation(RESEND_OTP);

  const isResending =
    resending || resendMutationLoading;

  // ==========================================================
  // MODAL OPEN
  // ==========================================================

  useEffect(() => {
    if (!visible) {
      return;
    }

    setOtp('');
    setError('');

    const timer = setTimeout(() => {
      inputRef.current?.focus();
    }, 400);

    return () => {
      clearTimeout(timer);
    };
  }, [visible, phoneNumber]);

  // ==========================================================
  // OTP CHANGE
  // ==========================================================

  const handleOtpChange = (value: string) => {
    const numericValue = value
      .replace(/[^0-9]/g, '')
      .slice(0, 6);

    setOtp(numericValue);

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

  // ==========================================================
  // VERIFY OTP
  // ==========================================================

  const handleVerify = async () => {
    if (otp.length !== 6) {
      setError('Enter the 6-digit code.');
      return;
    }

    if (verifying || isResending) {
      return;
    }

    if (!phoneNumber?.trim()) {
      setError('Phone number is missing.');
      return;
    }

    try {
      setError('');

      console.log('VERIFY OTP START');
      console.log('PHONE:', phoneNumber);

      const { data } = await verifyOTP({
        variables: {
          phoneNumber,
          otp,
        },
      });

      const result = data?.verifyOTP;

      console.log(
        'VERIFY OTP RESULT:',
        JSON.stringify(result, null, 2),
      );

      if (!result) {
        setError(
          'Unable to verify the code. Please try again.',
        );
        return;
      }

      if (result.success !== true) {
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

      const isExistingUser =
        result.isExistingUser === true;

      if (isExistingUser) {
        const user = result.user;

        if (!user) {
          setError(
            'We found your account, but could not load your account details. Please try again.',
          );
          return;
        }

        if (
          user.role !== 'CUSTOMER' &&
          user.role !== 'PROVIDER'
        ) {
          setError(
            'Unable to determine your account type. Please contact support.',
          );
          return;
        }

        if (user.role === 'PROVIDER') {
          const validProviderStatuses: ProviderStatus[] = [
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
            setError(
              'Your provider account has an invalid status. Please contact support.',
            );
            return;
          }
        }
      }

      const normalizedResult: OTPResult = {
        success: true,
        message: result.message || 'OTP verified.',
        isExistingUser,
        user: isExistingUser ? result.user : null,
      };

      onVerified(normalizedResult);
    } catch (err) {
      console.error('OTP VERIFICATION ERROR:', err);

      setError(
        'Unable to verify the code. Please try again.',
      );
    }
  };

  // ==========================================================
  // RESEND OTP
  // ==========================================================

  const handleResend = async () => {
    if (isResending || verifying) {
      return;
    }

    if (!phoneNumber?.trim()) {
      setError('Phone number is missing.');
      return;
    }

    try {
      setResending(true);
      setError('');
      setOtp('');

      console.log('RESEND OTP START');
      console.log('PHONE:', phoneNumber);

      const { data } = await resendOTP({
        variables: {
          phoneNumber,
        },
      });

      const result = data?.resendOTP;

      console.log(
        'RESEND OTP RESULT:',
        JSON.stringify(result, null, 2),
      );

      if (!result) {
        setError(
          'Unable to resend the code. Please try again.',
        );
        return;
      }

      if (result.success !== true) {
        setError(
          result.message ||
            'Unable to resend the code.',
        );
        return;
      }

      console.log('OTP RESENT SUCCESSFULLY');

      setOtp('');
      setError('');

      setTimeout(() => {
        inputRef.current?.focus();
      }, 100);
    } catch (err) {
      console.error('RESEND OTP ERROR:', err);

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

  const handleClose = () => {
    if (verifying || isResending) {
      return;
    }

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
      onRequestClose={handleClose}
    >
      <BlurView
        style={styles.blur}
        blurType="light"
        blurAmount={16}
        reducedTransparencyFallbackColor="rgba(255,255,255,0.94)"
      />

      <View style={styles.overlay}>
        <Pressable
          style={styles.outside}
          onPress={handleClose}
          disabled={verifying || isResending}
        />

        <KeyboardAvoidingView
          style={styles.keyboard}
          behavior={
            Platform.OS === 'ios'
              ? 'padding'
              : undefined
          }
        >
          <View style={styles.card}>
            {/* CLOSE */}

            <TouchableOpacity
              style={styles.closeButton}
              onPress={handleClose}
              activeOpacity={0.7}
              disabled={verifying || isResending}
            >
              <Text style={styles.closeText}>×</Text>
            </TouchableOpacity>

            {/* TITLE */}

            <Text style={styles.title}>
              Verify number
            </Text>

            <Text style={styles.subtitle}>
              Enter the code sent to
            </Text>

            <Text style={styles.phone}>
              {phoneNumber}
            </Text>

            {/* OTP INPUT */}

            <View style={styles.otpWrapper}>
              <View style={styles.otpBoxes}>
                {Array.from({ length: 6 }).map(
                  (_, index) => {
                    const digit = otp[index];

                    const isActive =
                      index === otp.length &&
                      otp.length < 6;

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
                        <Text style={styles.otpDigit}>
                          {digit || ''}
                        </Text>
                      </View>
                    );
                  },
                )}
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
                editable={!verifying && !isResending}
              />
            </View>

            {/* ERROR */}

            {error ? (
              <Text style={styles.error}>
                {error}
              </Text>
            ) : null}

            {/* VERIFY BUTTON */}

            <TouchableOpacity
              style={[
                styles.verifyButton,
                localStyles.gradientButton,
                {
                  opacity: isVerifyEnabled ? 1 : 0.55,
                },
              ]}
              activeOpacity={0.85}
              disabled={!isVerifyEnabled}
              onPress={handleVerify}
            >
              <AppGradient
                colors={BUTTON_GRADIENT}
                style={StyleSheet.absoluteFillObject}
              >
                <View
                  style={StyleSheet.absoluteFillObject}
                />
              </AppGradient>

              <View style={styles.verifyButtonContent}>
                <Text style={styles.buttonText}>
                  {verifying
                    ? 'Verifying...'
                    : 'Verify & Continue'}
                </Text>
              </View>
            </TouchableOpacity>

            {/* RESEND PROMPT AND SMALL BUTTON */}

            <View style={localStyles.resendContainer}>
              <Text style={styles.resendText}>
                Didn't receive the code?
              </Text>

              <TouchableOpacity
                style={[
                  localStyles.resendButton,
                  localStyles.gradientButton,
                  {
                    opacity:
                      isResending || verifying ? 0.55 : 1,
                  },
                ]}
                onPress={handleResend}
                disabled={isResending || verifying}
                activeOpacity={0.85}
              >
                <AppGradient
                  colors={BUTTON_GRADIENT}
                  style={StyleSheet.absoluteFillObject}
                >
                  <View
                    style={StyleSheet.absoluteFillObject}
                  />
                </AppGradient>

                <Text style={localStyles.resendButtonText}>
                  {isResending
                    ? 'Resending...'
                    : 'Resend Code'}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </KeyboardAvoidingView>
      </View>
    </Modal>
  );
}

// ============================================================
// LOCAL BUTTON STYLES
// ============================================================

const localStyles = StyleSheet.create({
  gradientButton: {
    backgroundColor: 'transparent',
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'center',
  },

  resendContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    flexWrap: 'wrap',
    marginTop: 18,
    gap: 8,
  },

  resendButton: {
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 8,
    overflow: 'hidden',
  },

  resendButtonText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
  },
});
