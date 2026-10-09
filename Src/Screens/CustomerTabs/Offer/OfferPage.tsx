import React, { useMemo, useState, useCallback } from 'react';
import {
    SafeAreaView,
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    TextInput,
    StatusBar,
    ActivityIndicator,
    RefreshControl,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useQuery } from '@apollo/client';
import {
    COLORS,
    FONT_SIZES,
    SPACING,
    RADIUS,
    GRADIENTS,
} from '../../../constants/constants';
import AppGradient from '../../../common/AppGradient';
import { ACTIVE_OFFERS } from '../../../graphql/queries';

type BackendOffer = {
    offerId: string;
    salonId: string;
    salonName: string;
    title: string;
    description: string;
    discountType: 'PERCENTAGE' | 'FIXED';
    discountValue: number;
    couponCode?: string | null;
    minimumBookingAmount?: number | null;
    category?: string | null;
    serviceIds: string[];
    startDate: string;
    endDate: string;
    usageLimit?: number | null;
    usageCount: number;
    customerLimit?: number | null;
    status: 'DRAFT' | 'PENDING_APPROVAL' | 'ACTIVE' | 'PAUSED' | 'EXPIRED' | 'REJECTED';
    rejectionReason?: string | null;
    approvedBy?: string | null;
    approvedAt?: string | null;
    rejectedBy?: string | null;
    rejectedAt?: string | null;
    createdAt: string;
    updatedAt: string;
};

type ActiveOffersResponse = {
    activeOffers: {
        success: boolean;
        message: string;
        totalCount: number;
        offers: BackendOffer[];
    };
};

type Offer = {
    id: string;
    salonId: string;
    salonName: string;
    discount: string;
    title: string;
    description: string;
    code?: string;
    minimum?: string;
    category: string;
    expires?: string;
    featured?: boolean;
    startDate: string;
    endDate: string;
    discountType: 'PERCENTAGE' | 'FIXED';
    discountValue: number;
    usageCount: number;
    usageLimit?: number | null;
    customerLimit?: number | null;
    serviceIds: string[];
    minimumBookingAmount?: number | null;
};

const formatDiscount = (discountType: 'PERCENTAGE' | 'FIXED', discountValue: number): string =>
    discountType === 'PERCENTAGE'
        ? `${discountValue}% OFF`
        : `₹${Number(discountValue).toLocaleString('en-IN')} OFF`;

const formatExpiryDate = (dateString: string): string => {
    if (!dateString) return '';
    const date = new Date(dateString);
    if (Number.isNaN(date.getTime())) return '';
    return date.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });
};

const getExpiryText = (endDate: string): string => {
    if (!endDate) return '';
    const end = new Date(endDate);
    if (Number.isNaN(end.getTime())) return '';
    const days = Math.ceil((end.getTime() - Date.now()) / (1000 * 60 * 60 * 24));
    if (days < 0) return 'Expired';
    if (days === 0) return 'Ends today';
    if (days === 1) return 'Ends tomorrow';
    if (days <= 7) return `Ends in ${days} days`;
    return `Ends ${formatExpiryDate(endDate)}`;
};

const formatMinimumBooking = (amount?: number | null): string | undefined => {
    if (amount == null || amount <= 0) return undefined;
    return `Min. booking ₹${Number(amount).toLocaleString('en-IN')}`;
};

const mapBackendOffer = (offer: BackendOffer): Offer => ({
    id: offer.offerId,
    salonId: offer.salonId,
    salonName: offer.salonName || 'Salon',
    discount: formatDiscount(offer.discountType, offer.discountValue),
    title: offer.title,
    description: offer.description,
    code: offer.couponCode || undefined,
    minimum: formatMinimumBooking(offer.minimumBookingAmount),
    category: offer.category || 'Other',
    expires: getExpiryText(offer.endDate),
    featured: offer.usageCount > 0,
    startDate: offer.startDate,
    endDate: offer.endDate,
    discountType: offer.discountType,
    discountValue: offer.discountValue,
    usageCount: offer.usageCount,
    usageLimit: offer.usageLimit,
    customerLimit: offer.customerLimit,
    serviceIds: offer.serviceIds || [],
    minimumBookingAmount: offer.minimumBookingAmount,
});

export default function OffersScreen() {
    const navigation = useNavigation<any>();
    const [search, setSearch] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('All');
    const [refreshing, setRefreshing] = useState(false);

    const { data, loading, error, refetch } = useQuery<ActiveOffersResponse>(ACTIVE_OFFERS, {
        variables: { category: undefined },
        fetchPolicy: 'cache-and-network',
        notifyOnNetworkStatusChange: true,
    });

    const backendOffers = data?.activeOffers?.offers || [];
    const offers = useMemo(
        () => backendOffers.filter(offer => offer.status === 'ACTIVE').map(mapBackendOffer),
        [backendOffers],
    );
    const categories = useMemo(() => {
        const unique = Array.from(new Set(
            offers.map(offer => offer.category).filter(category => category && category.trim().length > 0),
        ));
        return ['All', ...unique];
    }, [offers]);

    const filteredOffers = useMemo(() => {
        const query = search.trim().toLowerCase();
        return offers.filter(offer => {
            const matchesCategory = selectedCategory === 'All' || offer.category === selectedCategory;
            const matchesSearch = !query ||
                offer.salonName.toLowerCase().includes(query) ||
                offer.title.toLowerCase().includes(query) ||
                offer.description.toLowerCase().includes(query) ||
                offer.category.toLowerCase().includes(query) ||
                offer.discount.toLowerCase().includes(query) ||
                Boolean(offer.code?.toLowerCase().includes(query));
            return matchesCategory && matchesSearch;
        });
    }, [offers, search, selectedCategory]);

    const featuredOffers = filteredOffers.filter(offer => offer.featured);
    const otherOffers = filteredOffers.filter(offer => !offer.featured);

    const handleOfferPress = useCallback((offer: Offer) => {
        if (!offer.salonId) {
            console.warn('Offer does not contain salonId:', offer);
            return;
        }
        navigation.navigate('SalonDetails', { salonId: offer.salonId, offer });
    }, [navigation]);

    const handleRefresh = useCallback(async () => {
        try {
            setRefreshing(true);
            await refetch();
        } finally {
            setRefreshing(false);
        }
    }, [refetch]);

    const clearFilters = () => {
        setSearch('');
        setSelectedCategory('All');
    };

    if (loading && !data) {
        return (
            <SafeAreaView style={styles.safeArea}>
                <StatusBar barStyle="dark-content" backgroundColor={COLORS.background} />
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color={COLORS.primary} />
                    <Text style={styles.loadingText}>Finding the best offers for you...</Text>
                </View>
            </SafeAreaView>
        );
    }

    if (error && !data) {
        return (
            <SafeAreaView style={styles.safeArea}>
                <StatusBar barStyle="dark-content" backgroundColor={COLORS.background} />
                <View style={styles.errorContainer}>
                    {/* <AppGradient colors={[...GRADIENTS.SOFT_PURPLE]} style={styles.emptyIcon}>
                        <Text style={styles.emptyIconText}>%</Text>
                    </AppGradient> */}
                    <Text style={styles.emptyTitle}>Unable to load offers</Text>
                    <Text style={styles.emptyText}>We couldn't load the latest offers. Please try again.</Text>
                    <TouchableOpacity activeOpacity={0.8} onPress={() => refetch()} style={styles.resetButton}>
                        <AppGradient colors={[...GRADIENTS.SOFT_PURPLE]} style={styles.resetButtonGradient}>
                            <Text style={styles.resetButtonText}>Try again</Text>
                        </AppGradient>
                    </TouchableOpacity>
                </View>
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView style={styles.safeArea}>
            <StatusBar barStyle="dark-content" backgroundColor={COLORS.background} />
            <ScrollView
                showsVerticalScrollIndicator={false}
                contentContainerStyle={styles.scrollContent}
                keyboardShouldPersistTaps="handled"
                refreshControl={<RefreshControl refreshing={refreshing} onRefresh={handleRefresh} tintColor={COLORS.primary} />}
            >
                <View style={styles.header}>
                    <View style={styles.headerTextContainer}>
                        <Text style={styles.headerTitle}>Offers</Text>
                        <Text style={styles.headerSubtitle}>Exclusive deals near you</Text>
                    </View>
                    {/* <AppGradient colors={[...GRADIENTS.SOFT_PURPLE]} style={styles.offerIcon}>
                        <Text style={styles.offerIconText}>%</Text>
                    </AppGradient> */}
                </View>

                <View style={styles.searchContainer}>
                    <Text style={styles.searchIcon}>⌕</Text>
                    <TextInput
                        value={search}
                        onChangeText={setSearch}
                        placeholder="Search offers or salons"
                        placeholderTextColor={COLORS.textMuted}
                        style={styles.searchInput}
                        autoCorrect={false}
                        autoCapitalize="none"
                        returnKeyType="search"
                    />
                    {search.length > 0 && (
                        <TouchableOpacity onPress={() => setSearch('')} activeOpacity={0.7} style={styles.clearButton}>
                            <Text style={styles.clearText}>×</Text>
                        </TouchableOpacity>
                    )}
                </View>

                {categories.length > 1 && (
                    <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.categories}>
                        {categories.map(category => {
                            const selected = selectedCategory === category;
                            return (
                                <TouchableOpacity
                                    key={category}
                                    activeOpacity={0.8}
                                    onPress={() => setSelectedCategory(category)}
                                    style={[styles.categoryChip, selected && styles.categoryChipSelected]}
                                >
                                    {selected ? (
                                        <AppGradient colors={[...GRADIENTS.SOFT_PURPLE]} style={styles.categoryChipGradient}>
                                            <Text style={styles.categoryTextSelected}>{category}</Text>
                                        </AppGradient>
                                    ) : (
                                        <Text style={styles.categoryText}>{category}</Text>
                                    )}
                                </TouchableOpacity>
                            );
                        })}
                    </ScrollView>
                )}

                {featuredOffers.length > 0 && (
                    <>
                        <SectionHeader title="Popular near you" action="View all" onPress={clearFilters} />
                        {featuredOffers.map(offer => (
                            <OfferCard key={offer.id} offer={offer} onPress={() => handleOfferPress(offer)} />
                        ))}
                    </>
                )}

                {otherOffers.length > 0 && (
                    <>
                        <SectionHeader title="For you" action="" onPress={() => {}} />
                        {otherOffers.map(offer => (
                            <OfferCard key={offer.id} offer={offer} onPress={() => handleOfferPress(offer)} />
                        ))}
                    </>
                )}

                {filteredOffers.length === 0 && (
                    <View style={styles.emptyContainer}>
                        {/* <AppGradient colors={[...GRADIENTS.SOFT_PURPLE]} style={styles.emptyIcon}>
                            <Text style={styles.emptyIconText}>%</Text>
                        </AppGradient> */}
                        <Text style={styles.emptyTitle}>No offers found</Text>
                        <Text style={styles.emptyText}>
                            {offers.length === 0
                                ? 'There are no active offers available right now.'
                                : 'Try another category or search for a different offer.'}
                        </Text>
                        {(search.length > 0 || selectedCategory !== 'All') && (
                            <TouchableOpacity activeOpacity={0.8} onPress={clearFilters} style={styles.resetButton}>
                                <AppGradient colors={[...GRADIENTS.SOFT_PURPLE]} style={styles.resetButtonGradient}>
                                    <Text style={styles.resetButtonText}>Clear filters</Text>
                                </AppGradient>
                            </TouchableOpacity>
                        )}
                    </View>
                )}

                {offers.length > 0 && (
                    <Text style={styles.footer}>New offers are added regularly. Check back soon for more savings.</Text>
                )}
            </ScrollView>
        </SafeAreaView>
    );
}

type SectionHeaderProps = { title: string; action: string; onPress: () => void };

const SectionHeader = ({ title, action, onPress }: SectionHeaderProps) => (
    <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>{title}</Text>
        {action ? (
            <TouchableOpacity activeOpacity={0.7} onPress={onPress}>
                <Text style={styles.sectionAction}>{action}</Text>
            </TouchableOpacity>
        ) : null}
    </View>
);

type OfferCardProps = { offer: Offer; onPress: () => void };

const OfferCard = ({ offer, onPress }: OfferCardProps) => (
    <TouchableOpacity activeOpacity={0.92} onPress={onPress} style={styles.offerCard}>
        <AppGradient colors={[...GRADIENTS.SOFT_PURPLE]} style={styles.offerBadgeContainer}>
            <Text style={styles.offerBadgeText}>{offer.discount}</Text>
            <Text style={styles.offerBadgeSmall}>OFFER</Text>
        </AppGradient>
        <View style={styles.offerContent}>
            <View style={styles.salonRow}>
                <Text style={styles.salonIcon}>✦</Text>
                <Text style={styles.salonName} numberOfLines={1}>{offer.salonName || 'Salon'}</Text>
            </View>
            <View style={styles.offerTopRow}>
                <Text style={styles.offerTitle} numberOfLines={1}>{offer.title}</Text>
                <View style={styles.categoryBadge}>
                    <Text style={styles.categoryBadgeText}>{offer.category}</Text>
                </View>
            </View>
            <Text style={styles.offerDescription} numberOfLines={2}>{offer.description}</Text>
            {offer.code ? (
                <View style={styles.codeRow}>
                    <Text style={styles.codeLabel}>Use code</Text>
                    <View style={styles.codeBadge}><Text style={styles.codeText}>{offer.code}</Text></View>
                </View>
            ) : null}
            <View style={styles.offerBottom}>
                {offer.minimum ? <Text style={styles.minimum} numberOfLines={1}>{offer.minimum}</Text> : <View style={styles.minimumPlaceholder} />}
                {offer.expires ? <Text style={styles.expires} numberOfLines={1}>{offer.expires}</Text> : null}
            </View>
        </View>
        <View style={styles.arrowContainer}><Text style={styles.arrow}>›</Text></View>
    </TouchableOpacity>
);

const styles = StyleSheet.create({
    safeArea: { flex: 1, backgroundColor: COLORS.background },
    scrollContent: { paddingHorizontal: SPACING.xl, paddingTop: SPACING.large, paddingBottom: SPACING.huge },
    loadingContainer: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: SPACING.xl },
    loadingText: { marginTop: SPACING.medium, fontSize: FONT_SIZES.small, color: COLORS.textSecondary, textAlign: 'center' },
    errorContainer: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: SPACING.xl },
    header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: SPACING.xl },
    headerTextContainer: { flex: 1, minWidth: 0 },
    headerTitle: { marginTop: SPACING.small, fontSize: FONT_SIZES.title, fontWeight: '600', color: COLORS.text, letterSpacing: -0.5 },
    headerSubtitle: { marginTop: SPACING.xs, fontSize: FONT_SIZES.small, color: COLORS.textSecondary },
    offerIcon: { width: 46, height: 46, borderRadius: 23, overflow: 'hidden', alignItems: 'center', justifyContent: 'center', marginLeft: SPACING.medium },
    offerIconText: { fontSize: 21, fontWeight: '800', color: COLORS.white },
    searchContainer: { height: 50, backgroundColor: COLORS.surface, borderRadius: RADIUS.medium, borderWidth: 1, borderColor: COLORS.border, flexDirection: 'row', alignItems: 'center', paddingHorizontal: SPACING.medium, marginBottom: SPACING.medium },
    searchIcon: { fontSize: 23, color: COLORS.textMuted, marginRight: SPACING.small },
    searchInput: { flex: 1, height: '100%', fontSize: FONT_SIZES.small, color: COLORS.text, paddingVertical: 0 },
    clearButton: { width: 28, height: 28, alignItems: 'center', justifyContent: 'center' },
    clearText: { fontSize: 23, lineHeight: 25, color: COLORS.textMuted, fontWeight: '400' },
    categories: { paddingBottom: SPACING.small, gap: SPACING.small },
    categoryChip: { paddingHorizontal: 16, height: 36, borderRadius: RADIUS.round, backgroundColor: COLORS.surface, borderWidth: 1, borderColor: COLORS.border, alignItems: 'center', justifyContent: 'center', overflow: 'hidden' },
    categoryChipSelected: { paddingHorizontal: 0, paddingVertical: 0, backgroundColor: 'transparent', borderColor: 'transparent' },
    categoryChipGradient: { flex: 1, minHeight: 36, paddingHorizontal: 16, borderRadius: RADIUS.round, alignItems: 'center', justifyContent: 'center' },
    categoryText: { fontSize: FONT_SIZES.xs, fontWeight: '600', color: COLORS.textSecondary },
    categoryTextSelected: { fontSize: FONT_SIZES.xs, fontWeight: '600', color: COLORS.white },
    sectionHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: SPACING.xl, marginBottom: SPACING.medium },
    sectionTitle: { fontSize: FONT_SIZES.title, fontWeight: '700', color: COLORS.text },
    sectionAction: { fontSize: FONT_SIZES.xs, fontWeight: '600', color: COLORS.primary },
    offerCard: { backgroundColor: COLORS.surface, borderRadius: RADIUS.large, padding: SPACING.medium, marginBottom: SPACING.medium, flexDirection: 'row', alignItems: 'center', borderWidth: 1, borderColor: COLORS.border, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.04, shadowRadius: 7, elevation: 2 },
    offerBadgeContainer: { width: 72, height: 72, borderRadius: RADIUS.medium, overflow: 'hidden', alignItems: 'center', justifyContent: 'center', marginRight: SPACING.medium },
    offerBadgeText: { fontSize: 15, fontWeight: '900', color: COLORS.white, textAlign: 'center' },
    offerBadgeSmall: { fontSize: 8, fontWeight: '800', letterSpacing: 1, color: COLORS.white, marginTop: 3 },
    offerContent: { flex: 1, minWidth: 0 },
    salonRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 5, minWidth: 0 },
    salonIcon: { fontSize: 10, color: COLORS.primary, marginRight: 5 },
    salonName: { flex: 1, fontSize: 16, fontWeight: '700', color: COLORS.primary, letterSpacing: 0.1 },
    offerTopRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: SPACING.small },
    offerTitle: { flex: 1, fontSize: FONT_SIZES.small, fontWeight: '700', color: COLORS.text },
    categoryBadge: { paddingHorizontal: 7, paddingVertical: 3, borderRadius: RADIUS.small, backgroundColor: COLORS.badgeColor },
    categoryBadgeText: { fontSize: 9, fontWeight: '700', color: COLORS.white },
    offerDescription: { fontSize: FONT_SIZES.xs, lineHeight: 17, color: COLORS.textSecondary, marginTop: SPACING.xs, marginBottom: 7 },
    codeRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 7 },
    codeLabel: { fontSize: 10, color: COLORS.textMuted, marginRight: 6 },
    codeBadge: { paddingHorizontal: 7, paddingVertical: 3, borderRadius: 5, borderWidth: 1, borderStyle: 'dashed', borderColor: COLORS.borderStrong, backgroundColor: COLORS.background },
    codeText: { fontSize: 10, fontWeight: '800', color: COLORS.primary, letterSpacing: 0.4 },
    offerBottom: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: SPACING.small },
    minimum: { flex: 1, fontSize: 10, color: COLORS.textMuted },
    minimumPlaceholder: { flex: 1 },
    expires: { fontSize: 10, color: COLORS.textSecondary, fontWeight: '600', maxWidth: '45%' },
    arrowContainer: { width: 25, alignItems: 'flex-end', justifyContent: 'center', marginLeft: SPACING.xs },
    arrow: { fontSize: 25, fontWeight: '300', color: COLORS.textMuted },
    emptyContainer: { alignItems: 'center', justifyContent: 'center', paddingVertical: 60 },
    emptyIcon: { width: 60, height: 60, borderRadius: 30, overflow: 'hidden', alignItems: 'center', justifyContent: 'center', marginBottom: SPACING.medium },
    emptyIconText: { fontSize: 25, fontWeight: '800', color: COLORS.white },
    emptyTitle: { fontSize: FONT_SIZES.medium, fontWeight: '700', color: COLORS.text },
    emptyText: { marginTop: SPACING.xs, fontSize: FONT_SIZES.xs, color: COLORS.textSecondary, textAlign: 'center', maxWidth: 280 },
    resetButton: { marginTop: SPACING.large, padding: 0, borderRadius: RADIUS.round, overflow: 'hidden' },
    resetButtonGradient: { paddingHorizontal: SPACING.xl, paddingVertical: SPACING.small, borderRadius: RADIUS.round, alignItems: 'center', justifyContent: 'center' },
    resetButtonText: { color: COLORS.white, fontSize: FONT_SIZES.xs, fontWeight: '700' },
    footer: { marginTop: SPACING.xl, textAlign: 'center', fontSize: FONT_SIZES.xs, lineHeight: 18, color: COLORS.textMuted, paddingHorizontal: SPACING.xl },
});
