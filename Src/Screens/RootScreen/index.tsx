import React, {useEffect} from 'react';
import {View} from 'react-native';
import styles from './styles';
import {navigate} from '../../Navigation/NavigationFunctions.ts';

export const Root = () => {
  useEffect(() => {
    setTimeout(() => {
      navigate('authScreens');
    }, 500);
  }, []);
  return <View style={styles.container}></View>;
};
