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
  Modal,
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

type LegalDocument = 'TERMS' | 'PRIVACY' | null;

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

  const [legalModalVisible, setLegalModalVisible] =
    useState(false);

  const [activeLegalDocument, setActiveLegalDocument] =
    useState<LegalDocument>(null);

  const [registerUser, { loading }] =
    useMutation(REGISTER_USER);

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
      Alert.alert(
        'Name required',
        'Please enter your name.',
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
          result?.message ||
            'Unable to create your account.',
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
      console.error(
        'REGISTER USER ERROR:',
        error,
      );

      const message =
        error?.graphQLErrors?.[0]?.message ||
        error?.message ||
        'Unable to create your account. Please try again.';

      Alert.alert(
        'Registration failed',
        message,
      );
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
    if (loading) {
      return;
    }

    setAcceptedTerms(previous => !previous);
  };

  const openLegalDocument = (
    document: LegalDocument,
  ) => {
    setActiveLegalDocument(document);
    setLegalModalVisible(true);
  };

  const closeLegalDocument = () => {
    setLegalModalVisible(false);
    setActiveLegalDocument(null);
  };

  const getLegalTitle = () => {
    if (activeLegalDocument === 'TERMS') {
      return 'Terms & Conditions';
    }

    if (activeLegalDocument === 'PRIVACY') {
      return 'Privacy Policy';
    }

    return '';
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        style={styles.keyboardContainer}
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
          showsVerticalScrollIndicator={false}
        >
          {/* Back button */}
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
            <Text style={styles.backIcon}>
              ‹
            </Text>
          </TouchableOpacity>

          <View style={styles.header} />

          <View style={styles.card}>
            {/* Full name */}
            <Text style={styles.fieldLabel}>
              Full name
            </Text>

            <TextInput
              style={styles.input}
              placeholder="Your name"
              placeholderTextColor={
                COLORS.textMuted
              }
              value={fullName}
              onChangeText={setFullName}
              autoCapitalize="words"
              autoCorrect={false}
              returnKeyType="done"
              editable={!loading}
            />

            {/* Verified phone */}
            <View style={styles.verifiedRow}>
              {/* 
                Permanent checked checkbox.
                This is a View, not Pressable,
                so the user cannot uncheck it.
              */}
              <View
                style={[
                  styles.checkbox,
                  styles.checkboxSelected,
                ]}
              >
                <Text style={styles.tick}>
                  ✓
                </Text>
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

            {/* Terms / Privacy */}
            <Pressable
              style={styles.termsContainer}
              onPress={toggleTerms}
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
                  <Text style={styles.tick}>
                    ✓
                  </Text>
                )}
              </View>

              <Text style={styles.termsText}>
                I agree to Clavata's{' '}

                <Text
                  style={styles.termsLink}
                  onPress={() =>
                    openLegalDocument('TERMS')
                  }
                >
                  Terms & Conditions
                </Text>

                {' '}and{' '}

                <Text
                  style={styles.termsLink}
                  onPress={() =>
                    openLegalDocument('PRIVACY')
                  }
                >
                  Privacy Policy
                </Text>
              </Text>
            </Pressable>

            {/* Register */}
            <DButton
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

      {/* ================================================== */}
      {/* LEGAL DOCUMENT MODAL */}
      {/* ================================================== */}

      <Modal
        visible={legalModalVisible}
        transparent
        animationType="fade"
        onRequestClose={
          closeLegalDocument
        }
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            {/* Modal Header */}
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>
                {getLegalTitle()}
              </Text>

              <TouchableOpacity
                activeOpacity={0.7}
                onPress={
                  closeLegalDocument
                }
                style={styles.closeButton}
                hitSlop={{
                  top: 10,
                  bottom: 10,
                  left: 10,
                  right: 10,
                }}
              >
                <Text style={styles.closeIcon}>
                  ×
                </Text>
              </TouchableOpacity>
            </View>

            <View
              style={styles.modalDivider}
            />

            {/* Modal Content */}
            <ScrollView
              style={styles.modalScroll}
              contentContainerStyle={
                styles.modalContent
              }
              showsVerticalScrollIndicator={true}
            >
              {activeLegalDocument ===
                'TERMS' && (
                <>
                  <Text
                    style={
                      styles.documentHeading
                    }
                  >
                    Terms & Conditions
                  </Text>

                  <Text
                    style={
                      styles.documentParagraph
                    }
                  >
                    This section should contain
                    the final Terms & Conditions
                    applicable to Clavata Connects
                    Private Limited and the use of
                    the Clavata application.
                  </Text>

                  <Text
                    style={
                      styles.documentSectionTitle
                    }
                  >
                    1. Acceptance of Terms
                  </Text>

                  <Text
                    style={
                      styles.documentParagraph
                    }
                  >
                    By creating an account and
                    using Clavata, users agree to
                    comply with the applicable
                    terms governing use of the
                    platform and its services.
                  </Text>

                  <Text
                    style={
                      styles.documentSectionTitle
                    }
                  >
                    2. Use of the Platform
                  </Text>

                  <Text
                    style={
                      styles.documentParagraph
                    }
                  >
                    Users are responsible for
                    providing accurate information
                    and for maintaining the
                    security of their account.
                  </Text>

                  <Text
                    style={
                      styles.documentSectionTitle
                    }
                  >
                    3. Bookings and Services
                  </Text>

                  <Text
                    style={
                      styles.documentParagraph
                    }
                  >
                    Bookings made through Clavata
                    are subject to the applicable
                    booking, cancellation, payment
                    and service conditions displayed
                    in the application.
                  </Text>

                  <Text
                    style={
                      styles.documentNotice
                    }
                  >
                    Replace this sample content
                    with your company's approved
                    Terms & Conditions before
                    publishing the application.
                  </Text>
                </>
              )}

              {activeLegalDocument ===
                'PRIVACY' && (
                <>
                  <Text
                    style={
                      styles.documentHeading
                    }
                  >
                    Privacy Policy
                  </Text>

                  <Text
                    style={
                      styles.documentParagraph
                    }
                  >
                    This section should contain
                    the final Privacy Policy
                    applicable to Clavata Connects
                    Private Limited and the Clavata
                    application.
                  </Text>

                  <Text
                    style={
                      styles.documentSectionTitle
                    }
                  >
                    1. Information We Collect
                  </Text>

                  <Text
                    style={
                      styles.documentParagraph
                    }
                  >
                    The application may collect
                    information required to create
                    and manage user accounts,
                    provide services, process
                    bookings and communicate with
                    users.
                  </Text>

                  <Text
                    style={
                      styles.documentSectionTitle
                    }
                  >
                    2. Use of Information
                  </Text>

                  <Text
                    style={
                      styles.documentParagraph
                    }
                  >
                    Personal information should
                    only be used for the purposes
                    described in the final Privacy
                    Policy and applicable law.
                  </Text>

                  <Text
                    style={
                      styles.documentSectionTitle
                    }
                  >
                    3. Data Protection
                  </Text>

                  <Text
                    style={
                      styles.documentParagraph
                    }
                  >
                    The final Privacy Policy should
                    explain applicable data
                    protection practices, retention,
                    sharing, security and user
                    rights.
                  </Text>

                  <Text
                    style={
                      styles.documentNotice
                    }
                  >
                    Replace this sample content
                    with your company's approved
                    Privacy Policy before publishing
                    the application.
                  </Text>
                </>
              )}
            </ScrollView>

            {/* Modal Footer */}
            <View style={styles.modalFooter}>
              <TouchableOpacity
                activeOpacity={0.8}
                onPress={
                  closeLegalDocument
                }
                style={styles.modalCloseButton}
              >
                <Text
                  style={
                    styles.modalCloseButtonText
                  }
                >
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

  /*
   * Same checkbox used for BOTH:
   *
   * 1. Verified mobile number
   * 2. Terms & Conditions
   */
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
    backgroundColor: COLORS.themeColor,
    borderColor: COLORS.themeColor,
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
    textDecorationLine: 'underline',
  },

  button: {
    backgroundColor: COLORS.themeColor,
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

  /* ==================================================
     LEGAL MODAL
     ================================================== */

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
    backgroundColor: COLORS.themeColor,
    alignItems: 'center',
    justifyContent: 'center',
  },

  modalCloseButtonText: {
    fontFamily: FONTS.semiBold,
    fontSize: FONT_SIZES.medium,
    fontWeight: '600',
    color: COLORS.background,
    includeFontPadding: false,
  },
});