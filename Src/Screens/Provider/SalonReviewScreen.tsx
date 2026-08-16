import React, { useCallback, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

import { gql, useMutation } from '@apollo/client';

import { Header, DButton } from '../../components';

import { useSalonRegistration } from '../../context/SalonRegistrationContext';

import {
  COLORS,
  FONTS,
  SPACING,
  RADIUS,
} from '../../constants/constants';

// ============================================================
// GRAPHQL MUTATION
// ============================================================

const REGISTER_SALON_PARTNER = gql`
  mutation RegisterSalonPartner(
    $input: RegisterSalonPartnerInput!
  ) {
    registerSalonPartner(input: $input) {
      success
      message
      salonId
    }
  }
`;

// ============================================================
// TYPES
// ============================================================

type RegisterSalonPartnerResponse = {
  registerSalonPartner: {
    success: boolean;
    message: string;
    salonId: string;
  };
};

type RegisterSalonPartnerVariables = {
  input: {
    userId: string;
    phoneNumber: string;
    salonName: string;
    ownerName: string;
    email: string;
    businessType: string;

    address: {
      addressLine: string;
      city: string;
      state: string;
      pincode: string;
    };

    businessHours: Record<
      string,
      {
        isOpen: boolean;
        open?: string;
        close?: string;
      }
    >;

    gstNumber?: string;
    panNumber?: string;
    aadhaarNumber?: string;
    bankAccount?: string;
    ifsc?: string;
  };
};

// ============================================================
// SCREEN
// ============================================================

export default function SalonReviewScreen({
  navigation,
}: any) {
  const { data } = useSalonRegistration();

  const [submitting, setSubmitting] =
    useState(false);

  // ==========================================================
  // GRAPHQL
  // ==========================================================

  const [
    registerSalonPartner,
  ] = useMutation<
    RegisterSalonPartnerResponse,
    RegisterSalonPartnerVariables
  >(REGISTER_SALON_PARTNER);

  // ==========================================================
  // SUBMIT REGISTRATION
  // ==========================================================

  const handleSubmit = useCallback(() => {
    // --------------------------------------------------------
    // BASIC VALIDATION
    // --------------------------------------------------------

    if (!data.userId?.trim()) {
      Alert.alert(
        'Registration Error',
        'User information is missing. Please sign in again.',
      );
      return;
    }

    if (!data.phoneNumber?.trim()) {
      Alert.alert(
        'Registration Error',
        'Phone number is missing.',
      );
      return;
    }

    if (!data.salonName?.trim()) {
      Alert.alert(
        'Missing Information',
        'Salon name is missing.',
      );
      return;
    }

    if (!data.ownerName?.trim()) {
      Alert.alert(
        'Missing Information',
        'Owner name is missing.',
      );
      return;
    }

    if (!data.email?.trim()) {
      Alert.alert(
        'Missing Information',
        'Email address is missing.',
      );
      return;
    }

    if (!data.addressLine?.trim()) {
      Alert.alert(
        'Missing Information',
        'Salon address is missing.',
      );
      return;
    }

    if (!data.city?.trim()) {
      Alert.alert(
        'Missing Information',
        'City is missing.',
      );
      return;
    }

    if (!data.state?.trim()) {
      Alert.alert(
        'Missing Information',
        'State is missing.',
      );
      return;
    }

    if (!/^\d{6}$/.test(data.pincode?.trim() || '')) {
      Alert.alert(
        'Invalid Pincode',
        'Please provide a valid 6-digit pincode.',
      );
      return;
    }

    if (
      data.latitude == null ||
      data.longitude == null
    ) {
      Alert.alert(
        'Location Missing',
        'Please go back and confirm your salon location.',
      );
      return;
    }

    if (!data.businessType?.trim()) {
      Alert.alert(
        'Missing Information',
        'Business type is missing.',
      );
      return;
    }

    if (
      !data.businessHours ||
      Object.keys(data.businessHours).length === 0
    ) {
      Alert.alert(
        'Missing Information',
        'Business hours are missing.',
      );
      return;
    }

    // --------------------------------------------------------
    // CONFIRMATION
    // --------------------------------------------------------

    Alert.alert(
      'Submit Registration?',
      'Your salon registration will be submitted for verification. You will not be able to access the salon dashboard until your application is approved.',
      [
        {
          text: 'Go Back',
          style: 'cancel',
        },
        {
          text: 'Submit',
          onPress: submitRegistration,
        },
      ],
    );
  }, [data]);

  // ==========================================================
  // ACTUAL SUBMISSION
  // ==========================================================

  const submitRegistration = useCallback(async () => {
    if (submitting) {
      return;
    }

    try {
      setSubmitting(true);

      // ======================================================
      // BUILD GRAPHQL INPUT
      // ======================================================

      const input = {
        userId:
          data.userId.trim(),

        phoneNumber:
          data.phoneNumber.trim(),

        salonName:
          data.salonName.trim(),

        ownerName:
          data.ownerName.trim(),

        email:
          data.email.trim(),

        businessType:
          data.businessType.trim(),

        // IMPORTANT:
        // Your Lambda expects an `address` object.
        address: {
          addressLine:
            data.addressLine.trim(),

          city:
            data.city.trim(),

          state:
            data.state.trim(),

          pincode:
            data.pincode.trim(),
        },

        businessHours:
          data.businessHours,

        gstNumber:
          data.gstNumber?.trim() || '',

        panNumber:
          data.panNumber?.trim() || '',

        aadhaarNumber:
          data.aadhaarNumber?.trim() || '',

        bankAccount:
          data.bankAccount?.trim() || '',

        ifsc:
          data.ifsc?.trim() || '',
      };

      // ======================================================
      // DEBUG
      // ======================================================

      console.log(
        '==========================================',
      );

      console.log(
        'SUBMITTING SALON REGISTRATION',
      );

      console.log(
        '==========================================',
      );

      console.log(
        'USER ID:',
        input.userId,
      );

      console.log(
        'PHONE:',
        input.phoneNumber,
      );

      console.log(
        'SALON:',
        input.salonName,
      );

      console.log(
        'OWNER:',
        input.ownerName,
      );

      console.log(
        'EMAIL:',
        input.email,
      );

      console.log(
        'BUSINESS TYPE:',
        input.businessType,
      );

      console.log(
        'ADDRESS:',
        JSON.stringify(
          input.address,
          null,
          2,
        ),
      );

      console.log(
        'BUSINESS HOURS:',
        JSON.stringify(
          input.businessHours,
          null,
          2,
        ),
      );

      console.log(
        '==========================================',
      );

      // ======================================================
      // GRAPHQL MUTATION
      // ======================================================

      const response =
        await registerSalonPartner({
          variables: {
            input,
          },
        });

      // ======================================================
      // GRAPHQL RESPONSE
      // ======================================================

      const result =
        response.data
          ?.registerSalonPartner;

      console.log(
        'REGISTER SALON RESPONSE:',
        JSON.stringify(
          result,
          null,
          2,
        ),
      );

      // ======================================================
      // NO RESPONSE
      // ======================================================

      if (!result) {
        throw new Error(
          'No response received from the server.',
        );
      }

      // ======================================================
      // FAILED
      // ======================================================

      if (
        result.success !== true
      ) {
        Alert.alert(
          'Registration Failed',
          result.message ||
          'Unable to submit salon registration.',
        );

        return;
      }

      // ======================================================
      // SUCCESS
      // ======================================================

      console.log(
        '==========================================',
      );

      console.log(
        'SALON REGISTRATION SUCCESSFUL',
      );

      console.log(
        'SALON ID:',
        result.salonId,
      );

      console.log(
        'MESSAGE:',
        result.message,
      );

      console.log(
        '==========================================',
      );

      // ======================================================
      // NAVIGATE TO SUCCESS
      // ======================================================

      navigation.replace(
        'SalonSuccess',
        {
          salonId:
            result.salonId,
          message:
            result.message,
        },
      );
    } catch (error: any) {
      console.error(
        '==========================================',
      );

      console.error(
        'SALON REGISTRATION ERROR:',
      );

      console.error(
        error,
      );

      console.error(
        '==========================================',
      );

      let message =
        'We could not submit your salon registration. Please try again.';

      // ------------------------------------------------------
      // APOLLO ERROR
      // ------------------------------------------------------

      if (
        error?.graphQLErrors?.length
      ) {
        message =
          error.graphQLErrors[0]
            ?.message ||
          message;
      }

      // ------------------------------------------------------
      // NETWORK ERROR
      // ------------------------------------------------------

      else if (
        error?.networkError
      ) {
        message =
          'Unable to connect to the server. Please check your internet connection and try again.';
      }

      // ------------------------------------------------------
      // NORMAL ERROR
      // ------------------------------------------------------

      else if (
        error?.message
      ) {
        message =
          error.message;
      }

      Alert.alert(
        'Registration Failed',
        message,
      );
    } finally {
      setSubmitting(false);
    }
  }, [
    data,
    navigation,
    registerSalonPartner,
    submitting,
  ]);

  // ==========================================================
  // EDIT SECTION
  // ==========================================================

  const handleEditAddress = () => {
    navigation.navigate(
      'SalonAddress',
    );
  };

  const handleEditBusinessHours = () => {
    navigation.navigate(
      'SalonBusinessHours',
    );
  };

  const handleEditKYC = () => {
    navigation.navigate(
      'SalonKYC',
    );
  };

  // ==========================================================
  // BUSINESS HOURS
  // ==========================================================

  const dayLabels: Record<
    string,
    string
  > = {
    MONDAY: 'Monday',
    TUESDAY: 'Tuesday',
    WEDNESDAY: 'Wednesday',
    THURSDAY: 'Thursday',
    FRIDAY: 'Friday',
    SATURDAY: 'Saturday',
    SUNDAY: 'Sunday',
  };

  // ==========================================================
  // RENDER
  // ==========================================================

  return (
    <SafeAreaView
      style={styles.container}
    >
      <Header
        headerTitle="Review Registration"
      />

      <ScrollView
        contentContainerStyle={
          styles.content
        }
        showsVerticalScrollIndicator={
          false
        }
      >
        {/* ==================================================
            HEADER
        ================================================== */}

        <View
          style={styles.headerSection}
        >
          <Text
            style={styles.title}
          >
            Review your application
          </Text>

          <Text
            style={styles.subtitle}
          >
            Please check all your information carefully
            before submitting your salon for verification.
          </Text>
        </View>

        {/* ==================================================
            BASIC INFORMATION
        ================================================== */}

        <View
          style={styles.section}
        >
          <View
            style={styles.sectionHeader}
          >
            <View>
              <Text
                style={styles.sectionTitle}
              >
                Salon information
              </Text>

              <Text
                style={styles.sectionSubtitle}
              >
                Your business details
              </Text>
            </View>
          </View>

          <InfoRow
            label="Salon name"
            value={data.salonName}
          />

          <InfoRow
            label="Owner name"
            value={data.ownerName}
          />

          <InfoRow
            label="Email"
            value={data.email}
          />

          <InfoRow
            label="Phone"
            value={data.phoneNumber}
          />

          <InfoRow
            label="Business type"
            value={data.businessType}
          />
        </View>

        {/* ==================================================
            ADDRESS
        ================================================== */}

        <View
          style={styles.section}
        >
          <View
            style={styles.sectionHeader}
          >
            <View
              style={
                styles.sectionHeaderText
              }
            >
              <Text
                style={styles.sectionTitle}
              >
                Salon address
              </Text>

              <Text
                style={styles.sectionSubtitle}
              >
                Registered salon location
              </Text>
            </View>

            <TouchableOpacity
              onPress={
                handleEditAddress
              }
              activeOpacity={0.7}
            >
              <Text
                style={styles.editText}
              >
                Edit
              </Text>
            </TouchableOpacity>
          </View>

          <InfoRow
            label="Address"
            value={data.addressLine}
          />

          <InfoRow
            label="City"
            value={data.city}
          />

          <InfoRow
            label="State"
            value={data.state}
          />

          <InfoRow
            label="Pincode"
            value={data.pincode}
          />

          {data.latitude != null &&
            data.longitude != null && (
              <View
                style={
                  styles.locationCard
                }
              >
                <Text
                  style={
                    styles.locationTitle
                  }
                >
                  ✓ Location confirmed
                </Text>

                <Text
                  style={
                    styles.locationText
                  }
                >
                  Latitude:{' '}
                  {Number(
                    data.latitude,
                  ).toFixed(6)}
                </Text>

                <Text
                  style={
                    styles.locationText
                  }
                >
                  Longitude:{' '}
                  {Number(
                    data.longitude,
                  ).toFixed(6)}
                </Text>
              </View>
            )}
        </View>

        {/* ==================================================
            BUSINESS HOURS
        ================================================== */}

        <View
          style={styles.section}
        >
          <View
            style={styles.sectionHeader}
          >
            <View
              style={
                styles.sectionHeaderText
              }
            >
              <Text
                style={styles.sectionTitle}
              >
                Business hours
              </Text>

              <Text
                style={styles.sectionSubtitle}
              >
                Your salon operating hours
              </Text>
            </View>

            <TouchableOpacity
              onPress={
                handleEditBusinessHours
              }
              activeOpacity={0.7}
            >
              <Text
                style={styles.editText}
              >
                Edit
              </Text>
            </TouchableOpacity>
          </View>

          {Object.entries(
            data.businessHours || {},
          ).map(
            ([day, hours]: [
              string,
              any,
            ]) => (
              <View
                key={day}
                style={
                  styles.businessHourRow
                }
              >
                <Text
                  style={
                    styles.businessDay
                  }
                >
                  {dayLabels[day] ||
                    day}
                </Text>

                {hours?.isOpen ? (
                  <Text
                    style={
                      styles.businessTime
                    }
                  >
                    {hours.open} -{' '}
                    {hours.close}
                  </Text>
                ) : (
                  <Text
                    style={
                      styles.closedText
                    }
                  >
                    Closed
                  </Text>
                )}
              </View>
            ),
          )}
        </View>

        {/* ==================================================
            KYC
        ================================================== */}

        <View
          style={styles.section}
        >
          <View
            style={styles.sectionHeader}
          >
            <View
              style={
                styles.sectionHeaderText
              }
            >
              <Text
                style={styles.sectionTitle}
              >
                KYC information
              </Text>

              <Text
                style={styles.sectionSubtitle}
              >
                Verification information
              </Text>
            </View>

            <TouchableOpacity
              onPress={
                handleEditKYC
              }
              activeOpacity={0.7}
            >
              <Text
                style={styles.editText}
              >
                Edit
              </Text>
            </TouchableOpacity>
          </View>

          <KYCRow
            label="PAN"
            value={data.panNumber}
          />

          <KYCRow
            label="Aadhaar"
            value={
              data.aadhaarNumber
            }
          />

          <KYCRow
            label="GST"
            value={
              data.gstNumber
                ? data.gstNumber
                : 'Not provided'
            }
          />

          <KYCRow
            label="Bank account"
            value={
              data.bankAccount
                ? maskAccount(
                  data.bankAccount,
                )
                : 'Not provided'
            }
          />

          <KYCRow
            label="IFSC"
            value={
              data.ifsc
                ? data.ifsc
                : 'Not provided'
            }
          />

          <View
            style={styles.kycNotice}
          >
            <Text
              style={
                styles.kycNoticeTitle
              }
            >
              KYC verification
            </Text>

            <Text
              style={
                styles.kycNoticeText
              }
            >
              Your KYC information will be verified
              before your salon can become active.
            </Text>
          </View>
        </View>

        {/* ==================================================
            VERIFICATION PROCESS
        ================================================== */}

        <View
          style={
            styles.verificationCard
          }
        >
          <Text
            style={
              styles.verificationTitle
            }
          >
            What happens next?
          </Text>

          <Step
            number="1"
            title="Submit application"
            description="Your salon information will be securely submitted."
          />

          <Step
            number="2"
            title="KYC verification"
            description="Your submitted KYC details and documents will be verified."
          />

          <Step
            number="3"
            title="Salon verification"
            description="Our verification process will review your salon registration."
          />

          <Step
            number="4"
            title="Dashboard access"
            description="Once approved, your salon dashboard will become available."
            last
          />
        </View>

        {/* ==================================================
            IMPORTANT NOTICE
        ================================================== */}

        <View
          style={styles.warningCard}
        >
          <Text
            style={styles.warningTitle}
          >
            Before you submit
          </Text>

          <Text
            style={styles.warningText}
          >
            Make sure your salon name, address, business
            details and KYC information are correct. Incorrect
            information may delay verification.
          </Text>
        </View>

        {/* ==================================================
            SUBMIT
        ================================================== */}

        <DButton
          type="primary"
          style={styles.submitButton}
          onPress={handleSubmit}
          disabled={submitting}
        >
          {submitting ? (
            <ActivityIndicator
              color={COLORS.white}
            />
          ) : (
            <Text
              style={styles.submitText}
            >
              Submit for Verification
            </Text>
          )}
        </DButton>

        <Text
          style={styles.bottomText}
        >
          By submitting, you confirm that the information
          provided is accurate.
        </Text>
      </ScrollView>
    </SafeAreaView>
  );
}

// ============================================================
// INFO ROW
// ============================================================

function InfoRow({
  label,
  value,
}: {
  label: string;
  value?: string;
}) {
  return (
    <View
      style={styles.infoRow}
    >
      <Text
        style={styles.infoLabel}
      >
        {label}
      </Text>

      <Text
        style={[
          styles.infoValue,
          !value &&
          styles.missingValue,
        ]}
      >
        {value?.trim()
          ? value
          : 'Not provided'}
      </Text>
    </View>
  );
}

// ============================================================
// KYC ROW
// ============================================================

function KYCRow({
  label,
  value,
}: {
  label: string;
  value?: string;
}) {
  const safeValue =
    value?.trim()
      ? value
      : 'Not provided';

  return (
    <View
      style={styles.kycRow}
    >
      <Text
        style={styles.kycLabel}
      >
        {label}
      </Text>

      <Text
        style={[
          styles.kycValue,
          safeValue ===
          'Not provided' &&
          styles.missingValue,
        ]}
      >
        {safeValue}
      </Text>
    </View>
  );
}

// ============================================================
// MASK BANK ACCOUNT
// ============================================================

function maskAccount(
  account: string,
): string {
  const clean =
    account.replace(
      /\s/g,
      '',
    );

  if (clean.length <= 4) {
    return clean;
  }

  return (
    '•••• •••• ' +
    clean.slice(-4)
  );
}

// ============================================================
// VERIFICATION STEP
// ============================================================

function Step({
  number,
  title,
  description,
  last = false,
}: {
  number: string;
  title: string;
  description: string;
  last?: boolean;
}) {
  return (
    <View
      style={
        styles.stepContainer
      }
    >
      <View
        style={styles.stepLeft}
      >
        <View
          style={styles.stepCircle}
        >
          <Text
            style={
              styles.stepNumber
            }
          >
            {number}
          </Text>
        </View>

        {!last && (
          <View
            style={styles.stepLine}
          />
        )}
      </View>

      <View
        style={styles.stepContent}
      >
        <Text
          style={styles.stepTitle}
        >
          {title}
        </Text>

        <Text
          style={
            styles.stepDescription
          }
        >
          {description}
        </Text>
      </View>
    </View>
  );
}

// ============================================================
// STYLES
// ============================================================

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor:
      COLORS.background,
  },

  content: {
    paddingHorizontal:
      SPACING.xxl,

    paddingTop:
      SPACING.xxxl,

    paddingBottom:
      SPACING.huge,
  },

  headerSection: {
    marginBottom:
      SPACING.xxl,
  },

  title: {
    fontFamily:
      FONTS.bold,

    fontSize: 22,

    lineHeight: 28,

    color:
      COLORS.text,

    marginBottom:
      SPACING.small,
  },

  subtitle: {
    fontFamily:
      FONTS.regular,

    fontSize: 14,

    lineHeight: 21,

    color:
      COLORS.textSecondary,
  },

  section: {
    backgroundColor:
      COLORS.surface,

    borderWidth: 1,

    borderColor:
      COLORS.border,

    borderRadius:
      RADIUS.large,

    padding:
      SPACING.large,

    marginBottom:
      SPACING.medium,
  },

  sectionHeader: {
    flexDirection:
      'row',

    alignItems:
      'flex-start',

    justifyContent:
      'space-between',

    marginBottom:
      SPACING.medium,
  },

  sectionHeaderText: {
    flex: 1,
  },

  sectionTitle: {
    fontFamily:
      FONTS.semiBold,

    fontSize: 17,

    color:
      COLORS.text,

    marginBottom: 3,
  },

  sectionSubtitle: {
    fontFamily:
      FONTS.regular,

    fontSize: 12,

    color:
      COLORS.textSecondary,
  },

  editText: {
    fontFamily:
      FONTS.semiBold,

    fontSize: 13,

    color:
      COLORS.primary,

    paddingLeft:
      SPACING.medium,
  },

  infoRow: {
    paddingVertical:
      SPACING.small,

    borderBottomWidth: 1,

    borderBottomColor:
      COLORS.border,
  },

  infoLabel: {
    fontFamily:
      FONTS.regular,

    fontSize: 11,

    color:
      COLORS.textMuted,

    marginBottom: 3,
  },

  infoValue: {
    fontFamily:
      FONTS.semiBold,

    fontSize: 14,

    lineHeight: 20,

    color:
      COLORS.text,
  },

  missingValue: {
    color:
      COLORS.textMuted,
  },

  locationCard: {
    marginTop:
      SPACING.medium,

    padding:
      SPACING.medium,

    borderRadius:
      RADIUS.medium,

    backgroundColor:
      COLORS.background,

    borderWidth: 1,

    borderColor:
      COLORS.border,
  },

  locationTitle: {
    fontFamily:
      FONTS.semiBold,

    fontSize: 13,

    color:
      COLORS.primary,

    marginBottom: 5,
  },

  locationText: {
    fontFamily:
      FONTS.regular,

    fontSize: 12,

    color:
      COLORS.textSecondary,

    marginTop: 2,
  },

  businessHourRow: {
    flexDirection:
      'row',

    alignItems:
      'center',

    justifyContent:
      'space-between',

    paddingVertical:
      SPACING.small,

    borderBottomWidth: 1,

    borderBottomColor:
      COLORS.border,
  },

  businessDay: {
    fontFamily:
      FONTS.semiBold,

    fontSize: 13,

    color:
      COLORS.text,
  },

  businessTime: {
    fontFamily:
      FONTS.regular,

    fontSize: 13,

    color:
      COLORS.textSecondary,
  },

  closedText: {
    fontFamily:
      FONTS.semiBold,

    fontSize: 12,

    color:
      COLORS.textMuted,
  },

  kycRow: {
    flexDirection:
      'row',

    alignItems:
      'center',

    justifyContent:
      'space-between',

    paddingVertical:
      SPACING.small,

    borderBottomWidth: 1,

    borderBottomColor:
      COLORS.border,
  },

  kycLabel: {
    fontFamily:
      FONTS.regular,

    fontSize: 13,

    color:
      COLORS.textSecondary,
  },

  kycValue: {
    fontFamily:
      FONTS.semiBold,

    fontSize: 13,

    color:
      COLORS.text,

    maxWidth:
      '60%',

    textAlign:
      'right',
  },

  kycNotice: {
    marginTop:
      SPACING.medium,

    padding:
      SPACING.medium,

    borderRadius:
      RADIUS.medium,

    backgroundColor:
      COLORS.background,

    borderWidth: 1,

    borderColor:
      COLORS.border,
  },

  kycNoticeTitle: {
    fontFamily:
      FONTS.semiBold,

    fontSize: 13,

    color:
      COLORS.text,

    marginBottom: 4,
  },

  kycNoticeText: {
    fontFamily:
      FONTS.regular,

    fontSize: 12,

    lineHeight: 18,

    color:
      COLORS.textSecondary,
  },

  verificationCard: {
    backgroundColor:
      COLORS.surface,

    borderWidth: 1,

    borderColor:
      COLORS.border,

    borderRadius:
      RADIUS.large,

    padding:
      SPACING.large,

    marginBottom:
      SPACING.medium,
  },

  verificationTitle: {
    fontFamily:
      FONTS.semiBold,

    fontSize: 17,

    color:
      COLORS.text,

    marginBottom:
      SPACING.large,
  },

  stepContainer: {
    flexDirection:
      'row',

    minHeight: 70,
  },

  stepLeft: {
    width: 34,

    alignItems:
      'center',
  },

  stepCircle: {
    width: 28,

    height: 28,

    borderRadius:
      RADIUS.round,

    backgroundColor:
      COLORS.black,

    alignItems:
      'center',

    justifyContent:
      'center',

    zIndex: 2,
  },

  stepNumber: {
    color:
      COLORS.white,

    fontFamily:
      FONTS.bold,

    fontSize: 12,
  },

  stepLine: {
    width: 1,

    flex: 1,

    backgroundColor:
      COLORS.border,

    marginTop: -1,
  },

  stepContent: {
    flex: 1,

    paddingLeft:
      SPACING.small,

    paddingBottom:
      SPACING.medium,
  },

  stepTitle: {
    fontFamily:
      FONTS.semiBold,

    fontSize: 14,

    color:
      COLORS.text,

    marginBottom: 3,
  },

  stepDescription: {
    fontFamily:
      FONTS.regular,

    fontSize: 12,

    lineHeight: 17,

    color:
      COLORS.textSecondary,
  },

  warningCard: {
    padding:
      SPACING.large,

    borderRadius:
      RADIUS.large,

    backgroundColor:
      COLORS.surface,

    borderWidth: 1,

    borderColor:
      COLORS.border,

    marginBottom:
      SPACING.large,
  },

  warningTitle: {
    fontFamily:
      FONTS.semiBold,

    fontSize: 14,

    color:
      COLORS.text,

    marginBottom:
      SPACING.small,
  },

  warningText: {
    fontFamily:
      FONTS.regular,

    fontSize: 12,

    lineHeight: 18,

    color:
      COLORS.textSecondary,
  },

  submitButton: {
    width:
      '100%',

    height: 54,

    borderRadius:
      RADIUS.medium,

    marginTop:
      SPACING.small,
  },

  submitText: {
    color:
      COLORS.white,

    fontFamily:
      FONTS.semiBold,

    fontSize: 15,

    textAlign:
      'center',
  },

  bottomText: {
    fontFamily:
      FONTS.regular,

    fontSize: 11,

    lineHeight: 17,

    color:
      COLORS.textMuted,

    textAlign:
      'center',

    marginTop:
      SPACING.medium,
  },
});