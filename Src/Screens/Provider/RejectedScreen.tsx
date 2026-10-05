import React, { useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Linking,
  Platform,
  Pressable,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { gql, useQuery } from '@apollo/client';
import { useNavigation, useRoute } from '@react-navigation/native';

// ============================================================
// GRAPHQL
// ============================================================

const GET_SALON_REJECTION_DETAILS = gql`
  query GetSalonRejectionDetails($salonId: ID!) {
    getSalon(salonId: $salonId) {
      success
      message

      salon {
        salonId
        salonName
        rejectionReason
        rejectedAt
        adminApprovalStatus
        providerStatus
      }
    }
  }
`;

// ============================================================
// TYPES
// ============================================================

type SalonApprovalStatus =
  | 'PENDING'
  | 'APPROVED'
  | 'REJECTED';

interface SalonDetails {
  salonId: string;
  salonName?: string | null;
  rejectionReason?: string | null;
  rejectedAt?: string | null;
  adminApprovalStatus?: SalonApprovalStatus | null;
  providerStatus?: string | null;
}

interface GetSalonResponse {
  getSalon?: {
    success?: boolean;
    message?: string | null;
    salon?: SalonDetails | null;
  } | null;
}

interface GetSalonVariables {
  salonId: string;
}

interface RejectedScreenRouteParams {
  salonId?: string;
  rejectionReason?: string;
}

// ============================================================
// CONSTANTS
// ============================================================

/**
 * Do NOT put a fake Clavata phone number here.
 *
 * Replace this with the real Clavata Help Line when finalized.
 *
 * Example:
 * const CLAVATA_HELP_LINE = '+919876543210';
 */
const CLAVATA_HELP_LINE = '';

const COLORS = {
  theme: '#7B3FF2',
  themeDark: '#5F27C9',

  background: '#F8F7FC',
  card: '#FFFFFF',

  text: '#17151C',
  secondaryText: '#6F6A78',
  mutedText: '#96919F',

  border: '#E8E4EE',

  danger: '#D92D20',
  dangerLight: '#FFF1F0',
  dangerBorder: '#F4C7C3',

  white: '#FFFFFF',
};

// ============================================================
// SCREEN
// ============================================================

const RejectedScreen: React.FC = () => {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();

  const routeParams =
    (route.params as RejectedScreenRouteParams | undefined) ?? {};

  const [localError, setLocalError] = useState<string | null>(null);

  // ----------------------------------------------------------
  // Resolve salonId
  // ----------------------------------------------------------
  //
  // LoginScreen should ideally pass salonId:
  //
  // navigation.replace('BecomePartner', {
  //   screen: 'RejectedScreen',
  //   params: {
  //     salonId: user.salonId,
  //   },
  // });
  //
  // We also support a rejectionReason passed from LoginScreen.
  // ----------------------------------------------------------

  const salonId = routeParams.salonId ?? null;

  // ----------------------------------------------------------
  // GraphQL query
  // ----------------------------------------------------------

  const {
    data,
    loading,
    error: queryError,
    refetch,
  } = useQuery<GetSalonResponse, GetSalonVariables>(
    GET_SALON_REJECTION_DETAILS,
    {
      variables: {
        salonId: salonId as string,
      },

      skip: !salonId,

      fetchPolicy: 'network-only',

      onError: queryErrorResult => {
        console.warn(
          '[RejectedScreen] GET SALON ERROR:',
          queryErrorResult,
        );
      },
    },
  );

  // ----------------------------------------------------------
  // Salon data
  // ----------------------------------------------------------

  const salon = data?.getSalon?.salon ?? null;

  const rejectionReason = useMemo(() => {
    const serverReason =
      salon?.rejectionReason?.trim();

    if (serverReason) {
      return serverReason;
    }

    const passedReason =
      routeParams.rejectionReason?.trim();

    if (passedReason) {
      return passedReason;
    }

    return null;
  }, [
    salon?.rejectionReason,
    routeParams.rejectionReason,
  ]);

  const salonName =
    salon?.salonName?.trim() || 'Your salon';

  // ----------------------------------------------------------
  // Error handling
  // ----------------------------------------------------------

  useEffect(() => {
    if (!salonId) {
      setLocalError(
        'Salon information could not be loaded.',
      );
      return;
    }

    setLocalError(null);
  }, [salonId]);

  // ----------------------------------------------------------
  // Contact Clavata
  // ----------------------------------------------------------

  const handleContactHelp = async () => {
    if (!CLAVATA_HELP_LINE) {
      setLocalError(
        'Clavata Help Line is not configured yet. Please contact Clavata Support.',
      );
      return;
    }

    const phoneUrl =
      Platform.OS === 'android'
        ? `tel:${CLAVATA_HELP_LINE}`
        : `telprompt:${CLAVATA_HELP_LINE}`;

    try {
      const supported =
        await Linking.canOpenURL(phoneUrl);

      if (!supported) {
        setLocalError(
          'Unable to open the phone application.',
        );
        return;
      }

      await Linking.openURL(phoneUrl);
    } catch (error) {
      console.error(
        '[RejectedScreen] CONTACT HELP ERROR:',
        error,
      );

      setLocalError(
        'Unable to open the phone application.',
      );
    }
  };

  // ----------------------------------------------------------
  // Login
  // ----------------------------------------------------------

  const handleBackToLogin = () => {
    navigation.reset({
      index: 0,
      routes: [
        {
          name: 'LoginScreen',
        },
      ],
    });
  };

  // ==========================================================
  // LOADING
  // ==========================================================

  if (loading && salonId) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator
            size="large"
            color={COLORS.theme}
          />

          <Text style={styles.loadingText}>
            Loading your salon information...
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  // ==========================================================
  // UI
  // ==========================================================

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* ================================================== */}
        {/* TOP ICON */}
        {/* ================================================== */}

        <View style={styles.iconWrapper}>
          <View style={styles.iconCircle}>
            <Text style={styles.iconText}>!</Text>
          </View>
        </View>

        {/* ================================================== */}
        {/* TITLE */}
        {/* ================================================== */}

        <Text style={styles.title}>
          Salon Registration Rejected
        </Text>

        <Text style={styles.subtitle}>
          We’re sorry, but your salon registration could
          not be approved at this time.
        </Text>

        {/* ================================================== */}
        {/* SALON CARD */}
        {/* ================================================== */}

        <View style={styles.salonCard}>
          <Text style={styles.salonLabel}>
            SALON
          </Text>

          <Text
            style={styles.salonName}
            numberOfLines={2}
          >
            {salonName}
          </Text>
        </View>

        {/* ================================================== */}
        {/* REJECTION REASON */}
        {/* ================================================== */}

        <View style={styles.reasonCard}>
          <View style={styles.reasonHeader}>
            <View style={styles.reasonDot} />

            <Text style={styles.reasonTitle}>
              Reason for rejection
            </Text>
          </View>

          {rejectionReason ? (
            <Text style={styles.reasonText}>
              {rejectionReason}
            </Text>
          ) : (
            <Text style={styles.reasonTextMuted}>
              A specific rejection reason has not been
              provided here. Please contact Clavata Support
              for more information.
            </Text>
          )}
        </View>

        {/* ================================================== */}
        {/* HELP MESSAGE */}
        {/* ================================================== */}

        <View style={styles.helpCard}>
          <Text style={styles.helpTitle}>
            Need help?
          </Text>

          <Text style={styles.helpText}>
            Please contact the Clavata Help Line if you
            believe this rejection was made in error or if
            you need assistance completing your registration.
          </Text>
        </View>

        {/* ================================================== */}
        {/* ERROR */}
        {/* ================================================== */}

        {(localError || queryError) && (
          <View style={styles.errorBox}>
            <Text style={styles.errorText}>
              {localError ||
                'Unable to retrieve the latest salon information.'}
            </Text>

            {salonId && (
              <Pressable
                onPress={() => refetch()}
                style={styles.retryButton}
              >
                <Text style={styles.retryButtonText}>
                  Try Again
                </Text>
              </Pressable>
            )}
          </View>
        )}

        {/* ================================================== */}
        {/* CONTACT BUTTON */}
        {/* ================================================== */}

        <Pressable
          onPress={handleContactHelp}
          style={({ pressed }) => [
            styles.primaryButton,
            pressed && styles.buttonPressed,
          ]}
        >
          <Text style={styles.primaryButtonText}>
            Contact Clavata Help Line
          </Text>
        </Pressable>

        {/* ================================================== */}
        {/* BACK TO LOGIN */}
        {/* ================================================== */}

        <Pressable
          onPress={handleBackToLogin}
          style={({ pressed }) => [
            styles.secondaryButton,
            pressed && styles.buttonPressed,
          ]}
        >
          <Text style={styles.secondaryButtonText}>
            Back to Login
          </Text>
        </Pressable>

        {/* ================================================== */}
        {/* FOOTER */}
        {/* ================================================== */}

        <View style={styles.footer}>
          <Text style={styles.footerText}>
            Clavata Connects Private Limited 2026
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default RejectedScreen;

// ============================================================
// STYLES
// ============================================================

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: COLORS.background,
  },

  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 24,
    paddingTop: 36,
    paddingBottom: 32,
  },

  // ----------------------------------------------------------
  // Loading
  // ----------------------------------------------------------

  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 32,
  },

  loadingText: {
    marginTop: 16,
    fontSize: 15,
    lineHeight: 22,
    color: COLORS.secondaryText,
    textAlign: 'center',
  },

  // ----------------------------------------------------------
  // Icon
  // ----------------------------------------------------------

  iconWrapper: {
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 22,
  },

  iconCircle: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: COLORS.dangerLight,
    borderWidth: 1,
    borderColor: COLORS.dangerBorder,
    alignItems: 'center',
    justifyContent: 'center',
  },

  iconText: {
    fontSize: 34,
    fontWeight: '800',
    color: COLORS.danger,
    lineHeight: 40,
  },

  // ----------------------------------------------------------
  // Header
  // ----------------------------------------------------------

  title: {
    fontSize: 28,
    lineHeight: 35,
    fontWeight: '800',
    color: COLORS.text,
    textAlign: 'center',
    letterSpacing: -0.5,
  },

  subtitle: {
    marginTop: 12,
    fontSize: 15,
    lineHeight: 23,
    fontWeight: '400',
    color: COLORS.secondaryText,
    textAlign: 'center',
    paddingHorizontal: 8,
  },

  // ----------------------------------------------------------
  // Salon
  // ----------------------------------------------------------

  salonCard: {
    marginTop: 28,
    paddingHorizontal: 18,
    paddingVertical: 17,
    borderRadius: 14,
    backgroundColor: COLORS.card,
    borderWidth: 1,
    borderColor: COLORS.border,
  },

  salonLabel: {
    fontSize: 11,
    lineHeight: 15,
    fontWeight: '700',
    color: COLORS.mutedText,
    letterSpacing: 1,
  },

  salonName: {
    marginTop: 5,
    fontSize: 17,
    lineHeight: 23,
    fontWeight: '700',
    color: COLORS.text,
  },

  // ----------------------------------------------------------
  // Reason
  // ----------------------------------------------------------

  reasonCard: {
    marginTop: 14,
    padding: 18,
    borderRadius: 14,
    backgroundColor: COLORS.dangerLight,
    borderWidth: 1,
    borderColor: COLORS.dangerBorder,
  },

  reasonHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  reasonDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: COLORS.danger,
    marginRight: 9,
  },

  reasonTitle: {
    flex: 1,
    fontSize: 14,
    lineHeight: 20,
    fontWeight: '700',
    color: COLORS.text,
  },

  reasonText: {
    marginTop: 12,
    fontSize: 14,
    lineHeight: 22,
    fontWeight: '500',
    color: COLORS.text,
  },

  reasonTextMuted: {
    marginTop: 12,
    fontSize: 14,
    lineHeight: 22,
    color: COLORS.secondaryText,
  },

  // ----------------------------------------------------------
  // Help
  // ----------------------------------------------------------

  helpCard: {
    marginTop: 14,
    padding: 18,
    borderRadius: 14,
    backgroundColor: COLORS.card,
    borderWidth: 1,
    borderColor: COLORS.border,
  },

  helpTitle: {
    fontSize: 15,
    lineHeight: 21,
    fontWeight: '700',
    color: COLORS.text,
  },

  helpText: {
    marginTop: 7,
    fontSize: 14,
    lineHeight: 22,
    color: COLORS.secondaryText,
  },

  // ----------------------------------------------------------
  // Error
  // ----------------------------------------------------------

  errorBox: {
    marginTop: 14,
    padding: 14,
    borderRadius: 12,
    backgroundColor: COLORS.dangerLight,
    borderWidth: 1,
    borderColor: COLORS.dangerBorder,
  },

  errorText: {
    fontSize: 13,
    lineHeight: 20,
    color: COLORS.danger,
  },

  retryButton: {
    alignSelf: 'flex-start',
    marginTop: 10,
  },

  retryButtonText: {
    fontSize: 13,
    fontWeight: '700',
    color: COLORS.theme,
  },

  // ----------------------------------------------------------
  // Buttons
  // ----------------------------------------------------------

  primaryButton: {
    marginTop: 24,
    minHeight: 52,
    borderRadius: 13,
    backgroundColor: COLORS.theme,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 18,
  },

  primaryButtonText: {
    fontSize: 15,
    fontWeight: '700',
    color: COLORS.white,
  },

  secondaryButton: {
    marginTop: 12,
    minHeight: 52,
    borderRadius: 13,
    backgroundColor: COLORS.card,
    borderWidth: 1,
    borderColor: COLORS.border,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 18,
  },

  secondaryButtonText: {
    fontSize: 15,
    fontWeight: '700',
    color: COLORS.text,
  },

  buttonPressed: {
    opacity: 0.75,
  },

  // ----------------------------------------------------------
  // Footer
  // ----------------------------------------------------------

  footer: {
    marginTop: 'auto',
    paddingTop: 32,
    alignItems: 'center',
  },

  footerText: {
    fontSize: 11,
    lineHeight: 16,
    color: COLORS.mutedText,
    textAlign: 'center',
  },
});