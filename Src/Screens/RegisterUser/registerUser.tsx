import React, {
  useState,
  useCallback,
} from 'react';

import {
  SafeAreaView,
  View,
  Text,
  TextInput,
  Alert,
  StyleSheet,
  Pressable,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';

import {
  useNavigation,
  useRoute,
} from '@react-navigation/native';

import { useMutation } from '@apollo/client';

import { DButton } from '../../components';

import {
  REGISTER_USER,
} from '../../graphql/queries';

import {
  useUser,
} from '../../context/UserContext';

const PRIMARY = '#009D94';

export default function RegisterUser() {

  const navigation =
    useNavigation<any>();

  const route =
    useRoute<any>();

  const {
    setCurrentUser,
  } = useUser();

  const phoneNumber =
    route.params?.phoneNumber;

  const [
    fullName,
    setFullName,
  ] = useState('');

  const [
    acceptedTerms,
    setAcceptedTerms,
  ] = useState(false);

  const [
    registerUser,
    { loading },
  ] = useMutation(
    REGISTER_USER,
  );

  /*
   * Register customer
   */

  const onRegister =
    useCallback(
      async () => {

        const name =
          fullName.trim();

        if (!name) {

          Alert.alert(
            'Name required',
            'Please enter your full name to continue.',
          );

          return;
        }

        if (name.length < 2) {

          Alert.alert(
            'Invalid name',
            'Please enter a valid name.',
          );

          return;
        }

        if (!acceptedTerms) {

          Alert.alert(
            'Terms & Conditions',
            'Please accept the Terms & Conditions and Privacy Policy to continue.',
          );

          return;
        }

        if (!phoneNumber) {

          Alert.alert(
            'Phone number missing',
            'Please verify your mobile number again.',
          );

          return;
        }

        try {

          console.log(
            '========== REGISTER USER ==========',
          );

          const { data } =
            await registerUser({
              variables: {
                input: {
                  phoneNumber,
                  fullName: name,
                  acceptedTerms,
                },
              },
            });

          console.log(
            'REGISTER RESPONSE:',
            JSON.stringify(
              data,
              null,
              2,
            ),
          );

          const result =
            data?.registerUser;

          if (!result?.success) {

            Alert.alert(
              'Registration Failed',
              result?.message ||
              'We could not create your account. Please try again.',
            );

            return;
          }

          /*
           * Account created.
           */

          setCurrentUser(
            result.user,
          );

          /*
           * Remove all authentication/
           * registration screens.
           */

          navigation.reset({
            index: 0,
            routes: [
              {
                name: 'appScreens',
              },
            ],
          });

        } catch (error: any) {

          console.error(
            'REGISTER USER ERROR:',
            error,
          );

          Alert.alert(
            'Something went wrong',
            'Unable to create your account. Please try again.',
          );
        }

      },
      [
        fullName,
        acceptedTerms,
        phoneNumber,
        registerUser,
        setCurrentUser,
        navigation,
      ],
    );

  const toggleTerms =
    () => {

      setAcceptedTerms(
        previous =>
          !previous,
      );
    };

  return (
    <SafeAreaView
      style={styles.container}
    >

      <KeyboardAvoidingView
        style={
          styles.keyboardContainer
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

          {/* HEADER */}

          <View
            style={styles.topSection}
          >

            <View
              style={styles.iconCircle}
            >

              <Text
                style={styles.iconText}
              >
                C
              </Text>

            </View>

            <Text
              style={styles.title}
            >
              Welcome to Clavata 👋
            </Text>

            <Text
              style={styles.subtitle}
            >
              Just one more step to get started.
            </Text>

          </View>

          {/* CARD */}

          <View
            style={styles.card}
          >

            <Text
              style={styles.fieldLabel}
            >
              Full name
            </Text>

            <TextInput
              style={styles.input}
              placeholder="Enter your full name"
              placeholderTextColor="#9CA3AF"
              value={fullName}
              onChangeText={
                setFullName
              }
              autoCapitalize="words"
              autoCorrect={false}
              returnKeyType="done"
              editable={!loading}
            />

            {/* VERIFIED PHONE */}

            <View
              style={styles.phoneContainer}
            >

              <View
                style={styles.phoneIcon}
              >

                <Text
                  style={
                    styles.phoneIconText
                  }
                >
                  ✓
                </Text>

              </View>

              <View
                style={styles.phoneDetails}
              >

                <Text
                  style={styles.phoneLabel}
                >
                  Mobile number verified
                </Text>

                <Text
                  style={styles.phoneNumber}
                >
                  {phoneNumber}
                </Text>

              </View>

            </View>

            {/* TERMS */}

            <Pressable
              style={
                styles.termsContainer
              }
              onPress={
                toggleTerms
              }
              disabled={loading}
            >

              <View
                style={[
                  styles.checkbox,
                  acceptedTerms &&
                  styles.checkboxSelected,
                ]}
              >

                {acceptedTerms && (
                  <Text
                    style={styles.tick}
                  >
                    ✓
                  </Text>
                )}

              </View>

              <Text
                style={styles.termsText}
              >
                I agree to Clavata's{' '}
                <Text
                  style={
                    styles.termsLink
                  }
                >
                  Terms & Conditions
                </Text>{' '}
                and{' '}
                <Text
                  style={
                    styles.termsLink
                  }
                >
                  Privacy Policy
                </Text>
              </Text>

            </Pressable>

            {/* CONTINUE */}

            <DButton
              type="primary"
              style={styles.button}
              disabled={
                loading ||
                !fullName.trim() ||
                !acceptedTerms
              }
              onPress={
                onRegister
              }
            >

              <Text
                style={styles.buttonText}
              >
                {loading
                  ? 'Creating account...'
                  : 'Get Started'}
              </Text>

            </DButton>

          </View>

          <Text
            style={styles.footerText}
          >
            Your verified mobile number will be used
            to secure your Clavata account.
          </Text>

        </ScrollView>

      </KeyboardAvoidingView>

    </SafeAreaView>
  );
}

const styles = StyleSheet.create({

  container: {
    flex: 1,
    backgroundColor: '#F7F9FA',
  },

  keyboardContainer: {
    flex: 1,
  },

  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 22,
    paddingTop: 45,
    paddingBottom: 30,
  },

  topSection: {
    alignItems: 'center',
    marginBottom: 28,
  },

  iconCircle: {
    width: 58,
    height: 58,
    borderRadius: 29,
    backgroundColor: PRIMARY,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 18,
  },

  iconText: {
    color: '#FFFFFF',
    fontSize: 27,
    fontWeight: '800',
  },

  title: {
    fontSize: 25,
    fontWeight: '700',
    color: '#111827',
    textAlign: 'center',
    letterSpacing: -0.3,
  },

  subtitle: {
    marginTop: 8,
    fontSize: 15,
    color: '#6B7280',
    textAlign: 'center',
  },

  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 22,

    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.06,
    shadowRadius: 12,

    elevation: 3,
  },

  fieldLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 9,
  },

  input: {
    height: 54,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 12,
    paddingHorizontal: 16,
    fontSize: 16,
    color: '#111827',
    backgroundColor: '#FAFAFA',
  },

  phoneContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 18,
    padding: 13,
    borderRadius: 12,
    backgroundColor: '#F0FAF8',
  },

  phoneIcon: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: PRIMARY,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 11,
  },

  phoneIconText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },

  phoneDetails: {
    flex: 1,
  },

  phoneLabel: {
    fontSize: 12,
    color: '#6B7280',
    marginBottom: 2,
  },

  phoneNumber: {
    fontSize: 14,
    fontWeight: '600',
    color: '#111827',
  },

  termsContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginTop: 22,
    marginBottom: 22,
  },

  checkbox: {
    width: 21,
    height: 21,
    borderWidth: 1.5,
    borderColor: '#CBD5E1',
    borderRadius: 6,
    marginRight: 11,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 1,
  },

  checkboxSelected: {
    backgroundColor: PRIMARY,
    borderColor: PRIMARY,
  },

  tick: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '800',
  },

  termsText: {
    flex: 1,
    fontSize: 13,
    lineHeight: 20,
    color: '#6B7280',
  },

  termsLink: {
    color: PRIMARY,
    fontWeight: '600',
  },

  button: {
    width: '100%',
    minHeight: 52,
    borderRadius: 12,
  },

  buttonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
    textAlign: 'center',
  },

  footerText: {
    marginTop: 22,
    paddingHorizontal: 15,
    textAlign: 'center',
    fontSize: 12,
    lineHeight: 18,
    color: '#9CA3AF',
  },

});