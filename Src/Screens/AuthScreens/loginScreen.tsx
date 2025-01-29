import React, {useState} from 'react';
import {Image, SafeAreaView, Text, View} from 'react-native';
import styles from './styles.ts';
import {Header} from '../../Componants';
import {KeyboardAwareScrollView} from 'react-native-keyboard-aware-scroll-view';
import {Images} from '../../Theme';
import {DEmailInput} from '../../Componants/Dinputs.tsx';
import DButton from '../../Componants/Dbutton.tsx';

const LoginScreen: React.FC = () => {

  const [isValid, setValid] = useState(false);
  const [userEmail, setUserEmail] = useState('');
  return (
    <View style={styles.container}>
      <SafeAreaView style={styles.container}>
        <Header headerTitle="Login" hideBorder={true} hideBackIcon={true} />
        <KeyboardAwareScrollView>
          <View style={styles.contentContainer}>
            <Image style={{ marginHorizontal: 15, marginTop: 50 }} source={Images.logoBlueNew} />
            <Text
              style={{
                ...styles.content,
                paddingVertical: 15,
                marginHorizontal: 15,
              }}
            >
              Welcome
            </Text>
            <View style={styles.emailInputWrapper}>
            <DEmailInput
              inputAccessoryViewID={'sendOtp'}
              setValid={setValid} value={userEmail} setValue={setUserEmail} />
              {!isValid && userEmail && <Text style={[styles.errorMessage]}>
                Please enter the valid email.
              </Text>}
            </View>
            <DButton
              type="primary"
              style={styles.loginBtnStyle}
              disabled={!(Boolean(userEmail) && isValid)}
              onPress={() => alert('credentialLogin')}
            >
              <Text style={[styles.loginText]}>Log In</Text>
            </DButton>
          </View>


        </KeyboardAwareScrollView>
      </SafeAreaView>
    </View>
  );
};


export default LoginScreen;
