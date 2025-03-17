import {SafeAreaProvider} from 'react-native-safe-area-context';
import React from 'react';
import useColorScheme from './hooks/useColorScheme';

import {Magic} from '@magic-sdk/react-native-bare';
import {OAuthExtension} from '@magic-ext/react-native-bare-oauth';
import Web3 from 'web3';
import {ENV, API_KEY} from './config/env';
import {BitcoinExtension} from '@magic-ext/bitcoin';
import {GDKMSExtension} from '@magic-ext/gdkms';
import {AuthExtension} from '@magic-ext/auth';
import {MagicProvider} from './screens/Provider/MagicProvider';
import {View} from 'react-native';
import {GestureHandlerRootView} from 'react-native-gesture-handler';
import LoginScreen from './screens/AuthScreens/LoginScreen';
import NavigationWrapper from './Src/Navigation';
import {AuthProvider} from './screens/Provider/authProvider';
import {GraphQLProvider} from './screens/Provider/GraphQLProvider';

export default function App() {
  const colorScheme = useColorScheme();

  const [env, setEnv] = React.useState(ENV.PROD);

  const magic = new Magic('pk_live_F22A388602152902', {
    extensions: [
      new OAuthExtension(),
      new AuthExtension(),
      new GDKMSExtension(),
      new BitcoinExtension({
        rpcUrl: 'BTC_RPC_NODE_URL',
        network: 'testnet', // testnet or mainnet
      }),
    ],
  });

  const web3 = new Web3(magic.rpcProvider);

  const magicProps = {
    magic,
    web3,
    setEnv,
    env,
  };

  return (
    <View style={{flex: 1}}>
      <GestureHandlerRootView style={{flex: 1}}>
        <GraphQLProvider>
          <MagicProvider
            apiKey="pk_live_F22A388602152902"
            btcRpcUrl="BTC_RPC_NODE_URL">
            {/* <LoginScreen /> */}
            <AuthProvider>
              <NavigationWrapper />
            </AuthProvider>
            {/* <Navigation colorScheme={colorScheme} magicProps={magicProps} /> */}
          </MagicProvider>
        </GraphQLProvider>
      </GestureHandlerRootView>
    </View>
  );
}
