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

import {
  useMutation,
} from '@apollo/client';

import {
  DButton,
} from '../../components';

import {
  REGISTER_USER,
} from '../../graphql/queries';

import {
  useUser,
} from '../../context/UserContext';

import {
  markAccountCreated,
} from '../../utils/authStorage';

import {
  COLORS,
  FONTS,
  FONT_SIZES,
  SPACING,
  RADIUS,
} from '../../constants/constants';

/* ============================================================
   TYPES
   ============================================================ */

type UserRole =
  | 'CUSTOMER'
  | 'PROVIDER';

type LegalDocument =
  | 'TERMS'
  | 'PRIVACY'
  | null;

type RegisterUserRouteParams = {
  phoneNumber?: string;
  role?: UserRole;
};

/* ============================================================
   COMPONENT
   ============================================================ */

export default function RegisterUser() {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();

  const {
    setCurrentUser,
  } = useUser();

  /* ==========================================================
     ROUTE PARAMETERS
     ========================================================== */

  const routeParams =
    (route.params || {}) as RegisterUserRouteParams;

  const phoneNumber =
    routeParams.phoneNumber;

  /*
   * IMPORTANT
   *
   * There is intentionally NO default role here.
   *
   * If role is missing, we must not silently convert the
   * account into a CUSTOMER account.
   *
   * The expected values are:
   *
   *   CUSTOMER
   *   PROVIDER
   */

  const role =
    routeParams.role;

  const isProvider =
    role === 'PROVIDER';

  /* ==========================================================
     STATE
     ========================================================== */

  const [
    fullName,
    setFullName,
  ] = useState('');

  const [
    acceptedTerms,
    setAcceptedTerms,
  ] = useState(false);

  const [
    legalModalVisible,
    setLegalModalVisible,
  ] = useState(false);

  const [
    activeLegalDocument,
    setActiveLegalDocument,
  ] = useState<LegalDocument>(null);

  /* ==========================================================
     GRAPHQL
     ========================================================== */

  const [
    registerUser,
    {
      loading,
    },
  ] = useMutation(
    REGISTER_USER,
  );

  /* ==========================================================
     SCREEN LOGGING
     ========================================================== */

  useEffect(() => {
    console.log(
      '==========================================',
    );

    console.log(
      'REGISTER USER SCREEN',
    );

    console.log(
      'PHONE:',
      phoneNumber,
    );

    console.log(
      'ROLE:',
      role,
    );

    console.log(
      'IS PROVIDER:',
      isProvider,
    );

    console.log(
      'ROUTE PARAMS:',
      JSON.stringify(
        routeParams,
        null,
        2,
      ),
    );

    console.log(
      '==========================================',
    );
  }, [
    phoneNumber,
    role,
    isProvider,
    routeParams,
  ]);

  /* ==========================================================
     BACK
     ========================================================== */

  const handleBack =
    useCallback(() => {
      if (loading) {
        return;
      }

      if (navigation.canGoBack()) {
        navigation.goBack();
        return;
      }

      navigation.navigate(
        'authScreens',
      );
    }, [
      loading,
      navigation,
    ]);

  /* ==========================================================
     REGISTER USER
     ========================================================== */

  const onRegister =
    useCallback(
      async () => {
        /* ----------------------------------------------------
           PREVENT DOUBLE SUBMISSION
           ---------------------------------------------------- */

        if (loading) {
          console.log(
            'REGISTER USER → REQUEST ALREADY IN PROGRESS',
          );

          return;
        }

        /* ----------------------------------------------------
           NORMALIZE NAME
           ---------------------------------------------------- */

        const name =
          fullName.trim();

        /* ----------------------------------------------------
           VALIDATE NAME
           ---------------------------------------------------- */

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

        /* ----------------------------------------------------
           VALIDATE TERMS
           ---------------------------------------------------- */

        if (!acceptedTerms) {
          Alert.alert(
            'Terms & Conditions',
            'Please accept the Terms & Conditions and Privacy Policy.',
          );

          return;
        }

        /* ----------------------------------------------------
           VALIDATE PHONE
           ---------------------------------------------------- */

        if (!phoneNumber) {
          console.error(
            'REGISTER USER → PHONE NUMBER MISSING',
          );

          Alert.alert(
            'Phone number missing',
            'Please verify your mobile number again.',
          );

          return;
        }

        /* ----------------------------------------------------
           VALIDATE ROLE
           ---------------------------------------------------- */

        if (
          role !== 'CUSTOMER' &&
          role !== 'PROVIDER'
        ) {
          console.error(
            '==========================================',
          );

          console.error(
            'REGISTER USER → INVALID ROLE',
          );

          console.error(
            'ROLE:',
            role,
          );

          console.error(
            'ROUTE PARAMS:',
            JSON.stringify(
              routeParams,
              null,
              2,
            ),
          );

          console.error(
            '==========================================',
          );

          Alert.alert(
            'Registration failed',
            'Account type is missing. Please start registration again.',
          );

          return;
        }

        /* ====================================================
           GRAPHQL VARIABLES
           ==================================================== */

        /*
         * RegisterUserInput:
         *
         *   phoneNumber
         *   fullName
         *   acceptedTerms
         *   role
         *
         * There is intentionally NO:
         *
         *   activeRole
         *   roles
         */

        const variables = {
          input: {
            phoneNumber,
            fullName: name,
            acceptedTerms,
            role,
          },
        };

        console.log(
          '==========================================',
        );

        console.log(
          'REGISTER USER REQUEST',
        );

        console.log(
          'PHONE:',
          phoneNumber,
        );

        console.log(
          'FULL NAME:',
          name,
        );

        console.log(
          'ACCEPTED TERMS:',
          acceptedTerms,
        );

        console.log(
          'ROLE:',
          role,
        );

        console.log(
          'REGISTER USER VARIABLES:',
          JSON.stringify(
            variables,
            null,
            2,
          ),
        );

        console.log(
          '==========================================',
        );

        /* ====================================================
           GRAPHQL REQUEST
           ==================================================== */

        try {
          const {
            data,
          } = await registerUser({
            variables,
          });

          console.log(
            '==========================================',
          );

          console.log(
            'REGISTER USER RESPONSE',
          );

          console.log(
            'REGISTER USER DATA:',
            JSON.stringify(
              data,
              null,
              2,
            ),
          );

          console.log(
            '==========================================',
          );

          const result =
            data?.registerUser;

          /* --------------------------------------------------
             INVALID GRAPHQL RESPONSE
             -------------------------------------------------- */

          if (!result) {
            console.error(
              'REGISTER USER → EMPTY RESPONSE',
            );

            Alert.alert(
              'Registration failed',
              'The server did not return a registration response. Please try again.',
            );

            return;
          }

          /* --------------------------------------------------
             GRAPHQL BUSINESS FAILURE
             -------------------------------------------------- */

          if (!result.success) {
            console.error(
              'REGISTER USER FAILED:',
              result.message,
            );

            Alert.alert(
              'Registration failed',
              result.message ||
                'Unable to create your account.',
            );

            return;
          }

          /* --------------------------------------------------
             SUCCESS BUT USER MISSING
             -------------------------------------------------- */

          if (!result.user) {
            console.error(
              '==========================================',
            );

            console.error(
              'REGISTER USER → SUCCESS BUT USER MISSING',
            );

            console.error(
              'RESPONSE:',
              JSON.stringify(
                result,
                null,
                2,
              ),
            );

            console.error(
              '==========================================',
            );

            Alert.alert(
              'Registration failed',
              'Your account was created, but the user information could not be loaded. Please sign in again.',
            );

            return;
          }

          /* --------------------------------------------------
             BACKEND USER
             -------------------------------------------------- */

          const registeredUser =
            result.user;

          console.log(
            '==========================================',
          );

          console.log(
            'USER CREATED SUCCESSFULLY',
          );

          console.log(
            'USER:',
            JSON.stringify(
              registeredUser,
              null,
              2,
            ),
          );

          console.log(
            'BACKEND ROLE:',
            registeredUser.role,
          );

          console.log(
            'PROVIDER STATUS:',
            registeredUser.providerStatus,
          );

          console.log(
            'SALON ID:',
            registeredUser.salonId,
          );

          console.log(
            '==========================================',
          );

          /* --------------------------------------------------
             VALIDATE BACKEND ROLE
             -------------------------------------------------- */

          if (
            registeredUser.role !== 'CUSTOMER' &&
            registeredUser.role !== 'PROVIDER'
          ) {
            console.error(
              '==========================================',
            );

            console.error(
              'REGISTER USER → INVALID ROLE FROM BACKEND',
            );

            console.error(
              'BACKEND ROLE:',
              registeredUser.role,
            );

            console.error(
              '==========================================',
            );

            Alert.alert(
              'Registration failed',
              'The server returned an invalid account type. Please contact support.',
            );

            return;
          }

          /* --------------------------------------------------
             OPTIONAL SAFETY CHECK
             -------------------------------------------------- */

          /*
           * The role selected during onboarding and the role
           * returned by the backend should always match.
           *
           * If they do not match, we do not silently continue.
           */

          if (
            registeredUser.role !== role
          ) {
            console.error(
              '==========================================',
            );

            console.error(
              'REGISTER USER → ROLE MISMATCH',
            );

            console.error(
              'REQUESTED ROLE:',
              role,
            );

            console.error(
              'BACKEND ROLE:',
              registeredUser.role,
            );

            console.error(
              '==========================================',
            );

            Alert.alert(
              'Registration failed',
              'The account type returned by the server does not match your selection. Please try again.',
            );

            return;
          }

          /* ==================================================
             SAVE AUTH STATE
             ================================================== */

          console.log(
            'REGISTER USER → SAVING AUTH STATE',
          );

          await markAccountCreated();

          /*
           * Backend response is the source of truth.
           *
           * Do not rebuild the user object locally.
           */

          setCurrentUser(
            registeredUser,
          );

          console.log(
            'REGISTER USER → AUTH STATE SAVED',
          );

          /* ==================================================
             CUSTOMER FLOW
             ================================================== */

          if (
            registeredUser.role ===
            'CUSTOMER'
          ) {
            console.log(
              '==========================================',
            );

            console.log(
              'REGISTER FLOW → CUSTOMER APP',
            );

            console.log(
              'NAVIGATION → appScreens',
            );

            console.log(
              '==========================================',
            );

            navigation.reset({
              index: 0,
              routes: [
                {
                  name: 'appScreens',
                },
              ],
            });

            return;
          }

          /* ==================================================
             PROVIDER FLOW
             ================================================== */

          if (
            registeredUser.role ===
            'PROVIDER'
          ) {
            console.log(
              '==========================================',
            );

            console.log(
              'REGISTER FLOW → SERVICE PARTNER',
            );

            console.log(
              'NAVIGATION → BecomePartner',
            );

            console.log(
              '==========================================',
            );

            navigation.reset({
              index: 0,
              routes: [
                {
                  name: 'BecomePartner',
                },
              ],
            });

            return;
          }
        } catch (error: any) {
          console.error(
            '==========================================',
          );

          console.error(
            'REGISTER USER ERROR',
          );

          console.error(
            'ERROR:',
            error,
          );

          console.error(
            'ERROR MESSAGE:',
            error?.message,
          );

          console.error(
            'GRAPHQL ERRORS:',
            JSON.stringify(
              error?.graphQLErrors,
              null,
              2,
            ),
          );

          console.error(
            'NETWORK ERROR:',
            error?.networkError,
          );

          console.error(
            'NETWORK ERROR RESULT:',
            JSON.stringify(
              error?.networkError?.result,
              null,
              2,
            ),
          );

          console.error(
            '==========================================',
          );

          const message =
            error?.graphQLErrors?.[0]
              ?.message ||
            error?.networkError
              ?.result?.errors?.[0]
              ?.message ||
            error?.message ||
            'Unable to create your account. Please try again.';

          Alert.alert(
            'Registration failed',
            message,
          );
        }
      },
      [
        loading,
        fullName,
        acceptedTerms,
        phoneNumber,
        role,
        routeParams,
        registerUser,
        setCurrentUser,
        navigation,
      ],
    );

  /* ==========================================================
     TERMS TOGGLE
     ========================================================== */

  const toggleTerms =
    useCallback(() => {
      if (loading) {
        return;
      }

      setAcceptedTerms(
        previous => !previous,
      );
    }, [
      loading,
    ]);

  /* ==========================================================
     LEGAL DOCUMENT
     ========================================================== */

  const openLegalDocument =
    useCallback(
      (
        document: LegalDocument,
      ) => {
        if (!document) {
          return;
        }

        setActiveLegalDocument(
          document,
        );

        setLegalModalVisible(
          true,
        );
      },
      [],
    );

  const closeLegalDocument =
    useCallback(() => {
      setLegalModalVisible(
        false,
      );

      setActiveLegalDocument(
        null,
      );
    }, []);

  const getLegalTitle =
    useCallback(() => {
      if (
        activeLegalDocument ===
        'TERMS'
      ) {
        return 'Terms & Conditions';
      }

      if (
        activeLegalDocument ===
        'PRIVACY'
      ) {
        return 'Privacy Policy';
      }

      return '';
    }, [
      activeLegalDocument,
    ]);

  /* ==========================================================
     RENDER
     ========================================================== */

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
          {/* ==================================================
             BACK BUTTON
             ================================================== */}

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
            <Text
              style={styles.backIcon}
            >
              ‹
            </Text>
          </TouchableOpacity>

          <View
            style={styles.header}
          />

          {/* ==================================================
             REGISTRATION CARD
             ================================================== */}

          <View style={styles.card}>

            {/* =================================================
               FULL NAME
               ================================================= */}

            <Text
              style={styles.fieldLabel}
            >
              Full name
            </Text>

            <TextInput
              style={styles.input}
              placeholder="Your name"
              placeholderTextColor={
                COLORS.textMuted
              }
              value={fullName}
              onChangeText={
                setFullName
              }
              autoCapitalize="words"
              autoCorrect={false}
              returnKeyType="done"
              editable={!loading}
              maxLength={100}
            />

            {/* =================================================
               VERIFIED MOBILE NUMBER
               ================================================= */}

            <View
              style={
                styles.verifiedRow
              }
            >
              <View
                style={[
                  styles.checkbox,
                  styles.checkboxSelected,
                ]}
              >
                <Text
                  style={styles.tick}
                >
                  ✓
                </Text>
              </View>

              <View
                style={
                  styles.verifiedContent
                }
              >
                <Text
                  style={
                    styles.verifiedLabel
                  }
                >
                  Mobile number
                </Text>

                <Text
                  style={
                    styles.phoneNumber
                  }
                >
                  {phoneNumber ||
                    'Not available'}
                </Text>
              </View>
            </View>

            {/* =================================================
               TERMS AND PRIVACY
               ================================================= */}

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
                    style={
                      styles.tick
                    }
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
                  onPress={() =>
                    openLegalDocument(
                      'TERMS',
                    )
                  }
                >
                  Terms & Conditions
                </Text>

                {' '}and{' '}

                <Text
                  style={
                    styles.termsLink
                  }
                  onPress={() =>
                    openLegalDocument(
                      'PRIVACY',
                    )
                  }
                >
                  Privacy Policy
                </Text>
              </Text>
            </Pressable>

            {/* =================================================
               REGISTER BUTTON
               ================================================= */}

            <DButton
              style={styles.button}
              disabled={
                loading ||
                !fullName.trim() ||
                !acceptedTerms ||
                !phoneNumber ||
                (
                  role !== 'CUSTOMER' &&
                  role !== 'PROVIDER'
                )
              }
              onPress={onRegister}
            >
              <View
                style={
                  styles.buttonContent
                }
              >
                <Text
                  style={
                    styles.buttonText
                  }
                >
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

      {/* ======================================================
         LEGAL DOCUMENT MODAL
         ====================================================== */}

      <Modal
        visible={
          legalModalVisible
        }
        transparent
        animationType="fade"
        onRequestClose={
          closeLegalDocument
        }
      >
        <View
          style={
            styles.modalOverlay
          }
        >
          <View
            style={
              styles.modalContainer
            }
          >
            {/* =================================================
               MODAL HEADER
               ================================================= */}

            <View
              style={
                styles.modalHeader
              }
            >
              <Text
                style={
                  styles.modalTitle
                }
              >
                {getLegalTitle()}
              </Text>

              <TouchableOpacity
                activeOpacity={0.7}
                onPress={
                  closeLegalDocument
                }
                style={
                  styles.closeButton
                }
                hitSlop={{
                  top: 10,
                  bottom: 10,
                  left: 10,
                  right: 10,
                }}
              >
                <Text
                  style={
                    styles.closeIcon
                  }
                >
                  ×
                </Text>
              </TouchableOpacity>
            </View>

            <View
              style={
                styles.modalDivider
              }
            />

            {/* =================================================
               MODAL CONTENT
               ================================================= */}

            <ScrollView
              style={
                styles.modalScroll
              }
              contentContainerStyle={
                styles.modalContent
              }
              showsVerticalScrollIndicator={
                true
              }
            >

              {/* =================================================
                 TERMS
                 ================================================= */}

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
                    This section should
                    contain the final
                    Terms & Conditions
                    applicable to
                    Clavata Connects
                    Private Limited and
                    the use of the
                    Clavata application.
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
                    By creating an account
                    and using Clavata,
                    users agree to comply
                    with the applicable
                    terms governing use
                    of the platform and
                    its services.
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
                    Users are responsible
                    for providing accurate
                    information and for
                    maintaining the
                    security of their
                    account.
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
                    Bookings made through
                    Clavata are subject
                    to the applicable
                    booking, cancellation,
                    payment and service
                    conditions displayed
                    in the application.
                  </Text>

                  <Text
                    style={
                      styles.documentNotice
                    }
                  >
                    Replace this sample
                    content with your
                    company's approved
                    Terms & Conditions
                    before publishing
                    the application.
                  </Text>
                </>
              )}

              {/* =================================================
                 PRIVACY
                 ================================================= */}

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
                    This section should
                    contain the final
                    Privacy Policy
                    applicable to
                    Clavata Connects
                    Private Limited and
                    the Clavata
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
                    The application may
                    collect information
                    required to create
                    and manage user
                    accounts, provide
                    services, process
                    bookings and
                    communicate with
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
                    Personal information
                    should only be used
                    for the purposes
                    described in the
                    final Privacy Policy
                    and applicable law.
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
                    The final Privacy
                    Policy should explain
                    applicable data
                    protection practices,
                    retention, sharing,
                    security and user
                    rights.
                  </Text>

                  <Text
                    style={
                      styles.documentNotice
                    }
                  >
                    Replace this sample
                    content with your
                    company's approved
                    Privacy Policy before
                    publishing the
                    application.
                  </Text>
                </>
              )}

            </ScrollView>

            {/* =================================================
               MODAL FOOTER
               ================================================= */}

            <View
              style={
                styles.modalFooter
              }
            >
              <TouchableOpacity
                activeOpacity={0.8}
                onPress={
                  closeLegalDocument
                }
                style={
                  styles.modalCloseButton
                }
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

/* ============================================================
   NAVIGATION OPTIONS
   ============================================================ */

RegisterUser.navigationOptions = {
  header: null,
};

/* ============================================================
   STYLES
   ============================================================ */

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor:
      COLORS.background,
  },

  keyboardContainer: {
    flex: 1,
  },

  scrollContent: {
    flexGrow: 1,
    paddingHorizontal:
      SPACING.xxl,
    paddingTop:
      SPACING.large,
    paddingBottom:
      SPACING.xxxl,
  },

  /* ==========================================================
     BACK
     ========================================================== */

  backButton: {
    width: 40,
    height: 40,
    alignItems:
      'flex-start',
    justifyContent:
      'center',
    marginBottom:
      SPACING.xxl,
  },

  backIcon: {
    fontFamily:
      FONTS.regular,
    fontSize: 34,
    lineHeight: 36,
    fontWeight: '300',
    color:
      COLORS.primary,
    includeFontPadding: false,
  },

  header: {
    marginBottom:
      SPACING.xxl,
  },

  /* ==========================================================
     CARD
     ========================================================== */

  card: {
    backgroundColor:
      COLORS.surface,
    borderWidth: 1,
    borderColor:
      COLORS.border,
    borderRadius:
      RADIUS.large,
    padding:
      SPACING.large,
  },

  /* ==========================================================
     NAME
     ========================================================== */

  fieldLabel: {
    fontFamily:
      FONTS.semiBold,
    fontSize:
      FONT_SIZES.small,
    lineHeight: 19,
    fontWeight: '600',
    color:
      COLORS.primary,
    marginBottom:
      SPACING.small,
    includeFontPadding: false,
  },

  input: {
    height: 54,
    borderWidth: 1,
    borderColor:
      COLORS.borderStrong,
    borderRadius:
      RADIUS.medium,
    paddingHorizontal: 16,
    fontFamily:
      FONTS.regular,
    fontSize:
      FONT_SIZES.medium,
    color:
      COLORS.primary,
    backgroundColor:
      COLORS.background,
  },

  /* ==========================================================
     VERIFIED PHONE
     ========================================================== */

  verifiedRow: {
    flexDirection:
      'row',
    alignItems:
      'center',
    marginTop:
      SPACING.large,
    paddingTop:
      SPACING.large,
    borderTopWidth: 1,
    borderTopColor:
      COLORS.border,
  },

  verifiedContent: {
    flex: 1,
  },

  verifiedLabel: {
    fontFamily:
      FONTS.regular,
    fontSize:
      FONT_SIZES.small,
    lineHeight: 18,
    color:
      COLORS.textSecondary,
    includeFontPadding: false,
  },

  phoneNumber: {
    fontFamily:
      FONTS.semiBold,
    fontSize:
      FONT_SIZES.small,
    lineHeight: 19,
    fontWeight: '600',
    color:
      COLORS.primary,
    marginTop: 2,
    includeFontPadding: false,
  },

  /* ==========================================================
     TERMS
     ========================================================== */

  termsContainer: {
    flexDirection:
      'row',
    alignItems:
      'flex-start',
    marginTop:
      SPACING.xl,
    marginBottom:
      SPACING.xl,
  },

  checkbox: {
    width: 21,
    height: 21,
    borderWidth: 1.5,
    borderColor:
      COLORS.borderStrong,
    borderRadius:
      RADIUS.small,
    marginRight:
      SPACING.medium,
    alignItems:
      'center',
    justifyContent:
      'center',
    marginTop: 1,
  },

  checkboxSelected: {
    backgroundColor:
      COLORS.themeColor,
    borderColor:
      COLORS.themeColor,
  },

  tick: {
    fontFamily:
      FONTS.semiBold,
    fontSize: 13,
    fontWeight: '600',
    color:
      COLORS.background,
    includeFontPadding: false,
  },

  termsText: {
    flex: 1,
    fontFamily:
      FONTS.regular,
    fontSize:
      FONT_SIZES.small,
    lineHeight: 19,
    color:
      COLORS.textSecondary,
    includeFontPadding: false,
  },

  termsLink: {
    fontFamily:
      FONTS.semiBold,
    fontWeight: '600',
    color:
      COLORS.primary,
    textDecorationLine:
      'underline',
  },

  /* ==========================================================
     BUTTON
     ========================================================== */

  button: {
    backgroundColor:
      COLORS.themeColor,
    width: '100%',
    height: 52,
    borderRadius:
      RADIUS.medium,
    padding: 0,
  },

  buttonContent: {
    flex: 1,
    width: '100%',
    alignItems:
      'center',
    justifyContent:
      'center',
  },

  buttonText: {
    fontFamily:
      FONTS.semiBold,
    fontSize:
      FONT_SIZES.medium,
    lineHeight: 20,
    fontWeight: '600',
    color:
      COLORS.background,
    textAlign:
      'center',
    includeFontPadding: false,
  },

  /* ==========================================================
     LEGAL MODAL
     ========================================================== */

  modalOverlay: {
    flex: 1,
    backgroundColor:
      'rgba(0, 0, 0, 0.50)',
    alignItems:
      'center',
    justifyContent:
      'center',
    paddingHorizontal: 20,
    paddingVertical: 40,
  },

  modalContainer: {
    width: '100%',
    maxHeight: '85%',
    backgroundColor:
      COLORS.surface,
    borderRadius:
      RADIUS.large,
    overflow:
      'hidden',
  },

  modalHeader: {
    minHeight: 62,
    paddingHorizontal: 20,
    flexDirection:
      'row',
    alignItems:
      'center',
    justifyContent:
      'space-between',
  },

  modalTitle: {
    flex: 1,
    fontFamily:
      FONTS.semiBold,
    fontSize: 19,
    lineHeight: 24,
    fontWeight: '600',
    color:
      COLORS.primary,
    includeFontPadding: false,
  },

  closeButton: {
    width: 38,
    height: 38,
    alignItems:
      'center',
    justifyContent:
      'center',
    borderRadius:
      RADIUS.round,
    backgroundColor:
      COLORS.background,
    marginLeft: 12,
  },

  closeIcon: {
    fontFamily:
      FONTS.regular,
    fontSize: 27,
    lineHeight: 29,
    color:
      COLORS.text,
    fontWeight: '300',
    includeFontPadding: false,
  },

  modalDivider: {
    height: 1,
    backgroundColor:
      COLORS.border,
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
    fontFamily:
      FONTS.semiBold,
    fontSize: 18,
    lineHeight: 24,
    fontWeight: '600',
    color:
      COLORS.primary,
    marginBottom: 14,
    includeFontPadding: false,
  },

  documentSectionTitle: {
    fontFamily:
      FONTS.semiBold,
    fontSize:
      FONT_SIZES.medium,
    lineHeight: 22,
    fontWeight: '600',
    color:
      COLORS.primary,
    marginTop: 20,
    marginBottom: 8,
    includeFontPadding: false,
  },

  documentParagraph: {
    fontFamily:
      FONTS.regular,
    fontSize:
      FONT_SIZES.small,
    lineHeight: 21,
    color:
      COLORS.text,
    includeFontPadding: false,
  },

  documentNotice: {
    fontFamily:
      FONTS.medium,
    fontSize:
      FONT_SIZES.small,
    lineHeight: 20,
    color:
      COLORS.textSecondary,
    backgroundColor:
      COLORS.background,
    borderRadius:
      RADIUS.medium,
    padding: 14,
    marginTop: 24,
  },

  modalFooter: {
    borderTopWidth: 1,
    borderTopColor:
      COLORS.border,
    padding: 16,
  },

  modalCloseButton: {
    width: '100%',
    height: 48,
    borderRadius:
      RADIUS.medium,
    backgroundColor:
      COLORS.themeColor,
    alignItems:
      'center',
    justifyContent:
      'center',
  },

  modalCloseButtonText: {
    fontFamily:
      FONTS.semiBold,
    fontSize:
      FONT_SIZES.medium,
    fontWeight: '600',
    color:
      COLORS.background,
    includeFontPadding: false,
  },
});