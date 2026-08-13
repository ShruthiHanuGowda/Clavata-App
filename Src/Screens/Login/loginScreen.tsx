import React, { useState, useCallback, useEffect } from 'react';
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
import { useNavigation } from '@react-navigation/native';
import OTPModal from "../../components/OTPModal/OTPModal"
import styles from './styles';
import { DButton } from '../../components';
import { DMobileInput } from '../../components/Dinputs';
import { SEND_OTP } from '../../graphql/queries';
import { useUser } from '../../context/UserContext';

export default function LoginScreen() {
  const navigation = useNavigation<any>();
  const { setCurrentUser } = useUser();
  const [showOTP, setShowOTP] = useState(false);
  const [isValid, setValid] = useState(false);
  const [phoneNumber, setPhoneNumber] = useState('');
  const [loading, setLoading] = useState(false);
  const [sendOTP, { error: queryError }] = useMutation(SEND_OTP);

  useEffect(() => {
    if (queryError) {
      console.error('Send OTP error:', queryError);

      setLoading(false);

      Alert.alert(
        'Unable to continue',
        'We could not send the verification code. Please try again.',
      );
    }
  }, [queryError]);

  const loginWithPhone = useCallback(async () => {
    if (!phoneNumber || !isValid || loading) {
      return;
    }

    try {
      setLoading(true);

      console.log('User Phone Number:', phoneNumber);

      const { data } = await sendOTP({
        variables: {
          phoneNumber,
        },
      });

      console.log('OTP response:', data);

      if (data?.sendOTP?.success) {
        setShowOTP(true);
      } else {
        Alert.alert(
          'Unable to continue',
          data?.sendOTP?.message ||
          'We could not send the verification code.',
        );
      }
    } catch (error) {
      console.error('OTP error:', error);

      Alert.alert(
        'Something went wrong',
        'Please check your internet connection and try again.',
      );
    } finally {
      setLoading(false);
    }
  }, [
    phoneNumber,
    isValid,
    loading,
    sendOTP,
    navigation,
  ]);

  const handleBack = useCallback(() => {
    navigation.goBack();
  }, [navigation]);

  return (
    <SafeAreaView style={styles.safeAreaContainer}>
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {/* ================================= */}
          {/* HERO IMAGE */}
          {/* ================================= */}

          <View style={styles.heroContainer}>

            <Image
              source={require('../../assets/logo_badge.png')}
              style={styles.heroImage}
              resizeMode="cover"
            />

            {/* Image overlay */}
            <View style={styles.heroOverlay} />

            {/* Back button */}
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

            {/* Optional hero text */}
            <View style={styles.heroTextContainer}>
              <Text style={styles.heroTitle}>
                Beauty that feels like you
              </Text>

              <Text style={styles.heroSubtitle}>
                Discover trusted salons and beauty services near you.
              </Text>
            </View>

          </View>

          {/* ================================= */}
          {/* WHITE CONTENT PANEL */}
          {/* ================================= */}

          <View style={styles.contentCard}>

            {/* Heading */}

            <Text style={styles.title}>
              Welcome!
            </Text>

            <Text style={styles.subtitle}>
              Book your next beauty experience
            </Text>

            {/* ================================= */}
            {/* MOBILE NUMBER */}
            {/* ================================= */}

            <View style={styles.inputSection}>

              <Text style={styles.inputLabel}>
                Mobile number
              </Text>

              <View style={styles.emailInputWrapper}>
                <DMobileInput
                  inputAccessoryViewID="sendOtp"
                  setValid={setValid}
                  value={phoneNumber}
                  setValue={setPhoneNumber}
                />
              </View>

            </View>

            {/* ================================= */}
            {/* CONTINUE */}
            {/* ================================= */}

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
              <Text style={styles.loginText}>
                {loading
                  ? 'Sending code...'
                  : 'Continue'}
              </Text>
            </DButton>

            {/* ================================= */}
            {/* OTP INFORMATION */}
            {/* ================================= */}

            <View style={styles.securityContainer}>

              <View style={styles.securityIcon}>
                <Text style={styles.securityIconText}>
                  ✓
                </Text>
              </View>

              <Text style={styles.securityText}>
                We'll send you an OTP to verify your mobile number
              </Text>

            </View>

            {/* ================================= */}
            {/* TERMS */}
            {/* ================================= */}

            <View style={styles.bottomContainer}>

              <Text style={styles.bottomText}>
                By continuing, you agree to our
              </Text>

              <View style={styles.legalRow}>

                <TouchableOpacity activeOpacity={0.7}>
                  <Text style={styles.legalLink}>
                    Terms of Service
                  </Text>
                </TouchableOpacity>

                <Text style={styles.separator}>
                  {'  &  '}
                </Text>

                <TouchableOpacity activeOpacity={0.7}>
                  <Text style={styles.legalLink}>
                    Privacy Policy
                  </Text>
                </TouchableOpacity>

              </View>

            </View>

          </View>

        </ScrollView>
      </KeyboardAvoidingView>
      <OTPModal
        visible={showOTP}
        phoneNumber={phoneNumber}
        onClose={() => {
          setShowOTP(false);
        }}
        onVerified={(result: any) => {
          setShowOTP(false);

          if (result.isExistingUser) {
            setCurrentUser(result.user);

            navigation.reset({
              index: 0,
              routes: [
                {
                  name: 'appScreens',
                },
              ],
            });
          } else {
            navigation.navigate(
              'RegisterUser',
              {
                phoneNumber,
              },
            );
          }
        }}
      />
    </SafeAreaView>
  );
}

LoginScreen.navigationOptions = {
  header: null,
};