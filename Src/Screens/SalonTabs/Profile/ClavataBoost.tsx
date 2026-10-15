import React, { useMemo, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    SafeAreaView,
    ScrollView,
    StatusBar,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';

import AppGradient from '../../../common/AppGradient';
import { GRADIENTS } from '../../../constants/constants';

// ============================================================
// TYPES
// ============================================================

type BillingCycle = 'MONTHLY' | 'YEARLY';
type PlanCode = 'FREE' | 'BOOST';

type PlanFeature = {
    title: string;
    description: string;
};

// ============================================================
// THEME
// ============================================================

const COLORS = {
    background: '#F8F7FC',
    surface: '#FFFFFF',
    primary: '#8B5CF6',
    primaryDark: '#6741A5',
    primaryLight: '#F0EBFF',
    text: '#25213A',
    secondaryText: '#77738B',
    muted: '#A29DB3',
    border: '#EAE6F2',
    success: '#16866A',
    successLight: '#E8F7F1',
};

const FREE_FEATURES: PlanFeature[] = [
    {
        title: 'Salon profile',
        description: 'Maintain your business information.',
    },
    {
        title: 'Service catalogue',
        description: 'Manage your listed services and prices.',
    },
    {
        title: 'Booking requests',
        description: 'Receive and respond to customer requests.',
    },
    {
        title: 'Customer reviews',
        description: 'Build trust through customer feedback.',
    },
];

const BOOST_FEATURES: PlanFeature[] = [
    {
        title: 'Everything in Free',
        description: 'Keep access to your core business features.',
    },
    {
        title: 'Boost membership',
        description: 'Access benefits enabled for Boost members.',
    },
    {
        title: 'Subscription management',
        description: 'View your plan and renewal information.',
    },
    {
        title: 'Member benefits',
        description: 'Access additional benefits as they become available.',
    },
];

// Proposed prices. Confirm before enabling checkout.
const BOOST_PRICING = {
    MONTHLY: {
        price: 199,
        label: 'per month',
    },
    YEARLY: {
        price: 1999,
        label: 'per year',
    },
};

// ============================================================
// MAIN SCREEN
// ============================================================

export default function ClavataBoostScreen() {
    const navigation = useNavigation<any>();

    const [billingCycle, setBillingCycle] =
        useState<BillingCycle>('MONTHLY');

    const [loading] = useState(false);

    /*
     * DEMO STATE:
     * This is the plan currently displayed by the UI.
     *
     * Replace this with the subscription/plan returned by AppSync.
     * Set it to 'BOOST' only when your backend confirms an active
     * Boost subscription.
     */
    const [currentPlan] = useState<PlanCode>('FREE');

    const selectedPricing = BOOST_PRICING[billingCycle];

    const yearlySavings = useMemo(() => {
        const annualMonthlyCost = BOOST_PRICING.MONTHLY.price * 12;
        const annualYearlyCost = BOOST_PRICING.YEARLY.price;

        return Math.max(
            0,
            Math.round(
                ((annualMonthlyCost - annualYearlyCost) /
                    annualMonthlyCost) *
                    100,
            ),
        );
    }, []);

    // ========================================================
    // ACTIONS
    // ========================================================

    const handleSubscribe = () => {
        if (loading) {
            return;
        }

        Alert.alert(
            'Clavata Boost',
            `You selected the ${billingCycle.toLowerCase()} plan for ₹${selectedPricing.price.toLocaleString('en-IN')} ${selectedPricing.label}.\n\nSubscription checkout is not connected yet. No payment has been taken.`,
            [{ text: 'OK' }],
        );
    };

    const handleManageSubscription = () => {
        Alert.alert(
            'Subscription management',
            'Your subscription details will appear here once the subscription service is connected.',
            [{ text: 'OK' }],
        );
    };

    // ========================================================
    // RENDER
    // ========================================================

    return (
        <SafeAreaView style={styles.safeArea}>
            <StatusBar
                barStyle="dark-content"
                backgroundColor={COLORS.background}
            />

            <ScrollView
                showsVerticalScrollIndicator={false}
                contentContainerStyle={styles.scrollContent}
            >
                {/* HEADER */}

                <View style={styles.header}>
                    <TouchableOpacity
                        onPress={() => navigation.goBack()}
                        style={styles.backButton}
                        activeOpacity={0.75}
                        accessibilityRole="button"
                        accessibilityLabel="Go back"
                    >
                        <Text style={styles.backArrow}>‹</Text>
                    </TouchableOpacity>

                    <View style={styles.headerTitleContainer}>
                        <Text style={styles.headerTitle}>
                            Clavata Boost
                        </Text>
                        <Text style={styles.headerSubtitle}>
                            Grow with Clavata
                        </Text>
                    </View>

                    <View style={styles.headerSpacer} />
                </View>

                {/* HERO */}

                <AppGradient
                    colors={[...GRADIENTS.SOFT_PURPLE]}
                    style={styles.heroCard}
                >
                    <View style={styles.heroGlowOne} />
                    <View style={styles.heroGlowTwo} />

                    <View style={styles.heroTopRow}>
                        <View style={styles.boostIcon}>
                            <Text style={styles.boostIconText}>✦</Text>
                        </View>

                        <View style={styles.premiumBadge}>
                            <Text style={styles.premiumBadgeText}>
                                SALON MEMBERSHIP
                            </Text>
                        </View>
                    </View>

                    <Text style={styles.heroTitle}>
                        Take your business
                        {'\n'}
                        to the next level.
                    </Text>

                    <Text style={styles.heroDescription}>
                        Explore membership benefits designed to help
                        you grow your presence on Clavata.
                    </Text>

                    <View style={styles.heroDivider} />

                    <View style={styles.heroBottomRow}>
                        <View style={styles.heroStat}>
                            <Text style={styles.heroStatTitle}>
                                Flexible
                            </Text>
                            <Text style={styles.heroStatSubtitle}>
                                Billing options
                            </Text>
                        </View>

                        <View style={styles.heroStatDivider} />

                        <View style={styles.heroStat}>
                            <Text style={styles.heroStatTitle}>
                                Transparent
                            </Text>
                            <Text style={styles.heroStatSubtitle}>
                                Plan pricing
                            </Text>
                        </View>

                        <View style={styles.heroStatDivider} />

                        <View style={styles.heroStat}>
                            <Text style={styles.heroStatTitle}>
                                Optional
                            </Text>
                            <Text style={styles.heroStatSubtitle}>
                                Upgrade anytime
                            </Text>
                        </View>
                    </View>
                </AppGradient>

                {/* CURRENT PLAN */}

                <View style={styles.currentPlanCard}>
                    <View style={styles.currentPlanIcon}>
                        <Text style={styles.currentPlanIconText}>✓</Text>
                    </View>

                    <View style={styles.currentPlanContent}>
                        <Text style={styles.currentPlanEyebrow}>
                            YOUR CURRENT PLAN
                        </Text>

                        <Text style={styles.currentPlanTitle}>
                            {currentPlan === 'FREE'
                                ? 'Clavata Free'
                                : 'Clavata Boost'}
                        </Text>

                        <Text style={styles.currentPlanDescription}>
                            {currentPlan === 'FREE'
                                ? 'You can continue using the core business features.'
                                : 'Your business has an active Boost membership.'}
                        </Text>
                    </View>

                    <View style={styles.activeBadge}>
                        <Text style={styles.activeBadgeText}>
                            {currentPlan === 'BOOST' ? 'BOOST' : 'ACTIVE'}
                        </Text>
                    </View>
                </View>

                {/* PLANS HEADING */}

                <View style={styles.sectionHeading}>
                    <Text style={styles.sectionTitle}>
                        Choose your plan
                    </Text>

                    <Text style={styles.sectionDescription}>
                        Compare Free and Boost and choose the option
                        that works best for your business.
                    </Text>
                </View>

                {/* =================================================
                    FREE PLAN CARD
                ================================================= */}

                <View style={styles.planCard}>
                    <View style={styles.planTopRow}>
                        <View style={styles.planTitleContent}>
                            <Text style={styles.planName}>Free</Text>
                            <Text style={styles.planDescription}>
                                The essentials for your business
                            </Text>
                        </View>

                        {currentPlan === 'FREE' && (
                            <View style={styles.currentBadge}>
                                <Text style={styles.currentBadgeText}>
                                    CURRENT PLAN
                                </Text>
                            </View>
                        )}
                    </View>

                    <View style={styles.priceRow}>
                        <Text style={styles.freePrice}>₹0</Text>
                        <Text style={styles.pricePeriod}> forever</Text>
                    </View>

                    <View style={styles.planDivider} />

                    {FREE_FEATURES.map(feature => (
                        <FeatureRow
                            key={feature.title}
                            feature={feature}
                            included
                        />
                    ))}

                    <View style={styles.freePlanNote}>
                        <Text style={styles.freePlanNoteText}>
                            Your core booking functionality remains
                            available on the Free plan.
                        </Text>
                    </View>

                    <View style={styles.freePlanButton}>
                        <Text style={styles.freePlanButtonText}>
                            {currentPlan === 'FREE'
                                ? 'Your current plan'
                                : 'Free plan'}
                        </Text>
                    </View>
                </View>

                {/* =================================================
                    BOOST PLAN CARD
                ================================================= */}

                <View style={styles.boostPlanCard}>
                    {/* Accent only — does not wrap the entire card. */}
                    <AppGradient
                        colors={[...GRADIENTS.SOFT_PURPLE]}
                        style={styles.boostPlanTopBorder}
                    >
                        <View style={styles.gradientFill} />
                    </AppGradient>

                    <View style={styles.boostPlanInner}>
                        <View style={styles.planTopRow}>
                            <View style={styles.planTitleContent}>
                                <View style={styles.boostNameRow}>
                                    <Text style={styles.boostPlanName}>
                                        Boost
                                    </Text>

                                    <View style={styles.recommendedBadge}>
                                        <Text style={styles.recommendedBadgeText}>
                                            MEMBERSHIP
                                        </Text>
                                    </View>
                                </View>

                                <Text style={styles.boostPlanDescription}>
                                    Additional benefits for your business
                                </Text>
                            </View>

                            {currentPlan === 'BOOST' && (
                                <View style={styles.currentBadge}>
                                    <Text style={styles.currentBadgeText}>
                                        YOUR PLAN
                                    </Text>
                                </View>
                            )}
                        </View>

                        {/* BILLING SELECTOR */}

                        <View style={styles.billingSelector}>
                            <TouchableOpacity
                                style={[
                                    styles.billingOption,
                                    billingCycle === 'MONTHLY' &&
                                        styles.billingOptionSelected,
                                ]}
                                onPress={() => setBillingCycle('MONTHLY')}
                                activeOpacity={0.8}
                                accessibilityRole="button"
                                accessibilityState={{
                                    selected: billingCycle === 'MONTHLY',
                                }}
                            >
                                <Text
                                    style={[
                                        styles.billingOptionTitle,
                                        billingCycle === 'MONTHLY' &&
                                            styles.billingOptionTitleSelected,
                                    ]}
                                >
                                    Monthly
                                </Text>

                                <Text
                                    style={[
                                        styles.billingOptionSubtitle,
                                        billingCycle === 'MONTHLY' &&
                                            styles.billingOptionSubtitleSelected,
                                    ]}
                                >
                                    Pay each month
                                </Text>
                            </TouchableOpacity>

                            <TouchableOpacity
                                style={[
                                    styles.billingOption,
                                    billingCycle === 'YEARLY' &&
                                        styles.billingOptionSelected,
                                ]}
                                onPress={() => setBillingCycle('YEARLY')}
                                activeOpacity={0.8}
                                accessibilityRole="button"
                                accessibilityState={{
                                    selected: billingCycle === 'YEARLY',
                                }}
                            >
                                <View style={styles.yearlyOptionHeader}>
                                    <Text
                                        style={[
                                            styles.billingOptionTitle,
                                            billingCycle === 'YEARLY' &&
                                                styles.billingOptionTitleSelected,
                                        ]}
                                    >
                                        Yearly
                                    </Text>

                                    <View style={styles.saveBadge}>
                                        <Text style={styles.saveBadgeText}>
                                            SAVE {yearlySavings}%
                                        </Text>
                                    </View>
                                </View>

                                <Text
                                    style={[
                                        styles.billingOptionSubtitle,
                                        billingCycle === 'YEARLY' &&
                                            styles.billingOptionSubtitleSelected,
                                    ]}
                                >
                                    Pay once a year
                                </Text>
                            </TouchableOpacity>
                        </View>

                        {/* SELECTED PRICE */}

                        <View style={styles.priceRow}>
                            <Text style={styles.boostPrice}>
                                ₹{selectedPricing.price.toLocaleString('en-IN')}
                            </Text>
                            <Text style={styles.pricePeriod}>
                                {' '}{selectedPricing.label}
                            </Text>
                        </View>

                        {billingCycle === 'YEARLY' && (
                            <Text style={styles.effectivePrice}>
                                Equivalent to approximately ₹
                                {Math.round(
                                    BOOST_PRICING.YEARLY.price / 12,
                                )}{' '}
                                per month
                            </Text>
                        )}

                        <Text style={styles.priceDisclaimer}>
                            Proposed pricing. Confirm final pricing and
                            membership benefits before enabling checkout.
                        </Text>

                        <View style={styles.planDivider} />

                        {BOOST_FEATURES.map(feature => (
                            <FeatureRow
                                key={feature.title}
                                feature={feature}
                                included
                                highlighted
                            />
                        ))}

                        {/* CTA */}

                        <AppGradient
                            colors={[...GRADIENTS.SOFT_PURPLE]}
                            style={[
                                styles.subscribeButton,
                                loading && styles.buttonDisabled,
                            ]}
                        >
                            <TouchableOpacity
                                style={styles.subscribeButtonContent}
                                onPress={
                                    currentPlan === 'BOOST'
                                        ? handleManageSubscription
                                        : handleSubscribe
                                }
                                disabled={loading}
                                activeOpacity={0.85}
                                accessibilityRole="button"
                            >
                                {loading ? (
                                    <ActivityIndicator
                                        color="#FFFFFF"
                                        size="small"
                                    />
                                ) : (
                                    <>
                                        <Text style={styles.subscribeButtonText}>
                                            {currentPlan === 'BOOST'
                                                ? 'Manage Boost'
                                                : 'Explore Boost'}
                                        </Text>

                                        <Text style={styles.subscribeButtonArrow}>
                                            →
                                        </Text>
                                    </>
                                )}
                            </TouchableOpacity>
                        </AppGradient>

                        <Text style={styles.checkoutFootnote}>
                            No payment is taken on this demo screen.
                        </Text>
                    </View>
                </View>

                {/* BOOKING INFORMATION */}

                <View style={styles.infoCard}>
                    <View style={styles.infoIcon}>
                        <Text style={styles.infoIconText}>i</Text>
                    </View>

                    <View style={styles.infoContent}>
                        <Text style={styles.infoTitle}>
                            Your bookings come first
                        </Text>

                        <Text style={styles.infoDescription}>
                            Boost is separate from customer bookings.
                            Your salon can continue receiving and managing
                            booking requests on the Free plan. Core booking
                            features will not be restricted by membership.
                        </Text>
                    </View>
                </View>

                {/* HELP INFORMATION */}

                <View style={styles.infoCard}>
                    <View style={styles.infoIcon}>
                        <Text style={styles.infoIconText}>?</Text>
                    </View>

                    <View style={styles.infoContent}>
                        <Text style={styles.infoTitle}>
                            Need help choosing?
                        </Text>

                        <Text style={styles.infoDescription}>
                            Compare the available benefits before choosing
                            a membership. Subscription activation and renewal
                            details will be available after payment integration.
                        </Text>
                    </View>
                </View>

                {/* FOOTER */}

                <Text style={styles.footerText}>
                    Clavata Connects Private Limited © 2026
                </Text>

                <View style={styles.bottomSpacing} />
            </ScrollView>
        </SafeAreaView>
    );
}

// ============================================================
// FEATURE ROW
// ============================================================

function FeatureRow({
    feature,
    included = false,
    highlighted = false,
}: {
    feature: PlanFeature;
    included?: boolean;
    highlighted?: boolean;
}) {
    return (
        <View style={styles.featureRow}>
            <View
                style={[
                    styles.featureCheck,
                    highlighted && styles.featureCheckHighlighted,
                    !included && styles.featureCheckExcluded,
                ]}
            >
                <Text
                    style={[
                        styles.featureCheckText,
                        !included && styles.featureCheckTextExcluded,
                    ]}
                >
                    {included ? '✓' : '–'}
                </Text>
            </View>

            <View style={styles.featureContent}>
                <Text style={styles.featureTitle}>
                    {feature.title}
                </Text>

                <Text style={styles.featureDescription}>
                    {feature.description}
                </Text>
            </View>
        </View>
    );
}

// ============================================================
// STYLES
// ============================================================

const styles = StyleSheet.create({
    safeArea: {
        flex: 1,
        backgroundColor: COLORS.background,
    },
    scrollContent: {
        paddingHorizontal: 18,
        paddingBottom: 16,
    },

    // HEADER

    header: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingTop: 10,
        paddingBottom: 20,
    },
    backButton: {
        width: 42,
        height: 42,
        borderRadius: 14,
        backgroundColor: COLORS.surface,
        borderWidth: 1,
        borderColor: COLORS.border,
        alignItems: 'center',
        justifyContent: 'center',
    },
    backArrow: {
        color: COLORS.text,
        fontSize: 34,
        lineHeight: 38,
        marginTop: -4,
    },
    headerTitleContainer: {
        flex: 1,
        marginLeft: 13,
    },
    headerTitle: {
        fontSize: 20,
        fontWeight: '800',
        color: COLORS.text,
        letterSpacing: -0.4,
    },
    headerSubtitle: {
        fontSize: 12,
        color: COLORS.secondaryText,
        marginTop: 3,
    },
    headerSpacer: {
        width: 42,
    },

    // HERO

    heroCard: {
        overflow: 'hidden',
        borderRadius: 24,
        padding: 22,
        marginBottom: 18,
    },
    heroGlowOne: {
        position: 'absolute',
        width: 190,
        height: 190,
        borderRadius: 100,
        right: -65,
        top: -75,
        backgroundColor: 'rgba(255,255,255,0.15)',
    },
    heroGlowTwo: {
        position: 'absolute',
        width: 130,
        height: 130,
        borderRadius: 70,
        right: 55,
        bottom: -85,
        backgroundColor: 'rgba(255,255,255,0.12)',
    },
    heroTopRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    boostIcon: {
        width: 44,
        height: 44,
        borderRadius: 15,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: 'rgba(255,255,255,0.2)',
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.3)',
    },
    boostIconText: {
        fontSize: 28,
        color: '#FFFFFF',
    },
    premiumBadge: {
        paddingHorizontal: 10,
        paddingVertical: 7,
        borderRadius: 20,
        backgroundColor: 'rgba(255,255,255,0.2)',
    },
    premiumBadgeText: {
        color: '#FFFFFF',
        fontSize: 9,
        fontWeight: '800',
        letterSpacing: 0.9,
    },
    heroTitle: {
        marginTop: 22,
        fontSize: 29,
        lineHeight: 35,
        color: '#FFFFFF',
        fontWeight: '800',
        letterSpacing: -0.7,
    },
    heroDescription: {
        marginTop: 10,
        fontSize: 13,
        lineHeight: 21,
        color: '#FFFFFF',
        maxWidth: 300,
    },
    heroDivider: {
        height: 1,
        backgroundColor: 'rgba(255,255,255,0.3)',
        marginTop: 23,
        marginBottom: 17,
    },
    heroBottomRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    heroStat: {
        flex: 1,
    },
    heroStatTitle: {
        color: '#FFFFFF',
        fontSize: 12,
        fontWeight: '700',
    },
    heroStatSubtitle: {
        marginTop: 5,
        color: '#FFFFFF',
        fontSize: 10,
        lineHeight: 14,
    },
    heroStatDivider: {
        width: 1,
        height: 32,
        backgroundColor: 'rgba(255,255,255,0.3)',
        marginHorizontal: 10,
    },

    // CURRENT PLAN

    currentPlanCard: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 16,
        borderRadius: 18,
        backgroundColor: COLORS.surface,
        borderWidth: 1,
        borderColor: COLORS.border,
        marginBottom: 27,
    },
    currentPlanIcon: {
        width: 42,
        height: 42,
        borderRadius: 14,
        backgroundColor: COLORS.primaryLight,
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 12,
    },
    currentPlanIconText: {
        color: COLORS.primaryDark,
        fontSize: 22,
        fontWeight: '800',
    },
    currentPlanContent: {
        flex: 1,
    },
    currentPlanEyebrow: {
        fontSize: 9,
        fontWeight: '800',
        letterSpacing: 0.8,
        color: COLORS.secondaryText,
    },
    currentPlanTitle: {
        marginTop: 4,
        fontSize: 15,
        fontWeight: '800',
        color: COLORS.text,
    },
    currentPlanDescription: {
        marginTop: 4,
        fontSize: 11,
        lineHeight: 16,
        color: COLORS.secondaryText,
        paddingRight: 3,
    },
    activeBadge: {
        paddingHorizontal: 8,
        paddingVertical: 5,
        backgroundColor: COLORS.successLight,
        borderRadius: 20,
        marginLeft: 5,
    },
    activeBadgeText: {
        fontSize: 8,
        color: COLORS.success,
        fontWeight: '800',
    },

    // SECTION HEADING

    sectionHeading: {
        marginBottom: 15,
    },
    sectionTitle: {
        color: COLORS.text,
        fontSize: 21,
        fontWeight: '800',
        letterSpacing: -0.4,
    },
    sectionDescription: {
        marginTop: 6,
        color: COLORS.secondaryText,
        fontSize: 12,
        lineHeight: 18,
    },

    // PLAN CARDS

    planCard: {
        padding: 19,
        borderRadius: 21,
        backgroundColor: COLORS.surface,
        borderWidth: 1,
        borderColor: COLORS.border,
        marginBottom: 16,
    },
    planTopRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
    },
    planTitleContent: {
        flex: 1,
    },
    planName: {
        color: COLORS.text,
        fontSize: 20,
        fontWeight: '800',
    },
    planDescription: {
        color: COLORS.secondaryText,
        fontSize: 12,
        marginTop: 5,
    },
    currentBadge: {
        backgroundColor: COLORS.primaryLight,
        paddingHorizontal: 8,
        paddingVertical: 6,
        borderRadius: 9,
        marginLeft: 8,
    },
    currentBadgeText: {
        color: COLORS.primaryDark,
        fontSize: 8,
        fontWeight: '800',
        letterSpacing: 0.4,
    },
    priceRow: {
        flexDirection: 'row',
        alignItems: 'baseline',
        marginTop: 19,
    },
    freePrice: {
        color: COLORS.text,
        fontSize: 34,
        fontWeight: '800',
        letterSpacing: -1,
    },
    pricePeriod: {
        color: COLORS.secondaryText,
        fontSize: 12,
    },
    planDivider: {
        height: 1,
        backgroundColor: COLORS.border,
        marginVertical: 17,
    },
    freePlanNote: {
        marginTop: 14,
        padding: 11,
        borderRadius: 11,
        backgroundColor: '#F7F5FC',
    },
    freePlanNoteText: {
        color: COLORS.secondaryText,
        fontSize: 11,
        lineHeight: 17,
    },
    freePlanButton: {
        minHeight: 43,
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: 12,
        borderWidth: 1,
        borderColor: COLORS.border,
        marginTop: 14,
        paddingHorizontal: 12,
    },
    freePlanButtonText: {
        color: COLORS.secondaryText,
        fontSize: 12,
        fontWeight: '700',
    },

    // BOOST CARD

    boostPlanCard: {
        borderRadius: 22,
        overflow: 'hidden',
        backgroundColor: COLORS.surface,
        borderWidth: 1.5,
        borderColor: '#D8C9FF',
        marginBottom: 19,
    },
    boostPlanTopBorder: {
        height: 6,
        width: '100%',
    },
    gradientFill: {
        flex: 1,
    },
    boostPlanInner: {
        padding: 19,
    },
    boostNameRow: {
        flexDirection: 'row',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: 8,
    },
    boostPlanName: {
        color: COLORS.primaryDark,
        fontSize: 23,
        fontWeight: '900',
    },
    recommendedBadge: {
        backgroundColor: COLORS.primaryLight,
        borderRadius: 8,
        paddingHorizontal: 8,
        paddingVertical: 5,
    },
    recommendedBadgeText: {
        color: COLORS.primaryDark,
        fontSize: 8,
        fontWeight: '800',
        letterSpacing: 0.5,
    },
    boostPlanDescription: {
        marginTop: 6,
        fontSize: 12,
        color: COLORS.secondaryText,
    },

    // BILLING SELECTOR

    billingSelector: {
        flexDirection: 'row',
        gap: 9,
        marginTop: 20,
    },
    billingOption: {
        flex: 1,
        minHeight: 75,
        borderRadius: 13,
        padding: 11,
        borderWidth: 1,
        borderColor: COLORS.border,
        backgroundColor: '#FFFFFF',
        justifyContent: 'center',
    },
    billingOptionSelected: {
        borderColor: COLORS.primary,
        backgroundColor: COLORS.primaryLight,
    },
    billingOptionTitle: {
        fontSize: 13,
        fontWeight: '800',
        color: COLORS.text,
    },
    billingOptionTitleSelected: {
        color: COLORS.primaryDark,
    },
    billingOptionSubtitle: {
        marginTop: 5,
        fontSize: 10,
        lineHeight: 14,
        color: COLORS.secondaryText,
    },
    billingOptionSubtitleSelected: {
        color: COLORS.primaryDark,
    },
    yearlyOptionHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: 5,
    },
    saveBadge: {
        paddingHorizontal: 5,
        paddingVertical: 3,
        borderRadius: 5,
        backgroundColor: COLORS.primaryLight,
    },
    saveBadgeText: {
        fontSize: 8,
        color: COLORS.primaryDark,
        fontWeight: '900',
    },
    boostPrice: {
        color: COLORS.primaryDark,
        fontSize: 35,
        fontWeight: '900',
        letterSpacing: -1,
    },
    effectivePrice: {
        marginTop: 4,
        fontSize: 11,
        color: COLORS.secondaryText,
    },
    priceDisclaimer: {
        marginTop: 9,
        fontSize: 10,
        lineHeight: 15,
        color: COLORS.muted,
    },

    // FEATURES

    featureRow: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        marginBottom: 16,
    },
    featureCheck: {
        width: 22,
        height: 22,
        borderRadius: 11,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: COLORS.successLight,
        marginRight: 10,
        marginTop: 1,
    },
    featureCheckHighlighted: {
        backgroundColor: COLORS.primaryLight,
    },
    featureCheckExcluded: {
        backgroundColor: '#F0EFF4',
    },
    featureCheckText: {
        fontSize: 13,
        fontWeight: '900',
        color: COLORS.success,
    },
    featureCheckTextExcluded: {
        color: COLORS.muted,
    },
    featureContent: {
        flex: 1,
    },
    featureTitle: {
        color: COLORS.text,
        fontSize: 12,
        fontWeight: '700',
    },
    featureDescription: {
        marginTop: 3,
        color: COLORS.secondaryText,
        fontSize: 11,
        lineHeight: 16,
    },

    // CTA

    subscribeButton: {
        minHeight: 52,
        borderRadius: 15,
        overflow: 'hidden',
        marginTop: 5,
    },
    subscribeButtonContent: {
        minHeight: 52,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingHorizontal: 18,
    },
    buttonDisabled: {
        opacity: 0.65,
    },
    subscribeButtonText: {
        color: '#FFFFFF',
        fontSize: 14,
        fontWeight: '800',
    },
    subscribeButtonArrow: {
        marginLeft: 10,
        color: '#FFFFFF',
        fontSize: 21,
        fontWeight: '600',
    },
    checkoutFootnote: {
        marginTop: 10,
        textAlign: 'center',
        color: COLORS.muted,
        fontSize: 10,
        lineHeight: 15,
    },

    // INFO CARDS

    infoCard: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        backgroundColor: COLORS.surface,
        borderWidth: 1,
        borderColor: COLORS.border,
        borderRadius: 16,
        padding: 15,
        marginBottom: 12,
    },
    infoIcon: {
        width: 28,
        height: 28,
        borderRadius: 10,
        backgroundColor: COLORS.primaryLight,
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 11,
    },
    infoIconText: {
        fontSize: 14,
        fontWeight: '900',
        color: COLORS.primaryDark,
    },
    infoContent: {
        flex: 1,
    },
    infoTitle: {
        color: COLORS.text,
        fontSize: 12,
        fontWeight: '800',
    },
    infoDescription: {
        marginTop: 5,
        color: COLORS.secondaryText,
        fontSize: 11,
        lineHeight: 18,
    },

    // FOOTER

    footerText: {
        marginTop: 17,
        textAlign: 'center',
        color: COLORS.muted,
        fontSize: 10,
    },
    bottomSpacing: {
        height: 20,
    },
});
