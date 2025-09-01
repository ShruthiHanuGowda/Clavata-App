import {StyleSheet} from 'react-native';
import {Colors, fontsFamily} from '../../../Theme';

export default StyleSheet.create({
  font: {
    fontFamily: fontsFamily.MulishBold,
    fontSize: 18,
    color: '#1F1F1F',
    lineHeight: 22,
    marginHorizontal: 18,
    marginTop: 36,
    marginBottom: 20,
  },
  container: {
    backgroundColor: Colors.white,
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
  },
  fontStyle: {
    fontFamily: fontsFamily.MulishBold,
    fontSize: 24,
    color: '#fff',
  },
  nameFontStyle: {
    fontFamily: fontsFamily.MulishBold,
    fontSize: 20,
    color: '#000',
  },
  seeAll: {
    fontFamily: fontsFamily.MulishSemiBold,
    fontSize: 12,
    color: '#008060',
    textAlign: 'center',
  },
  headerTitle: {
    fontFamily: fontsFamily.MulishBold,
    fontSize: 12,
    color: '#000',
    marginLeft: 10,
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
  content: {
    color: '#747474',
    fontSize: 14,
    fontFamily: fontsFamily.MulishSemiBold,
  },
});
