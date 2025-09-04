import React, {useEffect, useState} from 'react';
import {GestureHandlerRootView} from 'react-native-gesture-handler';
import {
  Appearance,
  View,
  StyleSheet,
  ActivityIndicator,
  Text,
} from 'react-native';
import JailMonkey from 'jail-monkey'; // ✅ Import jailbreak detection

import {MagicProvider} from './screens/Provider/MagicProvider';
import NavigationWrapper from './Src/Navigation';
import {AuthProvider} from './screens/Provider/authProvider';
import {GraphQLProvider} from './screens/Provider/GraphQLProvider';
import {WalletProvider} from './screens/Provider/WalletProvider';
import {GlobalKycProvider} from './Src/CustomHooks/GlobalKycProvider';
import GlobalKycBottomSheet from './Src/CustomHooks/GlobalKycBottomSheet';
import {NftProvider} from './screens/Provider/NftProvider';
import {MAGIC_API_KEY_PROD} from './Src/constants';
import {fontsFamily} from './Src/Theme';
import colors from './Src/Theme/Colors';

export default function App() {
  Appearance.setColorScheme('light');

  const [isSecureDevice, setIsSecureDevice] = useState<Boolean>(true);

  useEffect(() => {
    const checkDeviceSecurity = async () => {
      const jailBroken = JailMonkey.isJailBroken();
      const canMockLocation = JailMonkey.canMockLocation();

      if (jailBroken || canMockLocation) {
        setIsSecureDevice(false);
      } else {
        setIsSecureDevice(true);
      }
    };

    checkDeviceSecurity();
  }, []);

  if (isSecureDevice === null) {
    // Still checking
    return (
      <View style={[styles.container, styles.center]}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  if (!isSecureDevice) {
    // Device is insecure, block usage
    return (
      <View style={[styles.container, styles.center]}>
        <Text style={styles?.ErrorText}>
          This device is not allowed to use the app.
        </Text>
      </View>
    );
  }

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
  center: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  ErrorText: {
    fontFamily: fontsFamily.MulishBold,
    color: colors.error,
  },
});
