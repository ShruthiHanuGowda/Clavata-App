import React, {useRef, useEffect} from 'react';
import {View, Text, StyleSheet} from 'react-native';
import LottieView from 'lottie-react-native';
import {DText} from '../DText'; // Adjust the import path as needed

interface LoadingScreenWithStepProps {
  title?: string;
  subtitle?: string;
  icon?: string;
  progress?: number;
  showProgressBar?: boolean;
  showStepIndicators?: boolean;
  stepIndicatorCount?: number;
  feeInfo?: string;
  animationSource?: any;
  animationStyle?: object;
  containerStyle?: object;
  titleStyle?: object;
  subtitleStyle?: object;
  progressBarColor?: string;
  backgroundColor?: string;
  iconBackgroundColor?: string;
}

const LoadingScreenWithStep: React.FC<LoadingScreenWithStepProps> = ({
  title = 'Processing...',
  subtitle = 'Please wait while we process your request',
  icon = '⚡',
  progress = 0,
  showProgressBar = true,
  showStepIndicators = true,
  stepIndicatorCount = 8,
  feeInfo,
  animationSource,
  animationStyle,
  containerStyle,
  titleStyle,
  subtitleStyle,
  progressBarColor = '#81c8c3',
  backgroundColor = '#FFF',
  iconBackgroundColor = '#E8F8F7',
}) => {
  const animationRef = useRef<any>(null);

  useEffect(() => {
    if (animationRef.current && animationSource) {
      const controller = new AbortController();

      setTimeout(() => {
        if (!controller.signal.aborted && animationRef.current) {
          animationRef.current.reset();
          animationRef.current.play();
        }
      }, 300);

      return () => controller.abort();
    }
  }, [animationRef, animationSource]);

  const renderProgressBar = () => {
    if (!showProgressBar) return null;

    return (
      <View style={styles.progressBarContainer}>
        <View style={styles.progressBarBackground}>
          <View
            style={[
              styles.progressBarFill,
              {
                width: `${progress}%`,
                backgroundColor: progressBarColor,
              },
            ]}
          />
        </View>
        <DText style={styles.progressText}>{progress}% Complete</DText>
      </View>
    );
  };

  const renderStepIndicators = () => {
    if (!showStepIndicators) return null;

    const stepProgress = Math.floor(progress / (100 / stepIndicatorCount));
    const indicators = Array.from({length: stepIndicatorCount}, (_, index) => (
      <View
        key={index}
        style={[
          styles.stepIndicator,
          index < stepProgress && [
            styles.stepIndicatorActive,
            {backgroundColor: progressBarColor},
          ],
        ]}
      />
    ));

    return <View style={styles.stepIndicatorsContainer}>{indicators}</View>;
  };

  const renderFeeInfo = () => {
    if (!feeInfo) return null;

    return (
      <View
        style={[
          styles.feeInfoContainer,
          {borderColor: progressBarColor + '40'},
        ]}>
        <DText style={[styles.feeInfoText, {color: progressBarColor}]}>
          {feeInfo}
        </DText>
      </View>
    );
  };

  const renderAnimation = () => {
    if (animationSource) {
      return (
        <LottieView
          ref={animationRef}
          source={animationSource}
          autoPlay={true}
          loop={true}
          style={[styles.lottieAnimation, animationStyle]}
          speed={1}
          resizeMode="contain"
          key={Math.random().toString()}
        />
      );
    }

    // Default loading animation or spinner can be added here
    return null;
  };

  return (
    <View style={[styles.container, {backgroundColor}, containerStyle]}>
      {/* Header Section */}
      <View style={styles.headerSection}>
        <View
          style={[
            styles.iconContainer,
            {backgroundColor: iconBackgroundColor},
          ]}>
          <Text style={styles.iconText}>{icon}</Text>
        </View>
        <DText fontStyle="fontBold" style={[styles.title, titleStyle]}>
          {title}
        </DText>
        <DText style={[styles.subtitle, subtitleStyle]}>{subtitle}</DText>
      </View>

      {/* Animation Section */}
      <View style={styles.animationSection}>{renderAnimation()}</View>

      {/* Progress Section */}
      <View style={styles.progressSection}>
        {renderProgressBar()}
        {renderStepIndicators()}
        {renderFeeInfo()}
      </View>

      {/* Spacer to push content up */}
      <View style={styles.spacer} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 16,
  },
  headerSection: {
    alignItems: 'center',
    paddingVertical: 30,
  },
  iconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  iconText: {
    fontSize: 32,
  },
  title: {
    fontSize: 24,
    color: '#1A1A1A',
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    lineHeight: 22,
    paddingHorizontal: 20,
  },
  animationSection: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 40,
  },
  lottieAnimation: {
    width: 250,
    height: 250,
  },
  progressSection: {
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  progressBarContainer: {
    width: '100%',
    alignItems: 'center',
    marginBottom: 30,
  },
  progressBarBackground: {
    width: '100%',
    height: 10,
    backgroundColor: '#E0E0E0',
    borderRadius: 5,
    overflow: 'hidden',
    marginBottom: 12,
  },
  progressBarFill: {
    height: '100%',
    borderRadius: 5,
  },
  progressText: {
    fontSize: 16,
    color: '#1A1A1A',
    fontWeight: '600',
  },
  stepIndicatorsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
    gap: 12,
  },
  stepIndicator: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#E0E0E0',
  },
  stepIndicatorActive: {
    backgroundColor: '#81c8c3',
  },
  feeInfoContainer: {
    backgroundColor: '#F0FBF9',
    padding: 16,
    borderRadius: 8,
    borderWidth: 1,
    alignItems: 'center',
  },
  feeInfoText: {
    fontSize: 14,
    fontWeight: '600',
  },
  spacer: {
    flex: 0.5,
  },
});

export default LoadingScreenWithStep;
