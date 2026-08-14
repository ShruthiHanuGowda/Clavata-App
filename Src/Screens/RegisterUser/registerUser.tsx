import React, { useState, useCallback } from 'react';
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
  TouchableOpacity,
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { useMutation } from '@apollo/client';
import { DButton } from '../../components';
import { REGISTER_USER } from '../../graphql/queries';
import { useUser } from '../../context/UserContext';
import { markAccountCreated } from '../../utils/authStorage';
import {
  COLORS,
  FONTS,
  FONT_SIZES,
  SPACING,
  RADIUS,
} from '../../constants/constants';

type ActiveRole = 'CUSTOMER' | 'PROVIDER';

export default function RegisterUser() {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const { setCurrentUser } = useUser();

  const phoneNumber = route.params?.phoneNumber;

  const activeRole: ActiveRole =
    route.params?.activeRole || 'CUSTOMER';

  const isProvider = activeRole === 'PROVIDER';

  const [fullName, setFullName] = useState('');
  const [acceptedTerms, setAcceptedTerms] = useState(false);

  const [registerUser, { loading }] = useMutation(REGISTER_USER);

  const handleBack = useCallback(() => {
    if (navigation.canGoBack()) {
      navigation.goBack();
      return;
    }
    navigation.navigate('authScreens');
  }, [navigation]);

  const onRegister = useCallback(async () => {
    const name = fullName.trim();

    if (!name) {
      Alert.alert('Name required', 'Please enter your name.');
      return;
    }

    if (name.length < 2) {
      Alert.alert('Invalid name', 'Please enter a valid name.');
      return;
    }

    if (!acceptedTerms) {
      Alert.alert(
        'Terms & Conditions',
        'Please accept the Terms & Conditions and Privacy Policy.',
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
      const { data } = await registerUser({
        variables: {
          input: {
            phoneNumber,
            fullName: name,
            acceptedTerms,
            activeRole,
          },
        },
      });

      const result = data?.registerUser;

      if (!result?.success) {
        Alert.alert(
          'Registration failed',
          result?.message || 'Unable to create your account.',
        );
        return;
      }

      await markAccountCreated();
      setCurrentUser(result.user);

      if (activeRole === 'CUSTOMER') {
        navigation.reset({
          index: 0,
          routes: [{ name: 'appScreens' }],
        });
        return;
      }

      if (activeRole === 'PROVIDER') {
        navigation.reset({
          index: 0,
          routes: [{ name: 'BecomePartner' }],
        });
        return;
      }
    } catch (error: any) {
      console.error('REGISTER USER ERROR:', error);

      const message =
        error?.graphQLErrors?.[0]?.message ||
        error?.message ||
        'Unable to create your account. Please try again.';

      Alert.alert('Registration failed', message);
    }
  }, [
    fullName,
    acceptedTerms,
    phoneNumber,
    activeRole,
    registerUser,
    setCurrentUser,
    navigation,
  ]);

  const toggleTerms = () => {
    setAcceptedTerms(previous => !previous);
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        style={styles.keyboardContainer}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <TouchableOpacity
            onPress={handleBack}
            style={styles.backButton}
            activeOpacity={0.7}
            hitSlop={{
              top: 10,
              bottom: 10,
              left: 10,
              right: 10,
            }}
          >
            <Text style={styles.backIcon}>‹</Text>
          </TouchableOpacity>

          <View style={styles.header}>
            {/* <Text style={styles.title}>
              {isProvider ? 'Create service provider account' : 'Create your account'}
            </Text> */}

            {/* <Text style={styles.subtitle}>
              {isProvider ? 'Provider' : 'Customer'}
            </Text> */}
          </View>

          <View style={styles.card}>
            <Text style={styles.fieldLabel}>
              Full name
            </Text>

            <TextInput
              style={styles.input}
              placeholder="Your name"
              placeholderTextColor={COLORS.textMuted}
              value={fullName}
              onChangeText={setFullName}
              autoCapitalize="words"
              autoCorrect={false}
              returnKeyType="done"
              editable={!loading}
            />

            <View style={styles.verifiedRow}>
              <View style={styles.verifiedIcon}>
                <Text style={styles.verifiedTick}>✓</Text>
              </View>

              <View style={styles.verifiedContent}>
                <Text style={styles.verifiedLabel}>
                  Mobile number
                </Text>

                <Text style={styles.phoneNumber}>
                  {phoneNumber}
                </Text>
              </View>
            </View>

            <Pressable
              style={styles.termsContainer}
              onPress={toggleTerms}
              disabled={loading}
            >
              <View
                style={[
                  styles.checkbox,
                  acceptedTerms && styles.checkboxSelected,
                ]}
              >
                {acceptedTerms && (
                  <Text style={styles.tick}>✓</Text>
                )}
              </View>

              <Text style={styles.termsText}>
                I agree to Clavata's{' '}
                <Text style={styles.termsLink}>
                  Terms & Conditions
                </Text>
                {' '}and{' '}
                <Text style={styles.termsLink}>
                  Privacy Policy
                </Text>
              </Text>
            </Pressable>

            <DButton
              type="primary"
              style={styles.button}
              disabled={
                loading ||
                !fullName.trim() ||
                !acceptedTerms
              }
              onPress={onRegister}
            >
              <View style={styles.buttonContent}>
                <Text style={styles.buttonText}>
                  {loading
                    ? 'Creating account...'
                    : isProvider
                      ? 'Continue'
                      : 'Create account'}
                </Text>
              </View>
            </DButton>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

RegisterUser.navigationOptions = {
  header: null,
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  keyboardContainer: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: SPACING.xxl,
    paddingTop: SPACING.large,
    paddingBottom: SPACING.xxxl,
  },
  backButton: {
    width: 40,
    height: 40,
    alignItems: 'flex-start',
    justifyContent: 'center',
    marginBottom: SPACING.xxl,
  },
  backIcon: {
    fontFamily: FONTS.regular,
    fontSize: 34,
    lineHeight: 36,
    fontWeight: '300',
    color: COLORS.primary,
    includeFontPadding: false,
  },
  header: {
    marginBottom: SPACING.xxl,
  },
  title: {
    fontFamily: FONTS.semiBold,
    fontSize: 26,
    lineHeight: 32,
    fontWeight: '600',
    color: COLORS.primary,
    letterSpacing: -0.5,
    includeFontPadding: false,
  },
  subtitle: {
    fontFamily: FONTS.regular,
    fontSize: FONT_SIZES.small,
    lineHeight: 20,
    color: COLORS.textSecondary,
    marginTop: 7,
    includeFontPadding: false,
  },
  card: {
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: RADIUS.large,
    padding: SPACING.large,
  },
  fieldLabel: {
    fontFamily: FONTS.semiBold,
    fontSize: FONT_SIZES.small,
    lineHeight: 19,
    fontWeight: '600',
    color: COLORS.primary,
    marginBottom: SPACING.small,
    includeFontPadding: false,
  },
  input: {
    height: 54,
    borderWidth: 1,
    borderColor: COLORS.borderStrong,
    borderRadius: RADIUS.medium,
    paddingHorizontal: 16,
    fontFamily: FONTS.regular,
    fontSize: FONT_SIZES.medium,
    color: COLORS.primary,
    backgroundColor: COLORS.background,
  },
  verifiedRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: SPACING.large,
    paddingTop: SPACING.large,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
  verifiedIcon: {
    width: 32,
    height: 32,
    borderRadius: RADIUS.round,
    borderWidth: 1,
    borderColor: COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: SPACING.medium,
  },
  verifiedTick: {
    fontFamily: FONTS.semiBold,
    fontSize: 15,
    fontWeight: '600',
    color: COLORS.primary,
    includeFontPadding: false,
  },
  verifiedContent: {
    flex: 1,
  },
  verifiedLabel: {
    fontFamily: FONTS.regular,
    fontSize: FONT_SIZES.small,
    lineHeight: 18,
    color: COLORS.textSecondary,
    includeFontPadding: false,
  },
  phoneNumber: {
    fontFamily: FONTS.semiBold,
    fontSize: FONT_SIZES.small,
    lineHeight: 19,
    fontWeight: '600',
    color: COLORS.primary,
    marginTop: 2,
    includeFontPadding: false,
  },
  termsContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginTop: SPACING.xl,
    marginBottom: SPACING.xl,
  },
  checkbox: {
    width: 21,
    height: 21,
    borderWidth: 1.5,
    borderColor: COLORS.borderStrong,
    borderRadius: RADIUS.small,
    marginRight: SPACING.medium,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 1,
  },
  checkboxSelected: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  tick: {
    fontFamily: FONTS.semiBold,
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.background,
    includeFontPadding: false,
  },
  termsText: {
    flex: 1,
    fontFamily: FONTS.regular,
    fontSize: FONT_SIZES.small,
    lineHeight: 19,
    color: COLORS.textSecondary,
    includeFontPadding: false,
  },
  termsLink: {
    fontFamily: FONTS.semiBold,
    fontWeight: '600',
    color: COLORS.primary,
  },
  button: {
    width: '100%',
    height: 52,
    borderRadius: RADIUS.medium,
    padding: 0,
  },
  buttonContent: {
    flex: 1,
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonText: {
    fontFamily: FONTS.semiBold,
    fontSize: FONT_SIZES.medium,
    lineHeight: 20,
    fontWeight: '600',
    color: COLORS.background,
    textAlign: 'center',
    includeFontPadding: false,
  },
});