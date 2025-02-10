import React, {useState} from 'react';
import {Image, SafeAreaView, Text, View, Alert} from 'react-native';
import {Magic} from '@magic-sdk/react-native-bare';
import {RPCError, RPCErrorCode} from '@magic-sdk/react-native-bare';
import styles from './styles.ts';
import {Header} from '../../Componants';
import {KeyboardAwareScrollView} from 'react-native-keyboard-aware-scroll-view';
import {Images} from '../../Theme';
import {DEmailInput} from '../../Componants/Dinputs.tsx';
import DButton from '../../Componants/Dbutton.tsx';

// Initialize Magic SDK

const magic = new Magic('pk_live_F22A388602152902');

const LoginScreen: React.FC = () => {
  const [isValid, setValid] = useState(false);
  const [userEmail, setUserEmail] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    try {
      console.log("Function called just now", userEmail);
      setLoading(true);
      await magic.auth.loginWithEmailOTP({
        email: userEmail,
      });
      // Successful login - handle navigation or state update
      Alert.alert('Check your email', 'We sent a magic link to your inbox');
    } catch (err) {
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
    <View style={styles.container}>
      <SafeAreaView style={styles.container}>
        {/* Magic Relayer Component */}
        <magic.Relayer />
        <Header headerTitle="Login" hideBorder={true} hideBackIcon={true} />
        <KeyboardAwareScrollView>
          <View style={styles.contentContainer}>
            <Image 
              style={{ marginHorizontal: 15, marginTop: 50 }} 
              source={Images.logoBlueNew} 
            />
            <Text style={{...styles.content, paddingVertical: 15, marginHorizontal: 15}}>
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
                  Please enter a valid email
                </Text>
              )}
            </View>
            <DButton
              type="primary"
              style={styles.loginBtnStyle}
              disabled={!(userEmail && isValid) || loading}
              onPress={handleLogin}
            >
              <Text style={[styles.loginText]}>
                {loading ? 'Sending...' : 'Log In'}
              </Text>
            </DButton>
          </View>
        </KeyboardAwareScrollView>
      </SafeAreaView>
    </View>
  );
};

export default LoginScreen;
