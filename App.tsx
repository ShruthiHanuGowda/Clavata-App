import {SafeAreaProvider} from 'react-native-safe-area-context';
import React from 'react';
import Navigation from './navigation';

import {Magic} from '@magic-sdk/react-native-bare';
import {OAuthExtension} from '@magic-ext/react-native-bare-oauth';
import Web3 from 'web3';
import {ENV, API_KEY} from './config/env';
import {GDKMSExtension} from '@magic-ext/gdkms';
import {GestureHandlerRootView} from 'react-native-gesture-handler';
import {Appearance, View, useColorScheme} from 'react-native';
import LoginScreenNew from './Src/Screens/AuthScreens/loginScreenNew';
import {MagicProvider} from './screens/Provider/MagicProvider';
import NavigationWrapper from './Src/Navigation';
import {AuthProvider} from './screens/Provider/authProvider';
import {GraphQLProvider} from './screens/Provider/GraphQLProvider';
import {WalletProvider} from './screens/Provider/WalletProvider';
import {KycProvider} from './Src/CustomHooks/KYC/KYCProvider';
import {KycServiceProvider} from './Src/CustomHooks/KYC/KycServiceProvider';

export default function App() {
  Appearance.setColorScheme('light');
  const [env, setEnv] = React.useState(ENV.PROD);

  const magic = new Magic(API_KEY[env], {
    extensions: [new OAuthExtension(), new GDKMSExtension()],
  });

  const web3 = new Web3(magic.rpcProvider as any);

  const magicProps = {
    magic,
    web3,
    setEnv,
    env,
  };

  return (
    <View style={{flex: 1}}>
      <GestureHandlerRootView style={{flex: 1}}>
        <MagicProvider apiKey="pk_live_F22A388602152902">
          <GraphQLProvider>
            <AuthProvider>
              {/* <LoginScreen /> */}
              <WalletProvider>
                <KycProvider>
                  <KycServiceProvider>
                    <NavigationWrapper />
                  </KycServiceProvider>
                </KycProvider>
              </WalletProvider>
            </AuthProvider>
            {/* <Navigation colorScheme={colorScheme} magicProps={magicProps} /> */}
          </GraphQLProvider>
        </MagicProvider>
      </GestureHandlerRootView>
    </View>
  );
}
