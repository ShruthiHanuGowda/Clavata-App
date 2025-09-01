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
  ImageSourcePropType,
} from 'react-native';
import images from '../../Theme/images';

const {width} = Dimensions.get('window');

interface OnboardingItemData {
  title: string;
  image: ImageSourcePropType;
  description: string;
  showSkip?: boolean;
  showBack?: boolean;
  top?: boolean;
  onBackPress?: () => void;
  onSkipPress?: () => void;
}

interface OnboardingItemProps {
  item: OnboardingItemData;
}

const OnboardingItem: React.FC<OnboardingItemProps> = ({item}) => {
  const {
    title,
    image,
    description,
    showSkip,
    showBack,
    top,
    onBackPress,
    onSkipPress,
  } = item;

  const content = (
    <View style={[styles.contentContainer, top ? styles.topPosition : styles.bottomPosition]}>
      <Text style={styles.title}>
        {title}
      </Text>
      <Text style={styles.notice}>
        {description}
      </Text>
    </View>
  );

  return (
    <ImageBackground source={image} style={styles.background}>
      <SafeAreaView style={styles.child}>
        <View style={styles.headerContainer}>
          <TouchableOpacity onPress={onBackPress} style={styles.backButton}>
            {showBack && <Image source={images.back} />}
          </TouchableOpacity>
          {showSkip && (
            <TouchableOpacity onPress={onSkipPress} style={styles.skipButton}>
              <Text style={styles.skipText}>
                Skip
              </Text>
            </TouchableOpacity>
          )}
        </View>
        {content}
      </SafeAreaView>
    </ImageBackground>
  );
};

const styles = StyleSheet.create({
  background: {
    backgroundColor: '#fff',
    alignItems: 'center',
    flex: 1,
    marginTop: 1,
  },
  child: {
    width,
    flex: 1,
  },
  headerContainer: {
    alignItems: 'center',
    justifyContent: 'space-between',
    flexDirection: 'row',
    width,
  },
  contentContainer: {
    height: 200,
    marginLeft: 35,
    position: 'absolute',
  },
  topPosition: {
    top: '20%',
  },
  bottomPosition: {
    bottom: '10%',
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

export default OnboardingItem;