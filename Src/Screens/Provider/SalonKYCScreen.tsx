import React, {
  useState,
} from 'react';

import {
  Alert,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  ActivityIndicator,
  View,
} from 'react-native';

import {
  Header,
  DButton,
} from '../../components';

import {
  COLORS,
  FONTS,
  SPACING,
  RADIUS,
} from '../../constants/constants';

import {
  useSalonRegistration,
} from '../../context/SalonRegistrationContext';

// ============================================================
// SCREEN
// ============================================================

export default function SalonKYCScreen({
  navigation,
}: any) {

  const {
    data,
    updateData,
  } = useSalonRegistration();

  // ==========================================================
  // STATE
  // ==========================================================

  const [
    panNumber,
    setPanNumber,
  ] = useState(
    data.panNumber || '',
  );

  const [
    aadhaarNumber,
    setAadhaarNumber,
  ] = useState(
    data.aadhaarNumber || '',
  );

  const [
    gstNumber,
    setGstNumber,
  ] = useState(
    data.gstNumber || '',
  );

  const [
    shopEstablishmentNumber,
    setShopEstablishmentNumber,
  ] = useState(
    data.shopEstablishmentNumber || '',
  );

  const [
    udyamNumber,
    setUdyamNumber,
  ] = useState(
    data.udyamNumber || '',
  );

  const [
    submitting,
    setSubmitting,
  ] = useState(false);

  // ==========================================================
  // CONTINUE
  // ==========================================================

  const handleContinue = async () => {

    // ========================================================
    // CLEAN VALUES
    // ========================================================

    const cleanPAN =
      panNumber
        .trim()
        .toUpperCase();

    const cleanAadhaar =
      aadhaarNumber
        .replace(/\D/g, '');

    const cleanGST =
      gstNumber
        .trim()
        .toUpperCase();

    const cleanShop =
      shopEstablishmentNumber
        .trim();

    const cleanUdyam =
      udyamNumber
        .trim()
        .toUpperCase();

    // ========================================================
    // PAN VALIDATION
    // ========================================================

    if (
      !/^[A-Z]{5}[0-9]{4}[A-Z]$/.test(
        cleanPAN,
      )
    ) {
      Alert.alert(
        'Invalid PAN',
        'Please enter a valid PAN number.',
      );

      return;
    }

    // ========================================================
    // AADHAAR VALIDATION
    // ========================================================

    if (
      !/^\d{12}$/.test(
        cleanAadhaar,
      )
    ) {
      Alert.alert(
        'Invalid Aadhaar',
        'Please enter a valid 12-digit Aadhaar number.',
      );

      return;
    }

    // ========================================================
    // BUSINESS DOCUMENT
    // ========================================================

    if (
      !cleanGST &&
      !cleanShop &&
      !cleanUdyam
    ) {
      Alert.alert(
        'Business verification required',
        'Please provide at least one business registration detail such as GSTIN, Shop & Establishment number, or Udyam number.',
      );

      return;
    }

    try {

      setSubmitting(true);

      // ======================================================
      // DEVELOPMENT REFERENCE
      //
      // This is ONLY a local/mock reference.
      //
      // Later HyperVerge/backend will create the real
      // verification reference.
      // ======================================================

      const referenceId =
        data.kycReferenceId ||
        `DEV-KYC-${Date.now()}`;

      // ======================================================
      // SAVE KYC INFORMATION
      // ======================================================

      updateData({

        panNumber:
          cleanPAN,

        aadhaarNumber:
          cleanAadhaar,

        gstNumber:
          cleanGST,

        shopEstablishmentNumber:
          cleanShop,

        udyamNumber:
          cleanUdyam,

        kycStatus:
          'PENDING',

        kycReferenceId:
          referenceId,

        // We have not actually submitted to provider yet.
        // Keep submission time empty until SalonReview
        // confirms final submission.

        kycSubmittedAt:
          '',

        kycReviewedAt:
          '',

        kycRejectionReason:
          '',

        providerStatus:
          'NOT_REGISTERED',
      });

      // ======================================================
      // SMALL DELAY FOR UI
      // ======================================================

      await new Promise(
        resolve =>
          setTimeout(
            resolve,
            300,
          ),
      );

      // ======================================================
      // GO TO REVIEW
      // ======================================================

      navigation.navigate(
        'SalonReview',
      );

    } catch (error) {

      console.error(
        'KYC CONTINUE ERROR:',
        error,
      );

      Alert.alert(
        'Unable to continue',
        'Something went wrong while saving your KYC information. Please try again.',
      );

    } finally {

      setSubmitting(false);
    }
  };

  // ==========================================================
  // RENDER
  // ==========================================================

  return (
    <SafeAreaView
      style={styles.container}
    >

      <Header
        headerTitle="Salon KYC"
      />

      <ScrollView
        contentContainerStyle={
          styles.content
        }
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={
          false
        }
      >

        {/* ==================================================
            HEADER
        ================================================== */}

        <Text
          style={styles.title}
        >
          Verify your salon
        </Text>

        <Text
          style={styles.subtitle}
        >
          Provide the owner and business information required
          to verify your salon.
        </Text>

        {/* ==================================================
            OWNER VERIFICATION
        ================================================== */}

        <View
          style={styles.section}
        >

          <Text
            style={styles.sectionTitle}
          >
            Owner verification
          </Text>

          <Text
            style={styles.sectionSubtitle}
          >
            These details are used to verify the salon owner.
          </Text>

          {/* PAN */}

          <View
            style={styles.field}
          >

            <Text
              style={styles.label}
            >
              PAN Number
            </Text>

            <TextInput
              style={styles.input}
              placeholder="ABCDE1234F"
              placeholderTextColor={
                COLORS.textMuted
              }
              value={panNumber}
              onChangeText={
                text =>
                  setPanNumber(
                    text
                      .toUpperCase()
                      .replace(
                        /[^A-Z0-9]/g,
                        '',
                      ),
                  )
              }
              maxLength={10}
              autoCapitalize="characters"
              autoCorrect={false}
            />

          </View>

          {/* AADHAAR */}

          <View
            style={styles.field}
          >

            <Text
              style={styles.label}
            >
              Aadhaar Number
            </Text>

            <TextInput
              style={styles.input}
              placeholder="12 digit Aadhaar"
              placeholderTextColor={
                COLORS.textMuted
              }
              value={aadhaarNumber}
              onChangeText={
                text =>
                  setAadhaarNumber(
                    text.replace(
                      /\D/g,
                      '',
                    ),
                  )
              }
              keyboardType="number-pad"
              maxLength={12}
              secureTextEntry
            />

          </View>

        </View>

        {/* ==================================================
            BUSINESS VERIFICATION
        ================================================== */}

        <View
          style={styles.section}
        >

          <Text
            style={styles.sectionTitle}
          >
            Business verification
          </Text>

          <Text
            style={styles.sectionSubtitle}
          >
            Provide whichever business registration details
            apply to your salon.
          </Text>

          {/* GST */}

          <View
            style={styles.field}
          >

            <Text
              style={styles.label}
            >
              GSTIN
            </Text>

            <TextInput
              style={styles.input}
              placeholder="Optional"
              placeholderTextColor={
                COLORS.textMuted
              }
              value={gstNumber}
              onChangeText={
                text =>
                  setGstNumber(
                    text
                      .toUpperCase()
                      .replace(
                        /[^A-Z0-9]/g,
                        '',
                      ),
                  )
              }
              maxLength={15}
              autoCapitalize="characters"
              autoCorrect={false}
            />

          </View>

          {/* SHOP */}

          <View
            style={styles.field}
          >

            <Text
              style={styles.label}
            >
              Shop & Establishment Number
            </Text>

            <TextInput
              style={styles.input}
              placeholder="Optional"
              placeholderTextColor={
                COLORS.textMuted
              }
              value={
                shopEstablishmentNumber
              }
              onChangeText={
                setShopEstablishmentNumber
              }
              autoCapitalize="characters"
              autoCorrect={false}
            />

          </View>

          {/* UDYAM */}

          <View
            style={styles.field}
          >

            <Text
              style={styles.label}
            >
              Udyam Number
            </Text>

            <TextInput
              style={styles.input}
              placeholder="Optional"
              placeholderTextColor={
                COLORS.textMuted
              }
              value={udyamNumber}
              onChangeText={
                setUdyamNumber
              }
              autoCapitalize="characters"
              autoCorrect={false}
            />

          </View>

        </View>

        {/* ==================================================
            INFORMATION
        ================================================== */}

        <View
          style={styles.infoCard}
        >

          <Text
            style={styles.infoTitle}
          >
            What happens next?
          </Text>

          <Text
            style={styles.infoText}
          >
            1. Review all your salon registration information.
          </Text>

          <Text
            style={styles.infoText}
          >
            2. Submit the registration.
          </Text>

          <Text
            style={styles.infoText}
          >
            3. Your KYC/business verification will be processed.
          </Text>

          <Text
            style={styles.infoText}
          >
            4. Your salon will remain pending until verification
            and approval are completed.
          </Text>

        </View>

        {/* ==================================================
            CONTINUE
        ================================================== */}

        <DButton
          type="primary"
          style={styles.button}
          onPress={
            handleContinue
          }
          disabled={
            submitting
          }
        >

          {submitting ? (

            <ActivityIndicator
              color={
                COLORS.white
              }
            />

          ) : (

            <Text
              style={styles.buttonText}
            >
              Continue to Review
            </Text>

          )}

        </DButton>

      </ScrollView>

    </SafeAreaView>
  );
}

// ============================================================
// STYLES
// ============================================================

const styles =
  StyleSheet.create({

    container: {
      flex: 1,
      backgroundColor:
        COLORS.background,
    },

    content: {
      paddingHorizontal:
        SPACING.xxl,

      paddingTop:
        SPACING.xxl,

      paddingBottom:
        SPACING.huge,
    },

    title: {
      fontFamily:
        FONTS.bold,

      fontSize: 22,

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

      marginBottom:
        SPACING.xxl,
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
        SPACING.large,
    },

    sectionTitle: {
      fontFamily:
        FONTS.semiBold,

      fontSize: 17,

      color:
        COLORS.text,

      marginBottom: 4,
    },

    sectionSubtitle: {
      fontFamily:
        FONTS.regular,

      fontSize: 12,

      lineHeight: 17,

      color:
        COLORS.textSecondary,

      marginBottom:
        SPACING.large,
    },

    field: {
      marginBottom:
        SPACING.large,
    },

    label: {
      fontFamily:
        FONTS.semiBold,

      fontSize: 13,

      color:
        COLORS.text,

      marginBottom:
        SPACING.small,
    },

    input: {
      height: 52,

      backgroundColor:
        COLORS.background,

      borderWidth: 1,

      borderColor:
        COLORS.border,

      borderRadius:
        RADIUS.medium,

      paddingHorizontal:
        SPACING.medium,

      fontFamily:
        FONTS.regular,

      fontSize: 15,

      color:
        COLORS.text,
    },

    infoCard: {
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
        SPACING.large,
    },

    infoTitle: {
      fontFamily:
        FONTS.semiBold,

      fontSize: 15,

      color:
        COLORS.text,

      marginBottom:
        SPACING.small,
    },

    infoText: {
      fontFamily:
        FONTS.regular,

      fontSize: 12,

      lineHeight: 18,

      color:
        COLORS.textSecondary,

      marginBottom:
        SPACING.small,
    },

    button: {
      width: '100%',

      height: 54,

      borderRadius:
        RADIUS.medium,
    },

    buttonText: {
      color:
        COLORS.white,

      fontFamily:
        FONTS.semiBold,

      fontSize: 15,

      textAlign:
        'center',
    },

  });