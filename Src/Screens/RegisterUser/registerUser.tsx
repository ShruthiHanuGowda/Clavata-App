import React, {
  useState,
  useCallback,
  useEffect,
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
  TouchableOpacity,
  Modal,
} from 'react-native';

import {
  useNavigation,
  useRoute,
} from '@react-navigation/native';

import { useMutation } from '@apollo/client';

import { DButton } from '../../components';
import AppGradient from '../../common/AppGradient';

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

type UserRole = 'CUSTOMER' | 'PROVIDER';
type LegalDocument = 'TERMS' | 'PRIVACY' | null;

type RegisterUserRouteParams = {
  phoneNumber?: string;
  role?: UserRole;
};

const BUTTON_GRADIENT: [string, ...string[]] = [
  '#C084FC',
  '#A78BFA',
  '#8B5CF6',
];

const BRAND_PURPLE = '#8B5CF6';

export default function RegisterUser() {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();

  const { setCurrentUser } = useUser();

  const routeParams =
    (route.params || {}) as RegisterUserRouteParams;

  const phoneNumber = routeParams.phoneNumber;
  const role = routeParams.role;
  const isProvider = role === 'PROVIDER';

  const [fullName, setFullName] = useState('');
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [legalModalVisible, setLegalModalVisible] = useState(false);
  const [activeLegalDocument, setActiveLegalDocument] =
    useState<LegalDocument>(null);

  const [registerUser, { loading }] = useMutation(REGISTER_USER);

  useEffect(() => {
    console.log('REGISTER USER SCREEN', {
      phoneNumber,
      role,
      isProvider,
      routeParams,
    });
  }, [phoneNumber, role, isProvider]);

  const handleBack = useCallback(() => {
    if (loading) {
      return;
    }

    if (navigation.canGoBack()) {
      navigation.goBack();
      return;
    }

    navigation.navigate('authScreens');
  }, [loading, navigation]);

  const onRegister = useCallback(async () => {
    if (loading) {
      return;
    }

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

    if (role !== 'CUSTOMER' && role !== 'PROVIDER') {
      Alert.alert(
        'Registration failed',
        'Account type is missing. Please start registration again.',
      );
      return;
    }

    const variables = {
      input: {
        phoneNumber,
        fullName: name,
        acceptedTerms,
        role,
      },
    };

    console.log(
      'REGISTER USER VARIABLES:',
      JSON.stringify(variables, null, 2),
    );

    try {
      const { data } = await registerUser({ variables });
      const result = data?.registerUser;

      if (!result) {
        Alert.alert(
          'Registration failed',
          'The server did not return a registration response. Please try again.',
        );
        return;
      }

      if (!result.success) {
        Alert.alert(
          'Registration failed',
          result.message || 'Unable to create your account.',
        );
        return;
      }

      if (!result.user) {
        Alert.alert(
          'Registration failed',
          'Your account was created, but the user information could not be loaded. Please sign in again.',
        );
        return;
      }

      const registeredUser = result.user;

      if (
        registeredUser.role !== 'CUSTOMER' &&
        registeredUser.role !== 'PROVIDER'
      ) {
        Alert.alert(
          'Registration failed',
          'The server returned an invalid account type. Please contact support.',
        );
        return;
      }

      if (registeredUser.role !== role) {
        Alert.alert(
          'Registration failed',
          'The account type returned by the server does not match your selection. Please try again.',
        );
        return;
      }

      await markAccountCreated();
      setCurrentUser(registeredUser);

      if (registeredUser.role === 'CUSTOMER') {
        navigation.reset({
          index: 0,
          routes: [{ name: 'appScreens' }],
        });
        return;
      }

      if (registeredUser.role === 'PROVIDER') {
        navigation.reset({
          index: 0,
          routes: [{ name: 'BecomePartner' }],
        });
      }
    } catch (error: any) {
      console.error('REGISTER USER ERROR:', error);

      const message =
        error?.graphQLErrors?.[0]?.message ||
        error?.networkError?.result?.errors?.[0]?.message ||
        error?.message ||
        'Unable to create your account. Please try again.';

      Alert.alert('Registration failed', message);
    }
  }, [
    loading,
    fullName,
    acceptedTerms,
    phoneNumber,
    role,
    registerUser,
    setCurrentUser,
    navigation,
  ]);

  const toggleTerms = useCallback(() => {
    if (loading) {
      return;
    }

    setAcceptedTerms(previous => !previous);
  }, [loading]);

  const openLegalDocument = useCallback(
    (document: LegalDocument) => {
      if (!document) {
        return;
      }

      setActiveLegalDocument(document);
      setLegalModalVisible(true);
    },
    [],
  );

  const closeLegalDocument = useCallback(() => {
    setLegalModalVisible(false);
    setActiveLegalDocument(null);
  }, []);

  const getLegalTitle = useCallback(() => {
    if (activeLegalDocument === 'TERMS') {
      return 'Terms & Conditions';
    }

    if (activeLegalDocument === 'PRIVACY') {
      return 'Privacy Policy';
    }

    return '';
  }, [activeLegalDocument]);

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
          {/* Back button */}
          <TouchableOpacity
            onPress={handleBack}
            style={styles.backButton}
            activeOpacity={0.7}
            disabled={loading}
            hitSlop={{
              top: 10,
              bottom: 10,
              left: 10,
              right: 10,
            }}
          >
            <Text style={styles.backIcon}>‹</Text>
          </TouchableOpacity>

          <View style={styles.header} />

          <View style={styles.card}>
            {/* Full name */}
            <Text style={styles.fieldLabel}>Full name</Text>

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
              maxLength={100}
            />

            {/* Verified mobile number */}
            <View style={styles.verifiedRow}>
              <View style={[styles.checkbox, styles.checkboxSelected,  { marginRight: 12 },]}>
                <Text style={styles.tick}>✓</Text>
              </View>

              <View style={styles.verifiedContent}>
                <Text style={styles.verifiedLabel}>
                  Mobile number
                </Text>

                <Text style={styles.phoneNumber}>
                  {phoneNumber || 'Not available'}
                </Text>
              </View>
            </View>

            {/* Terms and privacy checkbox */}
            <View style={styles.termsContainer}>
              <Pressable
                onPress={toggleTerms}
                disabled={loading}
                style={styles.checkboxPressable}
                accessibilityRole="checkbox"
                accessibilityState={{ checked: acceptedTerms }}
                accessibilityLabel="Accept Terms and Conditions and Privacy Policy"
                hitSlop={8}
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
              </Pressable>

              <Text style={styles.termsText}>
                I agree to Clavata's{' '}
                <Text
                  style={styles.termsLink}
                  onPress={() => openLegalDocument('TERMS')}
                  suppressHighlighting={false}
                >
                  Terms & Conditions
                </Text>
                {' '}and{' '}
                <Text
                  style={styles.termsLink}
                  onPress={() => openLegalDocument('PRIVACY')}
                  suppressHighlighting={false}
                >
                  Privacy Policy
                </Text>
              </Text>
            </View>

            {/* Gradient registration button */}
            <DButton
              style={styles.button}
              disabled={
                loading ||
                !fullName.trim() ||
                !acceptedTerms ||
                !phoneNumber ||
                (role !== 'CUSTOMER' && role !== 'PROVIDER')
              }
              onPress={onRegister}
            >
              <View style={styles.buttonContent}>
                <AppGradient
                  colors={BUTTON_GRADIENT}
                  style={StyleSheet.absoluteFillObject}
                >
                  <View style={StyleSheet.absoluteFillObject} />
                </AppGradient>

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

      {/* Legal document modal */}
      <Modal
        visible={legalModalVisible}
        transparent
        animationType="fade"
        onRequestClose={closeLegalDocument}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            {/* Modal header */}
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>
                {getLegalTitle()}
              </Text>

              <TouchableOpacity
                activeOpacity={0.7}
                onPress={closeLegalDocument}
                style={styles.closeButton}
                hitSlop={{
                  top: 10,
                  bottom: 10,
                  left: 10,
                  right: 10,
                }}
              >
                <Text style={styles.closeIcon}>×</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.modalDivider} />

            <ScrollView
              style={styles.modalScroll}
              contentContainerStyle={styles.modalContent}
              showsVerticalScrollIndicator
            >
              {activeLegalDocument === 'TERMS' && (
                <>
                  <Text style={styles.documentHeading}>
                    Terms & Conditions
                  </Text>

                  <Text style={styles.documentParagraph}>
                    This section should contain the final Terms &
                    Conditions applicable to Clavata Connects Private
                    Limited and the use of the Clavata application.
                  </Text>

                  <Text style={styles.documentSectionTitle}>
                    1. Acceptance of Terms
                  </Text>

                  <Text style={styles.documentParagraph}>
                    By creating an account and using Clavata, users
                    agree to comply with the applicable terms governing
                    use of the platform and its services.
                  </Text>

                  <Text style={styles.documentSectionTitle}>
                    2. Use of the Platform
                  </Text>

                  <Text style={styles.documentParagraph}>
                    Users are responsible for providing accurate
                    information and for maintaining the security of
                    their account.
                  </Text>

                  <Text style={styles.documentSectionTitle}>
                    3. Bookings and Services
                  </Text>

                  <Text style={styles.documentParagraph}>
                    Bookings made through Clavata are subject to the
                    applicable booking, cancellation, payment and
                    service conditions displayed in the application.
                  </Text>

                  <Text style={styles.documentNotice}>
                    Replace this sample content with your company's
                    approved Terms & Conditions before publishing the
                    application.
                  </Text>
                </>
              )}

              {activeLegalDocument === 'PRIVACY' && (
                <>
                  <Text style={styles.documentHeading}>
                    Privacy Policy
                  </Text>

                  <Text style={styles.documentParagraph}>
                    This section should contain the final Privacy
                    Policy applicable to Clavata Connects Private
                    Limited and the Clavata application.
                  </Text>

                  <Text style={styles.documentSectionTitle}>
                    1. Information We Collect
                  </Text>

                  <Text style={styles.documentParagraph}>
                    The application may collect information required
                    to create and manage user accounts, provide
                    services, process bookings and communicate with
                    users.
                  </Text>

                  <Text style={styles.documentSectionTitle}>
                    2. Use of Information
                  </Text>

                  <Text style={styles.documentParagraph}>
                    Personal information should only be used for the
                    purposes described in the final Privacy Policy and
                    applicable law.
                  </Text>

                  <Text style={styles.documentSectionTitle}>
                    3. Data Protection
                  </Text>

                  <Text style={styles.documentParagraph}>
                    The final Privacy Policy should explain applicable
                    data protection practices, retention, sharing,
                    security and user rights.
                  </Text>

                  <Text style={styles.documentNotice}>
                    Replace this sample content with your company's
                    approved Privacy Policy before publishing the
                    application.
                  </Text>
                </>
              )}
            </ScrollView>

            {/* Modal footer */}
            <View style={styles.modalFooter}>
              <TouchableOpacity
                activeOpacity={0.8}
                onPress={closeLegalDocument}
                style={styles.modalCloseButton}
              >
                <Text style={styles.modalCloseButtonText}>
                  Close
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
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

  /* Back button */

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

  /* Registration card */

  card: {
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: RADIUS.large,
    padding: SPACING.large,
  },

  /* Name */

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

  /* Verified phone */

  verifiedRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: SPACING.large,
    paddingTop: SPACING.large,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
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

  /* Checkbox and legal links */

  termsContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginTop: SPACING.xl,
    marginBottom: SPACING.xl,
  },

  checkboxPressable: {
    marginRight: SPACING.medium,
    marginTop: 1,
  },

  checkbox: {
    width: 22,
    height: 22,
    borderWidth: 1.5,
    borderColor: COLORS.borderStrong,
    borderRadius: 6,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'transparent',
  },

  checkboxSelected: {
    backgroundColor: BRAND_PURPLE,
    borderColor: BRAND_PURPLE,
  },

  tick: {
    fontFamily: FONTS.semiBold,
    fontSize: 14,
    lineHeight: 17,
    fontWeight: '700',
    color: '#FFFFFF',
    includeFontPadding: false,
  },

  termsText: {
    flex: 1,
    fontFamily: FONTS.regular,
    fontSize: FONT_SIZES.small,
    lineHeight: 20,
    color: COLORS.textSecondary,
    includeFontPadding: false,
  },

  termsLink: {
    fontFamily: FONTS.semiBold,
    fontWeight: '600',
    color: BRAND_PURPLE,
    textDecorationLine: 'underline',
  },

  /* Gradient button */

  button: {
    backgroundColor: 'transparent',
    width: '100%',
    height: 52,
    borderRadius: RADIUS.medium,
    padding: 0,
    overflow: 'hidden',
  },

  buttonContent: {
    flex: 1,
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: RADIUS.medium,
    overflow: 'hidden',
  },

  buttonText: {
    fontFamily: FONTS.semiBold,
    fontSize: FONT_SIZES.medium,
    lineHeight: 20,
    fontWeight: '600',
    color: '#FFFFFF',
    textAlign: 'center',
    includeFontPadding: false,
  },

  /* Legal modal */

  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.50)',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 20,
    paddingVertical: 40,
  },

  modalContainer: {
    width: '100%',
    maxHeight: '85%',
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.large,
    overflow: 'hidden',
  },

  modalHeader: {
    minHeight: 62,
    paddingHorizontal: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },

  modalTitle: {
    flex: 1,
    fontFamily: FONTS.semiBold,
    fontSize: 19,
    lineHeight: 24,
    fontWeight: '600',
    color: COLORS.primary,
    includeFontPadding: false,
  },

  closeButton: {
    width: 38,
    height: 38,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: RADIUS.round,
    backgroundColor: COLORS.background,
    marginLeft: 12,
  },

  closeIcon: {
    fontFamily: FONTS.regular,
    fontSize: 27,
    lineHeight: 29,
    color: COLORS.text,
    fontWeight: '300',
    includeFontPadding: false,
  },

  modalDivider: {
    height: 1,
    backgroundColor: COLORS.border,
  },

  modalScroll: {
    flexGrow: 0,
  },

  modalContent: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 24,
  },

  documentHeading: {
    fontFamily: FONTS.semiBold,
    fontSize: 18,
    lineHeight: 24,
    fontWeight: '600',
    color: COLORS.primary,
    marginBottom: 14,
    includeFontPadding: false,
  },

  documentSectionTitle: {
    fontFamily: FONTS.semiBold,
    fontSize: FONT_SIZES.medium,
    lineHeight: 22,
    fontWeight: '600',
    color: COLORS.primary,
    marginTop: 20,
    marginBottom: 8,
    includeFontPadding: false,
  },

  documentParagraph: {
    fontFamily: FONTS.regular,
    fontSize: FONT_SIZES.small,
    lineHeight: 21,
    color: COLORS.text,
    includeFontPadding: false,
  },

  documentNotice: {
    fontFamily: FONTS.medium,
    fontSize: FONT_SIZES.small,
    lineHeight: 20,
    color: COLORS.textSecondary,
    backgroundColor: COLORS.background,
    borderRadius: RADIUS.medium,
    padding: 14,
    marginTop: 24,
  },

  modalFooter: {
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    padding: 16,
  },

  modalCloseButton: {
    width: '100%',
    height: 48,
    borderRadius: RADIUS.medium,
    backgroundColor: BRAND_PURPLE,
    alignItems: 'center',
    justifyContent: 'center',
  },

  modalCloseButtonText: {
    fontFamily: FONTS.semiBold,
    fontSize: FONT_SIZES.medium,
    fontWeight: '600',
    color: '#FFFFFF',
    includeFontPadding: false,
  },
});