import React from 'react';
import {
  SafeAreaView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

import {
  COLORS,
  FONTS,
  FONT_SIZES,
  SPACING,
  RADIUS,
  GRADIENTS,
} from '../../constants/constants';

import AppGradient from '../../common/AppGradient';

const BecomePartnerScreen = ({ navigation }: any) => {
  const handleBack = () => {
    navigation.reset({
      index: 0,
      routes: [
        {
          name: 'LoginScreen',
          params: {
            mode: 'PROVIDER',
            hideBackButton: false,
          },
        },
      ],
    });
  };

  const handleContinue = () => {
    navigation.navigate('SalonRegistration');
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* HEADER */}
      <View style={styles.header}>
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
          <Text style={styles.backIcon}>‹</Text>
        </TouchableOpacity>

        <View style={styles.headerTitleContainer}>
          <Text style={styles.headerTitle}>
            Become a service partner
          </Text>
        </View>

        <View style={styles.headerSpacer} />
      </View>

      {/* MAIN CONTENT */}
      <View style={styles.content}>
        {/* HERO */}
        <View style={styles.hero}>
          <Text style={styles.title}>Clavata</Text>

          <Text style={styles.subtitle}>
            Your next client starts here
          </Text>
        </View>

        {/* FEATURES CARD */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>
            Grow Your Business
          </Text>

          {/* FEATURE 1 */}
          <View style={styles.item}>
            <AppGradient
              colors={[...GRADIENTS.SOFT_PURPLE]}
              style={styles.check}
            >
              <Text style={styles.checkText}>✓</Text>
            </AppGradient>

            <View style={styles.itemContent}>
              <Text style={styles.itemText}>
                List your business
              </Text>

              <Text style={styles.itemSubText}>
                Showcase your services and products to our growing community of clients
              </Text>
            </View>
          </View>

          {/* FEATURE 2 */}
          <View style={styles.item}>
            <AppGradient
              colors={[...GRADIENTS.SOFT_PURPLE]}
              style={styles.check}
            >
              <Text style={styles.checkText}>✓</Text>
            </AppGradient>

            <View style={styles.itemContent}>
              <Text style={styles.itemText}>
                Zero commission
              </Text>

              <Text style={styles.itemSubText}>
                You keep 100% of what you earn. No commissions. No deductions
              </Text>
            </View>
          </View>

          {/* FEATURE 3 */}
          <View style={styles.item}>
            <AppGradient
              colors={[...GRADIENTS.SOFT_PURPLE]}
              style={styles.check}
            >
              <Text style={styles.checkText}>✓</Text>
            </AppGradient>

            <View style={styles.itemContent}>
              <Text style={styles.itemText}>
                Connect with customers
              </Text>

              <Text style={styles.itemSubText}>
                Build lasting relationships, attract new clients, and keep them coming back
              </Text>
            </View>
          </View>

          {/* FEATURE 4 */}
          <View style={styles.item}>
            <AppGradient
              colors={[...GRADIENTS.SOFT_PURPLE]}
              style={styles.check}
            >
              <Text style={styles.checkText}>✓</Text>
            </AppGradient>

            <View style={styles.itemContent}>
              <Text style={styles.itemText}>
                Boost your online visibility
              </Text>

              <Text style={styles.itemSubText}>
                Get discovered by more clients searching for your services
              </Text>
            </View>
          </View>

          {/* FEATURE 5 */}
          <View style={[styles.item, styles.lastItem]}>
            <AppGradient
              colors={[...GRADIENTS.SOFT_PURPLE]}
              style={styles.check}
            >
              <Text style={styles.checkText}>✓</Text>
            </AppGradient>

            <View style={styles.itemContent}>
              <Text style={styles.itemText}>
                Manage your business with ease
              </Text>

              <Text style={styles.itemSubText}>
                Keep your services, information, and booking requests organized in one place
              </Text>
            </View>
          </View>
        </View>

        {/* NOTE */}
        <Text style={styles.note}>
          Register in minutes and get your business verified
        </Text>
      </View>

      {/* FOOTER */}
      <View style={styles.footer}>
        <TouchableOpacity
          onPress={handleContinue}
          activeOpacity={0.85}
          style={styles.buttonWrapper}
        >
          <AppGradient
            colors={[...GRADIENTS.SOFT_PURPLE]}
            style={styles.button}
          >
            <Text style={styles.buttonText}>
              Continue
            </Text>

            <Text style={styles.arrow}>›</Text>
          </AppGradient>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

export default BecomePartnerScreen;

// STYLES
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },

  // HEADER
  header: {
    height: 64,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING.large,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
    backgroundColor: COLORS.background,
  },

  backButton: {
    width: 40,
    height: 40,
    alignItems: 'flex-start',
    justifyContent: 'center',
  },

  backIcon: {
    fontFamily: FONTS.regular,
    fontSize: 36,
    lineHeight: 38,
    fontWeight: '300',
    color: COLORS.primary,
    includeFontPadding: false,
  },

  headerTitleContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },

  headerTitle: {
    fontFamily: FONTS.semiBold,
    fontSize: FONT_SIZES.medium,
    lineHeight: 21,
    fontWeight: '600',
    color: COLORS.primary,
    textAlign: 'center',
    includeFontPadding: false,
  },

  headerSpacer: {
    width: 40,
  },

  // CONTENT
  content: {
    flex: 1,
    paddingHorizontal: SPACING.xxl,
    paddingTop: SPACING.medium,
  },

  // HERO
  hero: {
    alignItems: 'center',
    paddingHorizontal: SPACING.small,
    marginBottom: SPACING.xxxl,
  },

  title: {
    fontFamily: FONTS.semiBold,
    fontSize: FONT_SIZES.heading,
    lineHeight: FONT_SIZES.title + 5,
    color: COLORS.text,
    textAlign: 'center',
    letterSpacing: -0.2,
  },

  subtitle: {
    marginTop: SPACING.small,
    fontFamily: FONTS.regular,
    fontSize: FONT_SIZES.medium,
    lineHeight: FONT_SIZES.small + 7,
    color: COLORS.textSecondary,
    textAlign: 'center',
  },

  // FEATURES CARD
  card: {
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.large,
    padding: SPACING.xl,
    borderWidth: 1,
    borderColor: COLORS.border,
  },

  cardTitle: {
    fontFamily: FONTS.bold,
    fontSize: FONT_SIZES.title,
    color: COLORS.text,
    marginBottom: SPACING.large,
  },

  // FEATURE ITEMS
  item: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: SPACING.large,
  },

  lastItem: {
    marginBottom: 0,
  },

  check: {
    width: 28,
    height: 28,
    borderRadius: RADIUS.round,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: SPACING.medium,
    marginTop: 1,
    overflow: 'hidden',
  },

  checkText: {
    color: COLORS.white,
    fontSize: FONT_SIZES.small,
    fontFamily: FONTS.bold,
  },

  itemContent: {
    flex: 1,
    paddingTop: 2,
  },

  itemText: {
    fontFamily: FONTS.medium,
    fontSize: FONT_SIZES.body,
    lineHeight: FONT_SIZES.small + 6,
    color: COLORS.text,
  },

  itemSubText: {
    marginTop: 4,
    fontFamily: FONTS.regular,
    fontSize: 12,
    lineHeight: 18,
    color: COLORS.textSecondary,
  },

  // NOTE
  note: {
    marginTop: SPACING.large,
    textAlign: 'center',
    fontFamily: FONTS.regular,
    fontSize: FONT_SIZES.selected,
    lineHeight: 18,
    color: COLORS.textMuted,
  },

  // FOOTER
  footer: {
    paddingHorizontal: SPACING.xxl,
    paddingBottom: SPACING.xl,
  },

  buttonWrapper: {
    borderRadius: RADIUS.medium,
    overflow: 'hidden',
  },

  // GRADIENT CONTINUE BUTTON
  button: {
    height: 54,
    borderRadius: RADIUS.medium,
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

