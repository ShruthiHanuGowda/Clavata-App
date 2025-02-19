import React, {useEffect} from 'react';
import {View} from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import {Colors} from './Src/Theme';
import NavigationWrapper from './Src/Navigation/index.tsx';
import {AuthProvider} from './Src/Providers/authProvider.tsx';
import BootSplash from 'react-native-bootsplash';
import { Magic } from '@magic-sdk/react-native-bare'
import { OAuthExtension } from "@magic-ext/react-native-bare-oauth";

function App(): React.JSX.Element {

  useEffect(() => {
    const init = async () => {
      // …do multiple sync or async tasks
    };

    init().finally(async () => {
      await BootSplash.hide({fade: true});
      console.log('BootSplash has been hidden successfully');
    });
  }, []);

  
  const magic = new Magic("pk_live_F22A388602152902", {
    extensions: [new OAuthExtension()]
  });

  // const web3 = new Web3(magic.rpcProvider);

  const magicProps = {
    magic,
    // web3,
    // setEnv,
    // env
  }

  const backgroundStyle = {
    backgroundColor: Colors.white,
    flex: 1,
  };

  return (
    <SafeAreaProvider style={backgroundStyle}>

      <View style={{flex: 1, backgroundColor: Colors.white}}>
        <AuthProvider>
          <NavigationWrapper magicProps={magicProps} />
        </AuthProvider>
      </View>
    </SafeAreaProvider>
  );
}

export default App;
