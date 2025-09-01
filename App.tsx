import React from 'react';

import {GestureHandlerRootView} from 'react-native-gesture-handler';
import {Appearance, View, StyleSheet} from 'react-native';
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
    <View style={styles.container}>
      <GestureHandlerRootView style={styles.container}>
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

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
