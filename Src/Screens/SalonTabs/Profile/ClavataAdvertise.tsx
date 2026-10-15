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

type CampaignType = 'FEATURED' | 'OFFER' | 'VISIBILITY';
type CampaignDuration = 7 | 14 | 30;

type Campaign = {
    id: string;
    name: string;
    type: CampaignType;
    status: 'DRAFT' | 'PENDING' | 'ACTIVE' | 'COMPLETED' | 'REJECTED';
    duration: number;
    budget: number;
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
    warning: '#A76513',
    warningLight: '#FFF3DF',
    danger: '#C2415D',
    dangerLight: '#FCEBF0',
};

const CAMPAIGN_OPTIONS: {
    id: CampaignType;
    icon: string;
    title: string;
    subtitle: string;
    description: string;
}[] = [
    {
        id: 'FEATURED',
        icon: '✦',
        title: 'Featured Salon',
        subtitle: 'Stand out in discovery',
        description:
            'Promote your salon in eligible discovery and search placements.',
    },
    {
        id: 'OFFER',
        icon: '%',
        title: 'Promote an Offer',
        subtitle: 'Highlight a special offer',
        description:
            'Showcase a salon offer or service promotion to potential customers.',
    },
    {
        id: 'VISIBILITY',
        icon: '◎',
        title: 'More Visibility',
        subtitle: 'Increase salon exposure',
        description:
            'Request additional visibility in supported Clavata placements.',
    },
];

// Illustrative prices only. Replace with admin-configured pricing.
const DURATION_OPTIONS: {
    days: CampaignDuration;
    label: string;
}[] = [
    { days: 7, label: '7 days' },
    { days: 14, label: '14 days' },
    { days: 30, label: '30 days' },
];

const BUDGET_OPTIONS = [299, 599, 999, 1999];

// ============================================================
// HELPERS
// ============================================================

const formatCurrency = (amount: number) =>
    `₹${amount.toLocaleString('en-IN')}`;

const getStatusStyle = (status: Campaign['status']) => {
    switch (status) {
        case 'ACTIVE':
            return {
                backgroundColor: COLORS.successLight,
                color: COLORS.success,
            };
        case 'PENDING':
            return {
                backgroundColor: COLORS.warningLight,
                color: COLORS.warning,
            };
        case 'REJECTED':
            return {
                backgroundColor: COLORS.dangerLight,
                color: COLORS.danger,
            };
        case 'COMPLETED':
            return {
                backgroundColor: '#F0EFF4',
                color: COLORS.secondaryText,
            };
        default:
            return {
                backgroundColor: COLORS.primaryLight,
                color: COLORS.primaryDark,
            };
    }
};

// ============================================================
// SCREEN
// ============================================================

export default function ClavataAdvertiseScreen() {
    const navigation = useNavigation<any>();

    const [campaignType, setCampaignType] =
        useState<CampaignType>('FEATURED');

    const [duration, setDuration] =
        useState<CampaignDuration>(7);

    const [budget, setBudget] = useState<number>(599);
    const [loading, setLoading] = useState(false);

    // Demo data. Replace with campaigns loaded from AppSync.
    const [campaigns] = useState<Campaign[]>([]);

    const selectedCampaign = useMemo(
        () => CAMPAIGN_OPTIONS.find(item => item.id === campaignType)!,
        [campaignType],
    );

    const estimatedPrice = budget;

    const handleCreateCampaign = () => {
        if (loading) {
            return;
        }

        Alert.alert(
            'Campaign preview',
            `Campaign: ${selectedCampaign.title}\n` +
                `Duration: ${duration} days\n` +
                `Illustrative budget: ${formatCurrency(estimatedPrice)}\n\n` +
                'This is a preview only. No campaign has been submitted, activated, or charged.',
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'OK',
                    onPress: () => {
                        // TODO:
                        // 1. Submit campaign draft to AppSync.
                        // 2. Validate salon approval and campaign details.
                        // 3. Show admin review/payment steps.
                        // 4. Activate only after required approvals
                        //    and successful payment.
                    },
                },
            ],
        );
    };

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

                    <View style={styles.headerText}>
                        <Text style={styles.headerTitle}>
                            Advertise on Clavata
                        </Text>
                        <Text style={styles.headerSubtitle}>
                            Reach more potential customers
                        </Text>
                    </View>

                    <View style={styles.headerSpacer} />
                </View>

                {/* HERO */}

                <AppGradient
                    colors={[...GRADIENTS.SOFT_PURPLE]}
                    style={styles.heroCard}
                >
                    <View style={styles.heroDecoration} />

                    <View style={styles.heroIcon}>
                        <Text style={styles.heroIconText}>✦</Text>
                    </View>

                    <View style={styles.heroBadge}>
                        <Text style={styles.heroBadgeText}>
                            SALON PROMOTION
                        </Text>
                    </View>

                    <Text style={styles.heroTitle}>
                        Get your salon noticed.
                    </Text>

                    <Text style={styles.heroDescription}>
                        Discover advertising options designed to help
                        your salon reach more customers on Clavata.
                    </Text>

                    <View style={styles.heroBottom}>
                        <Text style={styles.heroBottomIcon}>✓</Text>
                        <Text style={styles.heroBottomText}>
                            Review your budget before proceeding
                        </Text>
                    </View>
                </AppGradient>

                {/* SECTION HEADING */}

                <View style={styles.sectionHeading}>
                    <Text style={styles.sectionTitle}>
                        Choose your promotion
                    </Text>
                    <Text style={styles.sectionDescription}>
                        Select the type of campaign you want to explore.
                    </Text>
                </View>

                {/* CAMPAIGN TYPES */}

                {CAMPAIGN_OPTIONS.map(option => {
                    const selected = campaignType === option.id;

                    return (
                        <TouchableOpacity
                            key={option.id}
                            style={[
                                styles.campaignCard,
                                selected && styles.campaignCardSelected,
                            ]}
                            onPress={() => setCampaignType(option.id)}
                            activeOpacity={0.82}
                            accessibilityRole="radio"
                            accessibilityState={{ selected }}
                        >
                            <View
                                style={[
                                    styles.campaignIcon,
                                    selected && styles.campaignIconSelected,
                                ]}
                            >
                                <Text
                                    style={[
                                        styles.campaignIconText,
                                        selected &&
                                            styles.campaignIconTextSelected,
                                    ]}
                                >
                                    {option.icon}
                                </Text>
                            </View>

                            <View style={styles.campaignContent}>
                                <View style={styles.campaignTitleRow}>
                                    <Text style={styles.campaignTitle}>
                                        {option.title}
                                    </Text>

                                    {selected && (
                                        <View style={styles.selectedBadge}>
                                            <Text style={styles.selectedBadgeText}>
                                                SELECTED
                                            </Text>
                                        </View>
                                    )}
                                </View>

                                <Text style={styles.campaignSubtitle}>
                                    {option.subtitle}
                                </Text>

                                <Text style={styles.campaignDescription}>
                                    {option.description}
                                </Text>
                            </View>

                            <View
                                style={[
                                    styles.radioOuter,
                                    selected && styles.radioOuterSelected,
                                ]}
                            >
                                {selected && (
                                    <View style={styles.radioInner} />
                                )}
                            </View>
                        </TouchableOpacity>
                    );
                })}

                {/* DURATION */}

                <View style={styles.sectionHeading}>
                    <Text style={styles.sectionTitle}>
                        Campaign duration
                    </Text>
                    <Text style={styles.sectionDescription}>
                        Choose how long you want to run the campaign.
                    </Text>
                </View>

                <View style={styles.optionRow}>
                    {DURATION_OPTIONS.map(option => {
                        const selected = duration === option.days;

                        return (
                            <TouchableOpacity
                                key={option.days}
                                style={[
                                    styles.durationOption,
                                    selected &&
                                        styles.durationOptionSelected,
                                ]}
                                onPress={() => setDuration(option.days)}
                                activeOpacity={0.8}
                                accessibilityRole="radio"
                                accessibilityState={{ selected }}
                            >
                                <Text
                                    style={[
                                        styles.durationValue,
                                        selected &&
                                            styles.optionTextSelected,
                                    ]}
                                >
                                    {option.days}
                                </Text>

                                <Text
                                    style={[
                                        styles.durationLabel,
                                        selected &&
                                            styles.optionTextSelected,
                                    ]}
                                >
                                    days
                                </Text>

                                {selected && (
                                    <View style={styles.durationCheck}>
                                        <Text style={styles.durationCheckText}>
                                            ✓
                                        </Text>
                                    </View>
                                )}
                            </TouchableOpacity>
                        );
                    })}
                </View>

                {/* BUDGET */}

                <View style={styles.sectionHeading}>
                    <Text style={styles.sectionTitle}>
                        Advertising budget
                    </Text>
                    <Text style={styles.sectionDescription}>
                        Choose an illustrative campaign budget.
                    </Text>
                </View>

                <View style={styles.budgetCard}>
                    <View style={styles.budgetHeader}>
                        <View>
                            <Text style={styles.budgetEyebrow}>
                                SELECTED BUDGET
                            </Text>
                            <Text style={styles.budgetAmount}>
                                {formatCurrency(budget)}
                            </Text>
                        </View>

                        <View style={styles.budgetIcon}>
                            <Text style={styles.budgetIconText}>₹</Text>
                        </View>
                    </View>

                    <View style={styles.budgetOptions}>
                        {BUDGET_OPTIONS.map(amount => {
                            const selected = budget === amount;

                            return (
                                <TouchableOpacity
                                    key={amount}
                                    style={[
                                        styles.budgetOption,
                                        selected &&
                                            styles.budgetOptionSelected,
                                    ]}
                                    onPress={() => setBudget(amount)}
                                    activeOpacity={0.8}
                                    accessibilityRole="radio"
                                    accessibilityState={{ selected }}
                                >
                                    <Text
                                        style={[
                                            styles.budgetOptionText,
                                            selected &&
                                                styles.budgetOptionTextSelected,
                                        ]}
                                    >
                                        {formatCurrency(amount)}
                                    </Text>
                                </TouchableOpacity>
                            );
                        })}
                    </View>

                    <View style={styles.budgetDivider} />

                    <View style={styles.estimateRow}>
                        <Text style={styles.estimateLabel}>
                            Selected duration
                        </Text>
                        <Text style={styles.estimateValue}>
                            {duration} days
                        </Text>
                    </View>

                    <View style={styles.estimateRow}>
                        <Text style={styles.estimateLabel}>
                            Campaign budget
                        </Text>
                        <Text style={styles.estimateValue}>
                            {formatCurrency(estimatedPrice)}
                        </Text>
                    </View>

                    <Text style={styles.budgetDisclaimer}>
                        Illustrative prices only, not live advertising rates.
                        Final pricing, placement, and availability must be
                        confirmed by Clavata before payment.
                    </Text>
                </View>

                {/* CAMPAIGN SUMMARY */}

                <View style={styles.summaryCard}>
                    <Text style={styles.summaryTitle}>
                        Your campaign summary
                    </Text>

                    <View style={styles.summaryRow}>
                        <Text style={styles.summaryLabel}>Promotion</Text>
                        <Text style={styles.summaryValue}>
                            {selectedCampaign.title}
                        </Text>
                    </View>

                    <View style={styles.summaryRow}>
                        <Text style={styles.summaryLabel}>Duration</Text>
                        <Text style={styles.summaryValue}>
                            {duration} days
                        </Text>
                    </View>

                    <View style={styles.summaryRow}>
                        <Text style={styles.summaryLabel}>Budget</Text>
                        <Text style={styles.summaryPrice}>
                            {formatCurrency(estimatedPrice)}
                        </Text>
                    </View>

                    <View style={styles.summaryDivider} />

                    <Text style={styles.summaryNote}>
                        Submitting a campaign request does not guarantee
                        placement or immediate activation. Campaigns may
                        require review and payment confirmation.
                    </Text>

                    <AppGradient
                        colors={[...GRADIENTS.SOFT_PURPLE]}
                        style={[
                            styles.createButton,
                            loading && styles.buttonDisabled,
                        ]}
                    >
                        <TouchableOpacity
                            style={styles.createButtonContent}
                            onPress={handleCreateCampaign}
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
                                    <Text style={styles.createButtonText}>
                                        Continue to campaign review
                                    </Text>
                                    <Text style={styles.createButtonArrow}>
                                        →
                                    </Text>
                                </>
                            )}
                        </TouchableOpacity>
                    </AppGradient>

                    <Text style={styles.noChargeText}>
                        No payment will be taken on this demo screen.
                    </Text>
                </View>

                {/* CAMPAIGNS */}

                <View style={styles.sectionHeading}>
                    <Text style={styles.sectionTitle}>
                        Your campaigns
                    </Text>
                    <Text style={styles.sectionDescription}>
                        View your campaign requests and their statuses.
                    </Text>
                </View>

                {campaigns.length === 0 ? (
                    <View style={styles.emptyCard}>
                        <View style={styles.emptyIcon}>
                            <Text style={styles.emptyIconText}>✦</Text>
                        </View>

                        <Text style={styles.emptyTitle}>
                            No campaigns yet
                        </Text>

                        <Text style={styles.emptyDescription}>
                            Your submitted campaigns will appear here
                            once campaign management is connected.
                        </Text>
                    </View>
                ) : (
                    campaigns.map(campaign => {
                        const statusStyle = getStatusStyle(campaign.status);

                        return (
                            <View
                                key={campaign.id}
                                style={styles.existingCampaignCard}
                            >
                                <View style={styles.existingCampaignHeader}>
                                    <Text style={styles.existingCampaignName}>
                                        {campaign.name}
                                    </Text>

                                    <View
                                        style={[
                                            styles.statusBadge,
                                            {
                                                backgroundColor:
                                                    statusStyle.backgroundColor,
                                            },
                                        ]}
                                    >
                                        <Text
                                            style={[
                                                styles.statusBadgeText,
                                                { color: statusStyle.color },
                                            ]}
                                        >
                                            {campaign.status}
                                        </Text>
                                    </View>
                                </View>

                                <Text style={styles.existingCampaignDetails}>
                                    {campaign.duration} days ·{' '}
                                    {formatCurrency(campaign.budget)}
                                </Text>
                            </View>
                        );
                    })
                )}

                {/* IMPORTANT NOTE */}

                <View style={styles.infoCard}>
                    <View style={styles.infoIcon}>
                        <Text style={styles.infoIconText}>i</Text>
                    </View>

                    <View style={styles.infoContent}>
                        <Text style={styles.infoTitle}>
                            Advertising is separate from Boost
                        </Text>

                        <Text style={styles.infoDescription}>
                            Advertising campaigns and Boost membership
                            are separate options. Your salon can continue
                            receiving and managing its core booking requests
                            on the Free plan.
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
// STYLES
// ============================================================

const styles = StyleSheet.create({
    safeArea: {
        flex: 1,
        backgroundColor: COLORS.background,
    },
    scrollContent: {
        paddingHorizontal: 18,
        paddingBottom: 20,
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
    headerText: {
        flex: 1,
        marginLeft: 13,
    },
    headerTitle: {
        fontSize: 19,
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
        width: 12,
    },

    // HERO

    heroCard: {
        borderRadius: 24,
        overflow: 'hidden',
        padding: 22,
        marginBottom: 28,
    },
    heroDecoration: {
        position: 'absolute',
        width: 190,
        height: 190,
        borderRadius: 100,
        right: -65,
        top: -70,
        backgroundColor: 'rgba(255,255,255,0.14)',
    },
    heroIcon: {
        width: 46,
        height: 46,
        borderRadius: 15,
        backgroundColor: 'rgba(255,255,255,0.2)',
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.25)',
    },
    heroIconText: {
        fontSize: 27,
        color: '#FFFFFF',
    },
    heroBadge: {
        alignSelf: 'flex-start',
        marginTop: 17,
        paddingHorizontal: 10,
        paddingVertical: 6,
        borderRadius: 20,
        backgroundColor: 'rgba(255,255,255,0.2)',
    },
    heroBadgeText: {
        color: '#FFFFFF',
        fontSize: 9,
        fontWeight: '800',
        letterSpacing: 0.8,
    },
    heroTitle: {
        marginTop: 15,
        fontSize: 27,
        lineHeight: 34,
        fontWeight: '900',
        letterSpacing: -0.6,
        color: '#FFFFFF',
    },
    heroDescription: {
        marginTop: 9,
        fontSize: 13,
        lineHeight: 21,
        color: '#FFFFFF',
    },
    heroBottom: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 20,
        paddingTop: 15,
        borderTopWidth: 1,
        borderTopColor: 'rgba(255,255,255,0.3)',
    },
    heroBottomIcon: {
        color: '#FFFFFF',
        fontSize: 16,
        fontWeight: '900',
        marginRight: 8,
    },
    heroBottomText: {
        flex: 1,
        color: '#FFFFFF',
        fontSize: 11,
        fontWeight: '600',
    },

    // SECTION HEADINGS

    sectionHeading: {
        marginBottom: 13,
        marginTop: 2,
    },
    sectionTitle: {
        fontSize: 19,
        fontWeight: '800',
        color: COLORS.text,
        letterSpacing: -0.3,
    },
    sectionDescription: {
        marginTop: 5,
        fontSize: 12,
        lineHeight: 18,
        color: COLORS.secondaryText,
    },

    // CAMPAIGN TYPES

    campaignCard: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        backgroundColor: COLORS.surface,
        borderRadius: 18,
        borderWidth: 1.2,
        borderColor: COLORS.border,
        padding: 15,
        marginBottom: 11,
    },
    campaignCardSelected: {
        borderColor: COLORS.primary,
        backgroundColor: '#FCFAFF',
    },
    campaignIcon: {
        width: 44,
        height: 44,
        borderRadius: 14,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#F5F2FA',
        marginRight: 12,
    },
    campaignIconSelected: {
        backgroundColor: COLORS.primaryLight,
    },
    campaignIconText: {
        fontSize: 23,
        fontWeight: '800',
        color: COLORS.secondaryText,
    },
    campaignIconTextSelected: {
        color: COLORS.primaryDark,
    },
    campaignContent: {
        flex: 1,
    },
    campaignTitleRow: {
        flexDirection: 'row',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: 6,
    },
    campaignTitle: {
        color: COLORS.text,
        fontSize: 14,
        fontWeight: '800',
    },
    selectedBadge: {
        backgroundColor: COLORS.primaryLight,
        paddingHorizontal: 6,
        paddingVertical: 4,
        borderRadius: 6,
    },
    selectedBadgeText: {
        color: COLORS.primaryDark,
        fontSize: 7,
        fontWeight: '900',
    },
    campaignSubtitle: {
        marginTop: 5,
        fontSize: 11,
        fontWeight: '700',
        color: COLORS.primaryDark,
    },
    campaignDescription: {
        marginTop: 5,
        fontSize: 11,
        lineHeight: 16,
        color: COLORS.secondaryText,
    },
    radioOuter: {
        width: 19,
        height: 19,
        borderRadius: 10,
        borderWidth: 1.5,
        borderColor: '#D5CFE2',
        alignItems: 'center',
        justifyContent: 'center',
        marginLeft: 8,
        marginTop: 2,
    },
    radioOuterSelected: {
        borderColor: COLORS.primary,
    },
    radioInner: {
        width: 9,
        height: 9,
        borderRadius: 5,
        backgroundColor: COLORS.primary,
    },

    // DURATION

    optionRow: {
        flexDirection: 'row',
        gap: 10,
        marginBottom: 25,
    },
    durationOption: {
        flex: 1,
        minHeight: 82,
        borderRadius: 15,
        borderWidth: 1,
        borderColor: COLORS.border,
        backgroundColor: COLORS.surface,
        alignItems: 'center',
        justifyContent: 'center',
        padding: 10,
        position: 'relative',
    },
    durationOptionSelected: {
        backgroundColor: COLORS.primaryLight,
        borderColor: COLORS.primary,
    },
    durationValue: {
        fontSize: 23,
        fontWeight: '900',
        color: COLORS.text,
    },
    durationLabel: {
        marginTop: 2,
        fontSize: 10,
        color: COLORS.secondaryText,
    },
    optionTextSelected: {
        color: COLORS.primaryDark,
    },
    durationCheck: {
        position: 'absolute',
        right: 6,
        top: 6,
        width: 16,
        height: 16,
        borderRadius: 8,
        backgroundColor: COLORS.primary,
        alignItems: 'center',
        justifyContent: 'center',
    },
    durationCheckText: {
        fontSize: 10,
        color: '#FFFFFF',
        fontWeight: '900',
    },

    // BUDGET

    budgetCard: {
        padding: 17,
        backgroundColor: COLORS.surface,
        borderWidth: 1,
        borderColor: COLORS.border,
        borderRadius: 20,
        marginBottom: 24,
    },
    budgetHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    budgetEyebrow: {
        color: COLORS.secondaryText,
        fontSize: 9,
        fontWeight: '800',
        letterSpacing: 0.8,
    },
    budgetAmount: {
        color: COLORS.primaryDark,
        fontSize: 30,
        fontWeight: '900',
        marginTop: 5,
    },
    budgetIcon: {
        width: 44,
        height: 44,
        borderRadius: 14,
        backgroundColor: COLORS.primaryLight,
        alignItems: 'center',
        justifyContent: 'center',
    },
    budgetIconText: {
        color: COLORS.primaryDark,
        fontSize: 22,
        fontWeight: '900',
    },
    budgetOptions: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 8,
        marginTop: 18,
    },
    budgetOption: {
        minWidth: '46%',
        flexGrow: 1,
        paddingHorizontal: 10,
        paddingVertical: 12,
        borderRadius: 11,
        borderWidth: 1,
        borderColor: COLORS.border,
        alignItems: 'center',
        backgroundColor: '#FFFFFF',
    },
    budgetOptionSelected: {
        backgroundColor: COLORS.primaryLight,
        borderColor: COLORS.primary,
    },
    budgetOptionText: {
        color: COLORS.text,
        fontSize: 12,
        fontWeight: '700',
    },
    budgetOptionTextSelected: {
        color: COLORS.primaryDark,
        fontWeight: '900',
    },
    budgetDivider: {
        height: 1,
        backgroundColor: COLORS.border,
        marginVertical: 17,
    },
    estimateRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 11,
    },
    estimateLabel: {
        fontSize: 12,
        color: COLORS.secondaryText,
    },
    estimateValue: {
        fontSize: 12,
        fontWeight: '800',
        color: COLORS.text,
    },
    budgetDisclaimer: {
        marginTop: 5,
        fontSize: 10,
        lineHeight: 16,
        color: COLORS.muted,
    },

    // SUMMARY

    summaryCard: {
        backgroundColor: COLORS.surface,
        borderWidth: 1,
        borderColor: '#DCCFFF',
        borderRadius: 20,
        padding: 18,
        marginBottom: 28,
    },
    summaryTitle: {
        color: COLORS.text,
        fontSize: 16,
        fontWeight: '900',
        marginBottom: 18,
    },
    summaryRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 13,
        gap: 12,
    },
    summaryLabel: {
        color: COLORS.secondaryText,
        fontSize: 12,
    },
    summaryValue: {
        flexShrink: 1,
        textAlign: 'right',
        color: COLORS.text,
        fontSize: 12,
        fontWeight: '700',
    },
    summaryPrice: {
        color: COLORS.primaryDark,
        fontSize: 15,
        fontWeight: '900',
    },
    summaryDivider: {
        height: 1,
        backgroundColor: COLORS.border,
        marginVertical: 5,
    },
    summaryNote: {
        color: COLORS.secondaryText,
        fontSize: 10,
        lineHeight: 16,
        marginVertical: 12,
    },
    createButton: {
        minHeight: 53,
        borderRadius: 15,
        overflow: 'hidden',
        marginTop: 3,
    },
    createButtonContent: {
        minHeight: 53,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingHorizontal: 12,
    },
    createButtonText: {
        color: '#FFFFFF',
        fontSize: 12,
        fontWeight: '800',
        flexShrink: 1,
        textAlign: 'center',
    },
    createButtonArrow: {
        color: '#FFFFFF',
        fontSize: 21,
        marginLeft: 9,
    },
    buttonDisabled: {
        opacity: 0.65,
    },
    noChargeText: {
        textAlign: 'center',
        color: COLORS.muted,
        fontSize: 10,
        marginTop: 10,
    },

    // EMPTY CAMPAIGNS

    emptyCard: {
        alignItems: 'center',
        paddingHorizontal: 24,
        paddingVertical: 27,
        borderRadius: 18,
        borderWidth: 1,
        borderColor: COLORS.border,
        borderStyle: 'dashed',
        backgroundColor: COLORS.surface,
        marginBottom: 17,
    },
    emptyIcon: {
        width: 48,
        height: 48,
        borderRadius: 16,
        backgroundColor: COLORS.primaryLight,
        alignItems: 'center',
        justifyContent: 'center',
    },
    emptyIconText: {
        fontSize: 25,
        color: COLORS.primaryDark,
    },
    emptyTitle: {
        color: COLORS.text,
        fontSize: 14,
        fontWeight: '800',
        marginTop: 13,
    },
    emptyDescription: {
        textAlign: 'center',
        color: COLORS.secondaryText,
        fontSize: 11,
        lineHeight: 17,
        marginTop: 6,
    },
    existingCampaignCard: {
        padding: 15,
        borderRadius: 15,
        backgroundColor: COLORS.surface,
        borderWidth: 1,
        borderColor: COLORS.border,
        marginBottom: 10,
    },
    existingCampaignHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        gap: 8,
    },
    existingCampaignName: {
        flex: 1,
        color: COLORS.text,
        fontSize: 13,
        fontWeight: '800',
    },
    existingCampaignDetails: {
        marginTop: 8,
        color: COLORS.secondaryText,
        fontSize: 11,
    },
    statusBadge: {
        borderRadius: 8,
        paddingHorizontal: 8,
        paddingVertical: 5,
    },
    statusBadgeText: {
        fontSize: 8,
        fontWeight: '900',
    },

    // INFO

    infoCard: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        padding: 15,
        borderRadius: 16,
        borderWidth: 1,
        borderColor: COLORS.border,
        backgroundColor: COLORS.surface,
        marginBottom: 12,
    },
    infoIcon: {
        width: 29,
        height: 29,
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
        textAlign: 'center',
        marginTop: 15,
        color: COLORS.muted,
        fontSize: 10,
    },
    bottomSpacing: {
        height: 20,
    },
});
