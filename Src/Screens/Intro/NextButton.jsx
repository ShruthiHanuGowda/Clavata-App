import React from 'react';
import {Image, StyleSheet, TouchableOpacity, View} from 'react-native';
import {Circle, G, Svg} from 'react-native-svg';
import images from '../../Theme/images';

export default function NextButton({onPress, progress = 50}) {
  const size = 80;
  const strokeWidth = 4;
  const center = size / 2;
  const radius = size / 2 - strokeWidth / 2;

  const circumfernce = 2 * Math.PI * radius;

  return (
    <View>
      <Svg width={size} height={size} fill={'#FFF'}>
        <G rotation={'-90'} origin={center}>
          <Circle
            stroke={'#00B3A8'}
            cx={center}
            cy={center}
            r={radius}
            strokeWidth={strokeWidth}
          />
          <Circle
            stroke={'#FFF'}
            cx={center}
            cy={center}
            r={radius}
            strokeWidth={strokeWidth}
            strokeDasharray={circumfernce}
            strokeDashoffset={circumfernce - (circumfernce * progress) / 100}
          />
        </G>
      </Svg>
      <TouchableOpacity
        onPress={onPress}
        style={[
          styles.container,
          {
            width: size - 10,
            height: size - 10,
            borderRadius: center,
          },
        ]}>
        <Image source={images.forward} />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#000',
    alignSelf: 'center',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'absolute',
    top: 5,
  },
});
