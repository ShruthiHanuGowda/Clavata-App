import { StyleSheet, Dimensions } from 'react-native';

const { width, height } = Dimensions.get('window');

const PRIMARY = '#9B2C83';
const PRIMARY_DARK = '#6A1B9A';

const TEXT = '#111827';
const MUTED = '#6B7280';
const BORDER = '#E5E7EB';

export default StyleSheet.create({

  /* =============================== */
  /* ROOT */
  /* =============================== */

  safeAreaContainer: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },

  flex: {
    flex: 1,
  },

  scrollContent: {
    flexGrow: 1,
    backgroundColor: '#FFFFFF',
  },

  /* =============================== */
  /* HERO */
  /* =============================== */

  heroContainer: {
    width: '100%',
    height: Math.min(height * 0.43, 390),
    position: 'relative',
    overflow: 'hidden',
    backgroundColor: PRIMARY_DARK,
  },

  heroImage: {
    width: '100%',
    height: '100%',
    position: 'absolute',
  },

  heroOverlay: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    height: 180,
    backgroundColor: 'rgba(0,0,0,0.16)',
  },

  /* =============================== */
  /* BACK BUTTON */
  /* =============================== */

  backButton: {
    position: 'absolute',
    top: 22,
    left: 20,

    width: 58,
    height: 58,

    borderRadius: 29,

    backgroundColor: 'rgba(255,255,255,0.96)',

    alignItems: 'center',
    justifyContent: 'center',

    elevation: 5,

    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 3,
    },
    shadowOpacity: 0.12,
    shadowRadius: 8,
  },

  back: {
    fontSize: 38,
    lineHeight: 42,
    fontWeight: '300',
    color: '#111827',

    marginTop: -3,
  },

  /* =============================== */
  /* HERO TEXT */
  /* =============================== */

  heroTextContainer: {
    position: 'absolute',

    left: 26,
    right: 26,
    bottom: 45,
  },

  heroTitle: {
    fontSize: 25,
    fontWeight: '800',
    color: '#FFFFFF',

    marginBottom: 7,

    letterSpacing: -0.4,
  },

  heroSubtitle: {
    fontSize: 14,
    lineHeight: 21,
    color: 'rgba(255,255,255,0.90)',

    maxWidth: 330,
  },

  /* =============================== */
  /* WHITE CONTENT CARD */
  /* =============================== */

  contentCard: {
    backgroundColor: '#FFFFFF',

    marginTop: -32,

    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,

    paddingHorizontal: 24,
    paddingTop: 34,
    paddingBottom: 34,

    position: 'relative',
  },

  /* =============================== */
  /* HEADING */
  /* =============================== */

  title: {
    fontSize: 32,
    lineHeight: 38,

    fontWeight: '800',

    color: TEXT,

    letterSpacing: -0.8,

    marginBottom: 7,
  },

  subtitle: {
    fontSize: 17,
    lineHeight: 24,

    color: MUTED,

    marginBottom: 32,
  },

  /* =============================== */
  /* INPUT */
  /* =============================== */

  inputSection: {
    width: '100%',
    marginBottom: 20,
  },

  inputLabel: {
    fontSize: 16,
    lineHeight: 22,

    fontWeight: '600',

    color: TEXT,

    marginBottom: 10,
  },

  emailInputWrapper: {
    width: '100%',
  },

  /* =============================== */
  /* CONTINUE BUTTON */
  /* =============================== */

  loginBtnStyle: {
    width: '100%',
    height: 56,

    borderRadius: 16,

    backgroundColor: PRIMARY,

    alignItems: 'center',
    justifyContent: 'center',

    marginTop: 4,

    elevation: 3,

    shadowColor: PRIMARY,
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.18,
    shadowRadius: 8,
  },

  loginText: {
    color: '#FFFFFF',

    fontSize: 17,
    fontWeight: '700',

    textAlign: 'center',

    width: '100%',
  },

  /* =============================== */
  /* SECURITY / OTP INFO */
  /* =============================== */

  securityContainer: {
    flexDirection: 'row',

    alignItems: 'center',

    marginTop: 24,

    paddingHorizontal: 2,
  },

  securityIcon: {
    width: 48,
    height: 48,

    borderRadius: 24,

    backgroundColor: '#FDF2F8',

    alignItems: 'center',
    justifyContent: 'center',

    marginRight: 14,
  },

  securityIconText: {
    fontSize: 24,
    fontWeight: '800',

    color: PRIMARY,
  },

  securityText: {
    flex: 1,

    fontSize: 14,
    lineHeight: 21,

    color: MUTED,

    fontWeight: '500',
  },

  /* =============================== */
  /* LEGAL */
  /* =============================== */

  bottomContainer: {
    alignItems: 'center',

    marginTop: 38,

    paddingTop: 4,
  },

  bottomText: {
    fontSize: 13,

    color: MUTED,

    textAlign: 'center',

    marginBottom: 5,
  },

  legalRow: {
    flexDirection: 'row',

    alignItems: 'center',

    justifyContent: 'center',
  },

  legalLink: {
    fontSize: 13,

    color: PRIMARY,

    fontWeight: '700',

    textDecorationLine: 'none',
  },

  separator: {
    fontSize: 13,

    color: MUTED,
  },
});