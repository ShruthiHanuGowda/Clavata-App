import React from 'react';
import {
  SafeAreaView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import Header from '../../components/Header';
import {
  COLORS,
  FONTS,
  FONT_SIZES,
  SPACING,
  RADIUS,
} from '../../constants/constants';

const BecomePartnerScreen = ({ navigation }: any) => {
  const handleContinue = () => {
    navigation.navigate('SalonRegistration');
  };

  return (
    <SafeAreaView style={styles.container}>
      <Header headerTitle="Become a Partner" />

      <View style={styles.content}>
        <View style={styles.hero}>
          <View style={styles.iconCircle}>
            <Text style={styles.icon}>✦</Text>
          </View>

          <Text style={styles.title}>
            Grow your business with Clavata
          </Text>

          <Text style={styles.subtitle}>
            List your salon, connect with customers and manage your business
            effortlessly.
          </Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>
            Everything you need
          </Text>

          <View style={styles.item}>
            <View style={styles.check}>
              <Text style={styles.checkText}>✓</Text>
            </View>

            <Text style={styles.itemText}>
              Reach more local customers
            </Text>
          </View>

          <View style={styles.item}>
            <View style={styles.check}>
              <Text style={styles.checkText}>✓</Text>
            </View>

            <Text style={styles.itemText}>
              Manage bookings with ease
            </Text>
          </View>

          <View style={styles.item}>
            <View style={styles.check}>
              <Text style={styles.checkText}>✓</Text>
            </View>

            <Text style={styles.itemText}>
              Grow your salon business
            </Text>
          </View>

          <View style={styles.item}>
            <View style={styles.check}>
              <Text style={styles.checkText}>✓</Text>
            </View>

            <Text style={styles.itemText}>
              Accept secure online payments
            </Text>
          </View>
        </View>

        <Text style={styles.note}>
          It only takes a few minutes to get started.
        </Text>
      </View>

      <View style={styles.footer}>
        <TouchableOpacity
          style={styles.button}
          onPress={handleContinue}
          activeOpacity={0.85}
        >
          <Text style={styles.buttonText}>
            Continue
          </Text>

          <Text style={styles.arrow}>
            ›
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

export default BecomePartnerScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },

  content: {
    flex: 1,
    paddingHorizontal: SPACING.xxl,
    paddingTop: SPACING.xxxl,
  },

  hero: {
    alignItems: 'center',
    paddingHorizontal: SPACING.small,
    marginBottom: SPACING.xxxl,
  },

  iconCircle: {
    width: 58,
    height: 58,
    borderRadius: RADIUS.round,
    backgroundColor: COLORS.black,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: SPACING.large,
  },

  icon: {
    fontSize: 24,
    color: COLORS.white,
    fontFamily: FONTS.medium,
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
    borderRadius: RADIUS.large,
    padding: SPACING.xl,
    borderWidth: 1,
    borderColor: COLORS.border,
  },

  cardTitle: {
    fontFamily: FONTS.semiBold,
    fontSize: FONT_SIZES.body,
    color: COLORS.text,
    marginBottom: SPACING.large,
  },

  item: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.large,
  },

  check: {
    width: 28,
    height: 28,
    borderRadius: RADIUS.round,
    backgroundColor: COLORS.black,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: SPACING.medium,
  },

  checkText: {
    color: COLORS.white,
    fontSize: FONT_SIZES.small,
    fontFamily: FONTS.bold,
  },

  itemText: {
    flex: 1,
    fontFamily: FONTS.regular,
    fontSize: FONT_SIZES.small,
    lineHeight: FONT_SIZES.small + 6,
    color: COLORS.text,
  },

  note: {
    marginTop: SPACING.large,
    textAlign: 'center',
    fontFamily: FONTS.regular,
    fontSize: FONT_SIZES.xs,
    color: COLORS.textMuted,
  },

  footer: {
    paddingHorizontal: SPACING.xxl,
    paddingBottom: SPACING.xl,
  },

  button: {
    height: 54,
    borderRadius: RADIUS.medium,
    backgroundColor: COLORS.black,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },

  buttonText: {
    color: COLORS.white,
    fontFamily: FONTS.semiBold,
    fontSize: FONT_SIZES.body,
  },

  arrow: {
    color: COLORS.white,
    fontSize: 25,
    lineHeight: 27,
    marginLeft: SPACING.small,
  },
});