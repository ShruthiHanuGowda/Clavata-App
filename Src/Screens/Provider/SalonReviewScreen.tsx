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

import { Header, DButton } from '../../components';

import { useSalonRegistration } from '../../context/SalonRegistrationContext';

import {
  COLORS,
  FONTS,
  SPACING,
  RADIUS,
} from '../../constants/constants';

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
  // SUBMIT REGISTRATION
  // ==========================================================

  const handleSubmit = useCallback(async () => {
    // --------------------------------------------------------
    // BASIC VALIDATION
    // --------------------------------------------------------

    if (!data.salonName.trim()) {
      Alert.alert(
        'Missing Information',
        'Salon name is missing.',
      );
      return;
    }

    if (!data.ownerName.trim()) {
      Alert.alert(
        'Missing Information',
        'Owner name is missing.',
      );
      return;
    }

    if (!data.email.trim()) {
      Alert.alert(
        'Missing Information',
        'Email address is missing.',
      );
      return;
    }

    if (!data.addressLine.trim()) {
      Alert.alert(
        'Missing Information',
        'Salon address is missing.',
      );
      return;
    }

    if (!data.city.trim()) {
      Alert.alert(
        'Missing Information',
        'City is missing.',
      );
      return;
    }

    if (!data.state.trim()) {
      Alert.alert(
        'Missing Information',
        'State is missing.',
      );
      return;
    }

    if (!/^\d{6}$/.test(data.pincode.trim())) {
      Alert.alert(
        'Invalid Pincode',
        'Please provide a valid 6-digit pincode.',
      );
      return;
    }

    if (
      data.latitude === undefined ||
      data.longitude === undefined
    ) {
      Alert.alert(
        'Location Missing',
        'Please go back and confirm your salon location.',
      );
      return;
    }

    if (!data.businessType.trim()) {
      Alert.alert(
        'Missing Information',
        'Business type is missing.',
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
    try {
      setSubmitting(true);

      // ======================================================
      // IMPORTANT
      // ======================================================
      //
      // THIS IS WHERE YOUR GRAPHQL MUTATION WILL GO.
      //
      // Example:
      //
      // await registerSalonPartner({
      //   userId: data.userId,
      //   phoneNumber: data.phoneNumber,
      //   salonName: data.salonName,
      //   ownerName: data.ownerName,
      //   email: data.email,
      //   businessType: data.businessType,
      //   addressLine: data.addressLine,
      //   city: data.city,
      //   state: data.state,
      //   pincode: data.pincode,
      //   latitude: data.latitude,
      //   longitude: data.longitude,
      //   gstNumber: data.gstNumber,
      //   panNumber: data.panNumber,
      //   aadhaarNumber: data.aadhaarNumber,
      //   bankAccount: data.bankAccount,
      //   ifsc: data.ifsc,
      //   businessHours: data.businessHours,
      // });
      //
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
        'SALON:',
        data.salonName,
      );

      console.log(
        'OWNER:',
        data.ownerName,
      );

      console.log(
        'EMAIL:',
        data.email,
      );

      console.log(
        'BUSINESS TYPE:',
        data.businessType,
      );

      console.log(
        'ADDRESS:',
        data.addressLine,
      );

      console.log(
        'CITY:',
        data.city,
      );

      console.log(
        'STATE:',
        data.state,
      );

      console.log(
        'PINCODE:',
        data.pincode,
      );

      console.log(
        'LATITUDE:',
        data.latitude,
      );

      console.log(
        'LONGITUDE:',
        data.longitude,
      );

      console.log(
        'BUSINESS HOURS:',
        data.businessHours,
      );

      console.log(
        '==========================================',
      );

      // ------------------------------------------------------
      // TEMPORARY DEVELOPMENT DELAY
      // ------------------------------------------------------
      //
      // Remove this once your GraphQL registration mutation
      // is connected.
      //

      await new Promise(resolve =>
        setTimeout(resolve, 1000),
      );

      // ------------------------------------------------------
      // SUCCESS
      // ------------------------------------------------------

      navigation.replace(
        'SalonSuccess',
      );
    } catch (error: unknown) {
      console.error(
        'SALON REGISTRATION ERROR:',
        error,
      );

      Alert.alert(
        'Registration Failed',
        'We could not submit your salon registration. Please try again.',
      );
    } finally {
      setSubmitting(false);
    }
  }, [
    data,
    navigation,
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

  const dayLabels: Record<string, string> = {
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
            <View style={styles.sectionHeaderText}>
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
              onPress={handleEditAddress}
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

          {data.latitude !== undefined &&
            data.longitude !== undefined && (
              <View
                style={styles.locationCard}
              >
                <Text
                  style={styles.locationTitle}
                >
                  ✓ Location confirmed
                </Text>

                <Text
                  style={styles.locationText}
                >
                  Latitude: {data.latitude.toFixed(6)}
                </Text>

                <Text
                  style={styles.locationText}
                >
                  Longitude: {data.longitude.toFixed(6)}
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
            <View style={styles.sectionHeaderText}>
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
              onPress={handleEditBusinessHours}
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
            data.businessHours,
          ).map(
            ([
              day,
              hours,
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
                  {
                    dayLabels[
                    day
                    ]
                  }
                </Text>

                {hours.isOpen ? (
                  <Text
                    style={
                      styles.businessTime
                    }
                  >
                    {hours.open} - {hours.close}
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
            <View style={styles.sectionHeaderText}>
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
              onPress={handleEditKYC}
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
            value={data.aadhaarNumber}
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
              style={styles.kycNoticeTitle}
            >
              KYC verification
            </Text>

            <Text
              style={styles.kycNoticeText}
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
          style={styles.verificationCard}
        >
          <Text
            style={styles.verificationTitle}
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
      style={styles.stepContainer}
    >
      <View
        style={styles.stepLeft}
      >
        <View
          style={styles.stepCircle}
        >
          <Text
            style={styles.stepNumber}
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
          style={styles.stepDescription}
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

    maxWidth: '60%',

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