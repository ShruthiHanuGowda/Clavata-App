import {StyleSheet} from 'react-native';
import {Colors, fontsFamily} from '../../../Theme';
import {ScreenWidth} from '@rneui/base';

export default StyleSheet.create({
  screen: {backgroundColor: '#fff', flex: 1},
  container: {
    flex: 1,
    backgroundColor: Colors.white,
  },
  toggleContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: 15,
    marginVertical: 15,
  },
  toggleDropDown: {
    flexDirection: 'row',
    borderWidth: 1,
    borderColor: '#E8E8E8',
    backgroundColor: '#E8E8E8',
    padding: 10,
    borderRadius: 7,
    height: 50,
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  toggleDropDownText: {
    fontFamily: fontsFamily.MulishBold,
    fontSize: 12,
    color: '#000',
    lineHeight: 15,
    marginHorizontal: 10,
  },
  input: {
    color: '#000000',
    fontFamily: fontsFamily.MulishBold,
    padding: 5,
    fontSize: 36,
  },
  inputContainer: {
    marginHorizontal: 21,
    alignItems: 'center',
    justifyContent: 'center',
  },
  balanceContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: 15,
    marginVertical: 15,
  },
  swapToImageContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#E7E7E7',
    marginVertical: 20,
    marginHorizontal: 21,
  },
  swapToImagePadding: {
    backgroundColor: '#FFF',
    position: 'absolute',
    padding: 10,
  },
  swapToImage: {
    height: 20,
    width: 20,
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
    //   marginHorizontal:20
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
    color: '#008060',
    textAlign: 'center',
    //   lineHeight:
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
  textStyle: {
    fontFamily: fontsFamily.MulishBold,
  },
  content: {
    color: '#747474',
    fontSize: 14,
    fontFamily: fontsFamily.MulishSemiBold,
  },
  forgot: {
    fontFamily: fontsFamily.MulishBold,
    fontSize: 14,
    lineHeight: 22,
    color: '#000',
    textAlign: 'center',
  },
  page2Content: {
    fontFamily: fontsFamily.Mulish,
    fontSize: 14,
    color: '#747474',
  },
  errorSec: {
    marginTop: 10,
    padding: 5,
    borderWidth: 1,
    borderWidth: 1,
    borderColor: 'red',
    backgroundColor: '#FFFFFF',
    width: ScreenWidth - 42,
    borderRadius: 10,
    alignItems: 'center',
    alignSelf: 'center',
  },
  errorText: {
    fontFamily: fontsFamily.Mulish,
    fontSize: 12,
    color: 'red',
    letterSpacing: 1,
  },
});
