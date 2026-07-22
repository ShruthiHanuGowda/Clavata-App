import { StyleSheet, TextStyle, ViewStyle, Platform } from 'react-native';
import Colors from '../../Theme/Colors';
import fontsFamily from '../../Theme/fontsFamily';

// Define the types for different style objects
interface Styles {
  container: ViewStyle;
  contentContainer: ViewStyle;
  title: TextStyle;
  subtitle: TextStyle;
  content: TextStyle;
  emailInputWrapper: ViewStyle;
  errorMessage: TextStyle;
  loginBtnStyle: ViewStyle;
  loginText: TextStyle;
  loadingContainer: ViewStyle;
  lottieAnimation: ViewStyle;
  flexContainer: ViewStyle;
  loginContent: ViewStyle;
  safeAreaContainer: ViewStyle;
  welcomeText: TextStyle;
  loadingMessage: TextStyle;
  loadingSubtitle: TextStyle;
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
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: '#111827',
    textAlign: 'center',
    // marginTop: 24,
  },

  loginContent: {
    // justifyContent: 'center',
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 90,
  },

  subtitle: {
    fontSize: 15,
    color: '#6B7280',
    textAlign: 'center',
    marginTop: 8,
    marginBottom: 32,
    paddingHorizontal: 20,
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
  safeAreaContainer: {
    flex: 1,
    backgroundColor: '#fff',
    paddingTop: Platform.OS === 'ios' ? 0 : 20,
  },
  welcomeText: {
    paddingVertical: 15,
    marginHorizontal: 15,
  },
  loadingMessage: {
    marginTop: 20,
    fontSize: 16,
    color: '#333',
    textAlign: 'center',
    fontWeight: '500',
  },
  loadingSubtitle: {
    marginTop: 8,
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
  },
});

export default styles;
