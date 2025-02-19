import React from 'react';
import {
  Dimensions,
  StyleSheet,
  TouchableOpacity,
  View,
  SafeAreaView,
  Image,
  ImageBackground,
  Text,
} from 'react-native';
// import {DText} from '../../../component/DText';
import images from '../../Theme/images';

const {width} = Dimensions.get('window');

export default function OnboardingItem(props) {
  const {
    title,
    image,
    description,
    showSkip,
    showBack,
    top,
    onBackPress,
    onSkipPress,
  } = props.item;
  const content = (
    <View
      style={{
        height: 200,
        marginLeft: 35,
        position: 'absolute',
        ...(top
          ? {
              top: '20%',
            }
          : {
              bottom: '10%',
            }),
      }}>
      <Text fontStyle="fontBold" style={styles.title}>
        {title}
      </Text>
      <Text fontStyle="fontRegular" style={styles.notice}>
        {description}
      </Text>
    </View>
  );
  return (
    <ImageBackground source={image} style={styles.background}>
      <SafeAreaView style={styles.child}>
        <View
          style={{
            alignItems: 'center',
            justifyContent: 'space-between',
            flexDirection: 'row',
            width,
          }}>
          <TouchableOpacity onPress={onBackPress} style={styles.backButton}>
            {showBack && <Image source={images.back} />}
          </TouchableOpacity>
          {showSkip && (
            <TouchableOpacity onPress={onSkipPress} style={styles.skipButton}>
              <Text fontStyle="fontSemiBold" style={styles.skipText}>
                Skip
              </Text>
            </TouchableOpacity>
          )}
        </View>
        {content}
      </SafeAreaView>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  background: {
    backgroundColor: '#fff',
    alignItems: 'center',
    flex: 1,
    marginTop: 1,
  },
  title: {
    color: '#2C2C2C',
    fontSize: 26,
    fontWeight: '700',
    marginRight: 24,
  },
  notice: {
    maxWidth: 300,
    color: '#6C6C6C',
    fontSize: 12,
    marginTop: 12,
    marginRight: 24,
  },
  child: {width, flex: 1},
  skipText: {
    color: '#000',
    fontSize: 14,
  },
  skipButton: {
    alignSelf: 'flex-end',
    margin: 24,
  },
  backButton: {
    alignSelf: 'flex-start',
    margin: 24,
  },
  pagination: {
    bottom: 100,
    alignSelf: 'flex-start',
    margin: 30,
  },
});
