import React, {useEffect, useRef, useState} from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Platform,
} from 'react-native';
import {useMutation} from '@apollo/client';

import {
  VERIFY_OTP,
  RESEND_OTP,
} from '../../graphql/queries';

import {DButton} from '../index';


// ============================================================
// OTP RESULT
// ============================================================

export type OTPResult = {
  success: boolean;
  message?: string;
  isExistingUser?: boolean;
  user?: any;
};


// ============================================================
// PROPS
// ============================================================

type OTPModalProps = {
  visible: boolean;
  phoneNumber: string;
  onClose: () => void;
  onVerified: (result: OTPResult) => void;
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
  const [otp, setOtp] = useState('');
  const [error, setError] = useState('');
  const [resending, setResending] = useState(false);

  const inputRef = useRef<TextInput>(null);

  // ==========================================================
  // VERIFY OTP
  // ==========================================================

  const [
    verifyOTP,
    {
      loading: verifying,
    },
  ] = useMutation(VERIFY_OTP);

  // ==========================================================
  // RESEND OTP
  // ==========================================================

  const [resendOTP] = useMutation(RESEND_OTP);

  // ==========================================================
  // OPEN
  // ==========================================================

  useEffect(() => {
    if (!visible) {
      return;
    }

    setOtp('');
    setError('');

    const timer = setTimeout(() => {
      inputRef.current?.focus();
    }, 300);

    return () => {
      clearTimeout(timer);
    };
  }, [visible]);

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
  // VERIFY
  // ==========================================================

  const handleVerify = async () => {
    if (otp.length !== 6) {
      setError('Enter the 6-digit code.');
      return;
    }

    if (verifying || resending) {
      return;
    }

    try {
      setError('');

      const {data} = await verifyOTP({
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

        setTimeout(() => {
          inputRef.current?.focus();
        }, 100);

        return;
      }

      onVerified(result);
    } catch (err) {
      console.error('OTP verification error:', err);

      setError(
        'Unable to verify the code. Please try again.',
      );
    }
  };

  // ==========================================================
  // RESEND
  // ==========================================================

  const handleResend = async () => {
    if (resending || verifying) {
      return;
    }

    if (!phoneNumber) {
      setError('Phone number is missing.');
      return;
    }

    try {
      setResending(true);
      setError('');
      setOtp('');

      const {data} = await resendOTP({
        variables: {
          phoneNumber,
        },
      });

      const result = data?.resendOTP;

      if (!result?.success) {
        setError(
          result?.message ||
            'Unable to resend the code.',
        );

        return;
      }

      setOtp('');
      setError('');

      setTimeout(() => {
        inputRef.current?.focus();
      }, 100);
    } catch (err) {
      console.error('Resend OTP error:', err);

      setError(
        'Unable to resend the code. Please try again.',
      );
    } finally {
      setResending(false);
    }
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
    <View style={styles.modalRoot}>

      {/* BACKDROP */}

      <TouchableOpacity
        activeOpacity={1}
        style={styles.backdrop}
        onPress={onClose}
      />

      {/* MODAL */}

      <View style={styles.card}>

        {/* CLOSE */}

        <TouchableOpacity
          style={styles.closeButton}
          onPress={onClose}
          activeOpacity={0.7}
          disabled={verifying || resending}
        >
          <Text style={styles.closeText}>
            ×
          </Text>
        </TouchableOpacity>


        {/* ICON */}

        <View style={styles.iconContainer}>
          <Text style={styles.icon}>
            ✓
          </Text>
        </View>


        {/* TITLE */}

        <Text style={styles.title}>
          Verify number
        </Text>


        <Text style={styles.subtitle}>
          Enter the 6-digit code sent to
        </Text>


        <Text style={styles.phone}>
          {phoneNumber}
        </Text>


        {/* OTP */}

        <View style={styles.otpWrapper}>

          <View style={styles.otpBoxes}>

            {Array.from({length: 6}).map(
              (_, index) => {
                const digit = otp[index];

                const isActive =
                  index === otp.length;

                return (
                  <View
                    key={index}
                    style={[
                      styles.otpBox,

                      isActive &&
                        styles.otpBoxActive,

                      error &&
                        styles.otpBoxError,
                    ]}
                  >
                    <Text
                      style={styles.otpDigit}
                    >
                      {digit || ''}
                    </Text>
                  </View>
                );
              },
            )}

          </View>


          {/* REAL INPUT */}

          <TextInput
            ref={inputRef}
            value={otp}
            onChangeText={handleOtpChange}
            keyboardType="numeric"
            maxLength={6}
            autoComplete="one-time-code"
            textContentType="oneTimeCode"
            autoFocus={false}
            style={styles.hiddenInput}
            editable={
              !verifying &&
              !resending
            }
            onSubmitEditing={
              handleVerify
            }
          />

        </View>


        {/* ERROR */}

        {error ? (
          <Text style={styles.error}>
            {error}
          </Text>
        ) : null}


        {/* VERIFY */}

        <DButton
          type="primary"
          style={styles.verifyButton}
          disabled={
            verifying ||
            resending ||
            otp.length !== 6
          }
          onPress={handleVerify}
        >
          <View
            style={
              styles.verifyButtonContent
            }
          >
            <Text
              style={styles.buttonText}
            >
              {verifying
                ? 'Verifying...'
                : 'Verify & Continue'}
            </Text>
          </View>
        </DButton>


        {/* RESEND */}

        <View
          style={styles.resendContainer}
        >
          <Text
            style={styles.resendText}
          >
            Didn't receive the code?
          </Text>

          <TouchableOpacity
            onPress={handleResend}
            disabled={
              resending ||
              verifying
            }
            activeOpacity={0.7}
          >
            <Text
              style={styles.resendLink}
            >
              {resending
                ? 'Resending...'
                : 'Resend'}
            </Text>
          </TouchableOpacity>
        </View>

      </View>
    </View>
  );
}


// ============================================================
// STYLES
// ============================================================

const styles = StyleSheet.create({

  modalRoot: {
    position: 'fixed' as any,
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,

    width: '100%',
    height: '100%',

    zIndex: 9999,

    alignItems: 'center',
    justifyContent: 'center',
  },

  backdrop: {
    position: 'absolute',

    top: 0,
    left: 0,
    right: 0,
    bottom: 0,

    backgroundColor:
      'rgba(10, 20, 40, 0.45)',

    ...(Platform.OS === 'web'
      ? {
          backdropFilter:
            'blur(10px)',
          WebkitBackdropFilter:
            'blur(10px)',
        } as any
      : {}),
  },

  card: {
    width: 430,
    maxWidth: 'calc(100% - 40px)' as any,

    backgroundColor: '#FFFFFF',

    borderRadius: 24,

    paddingHorizontal: 36,
    paddingTop: 38,
    paddingBottom: 30,

    position: 'relative',

    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 12,
    },
    shadowOpacity: 0.18,
    shadowRadius: 30,
    elevation: 20,
  },

  closeButton: {
    position: 'absolute',

    top: 16,
    right: 16,

    width: 36,
    height: 36,

    borderRadius: 18,

    alignItems: 'center',
    justifyContent: 'center',

    backgroundColor: '#F5F6F8',
  },

  closeText: {
    fontSize: 26,
    lineHeight: 28,

    fontWeight: '300',

    color: '#555555',
  },

  iconContainer: {
    width: 64,
    height: 64,

    borderRadius: 32,

    alignSelf: 'center',

    alignItems: 'center',
    justifyContent: 'center',

    backgroundColor: '#EAF2FF',

    marginBottom: 20,
  },

  icon: {
    fontSize: 30,
    fontWeight: '700',

    color: '#2563EB',
  },

  title: {
    fontSize: 26,

    fontWeight: '700',

    color: '#1F2937',

    textAlign: 'center',

    marginBottom: 8,
  },

  subtitle: {
    fontSize: 15,

    color: '#6B7280',

    textAlign: 'center',

    marginBottom: 5,
  },

  phone: {
    fontSize: 16,

    fontWeight: '600',

    color: '#2563EB',

    textAlign: 'center',

    marginBottom: 28,
  },

  otpWrapper: {
    position: 'relative',

    width: '100%',

    marginBottom: 10,
  },

  otpBoxes: {
    flexDirection: 'row',

    justifyContent: 'center',

    gap: 9,
  },

  otpBox: {
    width: 50,
    height: 58,

    borderWidth: 1.5,
    borderColor: '#D8DDE6',

    borderRadius: 12,

    alignItems: 'center',
    justifyContent: 'center',

    backgroundColor: '#FAFBFC',
  },

  otpBoxActive: {
    borderColor: '#2563EB',

    borderWidth: 2,

    backgroundColor: '#FFFFFF',
  },

  otpBoxError: {
    borderColor: '#DC2626',
  },

  otpDigit: {
    fontSize: 23,

    fontWeight: '600',

    color: '#111827',
  },

  hiddenInput: {
    position: 'absolute',

    top: 0,
    left: 0,

    width: '100%',
    height: 58,

    opacity: 0,

    outlineStyle: 'none' as any,
  },

  error: {
    fontSize: 13,

    color: '#DC2626',

    textAlign: 'center',

    marginTop: 6,
    marginBottom: 8,
  },

  verifyButton: {
    width: '100%',

    marginTop: 14,

    minHeight: 52,

    borderRadius: 12,
  },

  verifyButtonContent: {
    alignItems: 'center',
    justifyContent: 'center',

    width: '100%',
  },

  buttonText: {
    fontSize: 15,

    fontWeight: '600',

    color: '#FFFFFF',
  },

  resendContainer: {
    flexDirection: 'row',

    justifyContent: 'center',
    alignItems: 'center',

    marginTop: 22,
  },

  resendText: {
    fontSize: 14,

    color: '#6B7280',
  },

  resendLink: {
    fontSize: 14,

    fontWeight: '700',

    color: '#2563EB',

    marginLeft: 5,
  },
});

