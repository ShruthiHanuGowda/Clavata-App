import React, {useEffect} from 'react';
import {View} from 'react-native';
import styles from './styles';
import {navReset} from '../../Navigation/NavigationFunctions.ts';
import secureStorage, {initializeAppStorage} from '../../utils/secureStorage';

export const Root = () => {
  const CheckNav = async () => {
    try {
      const value = await secureStorage.getItem('isInfoDone');
      console.log('🚀 ~ CheckNav ~ value:', value);

      if (value === 'true') {
        (navReset as any)('authScreens');
      } else {
        (navReset as any)('intro');
      }
    } catch (e) {
      (navReset as any)('intro');
      // error reading value
    }
  };

  useEffect(() => {
    initializeAppStorage();
    setTimeout(() => {
      // navigate('authScreens');
      CheckNav();
      // navReset('intro');
    }, 500);
  }, []);
  return <View style={styles.container} />;
};
