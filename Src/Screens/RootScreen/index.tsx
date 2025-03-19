import React, {useEffect} from 'react';
import {View} from 'react-native';
import styles from './styles';
import {navReset} from '../../Navigation/NavigationFunctions.ts';
import AsyncStorage from '@react-native-async-storage/async-storage';

export const Root = () => {
  const CheckNav = async () => {
    try {
      const value = await AsyncStorage?.getItem('isInfoDone');

      if (value === 'true') {
        navReset('authScreens');
      } else {
        navReset('intro');
      }
    } catch (e) {
      navReset('intro');
      // error reading value
    }
  };

  useEffect(() => {
    setTimeout(() => {
      // navigate('authScreens');
      CheckNav();
      // navReset('intro');
    }, 500);
  }, []);
  return <View style={styles.container}></View>;
};
