import React, { useEffect, useState } from 'react';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import {
  Appearance,
  View,
  StyleSheet,
  ActivityIndicator,
  Text,
  Platform,
} from 'react-native';

import JailMonkey from 'jail-monkey';

import Navigation from './Src/Navigation/index.web';

import { AppProvider } from './Src/providers';
import GlobalKycBottomSheet from './Src/hooks/GlobalKycBottomSheet';
import GlobalWalletConnectModals from './Src/components/GlobalWalletConnectModals';
import { fontsFamily } from './Src/Theme';
import colors from './Src/Theme/Colors';

export default function App() {
  if (Platform.OS !== 'web') {
    Appearance.setColorScheme('light');
  }

  const [isSecureDevice, setIsSecureDevice] = useState(true);

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

    // Disabled for web
    // checkDeviceSecurity();
  }, []);

  if (!isSecureDevice) {
    return (
      <View style={[styles.container, styles.center]}>
        <Text style={styles.ErrorText}>
          This device is not allowed to use the app.
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <GestureHandlerRootView style={styles.container}>
        <AppProvider>
          <Navigation />

          <GlobalKycBottomSheet />

          <GlobalWalletConnectModals />
        </AppProvider>
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