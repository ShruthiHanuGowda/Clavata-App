import React from 'react';
import {View, Text, StyleSheet} from 'react-native';
import LottieView from 'lottie-react-native';
import { Animation } from '../../Theme';

interface LoaderAnimationProps {
  // Size options
  size?: 'small' | 'medium' | 'large' | number;
  
  // Color customization
  color?: string;
  
  // Animation speed
  speed?: number;
  
  // Show/hide text
  showText?: boolean;
  text?: string;
  textStyle?: object;
  
  // Container styling
  style?: object;
  containerStyle?: object;
  
  // Animation source
  source?: any; // For custom animation JSON
  
  // Animation behavior
  autoPlay?: boolean;
  loop?: boolean;
  
  // Layout options
  direction?: 'vertical' | 'horizontal';
  
  // Accessibility
  accessibilityLabel?: string;
}

const LoaderAnimation: React.FC<LoaderAnimationProps> = ({
  size = 'medium',
  color = '#81c8c3',
  speed = 1,
  showText = false,
  text = 'Loading...',
  textStyle = {},
  style = {},
  containerStyle = {},
  source,
  autoPlay = true,
  loop = true,
  direction = 'vertical',
  accessibilityLabel = 'Loading',
}) => {
  const getSizeValue = () => {
    if (typeof size === 'number') return size;
    
    switch (size) {
      case 'small':
        return 24;
      case 'medium':
        return 40;
      case 'large':
        return 60;
      default:
        return 40;
    }
  };

  const animationSize = getSizeValue();

  const defaultSource = source || Animation.loaderAnimation;

  const containerDirection = direction === 'horizontal' ? 'row' : 'column';
  const textMargin = direction === 'horizontal' 
    ? { marginLeft: 8 } 
    : { marginTop: 8 };

  return (
    <View 
      style={[
        styles.container, 
        { flexDirection: containerDirection },
        containerStyle
      ]}
      accessible={true}
      accessibilityLabel={accessibilityLabel}
      accessibilityRole="progressbar"
    >
      <LottieView
        source={defaultSource}
        autoPlay={autoPlay}
        loop={loop}
        speed={speed}
        style={[
          {
            width: animationSize,
            height: animationSize,
          },
          style,
        ]}
        colorFilters={[
          {
            keypath: '**',
            color: color,
          },
        ]}
        resizeMode="contain"
      />
      
      {showText && (
        <Text 
          style={[
            styles.loadingText,
            { color: color },
            textMargin,
            textStyle,
          ]}
        >
          {text}
        </Text>
      )}
    </View>
  );
};

export const SmallLoader = (props: Partial<LoaderAnimationProps>) => (
  <LoaderAnimation size="small" {...props} />
);

export const MediumLoader = (props: Partial<LoaderAnimationProps>) => (
  <LoaderAnimation size="medium" {...props} />
);

export const LargeLoader = (props: Partial<LoaderAnimationProps>) => (
  <LoaderAnimation size="large" {...props} />
);

export const FullScreenLoader = (props: Partial<LoaderAnimationProps>) => (
  <View style={styles.fullScreenContainer}>
    <LoaderAnimation 
      size="large" 
      showText={true} 
      text="Loading..." 
      {...props} 
    />
  </View>
);

export const InlineLoader = (props: Partial<LoaderAnimationProps>) => (
  <LoaderAnimation 
    size="small" 
    direction="horizontal" 
    showText={true} 
    {...props} 
  />
);

const styles = StyleSheet.create({
  container: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 14,
    fontWeight: '500',
    textAlign: 'center',
  },
  fullScreenContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
  },
});

export default LoaderAnimation;