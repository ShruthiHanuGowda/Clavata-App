import React from 'react';
import {
  SafeAreaView,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import {
  COLORS,
  FONTS,
  FONT_SIZES,
  SPACING,
  RADIUS,
} from '../../constants/constants';

export default function SalonPendingVerificationScreen() {
  const navigation = useNavigation<any>();

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
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

        <Text style={styles.headerTitle}>
          Verification Status
        </Text>

        <View style={styles.headerSpacer} />
      </View>

      {/* Main Content */}
      <View style={styles.content}>
        {/* Status Icon */}
        <View style={styles.iconOuter}>
          <View style={styles.iconInner}>
            <View style={styles.clockCircle}>
              <View style={styles.clockHandVertical} />
              <View style={styles.clockHandHorizontal} />
            </View>
          </View>
        </View>

        {/* Status Badge */}
        <View style={styles.statusBadge}>
          <View style={styles.statusDot} />

          <Text style={styles.statusText}>
            VERIFICATION IN PROGRESS
          </Text>
        </View>

        {/* Title */}
        <Text style={styles.title}>
          Your salon is under review
        </Text>

        {/* Description */}
        <Text style={styles.description}>
          We've received your salon registration and KYC
          documents successfully.
        </Text>

        <Text style={styles.description}>
          Our team is currently reviewing your business
          information and documents.
        </Text>

        {/* Information Card */}
        <View style={styles.infoCard}>
          <View style={styles.infoIconContainer}>
            <Text style={styles.infoIcon}>i</Text>
          </View>

          <View style={styles.infoContent}>
            <Text style={styles.infoTitle}>
              What happens next?
            </Text>

            <Text style={styles.infoText}>
              Once your verification is complete, you'll be
              able to access your salon dashboard and start
              managing your services and bookings.
            </Text>
          </View>
        </View>

        {/* Bottom Note */}
        <Text style={styles.note}>
          We'll notify you once your salon has been approved.
        </Text>
      </View>

      {/* Bottom Action */}
      <View style={styles.bottomContainer}>
        <TouchableOpacity
          style={styles.backToHomeButton}
          activeOpacity={0.8}
          onPress={() => {
            navigation.replace('LoginScreen', {
              mode: 'SIGN_IN',
              phoneNumber: '',
              hideBackButton: true,
            });
          }}
        >
          <Text style={styles.backToHomeText}>
            Back to Login
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },

  /* ============================================================
     HEADER
  ============================================================ */

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

  headerTitle: {
    flex: 1,
    textAlign: 'center',
    fontFamily: FONTS.semiBold,
    fontSize: FONT_SIZES.medium,
    lineHeight: 21,
    fontWeight: '600',
    color: COLORS.primary,
    includeFontPadding: false,
  },

  headerSpacer: {
    width: 40,
  },

  /* ============================================================
     CONTENT
  ============================================================ */

  content: {
    flex: 1,
    alignItems: 'center',
    paddingHorizontal: SPACING.xxl,
    paddingTop: SPACING.xxxl,
  },

  /* ============================================================
     VERIFICATION ICON
  ============================================================ */

  iconOuter: {
    width: 112,
    height: 112,
    borderRadius: RADIUS.round,
    backgroundColor: 'rgba(0, 157, 148, 0.08)',
    alignItems: 'center',
    justifyContent: 'center',
  },

  iconInner: {
    width: 82,
    height: 82,
    borderRadius: RADIUS.round,
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: 'rgba(0, 157, 148, 0.20)',
    alignItems: 'center',
    justifyContent: 'center',
  },

  clockCircle: {
    width: 46,
    height: 46,
    borderRadius: RADIUS.round,
    borderWidth: 3,
    borderColor: COLORS.primary,
    position: 'relative',
  },

  clockHandVertical: {
    position: 'absolute',
    width: 3,
    height: 14,
    backgroundColor: COLORS.primary,
    left: 19,
    top: 7,
    borderRadius: 2,
  },

  clockHandHorizontal: {
    position: 'absolute',
    width: 11,
    height: 3,
    backgroundColor: COLORS.primary,
    left: 19,
    top: 20,
    borderRadius: 2,
    transform: [
      {
        rotate: '35deg',
      },
    ],
  },

  /* ============================================================
     STATUS BADGE
  ============================================================ */

  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: SPACING.xl,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: RADIUS.round,
    backgroundColor: 'rgba(0, 157, 148, 0.08)',
    borderWidth: 1,
    borderColor: 'rgba(0, 157, 148, 0.16)',
  },

  statusDot: {
    width: 7,
    height: 7,
    borderRadius: RADIUS.round,
    backgroundColor: COLORS.primary,
    marginRight: 8,
  },

  statusText: {
    fontFamily: FONTS.semiBold,
    fontSize: 10,
    lineHeight: 13,
    fontWeight: '700',
    letterSpacing: 0.7,
    color: COLORS.primary,
    includeFontPadding: false,
  },

  /* ============================================================
     TITLE
  ============================================================ */

  title: {
    marginTop: SPACING.large,
    fontFamily: FONTS.semiBold,
    fontSize: 27,
    lineHeight: 34,
    fontWeight: '600',
    color: COLORS.primary,
    textAlign: 'center',
    letterSpacing: -0.5,
    includeFontPadding: false,
  },

  /* ============================================================
     DESCRIPTION
  ============================================================ */

  description: {
    marginTop: SPACING.medium,
    maxWidth: 360,
    fontFamily: FONTS.regular,
    fontSize: FONT_SIZES.small,
    lineHeight: 21,
    color: COLORS.textSecondary,
    textAlign: 'center',
    includeFontPadding: false,
  },

  /* ============================================================
     INFORMATION CARD
  ============================================================ */

  infoCard: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginTop: SPACING.xxl,
    padding: SPACING.large,
    borderRadius: RADIUS.large,
    borderWidth: 1,
    borderColor: COLORS.border,
    backgroundColor: COLORS.surface,
  },

  infoIconContainer: {
    width: 30,
    height: 30,
    borderRadius: RADIUS.round,
    backgroundColor: 'rgba(0, 157, 148, 0.10)',
    borderWidth: 1,
    borderColor: 'rgba(0, 157, 148, 0.18)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: SPACING.medium,
  },

  infoIcon: {
    fontFamily: FONTS.semiBold,
    fontSize: 15,
    fontWeight: '700',
    color: COLORS.primary,
    includeFontPadding: false,
  },

  infoContent: {
    flex: 1,
  },

  infoTitle: {
    fontFamily: FONTS.semiBold,
    fontSize: FONT_SIZES.small,
    lineHeight: 19,
    fontWeight: '600',
    color: COLORS.primary,
    includeFontPadding: false,
  },

  infoText: {
    marginTop: 6,
    fontFamily: FONTS.regular,
    fontSize: FONT_SIZES.small,
    lineHeight: 20,
    color: COLORS.textSecondary,
    includeFontPadding: false,
  },

  /* ============================================================
     NOTE
  ============================================================ */

  note: {
    marginTop: SPACING.xl,
    paddingHorizontal: SPACING.medium,
    fontFamily: FONTS.regular,
    fontSize: FONT_SIZES.small,
    lineHeight: 19,
    color: COLORS.textSecondary,
    textAlign: 'center',
    includeFontPadding: false,
  },

  /* ============================================================
     BOTTOM BUTTON
  ============================================================ */

  bottomContainer: {
    paddingHorizontal: SPACING.xxl,
    paddingBottom: SPACING.xxl,
    paddingTop: SPACING.medium,
  },

  backToHomeButton: {
    height: 52,
    width: '100%',
    borderRadius: RADIUS.medium,
    backgroundColor: COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },

  backToHomeText: {
    fontFamily: FONTS.semiBold,
    fontSize: FONT_SIZES.medium,
    lineHeight: 20,
    fontWeight: '600',
    color: COLORS.background,
    includeFontPadding: false,
  },
});