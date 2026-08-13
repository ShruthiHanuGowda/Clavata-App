import {
  StyleSheet,
  Dimensions,
} from 'react-native';

const { width } = Dimensions.get('window');

const PRIMARY = '#009D94';
const PRIMARY_DARK = '#007F78';
const BACKGROUND = '#F8FAFA';
const TEXT = '#152525';
const MUTED = '#748383';
const BORDER = '#E1E9E8';

export default StyleSheet.create({

  safeAreaContainer: {
    flex: 1,
    backgroundColor: BACKGROUND,
  },

  container: {
    flex: 1,
    paddingHorizontal: 24,
  },

  /* -------------------------
     Back
  ------------------------- */

  backButton: {
    position: 'absolute',
    top: 12,
    left: 20,

    width: 44,
    height: 44,

    justifyContent: 'center',
    alignItems: 'center',

    zIndex: 10,
  },

  back: {
    fontSize: 36,
    fontWeight: '300',
    color: TEXT,

    marginTop: -4,
  },

  /* -------------------------
     Main
  ------------------------- */

  loginContent: {
    paddingTop: 70,
    width: '100%',
    maxWidth: 520,
    alignSelf: 'center',
  },

  /* -------------------------
     Brand
  ------------------------- */

  brandContainer: {
    alignItems: 'center',
    marginBottom: 35,
  },

  brand: {
    fontSize: 25,
    fontWeight: '800',

    color: PRIMARY,

    letterSpacing: 1.2,
  },

  brandLine: {
    width: 24,
    height: 3,

    borderRadius: 2,

    backgroundColor: PRIMARY,

    marginTop: 8,
  },

  /* -------------------------
     Heading
  ------------------------- */

  headingContainer: {
    alignItems: 'center',

    marginBottom: 42,
  },

  title: {
    fontSize: 30,
    fontWeight: '700',

    color: TEXT,

    letterSpacing: -0.6,

    marginBottom: 10,
  },

  subtitle: {
    fontSize: 15,
    lineHeight: 23,

    color: MUTED,

    textAlign: 'center',
  },

  /* -------------------------
     Input
  ------------------------- */

  inputSection: {
    width: '100%',

    marginBottom: 24,
  },

  inputLabel: {
    fontSize: 14,
    fontWeight: '600',

    color: TEXT,

    marginBottom: 9,
    marginLeft: 3,
  },

  emailInputWrapper: {
    width: '100%',
  },

  helperText: {
    fontSize: 12.5,
    lineHeight: 18,

    color: MUTED,

    marginTop: 9,
    marginLeft: 3,
  },

  /* -------------------------
     Button
  ------------------------- */

  loginBtnStyle: {
    width: '100%',
    height: 54,
    borderRadius: 16,
    backgroundColor: PRIMARY,

    alignItems: 'center',
    justifyContent: 'center',

    shadowColor: PRIMARY,
    shadowOffset: {
      width: 0,
      height: 5,
    },
    shadowOpacity: 0.16,
    shadowRadius: 10,

    elevation: 3,
  },

  loginText: {
    color: '#FFFFFF',

    fontSize: 16,
    fontWeight: '700',

    letterSpacing: 0.2,
  },

  /* -------------------------
     Bottom
  ------------------------- */

  bottomContainer: {
    alignItems: 'center',
    paddingBottom: 22,
    paddingTop: 14,
  },

  bottomText: {
    fontSize: 11.5,
    color: MUTED,
    textAlign: 'center',
    marginBottom: 6,
  },

  legalRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },

  legalLink: {
    fontSize: 12,

    color: PRIMARY,

    fontWeight: '600',
  },

  separator: {
    fontSize: 11,

    color: BORDER,
  },
});