import React, { useState } from 'react';
import {
  SafeAreaView,
  View,
  Text,
  StyleSheet,
  TextInput,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import { Header, DButton } from '../../components';
import { useSalonRegistration } from '../../context/SalonRegistrationContext';
import {
  COLORS,
  FONTS,
  SPACING,
  RADIUS,
} from '../../constants/constants';

export default function SalonAddressScreen({ navigation }: any) {
  const { updateData } = useSalonRegistration();
  const [addressLine, setAddressLine] = useState('');
  const [city, setCity] = useState('');
  const [state, setState] = useState('');
  const [pincode, setPincode] = useState('');

  const onNext = () => {
    if (
      !addressLine.trim() ||
      !city.trim() ||
      !state.trim() ||
      !pincode.trim()
    ) {
      Alert.alert(
        'Missing Information',
        'Please fill all address details.',
      );
      return;
    }

    updateData({
      addressLine: addressLine.trim(),
      city: city.trim(),
      state: state.trim(),
      pincode: pincode.trim(),
    });

    navigation.navigate('SalonBusinessHours');
  };

  return (
    <SafeAreaView style={styles.container}>
      <Header headerTitle="Salon Address" />
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView
          contentContainerStyle={styles.content}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {/* SECTION HEADER */}
          <View style={styles.headerSection}>
            <Text style={styles.title}>
              Where is your salon located?
            </Text>
            <Text style={styles.subtitle}>
              Add your salon's address so customers can find you.
            </Text>
          </View>
          {/* ADDRESS */}
          <View style={styles.field}>
            <Text style={styles.label}>
              Address
            </Text>
            <TextInput
              style={styles.input}
              placeholder="Enter street address"
              placeholderTextColor={COLORS.textMuted}
              value={addressLine}
              onChangeText={setAddressLine}
              autoCapitalize="words"
              autoCorrect={false}
            />
          </View>
          {/* CITY */}
          <View style={styles.field}>
            <Text style={styles.label}>
              City
            </Text>
            <TextInput
              style={styles.input}
              placeholder="Enter city"
              placeholderTextColor={COLORS.textMuted}
              value={city}
              onChangeText={setCity}
              autoCapitalize="words"
              autoCorrect={false}
            />
          </View>
          {/* STATE */}
          <View style={styles.field}>
            <Text style={styles.label}>
              State
            </Text>
            <TextInput
              style={styles.input}
              placeholder="Enter state"
              placeholderTextColor={COLORS.textMuted}
              value={state}
              onChangeText={setState}
              autoCapitalize="words"
              autoCorrect={false}
            />
          </View>
          {/* PINCODE */}
          <View style={styles.field}>
            <Text style={styles.label}>
              Pincode
            </Text>
            <TextInput
              style={styles.input}
              placeholder="Enter pincode"
              placeholderTextColor={COLORS.textMuted}
              keyboardType="number-pad"
              maxLength={6}
              value={pincode}
              onChangeText={setPincode}
            />
          </View>
          {/* BUTTON */}
          <DButton
            type="primary"
            style={styles.button}
            onPress={onNext}
          >
            <Text style={styles.buttonText}>
              Continue
            </Text>
          </DButton>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  flex: {
    flex: 1,
  },
  content: {
    paddingHorizontal: SPACING.xxl,
    paddingTop: SPACING.xxxl,
    paddingBottom: SPACING.huge,
  },
  /* HEADER */
  headerSection: {
    marginBottom: SPACING.xxxl,
  },
  title: {
    fontFamily: FONTS.bold,
    fontSize: 21,
    lineHeight: 27,
    color: COLORS.text,
    letterSpacing: -0.3,
    marginBottom: SPACING.small,
  },
  subtitle: {
    fontFamily: FONTS.regular,
    fontSize: 14,
    lineHeight: 21,
    color: COLORS.textSecondary,
    maxWidth: 330,
  },
  /* FIELD */
  field: {
    marginBottom: SPACING.xl,
  },
  label: {
    fontFamily: FONTS.semiBold,
    fontSize: 14,
    color: COLORS.text,
    marginBottom: SPACING.small,
  },
  input: {
    height: 52,
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: RADIUS.medium,
    paddingHorizontal: SPACING.large,
    fontFamily: FONTS.regular,
    fontSize: 16,
    color: COLORS.text,
  },
  /* BUTTON */
  button: {
    width: '100%',
    height: 54,
    marginTop: SPACING.medium,
    borderRadius: RADIUS.medium,
  },
  buttonText: {
    color: COLORS.white,
    fontFamily: FONTS.semiBold,
    fontSize: 16,
    textAlign: 'center',
  },
});