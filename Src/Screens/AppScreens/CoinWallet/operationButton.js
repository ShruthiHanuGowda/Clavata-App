import React from 'react';
import {TouchableOpacity, Text, Image, View} from 'react-native';
import {fontsFamily} from '../../../Theme';

const operationButton = props => {
  return (
    <TouchableOpacity
      style={{justifyContent: 'center', alignItems: 'center'}}
      onPress={() => props.onPress()}>
      <View style={{borderRadius: 30, backgroundColor: '#E0F0EF', padding: 18}}>
        <Image style={{width: 14, height: 14}} source={props.image}></Image>
      </View>
      <View style={{marginVertical: 5}}>
        <Text
          style={{
            fontFamily: fontsFamily.MulishExtraBold,
            fontSize: 12,
            color: '#00201B',
          }}>
          {props.name}
        </Text>
      </View>
    </TouchableOpacity>
  );
};
export default operationButton;
