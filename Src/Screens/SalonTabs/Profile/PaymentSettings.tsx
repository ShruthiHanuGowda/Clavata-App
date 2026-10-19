import React, { useState, useCallback } from 'react';
import {
    SafeAreaView,
    ScrollView,
    View,
    Text,
    TouchableOpacity,
    Alert,
    StyleSheet,
    StatusBar,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';

// ================================================================
// TYPES
// ================================================================

type PaymentMethod = 'UPI' | 'CARD' | 'NET_BANKING';

type PaymentMethodOption = {
    id: PaymentMethod;
    title: string;
    subtitle: string;
    symbol: string;
};

type SectionKey = 'payment' | 'transactions' | 'subscription';

// ================================================================
// CONSTANTS
// ================================================================

const COLORS = {
    primary: '#8B5CF6',
    primaryDark: '#6D4AE8',
    primaryLight: '#F3EEFF',
    background: '#F8F7FC',
    white: '#FFFFFF',
    text: '#28243A',
    secondaryText: '#858196',
    border: '#EAE6F3',
    success: '#16865B',
    successBackground: '#EAF8F1',
    warning: '#B7791F',
    warningBackground: '#FFF7E6',
    mutedBackground: '#F4F2F9',
};

const PAYMENT_METHODS: PaymentMethodOption[] = [
    {
        id: 'UPI',
        title: 'UPI',
        subtitle: 'Pay using a supported UPI app',
        symbol: 'U',
    },
    {
        id: 'CARD',
        title: 'Debit / Credit Card',
        subtitle: 'Use a supported bank card',
        symbol: 'C',
    },
    {
        id: 'NET_BANKING',
        title: 'Net Banking',
        subtitle: 'Pay through your bank',
        symbol: 'B',
    },
];

// ================================================================
// SCREEN
// ================================================================

export default function PaymentSettings() {
    const navigation = useNavigation<any>();

    const [selectedPaymentMethod, setSelectedPaymentMethod] =
        useState<PaymentMethod | null>(null);

    const [savingPreference] = useState(false);

    // All sections are collapsed initially.
    // Only one section can be open at a time.
    const [expandedSection, setExpandedSection] =
        useState<SectionKey | null>(null);

    const toggleSection = useCallback((section: SectionKey) => {
        setExpandedSection(current =>
            current === section ? null : section,
        );
    }, []);

    // ============================================================
    // SAVE PREFERRED PAYMENT METHOD
    // ============================================================

    const handleSavePreference = useCallback(() => {
        if (!selectedPaymentMethod) {
            Alert.alert(
                'Select a payment method',
                'Please select your preferred payment method first.',
            );
            return;
        }

        /*
         * BACKEND INTEGRATION REQUIRED
         *
         * Connect this action to a backend mutation that saves
         * the salon's preferred payment method.
         *
         * Do not mark this preference as saved until the backend
         * confirms the operation.
         */

        Alert.alert(
            'Backend integration required',
            'Your selection is available on this screen, but it has not been saved yet. Connect the salon billing API and payment gateway to save your preference.',
        );
    }, [selectedPaymentMethod]);

    // ============================================================
    // NAVIGATE TO CLAVATA BOOST
    // ============================================================

    const handleManageSubscription = useCallback(() => {
        const parentNavigation = navigation.getParent();

        if (parentNavigation) {
            parentNavigation.navigate('ClavataBoost');
            return;
        }

        navigation.navigate('ClavataBoost');
    }, [navigation]);

    // ============================================================
    // REUSABLE ACCORDION HEADER
    // ============================================================

    const renderSectionHeader = (
        section: SectionKey,
        number: string,
        title: string,
        subtitle: string,
    ) => {
        const isExpanded = expandedSection === section;

        return (
            <TouchableOpacity
                style={styles.accordionHeader}
                onPress={() => toggleSection(section)}
                activeOpacity={0.75}
                accessibilityRole="button"
                accessibilityState={{ expanded: isExpanded }}
                accessibilityLabel={`${title}, ${isExpanded ? 'collapse' : 'expand'}`}
            >
                <View style={styles.sectionIcon}>
                    <Text style={styles.sectionIconText}>
                        {number}
                    </Text>
                </View>

                <View style={styles.sectionHeadingContent}>
                    <Text style={styles.sectionTitle}>
                        {title}
                    </Text>

                    <Text style={styles.sectionSubtitle}>
                        {subtitle}
                    </Text>
                </View>

                <View
                    style={[
                        styles.accordionArrowContainer,
                        isExpanded && styles.accordionArrowContainerOpen,
                    ]}
                >
                    <Text
                        style={[
                            styles.accordionArrow,
                            isExpanded && styles.accordionArrowOpen,
                        ]}
                    >
                        {isExpanded ? '−' : '+'}
                    </Text>
                </View>
            </TouchableOpacity>
        );
    };

    // ============================================================
    // RENDER
    // ============================================================

    return (
        <SafeAreaView style={styles.safeArea}>
            <StatusBar
                barStyle="dark-content"
                backgroundColor={COLORS.background}
            />

            <ScrollView
                style={styles.container}
                contentContainerStyle={styles.scrollContent}
                showsVerticalScrollIndicator={false}
            >
                {/* HEADER */}

                <View style={styles.header}>
                    <TouchableOpacity
                        onPress={() => {
                            if (navigation.canGoBack()) {
                                navigation.goBack();
                            } else {
                                navigation.getParent()?.goBack();
                            }
                        }}
                        style={styles.backButton}
                        activeOpacity={0.7}
                        accessibilityRole="button"
                        accessibilityLabel="Go back"
                    >
                        <Text style={styles.back}>‹</Text>
                    </TouchableOpacity>

                    <View style={styles.headerText}>
                        <Text style={styles.title}>
                            Payment Settings
                        </Text>

                        <Text style={styles.subtitle}>
                            Manage your Clavata billing preferences,
                            subscription payments and transactions.
                        </Text>
                    </View>
                </View>

                {/* ==================================================
                    SECTION 1: PREFERRED PAYMENT METHOD
                ================================================== */}

                <View style={styles.sectionCard}>
                    {renderSectionHeader(
                        'payment',
                        '1',
                        'Preferred Payment Method',
                        'Choose your preferred method for eligible Clavata purchases.',
                    )}

                    {expandedSection === 'payment' && (
                        <View style={styles.accordionBody}>
                            <View style={styles.infoBanner}>
                                <Text style={styles.infoBannerIcon}>
                                    i
                                </Text>

                                <Text style={styles.infoBannerText}>
                                    Your selection is not saved yet.
                                    Payment methods and recurring payments
                                    depend on payment gateway support.
                                </Text>
                            </View>

                            {PAYMENT_METHODS.map(method => {
                                const isSelected =
                                    selectedPaymentMethod === method.id;

                                return (
                                    <TouchableOpacity
                                        key={method.id}
                                        style={[
                                            styles.paymentMethodRow,
                                            isSelected &&
                                                styles.paymentMethodRowSelected,
                                        ]}
                                        onPress={() =>
                                            setSelectedPaymentMethod(method.id)
                                        }
                                        activeOpacity={0.75}
                                        accessibilityRole="radio"
                                        accessibilityState={{
                                            checked: isSelected,
                                        }}
                                    >
                                        <View
                                            style={[
                                                styles.methodIcon,
                                                isSelected &&
                                                    styles.methodIconSelected,
                                            ]}
                                        >
                                            <Text
                                                style={[
                                                    styles.methodIconText,
                                                    isSelected &&
                                                        styles.methodIconTextSelected,
                                                ]}
                                            >
                                                {method.symbol}
                                            </Text>
                                        </View>

                                        <View style={styles.methodDetails}>
                                            <Text style={styles.methodTitle}>
                                                {method.title}
                                            </Text>

                                            <Text style={styles.methodSubtitle}>
                                                {method.subtitle}
                                            </Text>
                                        </View>

                                        <View
                                            style={[
                                                styles.radioOuter,
                                                isSelected &&
                                                    styles.radioOuterSelected,
                                            ]}
                                        >
                                            {isSelected ? (
                                                <View style={styles.radioInner} />
                                            ) : null}
                                        </View>
                                    </TouchableOpacity>
                                );
                            })}

                            <TouchableOpacity
                                style={[
                                    styles.primaryButton,
                                    savingPreference &&
                                        styles.disabledButton,
                                ]}
                                onPress={handleSavePreference}
                                disabled={savingPreference}
                                activeOpacity={0.8}
                            >
                                <Text style={styles.primaryButtonText}>
                                    Save Preferred Method
                                </Text>
                            </TouchableOpacity>

                            <Text style={styles.footnote}>
                                Never share your UPI PIN, banking password
                                or card security code with Clavata.
                            </Text>
                        </View>
                    )}
                </View>

                {/* ==================================================
                    SECTION 2: BILLING & TRANSACTIONS
                ================================================== */}

                <View style={styles.sectionCard}>
                    {renderSectionHeader(
                        'transactions',
                        '2',
                        'Billing & Transactions',
                        'Review payments made to Clavata.',
                    )}

                    {expandedSection === 'transactions' && (
                        <View style={styles.accordionBody}>
                            <View style={styles.transactionSummary}>
                                <View style={styles.transactionSummaryIcon}>
                                    <Text style={styles.transactionSummaryIconText}>
                                        ₹
                                    </Text>
                                </View>

                                <View style={styles.transactionSummaryDetails}>
                                    <Text style={styles.transactionSummaryTitle}>
                                        Your payment history
                                    </Text>

                                    <Text style={styles.transactionSummarySubtitle}>
                                        Subscription and advertising transactions
                                        will appear here.
                                    </Text>
                                </View>
                            </View>

                            <View style={styles.emptyState}>
                                <View style={styles.emptyStateIcon}>
                                    <Text style={styles.emptyStateIconText}>
                                        ↗
                                    </Text>
                                </View>

                                <Text style={styles.emptyStateTitle}>
                                    No transactions to display
                                </Text>

                                <Text style={styles.emptyStateSubtitle}>
                                    Your payment records will appear here
                                    once billing history is connected.
                                </Text>
                            </View>

                            <View style={styles.transactionNote}>
                                <Text style={styles.transactionNoteText}>
                                    Payment history will include available
                                    transaction dates, amounts, payment status
                                    and gateway reference numbers.
                                </Text>
                            </View>
                        </View>
                    )}
                </View>

                {/* ==================================================
                    SECTION 3: SUBSCRIPTION BILLING
                ================================================== */}

                <View style={styles.sectionCard}>
                    {renderSectionHeader(
                        'subscription',
                        '3',
                        'Subscription Billing',
                        'Manage your Clavata membership billing.',
                    )}

                    {expandedSection === 'subscription' && (
                        <View style={styles.accordionBody}>
                            <View style={styles.subscriptionCard}>
                                <View style={styles.subscriptionTopRow}>
                                    <View style={styles.subscriptionIcon}>
                                        <Text style={styles.subscriptionIconText}>
                                            ✦
                                        </Text>
                                    </View>

                                    <View style={styles.subscriptionDetails}>
                                        <Text style={styles.subscriptionTitle}>
                                            Clavata Boost
                                        </Text>

                                        <Text style={styles.subscriptionSubtitle}>
                                            Subscription and membership plans
                                        </Text>
                                    </View>

                                    <View style={styles.freeBadge}>
                                        <Text style={styles.freeBadgeText}>
                                            FREE BY DEFAULT
                                        </Text>
                                    </View>
                                </View>

                                <View style={styles.subscriptionDivider} />

                                <View style={styles.billingInfoRow}>
                                    <Text style={styles.billingInfoLabel}>
                                        Current plan
                                    </Text>

                                    <Text style={styles.billingInfoValue}>
                                        View in Clavata Boost
                                    </Text>
                                </View>

                                <View style={styles.billingInfoRow}>
                                    <Text style={styles.billingInfoLabel}>
                                        Renewal date
                                    </Text>

                                    <Text style={styles.billingInfoValueMuted}>
                                        Not available yet
                                    </Text>
                                </View>

                                <View style={styles.billingInfoRow}>
                                    <Text style={styles.billingInfoLabel}>
                                        Auto-renewal
                                    </Text>

                                    <Text style={styles.billingInfoValueMuted}>
                                        Not configured
                                    </Text>
                                </View>

                                <View style={styles.subscriptionInfoBanner}>
                                    <Text style={styles.subscriptionInfoText}>
                                        Your salon can use the free plan.
                                        Paid plan and renewal information will
                                        be displayed when subscription billing
                                        is connected.
                                    </Text>
                                </View>

                                <TouchableOpacity
                                    style={styles.secondaryButton}
                                    onPress={handleManageSubscription}
                                    activeOpacity={0.8}
                                >
                                    <Text style={styles.secondaryButtonText}>
                                        View Plans & Membership
                                    </Text>

                                    <Text style={styles.buttonArrow}>
                                        ›
                                    </Text>
                                </TouchableOpacity>
                            </View>
                        </View>
                    )}
                </View>

                {/* IMPORTANT PAYMENT INFORMATION */}

                <View style={styles.disclaimerCard}>
                    <Text style={styles.disclaimerTitle}>
                        Important payment information
                    </Text>

                    <Text style={styles.disclaimerText}>
                        • Salon subscriptions and advertising purchases
                        are separate from customer booking payments.
                    </Text>

                    <Text style={styles.disclaimerText}>
                        • Customers pay the ₹9 Clavata booking fee only
                        after the salon confirms their booking.
                    </Text>

                    <Text style={styles.disclaimerText}>
                        • The remaining discounted service amount is
                        paid directly to the salon.
                    </Text>
                </View>

                <View style={styles.bottomSpace} />
            </ScrollView>
        </SafeAreaView>
    );
}

// ================================================================
// STYLES
// ================================================================

const styles = StyleSheet.create({
    safeArea: {
        flex: 1,
        backgroundColor: COLORS.background,
    },

    container: {
        flex: 1,
    },

    scrollContent: {
        paddingHorizontal: 16,
        paddingTop: 16,
    },

    header: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 4,
        paddingTop: 8,
        paddingBottom: 24,
    },

    backButton: {
        width: 42,
        height: 42,
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 8,
    },

    back: {
        fontSize: 38,
        lineHeight: 42,
        color: COLORS.primaryDark,
    },

    headerText: {
        flex: 1,
        justifyContent: 'center',
    },

    title: {
        fontSize: 22,
        fontWeight: '700',
        color: COLORS.text,
    },

    subtitle: {
        marginTop: 4,
        fontSize: 12,
        lineHeight: 18,
        color: COLORS.secondaryText,
    },

    sectionCard: {
        backgroundColor: COLORS.white,
        borderRadius: 20,
        borderWidth: 1,
        borderColor: COLORS.border,
        padding: 16,
        marginBottom: 16,
        elevation: 2,
        shadowColor: '#4B367C',
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.05,
        shadowRadius: 8,
    },

    accordionHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        minHeight: 48,
    },

    accordionArrowContainer: {
        width: 30,
        height: 30,
        borderRadius: 10,
        backgroundColor: COLORS.mutedBackground,
        alignItems: 'center',
        justifyContent: 'center',
        marginLeft: 8,
    },

    accordionArrowContainerOpen: {
        backgroundColor: COLORS.primaryLight,
    },

    accordionArrow: {
        fontSize: 23,
        lineHeight: 27,
        fontWeight: '500',
        color: COLORS.secondaryText,
    },

    accordionArrowOpen: {
        color: COLORS.primary,
    },

    accordionBody: {
        marginTop: 16,
    },

    sectionIcon: {
        width: 34,
        height: 34,
        borderRadius: 12,
        backgroundColor: COLORS.primaryLight,
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 11,
    },

    sectionIconText: {
        fontSize: 15,
        fontWeight: '800',
        color: COLORS.primary,
    },

    sectionHeadingContent: {
        flex: 1,
        paddingTop: 1,
    },

    sectionTitle: {
        fontSize: 15,
        fontWeight: '800',
        color: COLORS.text,
    },

    sectionSubtitle: {
        fontSize: 11,
        lineHeight: 16,
        color: COLORS.secondaryText,
        marginTop: 4,
    },

    infoBanner: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        backgroundColor: COLORS.warningBackground,
        borderRadius: 12,
        padding: 11,
        marginBottom: 14,
    },

    infoBannerIcon: {
        width: 18,
        height: 18,
        borderRadius: 9,
        overflow: 'hidden',
        textAlign: 'center',
        textAlignVertical: 'center',
        fontSize: 12,
        fontWeight: '800',
        color: COLORS.warning,
        borderWidth: 1,
        borderColor: COLORS.warning,
        marginRight: 8,
        marginTop: 1,
    },

    infoBannerText: {
        flex: 1,
        fontSize: 11,
        lineHeight: 17,
        color: '#805C24',
    },

    paymentMethodRow: {
        flexDirection: 'row',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: COLORS.border,
        borderRadius: 14,
        padding: 12,
        marginBottom: 10,
        backgroundColor: COLORS.white,
    },

    paymentMethodRowSelected: {
        borderColor: COLORS.primary,
        backgroundColor: '#FAF8FF',
    },

    methodIcon: {
        width: 42,
        height: 42,
        borderRadius: 13,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: COLORS.mutedBackground,
        marginRight: 12,
    },

    methodIconSelected: {
        backgroundColor: COLORS.primaryLight,
    },

    methodIconText: {
        fontSize: 17,
        fontWeight: '800',
        color: COLORS.secondaryText,
    },

    methodIconTextSelected: {
        color: COLORS.primary,
    },

    methodDetails: {
        flex: 1,
        paddingRight: 8,
    },

    methodTitle: {
        fontSize: 13,
        fontWeight: '700',
        color: COLORS.text,
    },

    methodSubtitle: {
        fontSize: 11,
        lineHeight: 16,
        color: COLORS.secondaryText,
        marginTop: 3,
    },

    radioOuter: {
        width: 21,
        height: 21,
        borderRadius: 11,
        borderWidth: 1.5,
        borderColor: '#C9C4D7',
        alignItems: 'center',
        justifyContent: 'center',
    },

    radioOuterSelected: {
        borderColor: COLORS.primary,
    },

    radioInner: {
        width: 11,
        height: 11,
        borderRadius: 6,
        backgroundColor: COLORS.primary,
    },

    primaryButton: {
        minHeight: 48,
        backgroundColor: COLORS.primary,
        borderRadius: 14,
        alignItems: 'center',
        justifyContent: 'center',
        paddingHorizontal: 16,
        marginTop: 7,
    },

    primaryButtonText: {
        fontSize: 14,
        fontWeight: '800',
        color: COLORS.white,
    },

    disabledButton: {
        opacity: 0.6,
    },

    footnote: {
        fontSize: 10,
        lineHeight: 16,
        color: COLORS.secondaryText,
        marginTop: 12,
        textAlign: 'center',
    },

    transactionSummary: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 13,
        borderRadius: 14,
        backgroundColor: '#FAF8FF',
        borderWidth: 1,
        borderColor: '#EEE7FF',
    },

    transactionSummaryIcon: {
        width: 43,
        height: 43,
        borderRadius: 13,
        backgroundColor: COLORS.primaryLight,
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 11,
    },

    transactionSummaryIconText: {
        fontSize: 22,
        fontWeight: '800',
        color: COLORS.primary,
    },

    transactionSummaryDetails: {
        flex: 1,
    },

    transactionSummaryTitle: {
        fontSize: 13,
        fontWeight: '700',
        color: COLORS.text,
    },

    transactionSummarySubtitle: {
        fontSize: 11,
        lineHeight: 16,
        color: COLORS.secondaryText,
        marginTop: 4,
    },

    emptyState: {
        alignItems: 'center',
        paddingHorizontal: 12,
        paddingVertical: 26,
    },

    emptyStateIcon: {
        width: 52,
        height: 52,
        borderRadius: 18,
        backgroundColor: COLORS.mutedBackground,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 12,
    },

    emptyStateIconText: {
        fontSize: 27,
        fontWeight: '700',
        color: COLORS.primary,
    },

    emptyStateTitle: {
        fontSize: 14,
        fontWeight: '800',
        color: COLORS.text,
        textAlign: 'center',
    },

    emptyStateSubtitle: {
        fontSize: 12,
        lineHeight: 18,
        color: COLORS.secondaryText,
        textAlign: 'center',
        marginTop: 6,
        maxWidth: 270,
    },

    transactionNote: {
        backgroundColor: COLORS.mutedBackground,
        borderRadius: 11,
        padding: 11,
    },

    transactionNoteText: {
        fontSize: 11,
        lineHeight: 17,
        color: COLORS.secondaryText,
    },

    subscriptionCard: {
        borderRadius: 16,
        borderWidth: 1,
        borderColor: '#E8DFFF',
        backgroundColor: '#FCFAFF',
        padding: 13,
    },

    subscriptionTopRow: {
        flexDirection: 'row',
        alignItems: 'center',
    },

    subscriptionIcon: {
        width: 42,
        height: 42,
        borderRadius: 14,
        backgroundColor: COLORS.primaryLight,
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 10,
    },

    subscriptionIconText: {
        fontSize: 24,
        color: COLORS.primary,
        fontWeight: '800',
    },

    subscriptionDetails: {
        flex: 1,
        paddingRight: 5,
    },

    subscriptionTitle: {
        fontSize: 14,
        fontWeight: '800',
        color: COLORS.text,
    },

    subscriptionSubtitle: {
        fontSize: 10,
        lineHeight: 15,
        color: COLORS.secondaryText,
        marginTop: 3,
    },

    freeBadge: {
        backgroundColor: COLORS.successBackground,
        borderRadius: 7,
        paddingHorizontal: 7,
        paddingVertical: 5,
        alignSelf: 'flex-start',
    },

    freeBadgeText: {
        fontSize: 8,
        fontWeight: '800',
        color: COLORS.success,
    },

    subscriptionDivider: {
        height: 1,
        backgroundColor: COLORS.border,
        marginVertical: 15,
    },

    billingInfoRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 8,
        gap: 10,
    },

    billingInfoLabel: {
        fontSize: 12,
        color: COLORS.secondaryText,
        flex: 1,
    },

    billingInfoValue: {
        fontSize: 11,
        fontWeight: '700',
        color: COLORS.text,
        textAlign: 'right',
        flex: 1,
    },

    billingInfoValueMuted: {
        fontSize: 11,
        fontWeight: '600',
        color: COLORS.secondaryText,
        textAlign: 'right',
        flex: 1,
    },

    subscriptionInfoBanner: {
        backgroundColor: COLORS.primaryLight,
        borderRadius: 11,
        padding: 11,
        marginTop: 10,
        marginBottom: 13,
    },

    subscriptionInfoText: {
        fontSize: 11,
        lineHeight: 17,
        color: '#5E469C',
    },

    secondaryButton: {
        minHeight: 46,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: COLORS.white,
        borderWidth: 1,
        borderColor: COLORS.primary,
        borderRadius: 13,
        paddingHorizontal: 12,
    },

    secondaryButtonText: {
        fontSize: 13,
        fontWeight: '800',
        color: COLORS.primary,
    },

    buttonArrow: {
        fontSize: 24,
        lineHeight: 26,
        color: COLORS.primary,
        marginLeft: 8,
    },

    disclaimerCard: {
        backgroundColor: COLORS.white,
        borderWidth: 1,
        borderColor: COLORS.border,
        borderRadius: 16,
        padding: 15,
        marginBottom: 10,
    },

    disclaimerTitle: {
        fontSize: 13,
        fontWeight: '800',
        color: COLORS.text,
        marginBottom: 10,
    },

    disclaimerText: {
        fontSize: 11,
        lineHeight: 18,
        color: COLORS.secondaryText,
        marginBottom: 7,
    },

    bottomSpace: {
        height: 24,
    },
});
