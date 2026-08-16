import React, { useState, useCallback, useEffect } from 'react';
import { Text, View, SafeAreaView, TouchableOpacity, ScrollView, KeyboardAvoidingView, Platform, Alert, Image } from 'react-native';
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

type LoginMode = 'CUSTOMER' | 'PROVIDER' | 'SIGN_IN';

export default function LoginScreen() {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const { setCurrentUser } = useUser();
  const mode: LoginMode = route.params?.mode || 'SIGN_IN';
  const hideBackButton = route.params?.hideBackButton === true;
  const [showOTP, setShowOTP] = useState(false);
  const [isValid, setValid] = useState(false);
  const [phoneNumber, setPhoneNumber] = useState(route.params?.phoneNumber || '');
  const [loading, setLoading] = useState(false);
  const [sendOTP, { error: queryError }] = useMutation(SEND_OTP);

  useEffect(() => {
    if (!queryError) return;
    console.error('Send OTP error:', queryError);
    setLoading(false);
    Alert.alert('Unable to continue', 'We could not send the verification code. Please try again.');
  }, [queryError]);

  const loginWithPhone = useCallback(async () => {
    if (!phoneNumber || !isValid || loading) return;
    try {
      setLoading(true);
      const { data } = await sendOTP({ variables: { phoneNumber } });
      if (data?.sendOTP?.success) {
        setShowOTP(true);
      } else {
        Alert.alert('Unable to continue', data?.sendOTP?.message || 'We could not send the verification code.');
      }
    } catch (error) {
      console.error('OTP error:', error);
      Alert.alert('Something went wrong', 'Please check your internet connection and try again.');
    } finally {
      setLoading(false);
    }
  }, [phoneNumber, isValid, loading, sendOTP]);

  const handleBack = useCallback(() => {
    if (navigation.canGoBack()) {
      navigation.goBack();
      return;
    }
    navigation.navigate('authScreens');
  }, [navigation]);

  const getExistingRole = (user: any) => {
    if (user?.roles?.customer === true) return 'CUSTOMER';
    if (user?.roles?.businessPartner === true) return 'PROVIDER';
    if (user?.activeRole === 'CUSTOMER') return 'CUSTOMER';
    if (user?.activeRole === 'PROVIDER') return 'PROVIDER';
    return null;
  };

  const openExistingAccount = (user: any) => {
    setCurrentUser(user);

    const existingRole = getExistingRole(user);

    console.log('========== EXISTING ACCOUNT ==========');
    console.log('ROLE:', existingRole);
    console.log('PROVIDER STATUS:', user?.providerStatus);
    console.log('USER:', JSON.stringify(user, null, 2));
    console.log('======================================');

    // ============================================================
    // PROVIDER ACCOUNT
    // ============================================================

    if (existingRole === 'PROVIDER') {
      const providerStatus = String(
        user?.providerStatus || 'NOT_REGISTERED'
      )
        .trim()
        .toUpperCase();

      console.log('NORMALIZED PROVIDER STATUS:', providerStatus);

      // ==========================================================
      // NOT REGISTERED
      // ==========================================================
      // User is a provider account but has NOT submitted
      // salon registration yet.
      //
      // DO NOT show SalonPendingVerification.
      // Send them to BecomePartner / registration flow.
      // ==========================================================

      if (providerStatus === 'NOT_REGISTERED') {
        navigation.navigate('BecomePartner');
        return;
      }

      // ==========================================================
      // PENDING
      // ==========================================================
      // Salon registration was submitted and is waiting for
      // admin/KYC verification.
      // ==========================================================

      if (providerStatus === 'PENDING') {
        navigation.replace('BecomePartner', {
          screen: 'SalonPendingVerification',
        });
        return;
      }

      // ==========================================================
      // APPROVED
      // ==========================================================
      // Provider can access the provider application.
      // ==========================================================

      if (providerStatus === 'APPROVED') {
        navigation.navigate('appScreens');
        return;
      }

      // ==========================================================
      // REJECTED
      // ==========================================================
      // Registration was rejected.
      // You can send them back to BecomePartner so they can
      // review/resubmit their registration.
      // ==========================================================

      if (providerStatus === 'REJECTED') {
        navigation.navigate('BecomePartner');
        return;
      }

      // ==========================================================
      // UNKNOWN STATUS
      // ==========================================================

      console.warn(
        'UNKNOWN PROVIDER STATUS:',
        providerStatus
      );

      navigation.navigate('BecomePartner');
      return;
    }

    // ============================================================
    // CUSTOMER ACCOUNT
    // ============================================================

    if (existingRole === 'CUSTOMER') {
      navigation.navigate('appScreens');
      return;
    }

    // ============================================================
    // INVALID / UNKNOWN ACCOUNT
    // ============================================================

    console.error(
      'UNKNOWN ACCOUNT ROLE:',
      JSON.stringify(user, null, 2)
    );

    Alert.alert(
      'Account error',
      'We could not determine your account type. Please contact support.'
    );
  };
  const handleOTPVerified = (result: any) => {
    console.log('========== OTP LOGIN RESULT ==========');
    console.log('SUCCESS:', result?.success);
    console.log('EXISTING:', result?.isExistingUser);
    console.log('USER:', JSON.stringify(result?.user, null, 2));
    console.log('MODE:', mode);
    console.log('======================================');
    setShowOTP(false);

    if (result?.success !== true) {
      Alert.alert('Verification failed', result?.message || 'OTP verification failed. Please try again.');
      return;
    }

    if (result?.isExistingUser === true && result?.user) {
      const user = result.user;
      const existingRole = getExistingRole(user);

      if (mode === 'SIGN_IN') {
        openExistingAccount(user);
        return;
      }

      if (mode === 'CUSTOMER') {
        if (existingRole === 'CUSTOMER') {
          openExistingAccount(user);
          return;
        }

        Alert.alert(
          'Number already registered',
          'This mobile number is already registered as a Service Provider. Please sign in.',
          [
            {
              text: 'Sign in',
              onPress: () => {
                navigation.replace('LoginScreen', {
                  mode: 'SIGN_IN',
                  phoneNumber,
                });
              },
            },
          ],
        );
        return;
      }

      if (mode === 'PROVIDER') {
        if (existingRole === 'PROVIDER') {
          openExistingAccount(user);
          return;
        }

        Alert.alert(
          'Number already registered',
          'This mobile number is already registered as a customer. Please sign in.',
          [
            {
              text: 'Sign in',
              onPress: () => {
                navigation.replace('LoginScreen', {
                  mode: 'SIGN_IN',
                  phoneNumber,
                });
              },
            },
          ],
        );
        return;
      }

      return;
    }

    if (result?.isExistingUser === false) {

      if (mode === 'SIGN_IN') {
        Alert.alert(
          'Account not found',
          'No Clavata account exists for this mobile number.',
          [
            {
              text: 'Choose account type',
              onPress: () => {
                navigation.replace('authScreens');
              },
            },
          ],
        );
        return;
      }

      if (mode === 'CUSTOMER') {
        navigation.replace('RegisterUser', {
          phoneNumber,
          activeRole: 'CUSTOMER',
        });
        return;
      }

      if (mode === 'PROVIDER') {
        navigation.replace('RegisterUser', {
          phoneNumber,
          activeRole: 'PROVIDER',
        });
        return;
      }

      Alert.alert('Unable to continue', `Unknown account type: ${mode}`);
      return;
    }

    Alert.alert(
      'Unable to continue',
      'We could not determine your account status. Please try again.',
    );
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.heroContainer}>
            {!hideBackButton && (
              <TouchableOpacity
                onPress={handleBack}
                style={styles.backButton}
                activeOpacity={0.7}
                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              >
                <Text style={styles.back}>‹</Text>
              </TouchableOpacity>
            )}

            <Image
              source={require('../../assets/logo-blue.png')}
              style={styles.heroLogo}
              resizeMode="contain"
            />

            {/* <Text style={styles.heroTitle}>
              Everything you need, in one place.
            </Text>

            <Text style={styles.heroSubtitle}>
              Discover services or grow your business with Clavata.
            </Text> */}
          </View>

          <View style={styles.content}>
            <View style={styles.inputSection}>
              {/* <Text style={styles.inputLabel}>Mobile number</Text> */}

              <DMobileInput
                inputAccessoryViewID="sendOtp"
                setValid={setValid}
                value={phoneNumber}
                setValue={setPhoneNumber}
              />
            </View>

            <View style={styles.buttonContainer}>
              <DButton
                type="primary"
                style={styles.loginBtnStyle}
                disabled={!phoneNumber || !isValid || loading}
                onPress={loginWithPhone}
              >
                <Text style={styles.loginText}>
                  {loading ? 'Sending code...' : 'Continue'}
                </Text>
              </DButton>
            </View>
          </View>

          <View style={styles.bottomContainer}>
            <Text style={styles.bottomText}>
              By continuing, you agree to our
            </Text>

            <View style={styles.legalRow}>
              <TouchableOpacity activeOpacity={0.7}>
                <Text style={styles.legalLink}>Terms of Service</Text>
              </TouchableOpacity>

              <Text style={styles.separator}>·</Text>

              <TouchableOpacity activeOpacity={0.7}>
                <Text style={styles.legalLink}>Privacy Policy</Text>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>

      <OTPModal
        visible={showOTP}
        phoneNumber={phoneNumber}
        onClose={() => setShowOTP(false)}
        onVerified={handleOTPVerified}
      />
    </SafeAreaView>
  );
}

LoginScreen.navigationOptions = {
  header: null,
};