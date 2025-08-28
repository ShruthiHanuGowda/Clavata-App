import React from 'react';

import {GestureHandlerRootView} from 'react-native-gesture-handler';
import {Appearance, View} from 'react-native';
import {MagicProvider} from './screens/Provider/MagicProvider';
import NavigationWrapper from './Src/Navigation';
import {AuthProvider} from './screens/Provider/authProvider';
import {GraphQLProvider} from './screens/Provider/GraphQLProvider';
import {WalletProvider} from './screens/Provider/WalletProvider';
import {GlobalKycProvider} from './Src/CustomHooks/GlobalKycProvider';
import GlobalKycBottomSheet from './Src/CustomHooks/GlobalKycBottomSheet';
import {NftProvider} from './screens/Provider/NftProvider';
import {MAGIC_API_KEY_PROD} from './Src/constants';

export default function App() {
  Appearance.setColorScheme('light');

  return (
    <View style={{flex: 1}}>
      <GestureHandlerRootView style={{flex: 1}}>
        <MagicProvider apiKey={MAGIC_API_KEY_PROD}>
          <GraphQLProvider>
            <AuthProvider>
              <WalletProvider>
                <GlobalKycProvider>
                  <NftProvider>
                    <NavigationWrapper />
                  </NftProvider>
                  <GlobalKycBottomSheet />
                </GlobalKycProvider>
              </WalletProvider>
            </AuthProvider>
          </GraphQLProvider>
        </MagicProvider>
      </GestureHandlerRootView>
    </View>
  );
}
