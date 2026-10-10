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

import { Header } from '../../components';

import { useSalonRegistration } from '../../context/SalonRegistrationContext';
import { useUser } from '../../context/UserContext';

import {
  COLORS,
  FONTS,
  FONT_SIZES,
  SPACING,
  RADIUS,
  GRADIENTS,
} from '../../constants/constants';

import AppGradient from '../../common/AppGradient';

type TargetAudience = 'FEMALE' | 'MALE' | 'KIDS';

interface TargetAudienceOption {
  value: TargetAudience;
  label: string;
  description: string;
}

const TARGET_AUDIENCE_OPTIONS: TargetAudienceOption[] = [
  {
    value: 'FEMALE',
    label: 'Female',
    description: 'Services primarily intended for women',
  },
  {
    value: 'MALE',
    label: 'Male',
    description: 'Services primarily intended for men',
  },
  {
    value: 'KIDS',
    label: 'Kids',
    description: 'Services specifically offered for children',
  },
];

const SalonRegistrationScreen = ({ navigation }: any) => {
  const { updateData } = useSalonRegistration();
  const { currentUser } = useUser();

  const [salonName, setSalonName] = useState('');
  const [ownerName, setOwnerName] = useState('');
  const [email, setEmail] = useState('');
  const [targetAudiences, setTargetAudiences] = useState<TargetAudience[]>([]);
  const [targetAudienceModalVisible, setTargetAudienceModalVisible] =
    useState(false);
  const [submitting, setSubmitting] = useState(false);

  const toggleTargetAudience = (audience: TargetAudience) => {
    setTargetAudiences(current => {
      if (current.includes(audience)) {
        return current.filter(item => item !== audience);
      }

      return [...current, audience];
    });
  };

  const getTargetAudienceLabel = () => {
    if (targetAudiences.length === 0) {
      return '';
    }

    return TARGET_AUDIENCE_OPTIONS
      .filter(option => targetAudiences.includes(option.value))
      .map(option => option.label)
      .join(', ');
  };

  const onNext = async () => {
    if (submitting) {
      return;
    }

    const trimmedSalonName = salonName.trim();
    const trimmedOwnerName = ownerName.trim();
    const trimmedEmail = email.trim();

    if (targetAudiences.length === 0) {
      Alert.alert(
        'Customer Type Required',
        'Please select who your business serves. You can select more than one',
      );
      return;
    }

    if (!trimmedSalonName) {
      Alert.alert(
        'Business Name Required',
        'Please enter your business name',
      );
      return;
    }

    if (!trimmedOwnerName) {
      Alert.alert(
        'Owner Name Required',
        'Please enter the owner name as per Aadhaar',
      );
      return;
    }

    if (!trimmedEmail) {
      Alert.alert(
        'Email Required',
        'Please enter your business email address',
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

    if (!currentUser?.userId) {
      Alert.alert(
        'Unable to Continue',
        'Your user information is unavailable. Please sign in again.',
      );
      return;
    }

    if (!currentUser?.phoneNumber) {
      Alert.alert(
        'Phone Number Missing',
        'Your phone number is unavailable. Please sign in again.',
      );
      return;
    }

    try {
      setSubmitting(true);

      console.log('[SalonRegistration] SAVE REGISTRATION DATA');
      console.log('[SalonRegistration] User ID:', currentUser.userId);
      console.log('[SalonRegistration] Phone:', currentUser.phoneNumber);
      console.log('[SalonRegistration] Business Name:', trimmedSalonName);
      console.log('[SalonRegistration] Owner Name:', trimmedOwnerName);
      console.log('[SalonRegistration] Email:', trimmedEmail);
      console.log('[SalonRegistration] Target Audiences:', targetAudiences);

      await updateData({
        userId: currentUser.userId,
        phoneNumber: currentUser.phoneNumber,
        salonName: trimmedSalonName,
        ownerName: trimmedOwnerName,
        email: trimmedEmail,
        targetAudiences,
      });

      console.log(
        '[SalonRegistration] Registration data saved successfully.',
      );

      navigation.navigate('SalonAddress');
    } catch (error) {
      console.log(
        '[SalonRegistration] Failed to save registration:',
        error,
      );

      Alert.alert(
        'Unable to Continue',
        'Something went wrong while saving your registration details. Please try again.',
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <Header headerTitle="Registration" />

      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.contentContainer}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.card}>
          <Text style={styles.title}>Tell us about your business</Text>

          <Text style={styles.subtitle}>
            Provide your business details to get started with Clavata
          </Text>

          {/* CUSTOMER TYPE */}
          <View style={styles.fieldContainer}>
            <Text style={styles.label}>
              Who does your business serve *
            </Text>

            <Text style={styles.audienceHelperText}>
              Select all that apply
            </Text>

            <TouchableOpacity
              style={[
                styles.dropdown,
                targetAudienceModalVisible && styles.dropdownActive,
              ]}
              activeOpacity={0.75}
              onPress={() => setTargetAudienceModalVisible(true)}
            >
              <View style={styles.dropdownContent}>
                <Text
                  style={[
                    styles.dropdownText,
                    targetAudiences.length === 0 && styles.placeholderText,
                  ]}
                  numberOfLines={1}
                >
                  {getTargetAudienceLabel() || 'Select customer type'}
                </Text>
              </View>

              <Text style={styles.dropdownArrow}>▾</Text>
            </TouchableOpacity>

            {targetAudiences.length > 0 && (
              <View style={styles.selectedAudienceInfo}>
                <Text style={styles.selectedAudienceTitle}>Selected</Text>

                <View style={styles.audienceChipContainer}>
                  {TARGET_AUDIENCE_OPTIONS
                    .filter(option =>
                      targetAudiences.includes(option.value),
                    )
                    .map(option => (
                      <View key={option.value} style={styles.audienceChip}>
                        <Text style={styles.audienceChipText}>
                          {option.label}
                        </Text>
                      </View>
                    ))}
                </View>
              </View>
            )}
          </View>

          {/* BUSINESS NAME */}
          <View style={styles.fieldContainer}>
            <Text style={styles.label}>Business name *</Text>

            <Text style={styles.helperText}>
              Enter your shop or company name
            </Text>

            <TextInput
              style={styles.input}
              placeholder="Enter your business name"
              placeholderTextColor={COLORS.textSecondary}
              value={salonName}
              onChangeText={setSalonName}
              autoCapitalize="words"
              returnKeyType="next"
              maxLength={100}
            />
          </View>

          {/* OWNER NAME */}
          <View style={styles.fieldContainer}>
            <Text style={styles.label}>Owner name *</Text>

            <Text style={styles.helperText}>
              Enter the name exactly as it appears on Aadhaar
            </Text>

            <TextInput
              style={styles.input}
              placeholder="Enter owner name"
              placeholderTextColor={COLORS.textSecondary}
              value={ownerName}
              onChangeText={setOwnerName}
              autoCapitalize="words"
              returnKeyType="next"
              maxLength={100}
            />
          </View>

          {/* BUSINESS EMAIL */}
          <View style={styles.fieldContainer}>
            <Text style={styles.label}>Business email *</Text>

            <TextInput
              style={styles.input}
              placeholder="Enter business email"
              placeholderTextColor={COLORS.textSecondary}
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
              returnKeyType="done"
              maxLength={150}
            />
          </View>

          {/* GRADIENT CONTINUE BUTTON */}
          <TouchableOpacity
            style={styles.buttonWrapper}
            activeOpacity={0.85}
            onPress={onNext}
            disabled={submitting}
          >
            <AppGradient
              colors={[...GRADIENTS.SOFT_PURPLE]}
              style={styles.button}
            >
              {submitting ? (
                <ActivityIndicator color={COLORS.white} />
              ) : (
                <>
                  <Text style={styles.buttonText}>Continue</Text>
                  <Text style={styles.buttonArrow}>›</Text>
                </>
              )}
            </AppGradient>
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* CUSTOMER TYPE MODAL */}
      <Modal
        visible={targetAudienceModalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setTargetAudienceModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <Pressable
            style={styles.modalOutside}
            onPress={() => setTargetAudienceModalVisible(false)}
          />

          <View style={styles.modalContainer}>
            <View style={styles.modalHeader}>
              <View style={styles.modalHeaderTextContainer}>
                <Text style={styles.modalTitle}>
                  Who does your business serve?
                </Text>

                <Text style={styles.modalSubtitle}>
                  Select all that apply
                </Text>
              </View>

              <TouchableOpacity
                style={styles.closeButton}
                activeOpacity={0.7}
                onPress={() => setTargetAudienceModalVisible(false)}
              >
                <Text style={styles.closeButtonText}>×</Text>
              </TouchableOpacity>
            </View>

            <ScrollView
              style={styles.modalScroll}
              contentContainerStyle={styles.modalScrollContent}
              showsVerticalScrollIndicator={false}
            >
              {TARGET_AUDIENCE_OPTIONS.map(option => {
                const isSelected = targetAudiences.includes(option.value);

                return (
                  <TouchableOpacity
                    key={option.value}
                    style={[
                      styles.audienceOption,
                      isSelected && styles.audienceOptionSelected,
                    ]}
                    activeOpacity={0.75}
                    onPress={() => toggleTargetAudience(option.value)}
                  >
                    <View
                      style={[
                        styles.checkbox,
                        isSelected && styles.checkboxSelected,
                      ]}
                    >
                      {isSelected && (
                        <AppGradient
                          colors={[...GRADIENTS.SOFT_PURPLE]}
                          style={styles.checkboxGradient}
                        >
                          <Text style={styles.checkboxText}>✓</Text>
                        </AppGradient>
                      )}
                    </View>

                    <View style={styles.audienceOptionContent}>
                      <Text
                        style={[
                          styles.audienceOptionTitle,
                          isSelected && styles.audienceOptionTitleSelected,
                        ]}
                      >
                        {option.label}
                      </Text>

                      <Text style={styles.audienceOptionDescription}>
                        {option.description}
                      </Text>
                    </View>
                  </TouchableOpacity>
                );
              })}

              <View style={styles.audienceInfoBox}>
                <AppGradient
                  colors={[...GRADIENTS.SOFT_PURPLE]}
                  style={styles.modalInfoIcon}
                >
                  <Text style={styles.modalInfoIconText}>i</Text>
                </AppGradient>

                <Text style={styles.modalInfoText}>
                  You can select more than one. For example, select Female,
                  Male and Kids if your business serves all three
                </Text>
              </View>
            </ScrollView>

            <View style={styles.audienceDoneContainer}>
              <TouchableOpacity
                style={styles.buttonWrapper}
                activeOpacity={0.85}
                onPress={() => setTargetAudienceModalVisible(false)}
              >
                <AppGradient
                  colors={[...GRADIENTS.SOFT_PURPLE]}
                  style={styles.audienceDoneButton}
                >
                  <Text style={styles.audienceDoneButtonText}>Done</Text>
                </AppGradient>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: COLORS.background,
  },

  container: {
    flex: 1,
  },

  contentContainer: {
    paddingHorizontal: SPACING?.medium ?? 16,
    paddingTop: SPACING?.medium ?? 16,
    paddingBottom: 40,
  },

  card: {
    backgroundColor: COLORS.white,
    borderRadius: RADIUS?.large ?? 16,
    padding: SPACING?.medium ?? 16,
  },

  title: {
    fontSize: FONT_SIZES?.title ?? 24,
    fontFamily: FONTS?.bold,
    color: COLORS.text,
    marginBottom: 6,
  },

  subtitle: {
    fontSize: FONT_SIZES?.small ?? 14,
    fontFamily: FONTS?.regular,
    color: COLORS.textSecondary,
    lineHeight: 21,
    marginBottom: 24,
  },

  fieldContainer: {
    marginBottom: 22,
  },

  label: {
    fontSize: FONT_SIZES?.small ?? 14,
    fontFamily: FONTS?.medium,
    color: COLORS.text,
    marginBottom: 8,
  },

  helperText: {
    fontSize: 12,
    fontFamily: FONTS?.regular,
    color: COLORS.textSecondary,
    marginTop: -3,
    marginBottom: 8,
    lineHeight: 17,
  },

  audienceHelperText: {
    fontSize: 12,
    fontFamily: FONTS?.regular,
    color: COLORS.textSecondary,
    marginTop: -4,
    marginBottom: 9,
  },

  selectedAudienceInfo: {
    marginTop: 9,
    padding: 12,
    backgroundColor: '#F7F3FF',
    borderRadius: RADIUS?.medium ?? 10,
  },

  selectedAudienceTitle: {
    fontSize: 12,
    fontFamily: FONTS?.medium,
    color: COLORS.text,
    marginBottom: 8,
  },

  audienceChipContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 7,
  },

  audienceChip: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 20,
    backgroundColor: COLORS.white,
    borderWidth: 1,
    borderColor: COLORS.primary,
  },

  audienceChipText: {
    fontSize: 12,
    fontFamily: FONTS?.medium,
    color: COLORS.primary,
  },

  input: {
    height: 52,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: RADIUS?.medium ?? 10,
    paddingHorizontal: 14,
    fontSize: FONT_SIZES?.small ?? 14,
    fontFamily: FONTS?.regular,
    color: COLORS.text,
    backgroundColor: COLORS.white,
  },

  dropdown: {
    minHeight: 52,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: RADIUS?.medium ?? 10,
    paddingHorizontal: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: COLORS.white,
  },

  dropdownActive: {
    borderColor: COLORS.primary,
  },

  dropdownContent: {
    flex: 1,
    marginRight: 10,
  },

  dropdownText: {
    fontSize: FONT_SIZES?.small ?? 14,
    fontFamily: FONTS?.regular,
    color: COLORS.text,
  },

  placeholderText: {
    color: COLORS.textSecondary,
  },

  dropdownArrow: {
    fontSize: 18,
    color: COLORS.textSecondary,
    marginTop: -3,
  },

  buttonWrapper: {
    width: '100%',
    borderRadius: RADIUS?.medium ?? 10,
    overflow: 'hidden',
  },

  button: {
    width: '100%',
    minHeight: 54,
    paddingHorizontal: 18,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: RADIUS?.medium ?? 10,
  },

  buttonText: {
    color: COLORS.white,
    fontSize: FONT_SIZES?.medium ?? 16,
    fontFamily: FONTS?.medium,
  },

  buttonArrow: {
    position: 'absolute',
    right: 18,
    color: COLORS.white,
    fontSize: 27,
    lineHeight: 30,
    fontFamily: FONTS?.regular,
  },

  modalOverlay: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(20, 12, 35, 0.45)',
  },

  modalOutside: {
    flex: 1,
  },

  modalContainer: {
    backgroundColor: COLORS.white,
    borderTopLeftRadius: 22,
    borderTopRightRadius: 22,
    maxHeight: '85%',
    paddingBottom: 10,
  },

  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 15,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: COLORS.border,
  },

  modalHeaderTextContainer: {
    flex: 1,
    paddingRight: 12,
  },

  modalTitle: {
    fontSize: 18,
    fontFamily: FONTS?.bold,
    color: COLORS.text,
    marginBottom: 4,
  },

  modalSubtitle: {
    fontSize: 12,
    fontFamily: FONTS?.regular,
    color: COLORS.textSecondary,
    lineHeight: 18,
  },

  closeButton: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: COLORS.background,
    alignItems: 'center',
    justifyContent: 'center',
  },

  closeButtonText: {
    fontSize: 24,
    lineHeight: 25,
    color: COLORS.textSecondary,
    fontFamily: FONTS?.regular,
  },

  modalScroll: {
    flexGrow: 0,
  },

  modalScrollContent: {
    padding: 16,
  },

  audienceOption: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: RADIUS?.medium ?? 10,
    padding: 15,
    marginBottom: 10,
    backgroundColor: COLORS.white,
  },

  audienceOptionSelected: {
    borderColor: COLORS.primary,
    backgroundColor: '#FAF7FF',
  },

  checkbox: {
    width: 22,
    height: 22,
    borderRadius: 6,
    borderWidth: 1.5,
    borderColor: COLORS.border,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
    marginTop: 1,
    overflow: 'hidden',
  },

  checkboxSelected: {
    borderColor: 'transparent',
  },

  checkboxGradient: {
    width: '100%',
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },

  checkboxText: {
    color: COLORS.white,
    fontSize: 14,
    fontFamily: FONTS?.bold,
  },

  audienceOptionContent: {
    flex: 1,
  },

  audienceOptionTitle: {
    fontSize: 15,
    fontFamily: FONTS?.medium,
    color: COLORS.text,
    marginBottom: 4,
  },

  audienceOptionTitleSelected: {
    fontFamily: FONTS?.bold,
    color: COLORS.primary,
  },

  audienceOptionDescription: {
    fontSize: 12,
    fontFamily: FONTS?.regular,
    color: COLORS.textSecondary,
    lineHeight: 18,
  },

  audienceInfoBox: {
    flexDirection: 'row',
    backgroundColor: '#F7F3FF',
    borderRadius: RADIUS?.medium ?? 10,
    padding: 13,
    marginTop: 5,
    alignItems: 'flex-start',
  },

  modalInfoIcon: {
    width: 21,
    height: 21,
    borderRadius: 10.5,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 9,
    overflow: 'hidden',
  },

  modalInfoIconText: {
    color: COLORS.white,
    fontSize: 11,
    fontFamily: FONTS?.bold,
  },

  modalInfoText: {
    flex: 1,
    fontSize: 12,
    fontFamily: FONTS?.regular,
    color: COLORS.textSecondary,
    lineHeight: 18,
  },

  audienceDoneContainer: {
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: COLORS.border,
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 6,
  },

  audienceDoneButton: {
    minHeight: 48,
    borderRadius: RADIUS?.medium ?? 10,
    alignItems: 'center',
    justifyContent: 'center',
  },

  audienceDoneButtonText: {
    color: COLORS.white,
    fontSize: 14,
    fontFamily: FONTS?.medium,
  },
});

export default SalonRegistrationScreen;

