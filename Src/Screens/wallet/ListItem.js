import {useNavigation} from '@react-navigation/native';
import React from 'react';
import {Text, View, Image, TouchableOpacity} from 'react-native';

import style from './style';
import {navigateTo} from '../../utils/navigationService';

const ListItem = ({item}) => {
  const navigation = useNavigation();

  return (
    <TouchableOpacity
      activeOpacity={0.5}
      onPress={() => ''} //navigateTo('coinWallet')
      style={style.listContainer}>
      <View style={style.listView}>
        <Text style={style.header}>{item.name}</Text>
        {item.name !== 'Staking Activities' && (
          <View style={style.valueBox}>
            <Text style={style.value}>{item.value}</Text>
          </View>
        )}
      </View>
      <Image
        source={require('../../assets/images/arrow-left.png')}
        style={style.arrowStyle}
        resizeMode="cover"
      />
    </TouchableOpacity>
  );
};

export default ListItem;
