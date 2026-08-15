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
  // ============================================================
  // BACK TO LOGIN
  // ============================================================
  //
  // BecomePartnerScreen is inside PartnerStack.
  //
  // Navigation hierarchy:
  //
  // RootScreenStack
  //   └── BecomePartner
  //         └── PartnerStack
  //               └── BecomePartnerScreen
  //
  // LoginScreen is in RootScreenStack.
  //
  // Therefore we go up through the parent navigators and then
  // navigate to LoginScreen.
  //
  // This is the FIRST-TIME provider registration flow.
  // Pressing Back must return to LoginScreen.
  //
  // ============================================================

  const handleBack = () => {
    const partnerNavigator =
      navigation.getParent();

    const rootNavigator =
      partnerNavigator?.getParent();

    if (rootNavigator) {
      rootNavigator.navigate('LoginScreen', {
        mode: 'PROVIDER',
        hideBackButton: false,
      });

      return;
    }

    // Fallback in case navigator hierarchy changes.
    if (navigation.canGoBack()) {
      navigation.goBack();
    }
  };

  // ============================================================
  // CONTINUE
  // ============================================================

  const handleContinue = () => {
    navigation.navigate('SalonRegistration');
  };

  return (
    <SafeAreaView style={styles.container}>

      {/* ======================================================
          HEADER
      ====================================================== */}

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
          <Text style={styles.backIcon}>
            ‹
          </Text>
        </TouchableOpacity>

        <Text style={styles.headerTitle}>
          Become a Partner
        </Text>

        <View style={styles.headerSpacer} />

      </View>

      {/* ======================================================
          MAIN CONTENT
      ====================================================== */}

      <View style={styles.content}>

        {/* ====================================================
            HERO
        ==================================================== */}

        <View style={styles.hero}>

          <View style={styles.iconCircle}>
            <Text style={styles.icon}>
              ✦
            </Text>
          </View>

          <Text style={styles.title}>
            Grow your business with Clavata
          </Text>

          <Text style={styles.subtitle}>
            List your salon, connect with customers and manage
            your business effortlessly.
          </Text>

        </View>

        {/* ====================================================
            FEATURES CARD
        ==================================================== */}

        <View style={styles.card}>

          <Text style={styles.cardTitle}>
            Everything you need
          </Text>

          {/* ------------------------------------------------
              FEATURE 1
          ------------------------------------------------ */}

          <View style={styles.item}>

            <View style={styles.check}>
              <Text style={styles.checkText}>
                ✓
              </Text>
            </View>

            <Text style={styles.itemText}>
              Reach more local customers
            </Text>

          </View>

          {/* ------------------------------------------------
              FEATURE 2
          ------------------------------------------------ */}

          <View style={styles.item}>

            <View style={styles.check}>
              <Text style={styles.checkText}>
                ✓
              </Text>
            </View>

            <Text style={styles.itemText}>
              Manage bookings with ease
            </Text>

          </View>

          {/* ------------------------------------------------
              FEATURE 3
          ------------------------------------------------ */}

          <View style={styles.item}>

            <View style={styles.check}>
              <Text style={styles.checkText}>
                ✓
              </Text>
            </View>

            <Text style={styles.itemText}>
              Grow your salon business
            </Text>

          </View>

          {/* ------------------------------------------------
              FEATURE 4
          ------------------------------------------------ */}

          <View
            style={[
              styles.item,
              styles.lastItem,
            ]}
          >

            <View style={styles.check}>
              <Text style={styles.checkText}>
                ✓
              </Text>
            </View>

            <Text style={styles.itemText}>
              Accept secure online payments
            </Text>

          </View>

        </View>

        {/* ====================================================
            NOTE
        ==================================================== */}

        <Text style={styles.note}>
          It only takes a few minutes to get started.
        </Text>

      </View>

      {/* ======================================================
          FOOTER
      ====================================================== */}

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
  // HEADER
  // ==========================================================

  header: {
    height: 64,

    flexDirection: 'row',

    alignItems: 'center',

    paddingHorizontal:
      SPACING.large,

    borderBottomWidth: 1,

    borderBottomColor:
      COLORS.border,

    backgroundColor:
      COLORS.background,
  },

  backButton: {
    width: 40,
    height: 40,

    alignItems: 'flex-start',

    justifyContent: 'center',
  },

  backIcon: {
    fontFamily:
      FONTS.regular,

    fontSize: 36,

    lineHeight: 38,

    fontWeight: '300',

    color:
      COLORS.primary,

    includeFontPadding: false,
  },

  headerTitle: {
    flex: 1,

    textAlign: 'center',

    fontFamily:
      FONTS.semiBold,

    fontSize:
      FONT_SIZES.medium,

    lineHeight: 21,

    fontWeight: '600',

    color:
      COLORS.primary,

    includeFontPadding: false,
  },

  headerSpacer: {
    width: 40,
  },

  // ==========================================================
  // CONTENT
  // ==========================================================

  content: {
    flex: 1,

    paddingHorizontal:
      SPACING.xxl,

    paddingTop:
      SPACING.xxxl,
  },

  // ==========================================================
  // HERO
  // ==========================================================

  hero: {
    alignItems: 'center',

    paddingHorizontal:
      SPACING.small,

    marginBottom:
      SPACING.xxxl,
  },

  iconCircle: {
    width: 58,
    height: 58,

    borderRadius:
      RADIUS.round,

    backgroundColor:
      COLORS.black,

    alignItems: 'center',

    justifyContent: 'center',

    marginBottom:
      SPACING.large,
  },

  icon: {
    fontSize: 24,

    color:
      COLORS.white,

    fontFamily:
      FONTS.medium,
  },

  title: {
    fontFamily:
      FONTS.semiBold,

    fontSize:
      FONT_SIZES.title,

    lineHeight:
      FONT_SIZES.title + 5,

    color:
      COLORS.text,

    textAlign:
      'center',

    letterSpacing: -0.2,
  },

  subtitle: {
    marginTop:
      SPACING.small,

    fontFamily:
      FONTS.regular,

    fontSize:
      FONT_SIZES.small,

    lineHeight:
      FONT_SIZES.small + 7,

    color:
      COLORS.textSecondary,

    textAlign:
      'center',
  },

  // ==========================================================
  // CARD
  // ==========================================================

  card: {
    backgroundColor:
      COLORS.surface,

    borderRadius:
      RADIUS.large,

    padding:
      SPACING.xl,

    borderWidth: 1,

    borderColor:
      COLORS.border,
  },

  cardTitle: {
    fontFamily:
      FONTS.semiBold,

    fontSize:
      FONT_SIZES.body,

    color:
      COLORS.text,

    marginBottom:
      SPACING.large,
  },

  // ==========================================================
  // FEATURE ITEM
  // ==========================================================

  item: {
    flexDirection: 'row',

    alignItems: 'center',

    marginBottom:
      SPACING.large,
  },

  lastItem: {
    marginBottom: 0,
  },

  check: {
    width: 28,
    height: 28,

    borderRadius:
      RADIUS.round,

    backgroundColor:
      COLORS.black,

    alignItems: 'center',

    justifyContent: 'center',

    marginRight:
      SPACING.medium,
  },

  checkText: {
    color:
      COLORS.white,

    fontSize:
      FONT_SIZES.small,

    fontFamily:
      FONTS.bold,
  },

  itemText: {
    flex: 1,

    fontFamily:
      FONTS.regular,

    fontSize:
      FONT_SIZES.small,

    lineHeight:
      FONT_SIZES.small + 6,

    color:
      COLORS.text,
  },

  // ==========================================================
  // NOTE
  // ==========================================================

  note: {
    marginTop:
      SPACING.large,

    textAlign:
      'center',

    fontFamily:
      FONTS.regular,

    fontSize:
      FONT_SIZES.xs,

    color:
      COLORS.textMuted,
  },

  // ==========================================================
  // FOOTER
  // ==========================================================

  footer: {
    paddingHorizontal:
      SPACING.xxl,

    paddingBottom:
      SPACING.xl,
  },

  // ==========================================================
  // CONTINUE BUTTON
  // ==========================================================

  button: {
    height: 54,

    borderRadius:
      RADIUS.medium,

    backgroundColor:
      COLORS.black,

    flexDirection: 'row',

    alignItems: 'center',

    justifyContent: 'center',
  },

  buttonText: {
    color:
      COLORS.white,

    fontFamily:
      FONTS.semiBold,

    fontSize:
      FONT_SIZES.body,
  },

  arrow: {
    color:
      COLORS.white,
    fontSize: 25,
    lineHeight: 27,
    marginLeft:
      SPACING.small,
  },

});