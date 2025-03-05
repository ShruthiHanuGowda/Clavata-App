import React, {useState} from 'react';
import {TextInput, Text, View, Pressable, Button, Image} from 'react-native';
import {GestureHandlerRootView, ScrollView} from 'react-native-gesture-handler';
import {Card} from 'react-native-elements';
import {DeepLinkPage} from '@magic-sdk/react-native-bare';
import styles from './styles';
import {useMagic} from '../../../screens/Provider/MagicProvider';
import {useAuth} from '../../../screens/Provider/authProvider';
import {navReset} from '../../Navigation/NavigationFunctions';
import {DButton, Header} from '../../Componants';
import {Images} from '../../Theme';
import {DEmailInput} from '../../Componants/Dinputs';

export default function LoginScreen() {
  const {magic} = useMagic();
  const {updateUserData, isAuthenticated, userDetails} = useAuth();

  const [isValid, setValid] = useState(false);
  const [userEmail, setUserEmail] = useState('');
  const [loading, setLoading] = useState(false);

  const loginEmailOTP = async () => {
    try {
      setLoading(true);
      await magic.auth.loginWithEmailOTP({email: userEmail});
      const res = await magic.user.getInfo();
      updateUserData(res);
      navReset('appScreens');
    } catch (err) {
      setLoading(false);
      console.log(err);
    }
  };

  const magicGoogleSignIn = async () => {
    try {
      alert('gooogle');
      const res = await magic.oauth.loginWithPopup({
        provider: 'google',
        redirectURI:
          'https://auth.magic.link/v1/oauth2/ZYMdhQ3jc3_qiD41-vlRngGMSa7xGMAy0-NvmODXoSw=/callback',
      });
      alert(JSON.stringify(res));
    } catch (error) {
      console.log('🚀 ~ magicGoogleSignIn ~ error:', error);
    }
  };

  return (
    <View style={{flex: 1, backgroundColor: '#fff'}}>
      {/* Magic Relayer Component */}
      <View
        style={{
          zIndex: 1, // Lower zIndex than Relayer

          flex: 1,
        }}>
        <Header headerTitle="Login" hideBorder={true} hideBackIcon={true} />
        <ScrollView>
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
              onPress={() => loginEmailOTP()}>
              <Text style={[styles.loginText]}>
                {loading ? 'Sending...' : 'Log In'}
              </Text>
            </DButton>
            {/* <DButton onPress={() => magicGoogleSignIn()}>
              <Text style={[styles.loginText]}>Google</Text>
            </DButton> */}
          </View>
        </ScrollView>
      </View>
    </View>
  );
}

LoginScreen.navigationOptions = {
  header: null,
};
