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
});
