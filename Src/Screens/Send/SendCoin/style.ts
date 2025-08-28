import {StyleSheet, TextStyle, ViewStyle} from 'react-native';
import {Colors, fontsFamily} from '../../../Theme';
import {SCREEN_WIDTH} from '../../../utils/screenSize';

interface Styles {
  container: ViewStyle;
  placeHolderStyle: TextStyle;
  headerStyle: TextStyle;
  fontStyle: TextStyle;
  nameFontStyle: TextStyle;
  seeAll: TextStyle;
  headerTitle: TextStyle;
  sendHeader: TextStyle;
  watt: TextStyle;
  textStyle: TextStyle;
  // Inline style replacements
  sendHeaderContainer: ViewStyle;
  inputWrapper: ViewStyle;
  errorContainer: ViewStyle;
  errorText: TextStyle;
  safeAreaContainer: ViewStyle;
  // Enhanced styles
  inputContainer: ViewStyle;
  amountInput: TextStyle;
  tokenBadge: ViewStyle;
  balanceContainer: ViewStyle;
  balanceRow: ViewStyle;
  balanceLabel: TextStyle;
  balanceValue: TextStyle;
  maxButton: ViewStyle;
  maxButtonText: TextStyle;
  // Success styles
  successContainer: ViewStyle;
  headerSection: ViewStyle;
  successIconContainer: ViewStyle;
  successAnimation: ViewStyle;
  title: TextStyle;
  subtitle: TextStyle;
  infoCard: ViewStyle;
  amountSection: ViewStyle;
  amountLabel: TextStyle;
  amountValue: TextStyle;
  networkFlow: ViewStyle;
  networkBadge: ViewStyle;
  networkText: TextStyle;
  arrowContainer: ViewStyle;
  arrow: TextStyle;
  hashSection: ViewStyle;
  hashLabel: TextStyle;
  hashContainer: ViewStyle;
  hashDisplay: ViewStyle;
  hashText: TextStyle;
  copyIcon: TextStyle;
  hashHint: TextStyle;
  explorerButton: ViewStyle;
  explorerIcon: TextStyle;
  submitButtonContainer: ViewStyle;
  submitButtonImage: ViewStyle;
}

export default StyleSheet.create<Styles>({
  container: {
    flex: 1,
    backgroundColor: Colors.white,
    // marginTop: 30,
  },
  placeHolderStyle: {
    fontFamily: fontsFamily.Mulish,
    color: '#BCBCBC',
    fontSize: 14,
    lineHeight: 18,
    marginLeft: 5,
  },
  headerStyle: {
    fontFamily: fontsFamily.Mulish,
    fontSize: 12,
    lineHeight: 20,
    color: '#9F9F9F',
    letterSpacing: 1.7,
    marginHorizontal: 5,
  },
  fontStyle: {
    fontFamily: fontsFamily.MulishBold,
    fontSize: 24,
    color: '#fff',
    //   lineHeight:38
  },
  nameFontStyle: {
    fontFamily: fontsFamily.MulishBold,
    fontSize: 20,
    color: '#000',
    //   lineHeight:19
  },
  seeAll: {
    fontFamily: fontsFamily.MulishSemiBold,
    fontSize: 12,
    color: '#81c8c3',
    textAlign: 'center',
    //   lineHeight:
  },
  headerTitle: {
    fontFamily: fontsFamily.MulishBold,
    fontSize: 12,
    color: '#000',
    maxWidth: SCREEN_WIDTH - 170,
    textTransform: 'uppercase',
  },
  sendHeader: {
    fontFamily: fontsFamily.MulishBold,
    fontSize: 12,
    color: '#6B6B6B',
    lineHeight: 16,
  },
  watt: {
    fontFamily: fontsFamily.MulishBold,
    fontSize: 12,
    color: '#000',
    lineHeight: 15,
    marginHorizontal: 10,
  },
  textStyle: {
    fontFamily: fontsFamily.MulishBold,
  },
  // Inline style replacements
  sendHeaderContainer: {
    marginHorizontal: 20,
  },
  inputWrapper: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorContainer: {
    padding: 10,
  },
  errorText: {
    color: '#F42121',
    fontSize: 12,
  },
  safeAreaContainer: {
    backgroundColor: '#fff',
    flex: 1,
  },
  // Enhanced styles
  inputContainer: {
    width: '90%',
    position: 'relative',
    flexDirection: 'row',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#E7E7E7',
  },
  amountInput: {
    flex: 1,
    color: '#000000',
    fontFamily: fontsFamily.MulishBold,
    fontSize: 36,
    textAlign: 'left',
    paddingRight: 10,
  },
  tokenBadge: {
    borderWidth: 1,
    borderColor: '#E8E8E8',
    backgroundColor: '#E8E8E8',
    padding: 10,
    borderRadius: 7,
    position: 'absolute',
    right: 0,
  },
  balanceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E0E0E0',
    marginTop: 20,
    borderRadius: 7,
    paddingHorizontal: 15,
    paddingVertical: 12,
    justifyContent: 'space-between',
    width: '90%',
  },
  balanceRow: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  balanceLabel: {
    fontFamily: fontsFamily.Mulish,
    fontSize: 12,
    color: '#848484',
  },
  balanceValue: {
    fontFamily: fontsFamily.MulishBold,
    marginLeft: 10,
    color: '#000',
    flex: 1,
  },
  maxButton: {
    backgroundColor: '#81c8c3',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 6,
    marginLeft: 10,
    shadowColor: '#81c8c3',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  maxButtonText: {
    color: '#FFF',
    fontFamily: fontsFamily.MulishBold,
    fontSize: 12,
    fontWeight: '700',
  },
  // Success styles
  successContainer: {
    flex: 1,
    backgroundColor: '#FFF',
    paddingHorizontal: 20,
  },
  headerSection: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  successIconContainer: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#E8F5E8',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
    shadowColor: '#4CAF50',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  successAnimation: {
    width: 80,
    height: 80,
  },
  title: {
    fontSize: 28,
    color: '#1A1A1A',
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    lineHeight: 22,
  },
  infoCard: {
    backgroundColor: '#F8F9FA',
    borderRadius: 20,
    padding: 24,
    marginBottom: 30,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  amountSection: {
    alignItems: 'center',
    marginBottom: 24,
    paddingBottom: 24,
    borderBottomWidth: 1,
    borderBottomColor: '#E9ECEF',
  },
  amountLabel: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
  },
  amountValue: {
    fontSize: 32,
    color: '#1A1A1A',
    marginBottom: 16,
  },
  networkFlow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  networkBadge: {
    backgroundColor: '#81c8c3',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  networkText: {
    color: '#FFF',
    fontSize: 12,
    fontWeight: '600',
  },
  arrowContainer: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: '#FFF',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#E9ECEF',
  },
  arrow: {
    fontSize: 16,
    color: '#81c8c3',
    fontWeight: 'bold',
  },
  hashSection: {
    marginBottom: 24,
  },
  hashLabel: {
    fontSize: 14,
    color: '#666',
    marginBottom: 12,
    textAlign: 'center',
  },
  hashContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 8,
  },
  hashDisplay: {
    flex: 1,
    backgroundColor: '#FFF',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E9ECEF',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  hashText: {
    fontSize: 16,
    color: '#1A1A1A',
    fontFamily: 'monospace',
    fontWeight: '600',
    flex: 1,
  },
  copyIcon: {
    fontSize: 16,
    marginLeft: 8,
  },
  hashHint: {
    fontSize: 12,
    color: '#999',
    textAlign: 'center',
    fontStyle: 'italic',
  },
  explorerButton: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: '#81c8c3',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#81c8c3',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  explorerIcon: {
    fontSize: 20,
  },
  submitButtonContainer: {
    height: 51,
    borderRadius: 12,
    marginBottom: 20,
    marginHorizontal: 0,
  },
  submitButtonImage: {
    height: 51,
    width: '100%',
  },
});
