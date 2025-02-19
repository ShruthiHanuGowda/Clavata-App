import React from 'react';
import {Animated, StyleSheet, useWindowDimensions, View} from 'react-native';

export default function Paginator({
  data,
  scrollX,
}) {
  const {width} = useWindowDimensions();
  return (
    <View style={styles.container}>
      {data.map((item, i) => {
        const inputRange = [(i - 1) * width, i * width, (i + 1) * width];
        const dotWidth = scrollX.interpolate({
          inputRange,
          outputRange: [18, 32, 18],
          extrapolate: 'clamp',
        });
        const opacity = scrollX.interpolate({
          inputRange,
          outputRange: [0.2, 1, 0.2],
          extrapolate: 'clamp',
        });
        return (
          <Animated.View
            key={item.title}
            style={[styles.dot, {width: dotWidth, opacity: opacity}]}
          />
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    height: 64,
  },
  dot: {
    height: 6,
    width: 18,
    borderRadius: 10,
    backgroundColor: '#000000',
    marginRight: 5,
  },
});
