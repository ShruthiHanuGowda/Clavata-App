import React, {useCallback, useMemo, useRef, useEffect} from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
  Platform,
  Alert,
  ViewStyle,
  TextStyle,
} from 'react-native';
import BottomSheet, {
  BottomSheetBackdrop,
  BottomSheetBackdropProps,
} from '@gorhom/bottom-sheet';
import {useSafeAreaInsets, EdgeInsets} from 'react-native-safe-area-context';
import {useGlobalKyc, setGlobalKycInstance} from './GlobalKycProvider';
import {Colors} from '../Theme';

// =================== COMPONENT ===================
const GlobalKycBottomSheet: React.FC = () => {
  // FIX: Call useGlobalKyc only ONCE at the top level
  const globalKycContext = useGlobalKyc();

  const {
    isKycBottomSheetVisible,
    hideKycBottomSheet,
    startKycVerification,
    skipKycVerification,
    kycStatus,
  } = globalKycContext;

  const insets: EdgeInsets = useSafeAreaInsets();
  const bottomSheetRef = useRef<BottomSheet>(null);

  // FIX: Set global instance correctly without multiple hook calls
  useEffect(() => {
    setGlobalKycInstance(globalKycContext);
  }, [globalKycContext]);

  // Variables for bottom sheet - SAME as your original
  const snapPoints = useMemo(() => ['55%'], []);

  // Effect to present or dismiss the bottom sheet when visibility changes
  useEffect(() => {
    if (isKycBottomSheetVisible && bottomSheetRef.current) {
      console.log('Opening bottom sheet');
      bottomSheetRef.current.expand();
    } else if (!isKycBottomSheetVisible && bottomSheetRef.current) {
      console.log('Closing bottom sheet');
      bottomSheetRef.current.close();
    }
  }, [isKycBottomSheetVisible]);

  // Callbacks for bottom sheet
  const handleSheetChanges = useCallback(
    (index: number): void => {
      console.log('Bottom sheet index changed to:', index);
      if (index === -1) {
        hideKycBottomSheet();
      }
    },
    [hideKycBottomSheet],
  );

  // Render backdrop component - defined outside conditional rendering
  const renderBackdrop = useCallback(
    (props: BottomSheetBackdropProps) => (
      <BottomSheetBackdrop
        {...props}
        disappearsOnIndex={-1}
        appearsOnIndex={0}
        opacity={0.6}
        pressBehavior="none"
      />
    ),
    [],
  );

  // Handle KYC start with improved event handling - SAME logic as your original
  const handleStartKyc = useCallback(async (): Promise<void> => {
    console.log('Start KYC button pressed');

    // Close the bottom sheet first
    hideKycBottomSheet();

    // Give some time for the animation to complete before starting KYC
    setTimeout(async () => {
      try {
        const result = await startKycVerification();
        console.log('KYC verification result:', result);
      } catch (error) {
        console.error('Error starting KYC:', error);
      }
    }, 300);
  }, [startKycVerification, hideKycBottomSheet]);

  // Handle KYC skip with improved event handling - SAME logic as your original
  const handleSkipKyc = useCallback((): void => {
    console.log('Skip KYC button pressed');

    // Close the bottom sheet first
    // hideKycBottomSheet();

    // Give some time for the animation to complete before navigating
    setTimeout(async () => {
      try {
        await skipKycVerification();
      } catch (error) {
        console.error('Error skipping KYC:', error);
      }
    }, 300);
  }, [skipKycVerification, hideKycBottomSheet]);

  // SAME render structure as your original - no UI changes!
  return (
    <BottomSheet
      ref={bottomSheetRef}
      index={-1}
      snapPoints={snapPoints}
      onChange={handleSheetChanges}
      enablePanDownToClose={!isKycBottomSheetVisible}
      backdropComponent={renderBackdrop}
      handleIndicatorStyle={styles.handleIndicator}
      backgroundStyle={styles.bottomSheetBackground}>
      <View style={[styles.contentContainer, {paddingBottom: insets.bottom}]}>
        {isKycBottomSheetVisible && (
          <>
            <Text style={styles.title}>KYC Verification</Text>
            <Text style={styles.description}>
              To unlock full functionality of our platform, we need to verify
              your identity. This process is quick and secure.
            </Text>

            <View style={styles.optionsContainer}>
              <TouchableOpacity
                style={styles.optionButton}
                activeOpacity={0.7}
                onPress={handleStartKyc}
                disabled={kycStatus.isProcessing}>
                <View style={styles.optionIconContainer}>
                  {/* <Image
                    source={require('../../assets/images/kyc-verify.png')}
                    style={styles.optionIcon}
                    resizeMode="contain"
                  /> */}
                </View>
                <View style={styles.optionTextContainer}>
                  <Text style={styles.optionTitle}>Complete KYC</Text>
                  <Text style={styles.optionDescription}>
                    Verify your identity now to unlock all features
                  </Text>
                </View>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.optionButton, styles.skipButton]}
                activeOpacity={0.7}
                onPress={handleSkipKyc}
                disabled={kycStatus.isProcessing}>
                <View style={styles.optionIconContainer}>
                  {/* <Image
                    source={require('../../assets/images/skip.png')}
                    style={styles.optionIcon}
                    resizeMode="contain"
                  /> */}
                </View>
                <View style={styles.optionTextContainer}>
                  <Text style={styles.optionTitle}>Skip for Now</Text>
                  <Text style={styles.optionDescription}>
                    You can complete verification later
                  </Text>
                </View>
              </TouchableOpacity>
            </View>

            <Text style={styles.note}>
              Note: Some features may be limited until KYC verification is
              completed.
            </Text>
          </>
        )}
      </View>
    </BottomSheet>
  );
};

// =================== STYLES - EXACTLY THE SAME AS YOUR ORIGINAL ===================
const {width} = Dimensions.get('window');

const styles = StyleSheet.create({
  bottomSheetBackground: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: -3,
    },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 10,
  },
  handleIndicator: {
    backgroundColor: '#DDDDDD',
    width: 50,
  },
  contentContainer: {
    flex: 1,
    padding: 20,
  },
  title: {
    fontSize: 22,
    fontWeight: '700',
    color: '#333333',
    marginBottom: 10,
    textAlign: 'center',
  },
  description: {
    fontSize: 16,
    color: '#666666',
    marginBottom: 20,
    textAlign: 'center',
    lineHeight: 22,
  },
  optionsContainer: {
    marginVertical: 20,
  },
  optionButton: {
    flexDirection: 'row',
    backgroundColor: '#F5F9FF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors?.success,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: {width: 0, height: 1},
        shadowOpacity: 0.1,
        shadowRadius: 2,
      },
      android: {
        elevation: 2,
      },
    }),
  },
  skipButton: {
    backgroundColor: '#F8F8F8',
    borderColor: '#DDDDDD',
  },
  optionIconContainer: {
    width: 50,
    height: 50,
    backgroundColor: '#E6F0FF',
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  optionIcon: {
    width: 30,
    height: 30,
  },
  optionTextContainer: {
    flex: 1,
  },
  optionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333333',
    marginBottom: 4,
  },
  optionDescription: {
    fontSize: 14,
    color: '#666666',
  },
  note: {
    fontSize: 13,
    color: '#999999',
    textAlign: 'center',
    marginBottom: 10,
  },
});

export default GlobalKycBottomSheet;
