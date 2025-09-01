import {StyleSheet} from 'react-native';
import {Colors, fontsFamily} from '../../../Theme';

export default StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.white,
  },
  font: {
    fontFamily: fontsFamily.MulishBold,
    fontSize: 18,
    color: '#1F1F1F',
    lineHeight: 22,
  },
  content: {
    fontFamily: fontsFamily.MulishSemiBold,
    fontSize: 10,
    color: '#00201B',
    lineHeight: 20,
    letterSpacing: 1,
  },
  contentText: {
    fontFamily: fontsFamily.MulishExtraBold,
    fontSize: 28,
    color: '#000',
    lineHeight: 40,
    letterSpacing: 1,
  },
  pricetext: {
    fontFamily: fontsFamily.MulishSemiBold,
    fontSize: 12,
    color: '#000',
  },
  priceFont: {
    fontFamily: fontsFamily.MulishSemiBold,
    fontSize: 12,
    color: '#8F8F8F',
  },
  HeaderFont: {
    fontFamily: fontsFamily.MulishSemiBold,
    color: '#656565',
    fontSize: 12,
  },
  divider: {
    borderColor: '#E8E8E8',
    borderWidth: 0.5,
    width: '100%',
    marginLeft: 5,
  },
  coinName: {
    fontFamily: fontsFamily.MulishExtraBold,
    fontSize: 13,
    lineHeight: 16,
    color: '#515151',
    marginVertical: 4,
  },
  coinCode: {
    fontFamily: fontsFamily.MulishSemiBold,
    fontSize: 12,
    lineHeight: 16,
    color: '#A6A6A6',
  },
  valueFont: {
    color: '#0FB990',
    fontFamily: fontsFamily.MulishSemiBold,
    fontSize: 12,
    lineHeight: 16,
  },
  header: {
    fontFamily: fontsFamily.MulishBold,
    fontSize: 14,
    lineHeight: 22,
    color: '#000',
  },
  usdvalue: {
    color: '#000',
    fontSize: 24,
    fontFamily: fontsFamily.MulishSemiBold,
  },
  toggleView: {
    backgroundColor: '#EEEEEE',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 3,
    flexDirection: 'row',
    padding: 3,
    paddingRight: 0,
  },
  toggleItemStyle: {
    width: 50,
    fontSize: 12,
    textAlign: 'center',
    fontFamily: fontsFamily.MulishBold,
    color: '#000',
    borderRadius: 3,
    textTransform: 'capitalize',
  },
  Today: {
    marginLeft: 8,
    fontFamily: fontsFamily.MulishSemiBold,
    fontSize: 12,
    color: '#A6A6A6',
  },
  uploadBtn: {
    backgroundColor: '#009d94',
    opacity: 0.6,
    borderRadius: 32,
    flexDirection: 'row',
    justifyContent: 'center',
  },
  uploadBtnText: {
    color: 'white',
    fontFamily: 'Santral-Bold',
    fontSize: 14,
    alignSelf: 'center',
    padding: 13,
  },
});