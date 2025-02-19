import React, {useState} from 'react';
import {Image, Text, View, Alert} from 'react-native';
import styles from './styles.ts';
import {Header} from '../../Componants';
import {KeyboardAwareScrollView} from 'react-native-keyboard-aware-scroll-view';
import {Colors, Images} from '../../Theme';
import {DEmailInput} from '../../Componants/Dinputs.tsx';
import DButton from '../../Componants/Dbutton.tsx';
import {SafeAreaProvider} from 'react-native-safe-area-context';
import {navReset} from '../../Navigation/NavigationFunctions.ts';
import {useAuth} from '../../Providers/authProvider.tsx';
import { Magic } from '@magic-sdk/react-native-bare';

// Initialize Magic SDK

const magic = new Magic('pk_live_F22A388602152902');

interface UserAuth {
  issuer: string;
  publicAddress: string;
  email: string | null;
  phoneNumber: null | string;
  isMfaEnabled: boolean;
  recoveryFactors: string[];
}

const LoginScreen: React.FC = () => {
  const [isValid, setValid] = useState(false);
  const [userEmail, setUserEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const {updateUserData, isAuthenticated, userDetails} = useAuth();
  console.log('🚀 ~ isAuthenticated:', isAuthenticated, userDetails);
  
  // const { magic } = magicProps;

// Initialize Magic SDK


  // useEffect(() => {
  //   let timeout:any;
  //   if (loading) {
  //     timeout = setTimeout(() => {
  //       setLoading(false);
  //       Alert.alert('Timeout', 'No server response');
  //     }, 30000); // 15-second timeout
  //   }
  //   return () => clearTimeout(timeout);
  // }, [loading])

  const handleLogin = async () => {
    try {
      setLoading(true);
      await magic.auth.loginWithEmailOTP({ email: userEmail });
      const res = await magic.user.getInfo();
      console.log("res",res);
      // Alert(JSON.stringify(res));
      setLoading(false);
    } catch (err) {
      console.log(err);
    }
  };

  return (
    <SafeAreaProvider>
      {/* Magic Relayer Component */}
      <magic.Relayer
        backgroundColor="transparent"
        style={{
          position: 'absolute',
          zIndex: 9999,
          elevation: 9999,
          width: '100%',
          height: '100%',
        }}
      />
      <View
        style={{
          zIndex: 1, // Lower zIndex than Relayer
          opacity: loading ? 0 : 1, // Visual feedback
          pointerEvents: loading ? 'none' : 'auto', // Block interactions during loading
          backgroundColor: Colors?.white,
          flex: 1,
        }}>
        <Header headerTitle="Login" hideBorder={true} hideBackIcon={true} />
        <KeyboardAwareScrollView>
          <View style={styles.contentContainer}>
            <Image
              style={{marginHorizontal: 15, marginTop: 50}}
              source={Images.logoBlueNew}
            />
            <Text
              style={{
                ...styles.content,
                paddingVertical: 15,
                marginHorizontal: 15,
              }}>
              Welcome
            </Text>
            <View style={styles.emailInputWrapper}>
              <DEmailInput
                inputAccessoryViewID={'sendOtp'}
                setValid={setValid}
                value={userEmail}
                setValue={setUserEmail}
              />
              {!isValid && userEmail && (
                <Text style={[styles.errorMessage]}>
                  Please enter the valid email.
                </Text>
              )}
            </View>
            <DButton
              type="primary"
              style={styles.loginBtnStyle}
              disabled={!(userEmail && isValid) || loading}
              onPress={handleLogin}>
              <Text style={[styles.loginText]}>
                {loading ? 'Sending...' : 'Log In'}
              </Text>
            </DButton>
          </View>
        </KeyboardAwareScrollView>
      </View>
    </SafeAreaProvider>
  );
};

export default LoginScreen;
