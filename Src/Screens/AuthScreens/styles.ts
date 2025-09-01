import {StyleSheet, TextStyle, ViewStyle} from 'react-native';
import Colors from '../../Theme/Colors';
import fontsFamily from '../../Theme/fontsFamily';

// Define the types for different style objects
interface Styles {
  container: ViewStyle;
  contentContainer: ViewStyle;
  content: TextStyle;
  emailInputWrapper: ViewStyle;
  errorMessage: TextStyle;
  loginBtnStyle: ViewStyle;
  loginText: TextStyle;
  loadingContainer: ViewStyle;
  lottieAnimation: ViewStyle;
  flexContainer: ViewStyle;
}

// Define your styles using StyleSheet.create
const styles = StyleSheet.create<Styles>({
  container: {
    flex: 1,
    backgroundColor: Colors.white,
  },
  contentContainer: {
    marginTop: 10,
  },
  content: {
    color: '#747474',
    fontSize: 14,
    fontFamily: fontsFamily.MulishSemiBold,
  },
  emailInputWrapper: {
    marginTop: 10,
    marginHorizontal: 15,
  },
  errorMessage: {
    marginTop: 2,
    color: Colors.error,
    fontSize: 12,
    fontFamily: fontsFamily.MulishSemiBold,
  },
  loginBtnStyle: {
    marginTop: 18,
    alignItems: 'center',
    justifyContent: 'center',
    width: '94%',
    alignSelf: 'center',
    marginBottom: 10,
  },
  loginText: {
    fontFamily: fontsFamily.MulishBold,
    fontSize: 14,
    color: Colors.white,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
    paddingHorizontal: 20,
  },
  lottieAnimation: {
    width: 150,
    height: 150,
  },
  flexContainer: {
    flex: 1,
  },
});

export default styles;
