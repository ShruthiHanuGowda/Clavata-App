import React, {
    useCallback,
    useRef,
    useState,
} from 'react';

import {
    ActivityIndicator,
    Alert,
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

import {
    useSalonRegistration,
} from '../../context/SalonRegistrationContext';

// ============================================================
// SCREEN
// ============================================================

const BecomePartnerScreen = ({ navigation }: any) => {
    const {
        loadDraft,
        isDraftLoading,
        draftError,
    } = useSalonRegistration();

    const [isContinuing, setIsContinuing] = useState(false);

    const continueLock = useRef(false);

    // --------------------------------------------------------
    // REGISTRATION STEP ROUTES
    //
    // Correct order:
    // 1. Registration
    // 2. Address
    // 3. Business Hours
    // 4. Services
    // 5. KYC
    // 6. Review
    // --------------------------------------------------------

    const stepRoutes: Record<number, string> = {
        1: 'SalonRegistration',
        2: 'SalonAddress',
        3: 'SalonBusinessHours',
        4: 'SalonServices',
        5: 'SalonKYC',
        6: 'SalonReview',
    };

    // --------------------------------------------------------
    // BACK
    // --------------------------------------------------------

    const handleBack = useCallback(() => {
        if (continueLock.current || isDraftLoading) {
            return;
        }

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
    }, [navigation, isDraftLoading]);

    // --------------------------------------------------------
    // CONTINUE / RESUME REGISTRATION
    // --------------------------------------------------------

    const handleContinue = useCallback(async () => {
        if (continueLock.current || isDraftLoading) {
            return;
        }

        continueLock.current = true;
        setIsContinuing(true);

        try {
            const draft = await loadDraft();

            const hasDraft = Boolean(draft.hasDraft);

            const savedStep = hasDraft
                ? Number(draft.currentStep)
                : 1;

            if (
                !Number.isInteger(savedStep) ||
                savedStep < 1 ||
                savedStep > 6
            ) {
                throw new Error(
                    `Invalid saved registration step: ${draft.currentStep}`,
                );
            }

            const destination = stepRoutes[savedStep];

            if (!destination) {
                throw new Error(
                    `No registration route configured for step ${savedStep}.`,
                );
            }

            const completedSteps = Array.isArray(draft.completedSteps)
                ? draft.completedSteps
                : [];

            /*
             * Build the navigation stack up to the saved step.
             *
             * This removes BecomePartnerScreen from the registration
             * Back history and allows the user to navigate through
             * the registration screens in the correct order.
             *
             * All route names must be registered in the navigator
             * receiving this reset action.
             */

            const registrationRoutes = Object.entries(stepRoutes)
                .filter(([step]) => Number(step) <= savedStep)
                .map(([step, routeName]) => {
                    const stepNumber = Number(step);

                    return {
                        name: routeName,
                        params: {
                            resumeDraft: hasDraft,
                            initialStep: stepNumber,
                            completedSteps,
                        },
                    };
                });

            navigation.reset({
                index: registrationRoutes.length - 1,
                routes: registrationRoutes,
            });
        } catch (error) {
            console.error(
                '[BecomePartnerScreen] Failed to resume registration:',
                error,
            );

            Alert.alert(
                'Unable to resume registration',
                'We could not load your saved progress. Please check your internet connection and try again.',
                [{ text: 'OK' }],
            );
        } finally {
            continueLock.current = false;
            setIsContinuing(false);
        }
    }, [
        loadDraft,
        isDraftLoading,
        navigation,
    ]);

    // --------------------------------------------------------
    // UI STATE
    // --------------------------------------------------------

    const loading = isContinuing || isDraftLoading;

    // --------------------------------------------------------
    // RENDER
    // --------------------------------------------------------

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
                    <Text style={styles.title}>
                        Clavata
                    </Text>

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
                                Showcase your services and products to our
                                growing community of clients
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
                                You keep 100% of what you earn. No commissions
                                and no deductions
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
                                Build lasting relationships, attract new
                                clients, and keep them coming back
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
                                Get discovered by more clients searching for
                                your services
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
                                Keep your services, information, and booking
                                requests organized in one place
                            </Text>
                        </View>
                    </View>
                </View>

                {/* NOTE */}
                <Text style={styles.note}>
                    Register in minutes and get your business verified
                </Text>

                {!!draftError && (
                    <Text style={styles.errorText}>
                        Your saved registration could not be loaded.
                        Press Continue to try again
                    </Text>
                )}
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

// ============================================================
// STYLES
// ============================================================

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