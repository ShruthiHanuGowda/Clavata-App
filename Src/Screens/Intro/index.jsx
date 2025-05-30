import React, {useEffect, useRef, useState} from 'react';
import {Dimensions, StyleSheet, View, Animated, ScrollView} from 'react-native';

import NextButton from './NextButton';
import OnboardingItem from './OnboardingItem';
import Paginator from './Paginator';
import images from '../../Theme/images';
import {navReset} from '../../Navigation/NavigationFunctions';
import AsyncStorage from '@react-native-async-storage/async-storage';

const {width} = Dimensions.get('window');

export default function Onboarding({navigation}) {
  const [index, setIndex] = useState(0);

  const scrollX = useRef(new Animated.Value(0)).current;
  const scrollViewRef = useRef(null);

  const navigateToWelcome = async () => {
    navReset('authScreens');
    try {
      await AsyncStorage.setItem('isInfoDone', 'true');
    } catch (error) {
      // Error saving data
    }
    // navigation.push(SCREEN_CONSTANT.WELCOME);
  };

  const handleScroll = Animated.event(
    [{nativeEvent: {contentOffset: {x: scrollX}}}],
    {
      useNativeDriver: false,
    },
  );

  const handleOnMomentumScrollEnd = event => {
    const offsetX = event.nativeEvent.contentOffset.x;
    const currentIndex = Math.round(offsetX / width);
    setIndex(currentIndex);
  };

  const handleNextPress = () => {
    if (index < slides.length - 1) {
      if (scrollViewRef.current) {
        scrollViewRef.current.scrollTo({
          x: width * (index + 1),
          animated: true,
        });
      }
    } else {
      navigateToWelcome();
    }
  };

  const handleBackPress = () => {
    if (index > 0) {
      if (scrollViewRef.current) {
        scrollViewRef.current.scrollTo({
          x: width * (index - 1),
          animated: true,
        });
      }
    }
  };

  const slides = [
    {
      image: images.onboard1,
      showSkip: true,
      onSkipPress: navigateToWelcome,
      onBackPress: handleBackPress,
      title: 'Feature 1',
      description:
        'It is a long established fact that a reader will be distracted by the readable content of a page when looking at its layout. The point of using ',
    },
    {
      image: images.onboard2,
      showSkip: true,
      onSkipPress: navigateToWelcome,
      onBackPress: handleBackPress,
      top: true,
      showBack: true,
      title: 'Feature 2',
      description:
        'Many desktop publishing packages and web page editors now use Lorem Ipsum as their default model text',
    },
    {
      image: images.onboard3,
      onSkipPress: navigateToWelcome,
      onBackPress: handleBackPress,
      showSkip: false,
      title: 'Feature 3',
      showBack: true,
      description:
        'Various versions have evolved over the years, sometimes by accident, sometimes on purpose (injected humour and the like).',
    },
  ];

  return (
    <View style={styles.background}>
      <ScrollView
        ref={scrollViewRef}
        horizontal
        showsVerticalScrollIndicator={false}
        showsHorizontalScrollIndicator={false}
        pagingEnabled
        bounces={false}
        onScroll={handleScroll}
        onMomentumScrollEnd={handleOnMomentumScrollEnd}
        scrollEventThrottle={16}
        contentContainerStyle={{width: width * slides.length}}>
        {slides.map((item, idx) => (
          <View key={idx} style={[styles.child]}>
            {OnboardingItem({item})}
          </View>
        ))}
      </ScrollView>

      <View style={{height: 100, left: 50, position: 'absolute', bottom: 0}}>
        <Paginator data={slides} scrollX={scrollX} />
      </View>
      <View style={{height: 100, right: 50, position: 'absolute', bottom: 32}}>
        <NextButton
          progress={index === 0 ? 70 : index === 1 ? 30 : 0}
          onPress={handleNextPress}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  background: {
    backgroundColor: '#fff',
    alignItems: 'center',
    flex: 1,
    marginTop: 1,
  },
  container: {
    flex: 1,
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFF',
  },
  child: {
    width,
  },
});
