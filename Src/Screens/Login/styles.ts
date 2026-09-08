import { StyleSheet } from 'react-native';

import {
  COLORS,
  FONTS,
  FONT_SIZES,
  SPACING,
  RADIUS,
} from '../../constants/constants';

const styles = StyleSheet.create({
  // ============================================================
  // SCREEN
  // ============================================================

  safeArea: {
    flex: 1,
    backgroundColor: COLORS.background,
  },

  flex: {
    flex: 1,
  },

  scrollContent: {
    flexGrow: 1,
    paddingBottom: SPACING.large,
  },

  // ============================================================
  // LOGO HEADER
  // ============================================================

  header: {
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',

    // Space above logo
    paddingTop: 100,

    // Small space below logo
    paddingBottom: 10,

    paddingHorizontal: SPACING.xxl,
  },

  // ============================================================
  // BACK BUTTON
  // ============================================================

  backButton: {
    position: 'absolute',

    left: SPACING.large,
    top: 20,

    width: 40,
    height: 40,

    alignItems: 'center',
    justifyContent: 'center',

    zIndex: 2,
  },

  back: {
    fontFamily: FONTS.regular,
    fontSize: 32,
    lineHeight: 34,
    color: COLORS.primary,

    includeFontPadding: false,
  },

  // ============================================================
  // LOGO
  // ============================================================

  heroLogo: {
    width: 150,
    height: 55,

    // No large margin here.
    // This keeps credentials close to the logo.
    marginBottom: 30,
  },

  // ============================================================
  // LOGIN CONTENT
  // ============================================================

  content: {
    width: '100%',

    paddingHorizontal: SPACING.xxl,

    // Small gap between logo and mobile input
    paddingTop: 10,
  },

  inputSection: {
    width: '100%',
  },

  inputLabel: {
    fontFamily: FONTS.semiBold,
    fontSize: FONT_SIZES.small,
    lineHeight: FONT_SIZES.small + 5,

    color: COLORS.primary,

    marginBottom: SPACING.small,

    includeFontPadding: false,
  },

  // ============================================================
  // CONTINUE BUTTON
  // ============================================================

  buttonContainer: {
    width: '100%',

    alignItems: 'center',

    marginTop: SPACING.xl,
  },

  loginBtnStyle: {
    width: '100%',
    maxWidth: 420,

    height: 52,

    borderRadius: RADIUS.medium,

    justifyContent: 'center',
    alignItems: 'center',
  },

  loginText: {
    fontFamily: FONTS.semiBold,
    fontSize: FONT_SIZES.medium,
    lineHeight: FONT_SIZES.medium + 4,

    color: COLORS.background,

    includeFontPadding: false,
  },

  // ============================================================
  // LEGAL FOOTER
  // ============================================================

  bottomContainer: {
    width: '100%',

    alignItems: 'center',

    marginTop: 'auto',

    paddingHorizontal: SPACING.xxl,

    paddingTop: SPACING.xxxl,

    paddingBottom: SPACING.large,
  },

  bottomText: {
    fontFamily: FONTS.regular,
    fontSize: FONT_SIZES.small,
    lineHeight: FONT_SIZES.small + 5,

    color: COLORS.primary,

    textAlign: 'center',

    includeFontPadding: false,
  },

  legalRow: {
    flexDirection: 'row',

    alignItems: 'center',
    justifyContent: 'center',

    marginTop: SPACING.small,
  },

  legalLink: {
    fontFamily: FONTS.semiBold,
    fontSize: FONT_SIZES.small,
    lineHeight: FONT_SIZES.small + 5,

    color: COLORS.primary,

    includeFontPadding: false,
  },

  separator: {
    fontFamily: FONTS.regular,
    fontSize: FONT_SIZES.small,
    lineHeight: FONT_SIZES.small + 5,

    color: COLORS.textMuted,

    marginHorizontal: SPACING.small,

    includeFontPadding: false,
  },
});

export default styles;