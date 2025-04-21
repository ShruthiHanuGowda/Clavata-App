import {SafeAreaProvider} from 'react-native-safe-area-context';
import React from 'react';
import useColorScheme from './hooks/useColorScheme';

import {ENV, API_KEY} from './config/env';
import {MagicProvider} from './screens/Provider/MagicProvider';
import {View} from 'react-native';
import {GestureHandlerRootView} from 'react-native-gesture-handler';
import NavigationWrapper from './Src/Navigation';
import {AuthProvider} from './screens/Provider/authProvider';
import {GraphQLProvider} from './screens/Provider/GraphQLProvider';
import {KycServiceProvider} from './Src/CustomHooks/KYC/KycServiceProvider';
import {KycProvider} from './Src/CustomHooks/KYC/KYCProvider';
import {WalletProvider} from './screens/Provider/WalletProvider';

export default function App() {
  const colorScheme = useColorScheme();

  const [env, setEnv] = React.useState(ENV.PROD);

  return (
    <View style={{flex: 1}}>
      <GestureHandlerRootView style={{flex: 1}}>
        <GraphQLProvider>
          <MagicProvider apiKey="pk_live_F22A388602152902">
            {/* <LoginScreen /> */}
            <AuthProvider>
              <WalletProvider>
                <KycProvider>
                  <KycServiceProvider>
                    <NavigationWrapper />
                  </KycServiceProvider>
                </KycProvider>
              </WalletProvider>
            </AuthProvider>
            {/* <Navigation colorScheme={colorScheme} magicProps={magicProps} /> */}
          </MagicProvider>
        </GraphQLProvider>
      </GestureHandlerRootView>
    </View>
  );
}
