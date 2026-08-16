import React, { useState } from 'react';
import { SafeAreaView, View, Text, StyleSheet, TextInput, Alert, ScrollView } from 'react-native';
import { Header, DButton } from '../../components';
import { useSalonRegistration } from '../../context/SalonRegistrationContext';
import { useUser } from '../../context/UserContext';
import { COLORS, FONTS, FONT_SIZES, SPACING, RADIUS } from '../../constants/constants';

export default function SalonRegistrationScreen({ navigation }: any) {
  const { updateData } = useSalonRegistration();
  const { currentUser } = useUser();
  const [salonName, setSalonName] = useState('');
  const [ownerName, setOwnerName] = useState('');
  const [email, setEmail] = useState('');
  const [businessType, setBusinessType] = useState('');

  const onNext = () => {
    if (
      !salonName.trim() ||
      !ownerName.trim() ||
      !email.trim() ||
      !businessType.trim()
    ) {
      Alert.alert(
        'Missing Information',
        'Please fill all fields.',
      );
      return;
    }

    if (!currentUser?.userId) {
      Alert.alert(
        'Session Expired',
        'Please sign in again.',
      );
      return;
    }

    updateData({
      userId: currentUser.userId,
      phoneNumber: currentUser.phoneNumber,

      salonName: salonName.trim(),
      ownerName: ownerName.trim(),
      email: email.trim(),
      businessType: businessType.trim(),
    });

    navigation.navigate('SalonAddress');
  };

  return (
    <SafeAreaView style={styles.container}>
      <Header headerTitle="Salon Registration" />
      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Text style={styles.title}>Basic details</Text>
          <Text style={styles.subtitle}>Tell us a little about your business.</Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.label}>Salon name</Text>
          <TextInput
            style={styles.input}
            placeholder="Enter salon name"
            placeholderTextColor={COLORS.textMuted}
            value={salonName}
            onChangeText={setSalonName}
            autoCapitalize="words"
          />

          <Text style={styles.label}>Owner name</Text>
          <TextInput
            style={styles.input}
            placeholder="Enter owner name"
            placeholderTextColor={COLORS.textMuted}
            value={ownerName}
            onChangeText={setOwnerName}
            autoCapitalize="words"
          />

          <Text style={styles.label}>Business email</Text>
          <TextInput
            style={styles.input}
            placeholder="example@email.com"
            placeholderTextColor={COLORS.textMuted}
            keyboardType="email-address"
            autoCapitalize="none"
            autoCorrect={false}
            value={email}
            onChangeText={setEmail}
          />

          <Text style={styles.label}>Business type</Text>
          <TextInput
            style={styles.input}
            placeholder="Salon, Spa, Barber..."
            placeholderTextColor={COLORS.textMuted}
            value={businessType}
            onChangeText={setBusinessType}
            autoCapitalize="words"
          />
        </View>

        <DButton type="primary" style={styles.button} onPress={onNext}>
          <Text style={styles.buttonText}>Continue</Text>
        </DButton>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  content: {
    paddingHorizontal: SPACING.xxl,
    paddingTop: SPACING.xxl,
    paddingBottom: SPACING.xxxl,
  },
  header: {
    marginBottom: SPACING.xxl,
  },
  title: {
    fontFamily: FONTS.semiBold,
    fontSize: FONT_SIZES.title,
    lineHeight: FONT_SIZES.title + 5,
    color: COLORS.text,
    textAlign: 'center',
    letterSpacing: -0.2,
  },
  subtitle: {
    marginTop: SPACING.small,
    fontFamily: FONTS.regular,
    fontSize: FONT_SIZES.small,
    lineHeight: FONT_SIZES.small + 7,
    color: COLORS.textSecondary,
    textAlign: 'center',
  },
  card: {
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: RADIUS.large,
    padding: SPACING.xl,
  },
  label: {
    fontFamily: FONTS.semiBold,
    fontSize: FONT_SIZES.small,
    color: COLORS.text,
    marginBottom: SPACING.small,
  },
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
  button: {
    width: '100%',
    height: 54,
    borderRadius: RADIUS.medium,
    marginTop: SPACING.xl,
    alignSelf: 'center',
  },
  buttonText: {
    color: COLORS.white,
    fontFamily: FONTS.semiBold,
    fontSize: FONT_SIZES.body,
    textAlign: 'center',
  },
});