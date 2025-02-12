import React, {useState, useEffect} from 'react';
import {Image, SafeAreaView, Text, View, Alert} from 'react-native';
import {Magic} from '@magic-sdk/react-native-bare';
import {RPCError, RPCErrorCode} from '@magic-sdk/react-native-bare';
import styles from './styles.ts';
import {Header} from '../../Componants';
import {KeyboardAwareScrollView} from 'react-native-keyboard-aware-scroll-view';
import {Images} from '../../Theme';
import {DEmailInput} from '../../Componants/Dinputs.tsx';
import DButton from '../../Componants/Dbutton.tsx';
import {SafeAreaProvider} from 'react-native-safe-area-context';
import {navReset} from '../../Navigation/NavigationFunctions.ts';

// Initialize Magic SDK

const magic = new Magic('pk_live_C45BDEA1B600F764');

const LoginScreen: React.FC = () => {
  const [isValid, setValid] = useState(false);
  const [userEmail, setUserEmail] = useState('');
  const [loading, setLoading] = useState(false);

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
      console.log('Function called just now', userEmail);
      setLoading(true);
      await magic.auth.loginWithEmailOTP({email: userEmail});

      const userInfo = await magic.user.getInfo();
      console.log(`UserInfo: ${userInfo}`);
      // Successful login - handle navigation or state update
      navReset('appScreens');
      Alert.alert('Check your email', 'We sent a magic link to your inbox');
    } catch (err) {
      console.log('🚀 ~ handleLogin ~ err:', err);
      if (err instanceof RPCError) {
        switch (err.code) {
          case RPCErrorCode.MagicLinkFailedVerification:
            Alert.alert('Error', 'Link verification failed');
            break;
          case RPCErrorCode.MagicLinkExpired:
            Alert.alert('Error', 'Magic link has expired');
            break;
          default:
            Alert.alert('Error', 'Authentication failed');
        }
      }
    } finally {
      setLoading(false);
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
