
import React, { useCallback, useEffect, useRef, useState } from 'react';

import {
  ActivityIndicator,
  SafeAreaView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

import {
  COLORS,
  FONTS,
  FONT_SIZES,
  SPACING,
  RADIUS,
  GRADIENTS,
} from '../../constants/constants';

import AppGradient from '../../common/AppGradient';
import { useSalonRegistration } from '../../context/SalonRegistrationContext';

const BecomePartnerScreen = ({ navigation, route }: any) => {
  const {
    loadDraft,
    isDraftLoading,
    draftError,
  } = useSalonRegistration();

  const [isContinuing, setIsContinuing] = useState(false);
  const continueLock = useRef(false);

  // Avoid navigating after this screen has been left.
  const isMounted = useRef(true);

  useEffect(() => {
    isMounted.current = true;

    return () => {
      isMounted.current = false;
    };
  }, []);

  const handleBack = () => {
    navigation.reset({
      index: 0,
      routes: [
        {
          name: 'LoginScreen',
          params: {
            mode: 'PROVIDER',
            hideBackButton: false,
          },
        },
      ],
    });
  };

  const handleContinue = useCallback(async () => {
    if (continueLock.current) {
      return;
    }

    continueLock.current = true;
    setIsContinuing(true);

    try {
      // Load the saved registration progress before
      // opening the registration flow.
      const result = await loadDraft();

      if (!isMounted.current) {
        return;
      }

      navigation.navigate('SalonRegistration', {
        resumeDraft: result.hasDraft,
        initialStep: result.currentStep,
        completedSteps: result.completedSteps,
      });
    } catch (error) {
      console.error('Unable to resume salon registration:', error);

      // Allow the user to retry. Don't silently start
      // a new registration if the draft could not load.
      if (isMounted.current) {
        continueLock.current = false;
        setIsContinuing(false);
      }
    } finally {
      if (isMounted.current && !draftError) {
        // Navigation may occur before this executes;
        // the mounted check prevents updating an unmounted screen.
        setIsContinuing(false);
      }
    }
  }, [loadDraft, navigation, draftError]);

  const loading = isContinuing || isDraftLoading;

  return (
    <SafeAreaView style={styles.container}>
      {/* HEADER */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={handleBack}
          style={styles.backButton}
          activeOpacity={0.7}
          disabled={loading}
          hitSlop={{
            top: 10,
            bottom: 10,
            left: 10,
            right: 10,
          }}
        >
          <Text style={styles.backIcon}>‹</Text>
        </TouchableOpacity>

        <View style={styles.headerTitleContainer}>
          <Text style={styles.headerTitle}>
            Become a service partner
          </Text>
        </View>

        <View style={styles.headerSpacer} />
      </View>

      {/* MAIN CONTENT */}
      <View style={styles.content}>
        {/* HERO */}
        <View style={styles.hero}>
          <Text style={styles.title}>Clavata</Text>

          <Text style={styles.subtitle}>
            Your next client starts here
          </Text>
        </View>

        {/* FEATURES CARD */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>
            Grow Your Business
          </Text>

          <View style={styles.item}>
            <AppGradient
              colors={[...GRADIENTS.SOFT_PURPLE]}
              style={styles.check}
            >
              <Text style={styles.checkText}>✓</Text>
            </AppGradient>

            <View style={styles.itemContent}>
              <Text style={styles.itemText}>
                List your business
              </Text>

              <Text style={styles.itemSubText}>
                Showcase your services and products to our growing community of clients
              </Text>
            </View>
          </View>

          <View style={styles.item}>
            <AppGradient
              colors={[...GRADIENTS.SOFT_PURPLE]}
              style={styles.check}
            >
              <Text style={styles.checkText}>✓</Text>
            </AppGradient>

            <View style={styles.itemContent}>
              <Text style={styles.itemText}>
                Zero commission
              </Text>

              <Text style={styles.itemSubText}>
                You keep 100% of what you earn. No commissions. No deductions
              </Text>
            </View>
          </View>

          <View style={styles.item}>
            <AppGradient
              colors={[...GRADIENTS.SOFT_PURPLE]}
              style={styles.check}
            >
              <Text style={styles.checkText}>✓</Text>
            </AppGradient>

            <View style={styles.itemContent}>
              <Text style={styles.itemText}>
                Connect with customers
              </Text>

              <Text style={styles.itemSubText}>
                Build lasting relationships, attract new clients, and keep them coming back
              </Text>
            </View>
          </View>

          <View style={styles.item}>
            <AppGradient
              colors={[...GRADIENTS.SOFT_PURPLE]}
              style={styles.check}
            >
              <Text style={styles.checkText}>✓</Text>
            </AppGradient>

            <View style={styles.itemContent}>
              <Text style={styles.itemText}>
                Boost your online visibility
              </Text>

              <Text style={styles.itemSubText}>
                Get discovered by more clients searching for your services
              </Text>
            </View>
          </View>

          <View style={[styles.item, styles.lastItem]}>
            <AppGradient
              colors={[...GRADIENTS.SOFT_PURPLE]}
              style={styles.check}
            >
              <Text style={styles.checkText}>✓</Text>
            </AppGradient>

            <View style={styles.itemContent}>
              <Text style={styles.itemText}>
                Manage your business with ease
              </Text>

              <Text style={styles.itemSubText}>
                Keep your services, information, and booking requests organized in one place
              </Text>
            </View>
          </View>
        </View>

        {/* NOTE */}
        <Text style={styles.note}>
          Register in minutes and get your business verified
        </Text>

        {draftError ? (
          <Text style={styles.errorText}>
            Could not load your saved registration. Please try again.
          </Text>
        ) : null}
      </View>

      {/* FOOTER */}
      <View style={styles.footer}>
        <TouchableOpacity
          onPress={handleContinue}
          activeOpacity={0.85}
          disabled={loading}
          style={[
            styles.buttonWrapper,
            loading && styles.buttonDisabled,
          ]}
        >
          <AppGradient
            colors={[...GRADIENTS.SOFT_PURPLE]}
            style={styles.button}
          >
            {loading ? (
              <>
                <ActivityIndicator
                  color={COLORS.white}
                  size="small"
                />
                <Text style={styles.buttonText}>
                  {'  '}Loading registration...
                </Text>
              </>
            ) : (
              <>
                <Text style={styles.buttonText}>
                  Continue
                </Text>

                <Text style={styles.arrow}>›</Text>
              </>
            )}
          </AppGradient>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

export default BecomePartnerScreen;

// =====================================================
// STYLES
// =====================================================

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },

  header: {
    height: 64,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING.large,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
    backgroundColor: COLORS.background,
  },

  backButton: {
    width: 40,
    height: 40,
    alignItems: 'flex-start',
    justifyContent: 'center',
  },

  backIcon: {
    fontFamily: FONTS.regular,
    fontSize: 36,
    lineHeight: 38,
    fontWeight: '300',
    color: COLORS.primary,
    includeFontPadding: false,
  },

  headerTitleContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },

  headerTitle: {
    fontFamily: FONTS.semiBold,
    fontSize: FONT_SIZES.medium,
    lineHeight: 21,
    fontWeight: '600',
    color: COLORS.primary,
    textAlign: 'center',
    includeFontPadding: false,
  },

  headerSpacer: {
    width: 40,
  },

  content: {
    flex: 1,
    paddingHorizontal: SPACING.xxl,
    paddingTop: SPACING.medium,
  },

  hero: {
    alignItems: 'center',
    paddingHorizontal: SPACING.small,
    marginBottom: SPACING.xxxl,
  },

  title: {
    fontFamily: FONTS.semiBold,
    fontSize: FONT_SIZES.heading,
    lineHeight: FONT_SIZES.title + 5,
    color: COLORS.text,
    textAlign: 'center',
    letterSpacing: -0.2,
  },

  subtitle: {
    marginTop: SPACING.small,
    fontFamily: FONTS.regular,
    fontSize: FONT_SIZES.medium,
    lineHeight: FONT_SIZES.small + 7,
    color: COLORS.textSecondary,
    textAlign: 'center',
  },

  card: {
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.large,
    padding: SPACING.xl,
    borderWidth: 1,
    borderColor: COLORS.border,
  },

  cardTitle: {
    fontFamily: FONTS.bold,
    fontSize: FONT_SIZES.title,
    color: COLORS.text,
    marginBottom: SPACING.large,
  },

  item: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: SPACING.large,
  },

  lastItem: {
    marginBottom: 0,
  },

  check: {
    width: 28,
    height: 28,
    borderRadius: RADIUS.round,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: SPACING.medium,
    marginTop: 1,
    overflow: 'hidden',
  },

  checkText: {
    color: COLORS.white,
    fontSize: FONT_SIZES.small,
    fontFamily: FONTS.bold,
  },

  itemContent: {
    flex: 1,
    paddingTop: 2,
  },

  itemText: {
    fontFamily: FONTS.medium,
    fontSize: FONT_SIZES.body,
    lineHeight: FONT_SIZES.small + 6,
    color: COLORS.text,
  },

  itemSubText: {
    marginTop: 4,
    fontFamily: FONTS.regular,
    fontSize: 12,
    lineHeight: 18,
    color: COLORS.textSecondary,
  },

  note: {
    marginTop: SPACING.large,
    textAlign: 'center',
    fontFamily: FONTS.regular,
    fontSize: FONT_SIZES.selected,
    lineHeight: 18,
    color: COLORS.textMuted,
  },

  errorText: {
    marginTop: SPACING.medium,
    textAlign: 'center',
    fontFamily: FONTS.regular,
    fontSize: FONT_SIZES.small,
    lineHeight: 18,
    color: '#C62828',
  },

  footer: {
    paddingHorizontal: SPACING.xxl,
    paddingBottom: SPACING.xl,
  },

  buttonWrapper: {
    borderRadius: RADIUS.medium,
    overflow: 'hidden',
  },

  buttonDisabled: {
    opacity: 0.75,
  },

  button: {
    height: 54,
    borderRadius: RADIUS.medium,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },

  buttonText: {
    color: COLORS.white,
    fontFamily: FONTS.semiBold,
    fontSize: FONT_SIZES.body,
  },

  arrow: {
    color: COLORS.white,
    fontSize: 25,
    lineHeight: 27,
    marginLeft: SPACING.small,
  },
});
