import React, { useEffect, useState } from 'react';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import {
  Appearance,
  View,
  StyleSheet,
  ActivityIndicator,
  Text,
} from 'react-native';
import JailMonkey from 'jail-monkey'; // ✅ Import jailbreak detection
import { checkDeviceSecurity } from './Src/utils/deviceSecurity';
import NavigationWrapper from './Src/Navigation';
import { AppProvider } from './Src/providers';
import GlobalKycBottomSheet from './Src/hooks/GlobalKycBottomSheet.native';
import GlobalWalletConnectModals from './Src/components/GlobalWalletConnectModals';
import { fontsFamily } from './Src/Theme';
import colors from './Src/Theme/Colors';

export default function App() {
  Appearance.setColorScheme('light');

  const [isSecureDevice, setIsSecureDevice] = useState<Boolean>(true);

  // useEffect(() => {
  //   const checkDeviceSecurity = async () => {
  //     const jailBroken = JailMonkey.isJailBroken();
  //     const canMockLocation = JailMonkey.canMockLocation();

  //     if (jailBroken || canMockLocation) {
  //       setIsSecureDevice(false);
  //     } else {
  //       setIsSecureDevice(true);
  //     }
  //   };  

  //   // checkDeviceSecurity();
  // }, []);

  useEffect(() => {
    const checkSecurity = async () => {
      const secure = await checkDeviceSecurity();
      setIsSecureDevice(secure);
    };

    // checkSecurity();
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
        <AppProvider>
          <NavigationWrapper />
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
