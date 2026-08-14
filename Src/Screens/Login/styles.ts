import { StyleSheet, Dimensions } from 'react-native';
import { COLORS, FONTS, FONT_SIZES, SPACING, RADIUS } from '../../constants/constants';

const { height } = Dimensions.get('window');

const styles = StyleSheet.create({
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
  heroContainer: {
    width: '100%',
    minHeight: height * 0.25,
    backgroundColor: COLORS.badgeColor,
    // borderBottomWidth: 1,
    // borderBottomColor: COLORS.border,
    paddingHorizontal: SPACING.xxl,
    paddingTop: SPACING.xxl,
    paddingBottom: SPACING.xxl,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  backButton: {
    position: 'absolute',
    left: SPACING.large,
    top: SPACING.large,
    width: 38,
    height: 38,
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
  heroLogo: {
    width: 500,
    height: 200,
    marginBottom: SPACING.medium,
  },
  heroTitle: {
    fontFamily: FONTS.semiBold,
    fontSize: FONT_SIZES.heading,
    lineHeight: FONT_SIZES.heading + 5,
    color: COLORS.primary,
    textAlign: 'center',
    includeFontPadding: false,
    letterSpacing: -0.3,
  },
  heroSubtitle: {
    fontFamily: FONTS.regular,
    fontSize: FONT_SIZES.small,
    lineHeight: FONT_SIZES.small + 5,
    color: COLORS.textSecondary,
    textAlign: 'center',
    marginTop: SPACING.small,
    includeFontPadding: false,
  },
  content: {
    width: '100%',
    paddingHorizontal: SPACING.xxl,
    paddingTop: SPACING.xxxl,
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
    color: COLORS.textSecondary,
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