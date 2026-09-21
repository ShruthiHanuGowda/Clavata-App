import React, { useState } from 'react';

import {
  SafeAreaView,
  View,
  Text,
  StyleSheet,
  TextInput,
  Alert,
  ScrollView,
  TouchableOpacity,
  Modal,
  Pressable,
  ActivityIndicator,
} from 'react-native';

import { useQuery } from '@apollo/client';

import { Header, DButton } from '../../components';

import { useSalonRegistration } from '../../context/SalonRegistrationContext';
import { useUser } from '../../context/UserContext';

import {
  COLORS,
  FONTS,
  FONT_SIZES,
  SPACING,
  RADIUS,
} from '../../constants/constants';

import { GET_BUSINESS_TYPES } from '../../graphql/queries';

// ============================================================
// TYPES
// ============================================================

interface BusinessType {
  businessTypeId: string;
  name: string;
  description?: string | null;
  status: 'ACTIVE' | 'INACTIVE';
  createdAt: string;
  updatedAt: string;
}

interface BusinessTypesQueryData {
  businessTypes: {
    success: boolean;
    message: string;
    totalCount: number;
    businessTypes: BusinessType[];
  };
}

interface BusinessTypesQueryVariables {
  status: 'ACTIVE' | 'INACTIVE';
}

// ============================================================
// SCREEN
// ============================================================

export default function SalonRegistrationScreen({ navigation }: any) {
  const { updateData } = useSalonRegistration();
  const { currentUser } = useUser();

  // ==========================================================
  // FORM STATE
  // ==========================================================

  const [businessType, setBusinessType] = useState('');
  const [otherBusinessType, setOtherBusinessType] = useState('');

  const [salonName, setSalonName] = useState('');
  const [ownerName, setOwnerName] = useState('');
  const [email, setEmail] = useState('');

  const [businessTypeModalVisible, setBusinessTypeModalVisible] =
    useState(false);

  // ==========================================================
  // GET ACTIVE BUSINESS TYPES FROM ADMIN
  // ==========================================================

  const {
    data: businessTypesData,
    loading: businessTypesLoading,
    error: businessTypesError,
    refetch: refetchBusinessTypes,
  } = useQuery<
    BusinessTypesQueryData,
    BusinessTypesQueryVariables
  >(GET_BUSINESS_TYPES, {
    variables: {
      status: 'ACTIVE',
    },

    fetchPolicy: 'network-only',

    notifyOnNetworkStatusChange: true,

    onError: error => {
      console.log(
        '[SalonRegistrationScreen] Business types query error:',
        error,
      );
    },
  });

  // ==========================================================
  // BUSINESS TYPES
  //
  // Admin-managed active types + permanent "Other"
  //
  // "Other" is intentionally NOT stored in the Business Types
  // admin table. It is a special mobile-only option.
  // ==========================================================

  const adminBusinessTypes: BusinessType[] =
    businessTypesData?.businessTypes?.businessTypes ?? [];

  const activeBusinessTypes = adminBusinessTypes
    .filter(type => type.status === 'ACTIVE')
    .filter(type => type.name.trim().length > 0)
    .sort((a, b) =>
      a.name.localeCompare(b.name, undefined, {
        sensitivity: 'base',
      }),
    );

  const businessTypeOptions: string[] = [
    ...activeBusinessTypes
      .map(type => type.name.trim())
      .filter(
        (name, index, array) =>
          array.findIndex(
            item =>
              item.toLowerCase() === name.toLowerCase(),
          ) === index,
      )
      .filter(name => name.toLowerCase() !== 'other'),

    'Other',
  ];

  // ============================================================
  // BUSINESS TYPE
  // ============================================================

  const selectBusinessType = (type: string) => {
    setBusinessType(type);

    // Clear custom business type when user selects
    // anything other than "Other".
    if (type !== 'Other') {
      setOtherBusinessType('');
    }

    setBusinessTypeModalVisible(false);
  };

  // ============================================================
  // OPEN BUSINESS TYPE MODAL
  // ============================================================

  const openBusinessTypeModal = () => {
    // If the API failed and we don't have any business types,
    // still allow the user to see "Other".
    setBusinessTypeModalVisible(true);
  };

  // ============================================================
  // CONTINUE
  // ============================================================

  const onNext = () => {
    const trimmedBusinessType = businessType.trim();
    const trimmedOtherBusinessType =
      otherBusinessType.trim();

    const trimmedSalonName = salonName.trim();
    const trimmedOwnerName = ownerName.trim();
    const trimmedEmail = email.trim();

    // ----------------------------------------------------------
    // BUSINESS TYPE VALIDATION
    // ----------------------------------------------------------

    if (!trimmedBusinessType) {
      Alert.alert(
        'Business Type Required',
        'Please select your business type.',
      );
      return;
    }

    // ----------------------------------------------------------
    // OTHER BUSINESS TYPE VALIDATION
    // ----------------------------------------------------------

    if (
      trimmedBusinessType === 'Other' &&
      !trimmedOtherBusinessType
    ) {
      Alert.alert(
        'Business Type Required',
        'Please enter your business type.',
      );
      return;
    }

    // ----------------------------------------------------------
    // FINAL BUSINESS TYPE
    // ----------------------------------------------------------

    const finalBusinessType =
      trimmedBusinessType === 'Other'
        ? trimmedOtherBusinessType
        : trimmedBusinessType;

    // ----------------------------------------------------------
    // SALON NAME
    // ----------------------------------------------------------

    if (!trimmedSalonName) {
      Alert.alert(
        'Business Name Required',
        'Please enter your business or salon name.',
      );
      return;
    }

    // ----------------------------------------------------------
    // OWNER NAME
    // ----------------------------------------------------------

    if (!trimmedOwnerName) {
      Alert.alert(
        'Owner Name Required',
        'Please enter the owner name as per Aadhar.',
      );
      return;
    }

    // ----------------------------------------------------------
    // EMAIL
    // ----------------------------------------------------------

    if (!trimmedEmail) {
      Alert.alert(
        'Business Email Required',
        'Please enter your business email address.',
      );
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailRegex.test(trimmedEmail)) {
      Alert.alert(
        'Invalid Email',
        'Please enter a valid business email address.',
      );
      return;
    }

    // ----------------------------------------------------------
    // USER VALIDATION
    // ----------------------------------------------------------

    if (!currentUser?.userId) {
      Alert.alert(
        'Session Expired',
        'Please sign in again.',
      );
      return;
    }

    if (!currentUser?.phoneNumber) {
      Alert.alert(
        'Phone Number Missing',
        'Please verify your mobile number again.',
      );
      return;
    }

    // ----------------------------------------------------------
    // SAVE REGISTRATION DATA
    // ----------------------------------------------------------

    updateData({
      userId: currentUser.userId,
      phoneNumber: currentUser.phoneNumber,
      salonName: trimmedSalonName,
      ownerName: trimmedOwnerName,
      email: trimmedEmail,
      businessType: finalBusinessType,
    });

    // ----------------------------------------------------------
    // NEXT SCREEN
    // ----------------------------------------------------------

    navigation.navigate('SalonAddress');
  };

  // ============================================================
  // RENDER
  // ============================================================

  return (
    <SafeAreaView style={styles.container}>
      {/* ======================================================
          HEADER
      ====================================================== */}

      <Header headerTitle="Registration" />

      {/* ======================================================
          CONTENT
      ====================================================== */}

      <ScrollView
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          {/* Header spacing retained intentionally */}
        </View>

        <View style={styles.card}>
          {/* ==================================================
              BUSINESS TYPE
          ================================================== */}

          <Text style={styles.label}>
            Business type
          </Text>

          <TouchableOpacity
            style={styles.dropdown}
            activeOpacity={0.75}
            onPress={openBusinessTypeModal}
          >
            <Text
              style={[
                styles.dropdownText,
                !businessType &&
                  styles.dropdownPlaceholder,
              ]}
              numberOfLines={1}
            >
              {businessType ||
                'Select business type'}
            </Text>

            <Text style={styles.dropdownArrow}>
              ▾
            </Text>
          </TouchableOpacity>

          {/* ==================================================
              BUSINESS TYPE LOAD STATUS
          ================================================== */}

          {businessTypesLoading && (
            <View style={styles.loadingRow}>
              <ActivityIndicator
                size="small"
                color={COLORS.themeColor}
              />

              <Text style={styles.loadingText}>
                Loading business types...
              </Text>
            </View>
          )}

          {/* ==================================================
              BUSINESS TYPE ERROR
          ================================================== */}

          {!businessTypesLoading &&
            businessTypesError && (
              <View style={styles.errorContainer}>
                <Text style={styles.errorText}>
                  Unable to load business types.
                </Text>

                <TouchableOpacity
                  activeOpacity={0.75}
                  onPress={() =>
                    refetchBusinessTypes()
                  }
                >
                  <Text style={styles.retryText}>
                    Tap to retry
                  </Text>
                </TouchableOpacity>
              </View>
            )}

          {/* ==================================================
              OTHER BUSINESS TYPE
              SHOWN ONLY WHEN "OTHER" IS SELECTED
          ================================================== */}

          {businessType === 'Other' && (
            <View
              style={
                styles.otherBusinessTypeContainer
              }
            >
              <Text style={styles.label}>
                Enter Your Business type
              </Text>

              <TextInput
                style={styles.input}
                placeholder="Hair Salon, Beauty Salon"
                placeholderTextColor={
                  COLORS.textMuted
                }
                value={otherBusinessType}
                onChangeText={
                  setOtherBusinessType
                }
                autoCapitalize="words"
                autoCorrect={false}
                returnKeyType="next"
              />
            </View>
          )}

          {/* ==================================================
              BUSINESS / SALON NAME
          ================================================== */}

          <Text style={styles.label}>
            Business/Salon Name
          </Text>

          <TextInput
            style={styles.input}
            placeholder="Enter business or salon name"
            placeholderTextColor={
              COLORS.textMuted
            }
            value={salonName}
            onChangeText={setSalonName}
            autoCapitalize="words"
            autoCorrect={false}
          />

          {/* ==================================================
              OWNER NAME
          ================================================== */}

          <Text style={styles.label}>
            Owner Name (As per Aadhar)
          </Text>

          <TextInput
            style={styles.input}
            placeholder="Enter owner name as per Aadhar"
            placeholderTextColor={
              COLORS.textMuted
            }
            value={ownerName}
            onChangeText={setOwnerName}
            autoCapitalize="words"
            autoCorrect={false}
          />

          {/* ==================================================
              BUSINESS EMAIL
          ================================================== */}

          <Text style={styles.label}>
            Business email
          </Text>

          <TextInput
            style={styles.input}
            placeholder="example@email.com"
            placeholderTextColor={
              COLORS.textMuted
            }
            keyboardType="email-address"
            autoCapitalize="none"
            autoCorrect={false}
            value={email}
            onChangeText={setEmail}
          />

          {/* ==================================================
              BUSINESS PHONE

              Kept commented exactly as before.
          ================================================== */}

          {/*
          <Text style={styles.label}>
            Business Phone/Mobile Number
          </Text>

          <View style={styles.phoneContainer}>
            <Text style={styles.phoneText}>
              {currentUser?.phoneNumber ||
                'Mobile number not available'}
            </Text>

            <View style={styles.verifiedBadge}>
              <Text style={styles.verifiedBadgeText}>
                ✓
              </Text>
            </View>
          </View>

          <Text style={styles.phoneHint}>
            This is the mobile number verified with Clavata.
          </Text>
          */}
        </View>

        {/* ====================================================
            CONTINUE BUTTON
        ==================================================== */}

        <DButton
          style={styles.button}
          onPress={onNext}
        >
          <Text style={styles.buttonText}>
            Continue
          </Text>
        </DButton>
      </ScrollView>

      {/* ======================================================
          BUSINESS TYPE MODAL
      ====================================================== */}

      <Modal
        visible={businessTypeModalVisible}
        transparent
        animationType="fade"
        onRequestClose={() =>
          setBusinessTypeModalVisible(false)
        }
      >
        <Pressable
          style={styles.modalOverlay}
          onPress={() =>
            setBusinessTypeModalVisible(false)
          }
        >
          <Pressable
            style={styles.modalContainer}
            onPress={() => {}}
          >
            {/* ==================================================
                MODAL HEADER
            ================================================== */}

            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>
                Select Business Type
              </Text>

              <TouchableOpacity
                style={styles.closeButton}
                activeOpacity={0.7}
                onPress={() =>
                  setBusinessTypeModalVisible(false)
                }
              >
                <Text style={styles.closeIcon}>
                  ×
                </Text>
              </TouchableOpacity>
            </View>

            <View style={styles.modalDivider} />

            {/* ==================================================
                OPTIONS
            ================================================== */}

            <ScrollView
              showsVerticalScrollIndicator={false}
              contentContainerStyle={
                styles.optionsContainer
              }
            >
              {businessTypeOptions.length === 0 ? (
                <View
                  style={
                    styles.emptyOptionsContainer
                  }
                >
                  <Text
                    style={styles.emptyOptionsText}
                  >
                    No business types available.
                  </Text>

                  <TouchableOpacity
                    activeOpacity={0.75}
                    onPress={() =>
                      refetchBusinessTypes()
                    }
                  >
                    <Text
                      style={styles.retryText}
                    >
                      Tap to retry
                    </Text>
                  </TouchableOpacity>
                </View>
              ) : (
                businessTypeOptions.map(type => {
                  const selected =
                    businessType === type;

                  return (
                    <TouchableOpacity
                      key={type}
                      style={[
                        styles.option,
                        selected &&
                          styles.selectedOption,
                      ]}
                      activeOpacity={0.7}
                      onPress={() =>
                        selectBusinessType(type)
                      }
                    >
                      <Text
                        style={[
                          styles.optionText,
                          selected &&
                            styles.selectedOptionText,
                        ]}
                      >
                        {type}
                      </Text>

                      {selected && (
                        <View
                          style={
                            styles.optionCheck
                          }
                        >
                          <Text
                            style={
                              styles.optionCheckText
                            }
                          >
                            ✓
                          </Text>
                        </View>
                      )}
                    </TouchableOpacity>
                  );
                })
              )}
            </ScrollView>
          </Pressable>
        </Pressable>
      </Modal>
    </SafeAreaView>
  );
}

// ============================================================
// STYLES
// ============================================================

const styles = StyleSheet.create({
  // ==========================================================
  // CONTAINER
  // ==========================================================

  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },

  // ==========================================================
  // CONTENT
  // ==========================================================

  content: {
    paddingHorizontal: SPACING.xxl,
    paddingTop: SPACING.xxl,
    paddingBottom: SPACING.xxxl,
  },

  header: {
    marginBottom: SPACING.xxl,
  },

  // ==========================================================
  // CARD
  // ==========================================================

  card: {
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: RADIUS.large,
    padding: SPACING.xl,
  },

  // ==========================================================
  // LABEL
  // ==========================================================

  label: {
    fontFamily: FONTS.semiBold,
    fontSize: FONT_SIZES.small,
    lineHeight: 19,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: SPACING.small,
    includeFontPadding: false,
  },

  // ==========================================================
  // INPUT
  // ==========================================================

  input: {
    height: 54,
    borderWidth: 1,
    borderColor: COLORS.borderStrong,
    borderRadius: RADIUS.medium,
    paddingHorizontal: SPACING.large,
    fontFamily: FONTS.regular,
    fontSize: FONT_SIZES.body,
    color: COLORS.text,
    backgroundColor: COLORS.surface,
    marginBottom: SPACING.large,
  },

  // ==========================================================
  // OTHER BUSINESS TYPE
  // ==========================================================

  otherBusinessTypeContainer: {
    marginBottom: 0,
  },

  // ==========================================================
  // DROPDOWN
  // ==========================================================

  dropdown: {
    height: 54,
    borderWidth: 1,
    borderColor: COLORS.borderStrong,
    borderRadius: RADIUS.medium,
    paddingHorizontal: SPACING.large,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: COLORS.surface,
    marginBottom: SPACING.large,
  },

  dropdownText: {
    flex: 1,
    fontFamily: FONTS.regular,
    fontSize: FONT_SIZES.body,
    color: COLORS.text,
    includeFontPadding: false,
  },

  dropdownPlaceholder: {
    color: COLORS.textMuted,
  },

  dropdownArrow: {
    fontFamily: FONTS.semiBold,
    fontSize: 20,
    color: COLORS.primary,
    marginLeft: SPACING.medium,
    includeFontPadding: false,
  },

  // ==========================================================
  // LOADING
  // ==========================================================

  loadingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: -SPACING.small,
    marginBottom: SPACING.large,
  },

  loadingText: {
    marginLeft: SPACING.small,
    fontFamily: FONTS.regular,
    fontSize: FONT_SIZES.xs,
    color: COLORS.textMuted,
    includeFontPadding: false,
  },

  // ==========================================================
  // ERROR
  // ==========================================================

  errorContainer: {
    marginTop: -SPACING.small,
    marginBottom: SPACING.large,
    paddingVertical: 4,
  },

  errorText: {
    fontFamily: FONTS.regular,
    fontSize: FONT_SIZES.xs,
    color: '#C62828',
    marginBottom: 4,
    includeFontPadding: false,
  },

  retryText: {
    fontFamily: FONTS.semiBold,
    fontSize: FONT_SIZES.xs,
    fontWeight: '600',
    color: COLORS.themeColor,
    includeFontPadding: false,
  },

  // ==========================================================
  // EMPTY OPTIONS
  // ==========================================================

  emptyOptionsContainer: {
    paddingVertical: 30,
    alignItems: 'center',
    justifyContent: 'center',
  },

  emptyOptionsText: {
    fontFamily: FONTS.regular,
    fontSize: FONT_SIZES.body,
    color: COLORS.textMuted,
    marginBottom: SPACING.medium,
    textAlign: 'center',
    includeFontPadding: false,
  },

  // ==========================================================
  // PHONE NUMBER
  // ==========================================================

  phoneContainer: {
    minHeight: 54,
    borderWidth: 1,
    borderColor: COLORS.borderStrong,
    borderRadius: RADIUS.medium,
    paddingHorizontal: SPACING.large,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: COLORS.background,
  },

  phoneText: {
    flex: 1,
    fontFamily: FONTS.semiBold,
    fontSize: FONT_SIZES.body,
    fontWeight: '600',
    color: COLORS.text,
    includeFontPadding: false,
  },

  verifiedBadge: {
    width: 24,
    height: 24,
    borderRadius: RADIUS.round,
    backgroundColor: COLORS.themeColor,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: SPACING.medium,
  },

  verifiedBadgeText: {
    fontFamily: FONTS.bold,
    fontSize: 14,
    color: COLORS.white,
    includeFontPadding: false,
  },

  phoneHint: {
    fontFamily: FONTS.regular,
    fontSize: FONT_SIZES.xs,
    lineHeight: 17,
    color: COLORS.textMuted,
    marginTop: 6,
    marginBottom: SPACING.large,
    includeFontPadding: false,
  },

  // ==========================================================
  // BUTTON
  // ==========================================================

  button: {
    width: '100%',
    height: 54,
    borderRadius: RADIUS.medium,
    marginTop: SPACING.xl,
    alignSelf: 'center',
    backgroundColor: COLORS.themeColor,
  },

  buttonText: {
    color: COLORS.white,
    fontFamily: FONTS.semiBold,
    fontSize: FONT_SIZES.body,
    textAlign: 'center',
    includeFontPadding: false,
  },

  // ==========================================================
  // MODAL
  // ==========================================================

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
    maxHeight: '80%',
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
    borderRadius: RADIUS.round,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.background,
    marginLeft: SPACING.medium,
  },

  closeIcon: {
    fontFamily: FONTS.regular,
    fontSize: 27,
    lineHeight: 29,
    fontWeight: '300',
    color: COLORS.text,
    includeFontPadding: false,
  },

  modalDivider: {
    height: 1,
    backgroundColor: COLORS.border,
  },

  // ==========================================================
  // OPTIONS
  // ==========================================================

  optionsContainer: {
    padding: SPACING.medium,
  },

  option: {
    minHeight: 52,
    borderRadius: RADIUS.medium,
    paddingHorizontal: SPACING.large,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 6,
  },

  selectedOption: {
    backgroundColor: COLORS.background,
    borderWidth: 1,
    borderColor: COLORS.themeColor,
  },

  optionText: {
    flex: 1,
    fontFamily: FONTS.regular,
    fontSize: FONT_SIZES.body,
    color: COLORS.text,
    includeFontPadding: false,
  },

  selectedOptionText: {
    fontFamily: FONTS.semiBold,
    fontWeight: '600',
    color: COLORS.primary,
  },

  optionCheck: {
    width: 24,
    height: 24,
    borderRadius: RADIUS.round,
    backgroundColor: COLORS.themeColor,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: SPACING.medium,
  },

  optionCheckText: {
    fontFamily: FONTS.bold,
    fontSize: 13,
    color: COLORS.white,
    includeFontPadding: false,
  },
});