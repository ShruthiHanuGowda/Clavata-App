import React, {useState} from 'react';
import {View, Button} from 'react-native';
import {SafeAreaProvider} from 'react-native-safe-area-context';
// import { useAuth } from '../../Providers/authProvider.tsx';
import {Magic} from '@magic-sdk/react-native-bare';
import {useMagic} from '../../../screens/Provider/MagicProvider';
import {navigationRef} from '../../Navigation';
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
const LoginScreenNew: React.FC = (props: {magic: any; web3?: any}) => {
  const {magic, magic_sepolia, magic_denergy, setActiveNetwork} = useMagic();
  // const {magic} = props;
  // const {updateUserData, isAuthenticated, userDetails} = useAuth();
  // console.log(':rocket: ~ isAuthenticated:', isAuthenticated, userDetails);
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
      console.log('try');
      const isLoggedOut = await magic.user.logout();
      console.log('isLoggedOut', isLoggedOut);

      await magic.auth.loginWithEmailOTP({email: 'j11@yopmail.com'});
      const res = await magic.user.getInfo();
      console.log('res', res);
      navigationRef?.navigate('appScreens');
      // Alert(JSON.stringify(res));
    } catch (err) {
      console.log(err);
    }
  };
  return (
    <SafeAreaProvider style={{paddingTop: 500}}>
      <View>
        <Button title="Login" onPress={handleLogin} />
      </View>
    </SafeAreaProvider>
  );
};
export default LoginScreenNew;
