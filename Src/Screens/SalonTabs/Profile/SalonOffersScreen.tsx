
import React, {
    useCallback,
    useMemo,
    useState,
} from 'react';
import {
    SafeAreaView,
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    FlatList,
    StatusBar,
    RefreshControl,
    ActivityIndicator,
    Alert,
} from 'react-native';
import {
    useFocusEffect,
    useNavigation,
} from '@react-navigation/native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import {
    useMutation,
    useQuery,
} from '@apollo/client';
import LinearGradient from 'react-native-linear-gradient';
import {
    SALON_OFFERS,
    DELETE_OFFER,
} from '../../../graphql/queries';
import { useUser } from '../../../context/UserContext';

const PRIMARY = '#8B5CF6';
const PRIMARY_DARK = '#6D28D9';
const PURPLE_LIGHT = '#F5F3FF';
const PURPLE_PALE = '#EDE9FE';
const PURPLE_BORDER = '#DDD6FE';

const SOFT_PURPLE_GRADIENT = [
    '#C4B5FD',
    '#A78BFA',
    '#8B5CF6',
];

type OfferStatus =
    | 'DRAFT'
    | 'PENDING_APPROVAL'
    | 'ACTIVE'
    | 'PAUSED'
    | 'EXPIRED'
    | 'REJECTED';

type SalonOffer = {
    offerId: string;
    salonId: string;
    salonName?: string;
    title: string;
    description: string;
    discountType: 'PERCENTAGE' | 'FIXED';
    discountValue: number;
    category?: string | null;
    startDate: string;
    endDate: string;
    couponCode?: string | null;
    minimumBookingAmount?: number | null;
    serviceIds?: string[];
    usageCount: number;
    usageLimit?: number | null;
    customerLimit?: number | null;
    status: OfferStatus;
    rejectionReason?: string | null;
    approvedBy?: string | null;
    approvedAt?: string | null;
    rejectedBy?: string | null;
    rejectedAt?: string | null;
    createdAt: string;
    updatedAt?: string;
};

type FilterType = 'ALL' | OfferStatus;

export default function SalonOffersScreen() {
    const navigation = useNavigation<any>();

    const { currentUser } = useUser();

    const salonId = currentUser?.salonId || null;

    const [isRefreshing, setIsRefreshing] = useState(false);

    const [selectedFilter, setSelectedFilter] =
        useState<FilterType>('ALL');

    const {
        data,
        loading,
        error,
        refetch,
    } = useQuery(SALON_OFFERS, {
        variables: {
            salonId,
            status: null,
        },
        skip: !salonId,
        fetchPolicy: 'network-only',
    });

    const [
        deleteOffer,
        { loading: deleteLoading },
    ] = useMutation(DELETE_OFFER);

    const offers: SalonOffer[] =
        data?.salonOffers?.offers || [];

    const filteredOffers = useMemo(() => {
        if (selectedFilter === 'ALL') {
            return offers;
        }

        return offers.filter(
            offer => offer.status === selectedFilter,
        );
    }, [offers, selectedFilter]);

    const loadOffers = useCallback(async () => {
        if (!salonId) {
            return;
        }

        try {
            setIsRefreshing(true);

            await refetch({
                salonId,
                status: null,
            });
        } catch (refreshError) {
            console.error(
                'Refresh offers error:',
                refreshError,
            );
        } finally {
            setIsRefreshing(false);
        }
    }, [refetch, salonId]);

    useFocusEffect(
        useCallback(() => {
            if (salonId) {
                loadOffers();
            }
        }, [salonId, loadOffers]),
    );

    const handleCreateOffer = () => {
        if (!salonId) {
            Alert.alert(
                'Salon information missing',
                'We could not find your salon information. Please log in again.',
            );
            return;
        }

        navigation.navigate('CreateOffer');
    };

    const handleOfferPress = (offer: SalonOffer) => {
        if (!salonId) {
            Alert.alert(
                'Salon information missing',
                'Please log in again before managing offers.',
            );
            return;
        }

        navigation.navigate('CreateOffer', {
            offerId: offer.offerId,
            offer,
            mode: 'EDIT',
        });
    };

    const handleDeleteOffer = (offer: SalonOffer) => {
        if (deleteLoading) {
            return;
        }

        if (!salonId) {
            Alert.alert(
                'Salon information missing',
                'Please log in again before deleting an offer.',
            );
            return;
        }

        if (offer.salonId !== salonId) {
            Alert.alert(
                'Unable to delete',
                'This offer does not belong to your salon.',
            );
            return;
        }

        if (offer.status === 'ACTIVE') {
            Alert.alert(
                'Active offer',
                'Active offers cannot be deleted. Pause the offer first, then delete it.',
            );
            return;
        }

        Alert.alert(
            'Delete Offer',
            `Are you sure you want to delete "${offer.title}"? This action cannot be undone.`,
            [
                {
                    text: 'Cancel',
                    style: 'cancel',
                },
                {
                    text: 'Delete',
                    style: 'destructive',
                    onPress: async () => {
                        try {
                            const { data: mutationData } =
                                await deleteOffer({
                                    variables: {
                                        input: {
                                            offerId: offer.offerId,
                                            salonId,
                                        },
                                    },
                                });

                            const response =
                                mutationData?.deleteOffer;

                            if (!response) {
                                throw new Error(
                                    'No response received from deleteOffer.',
                                );
                            }

                            if (!response.success) {
                                Alert.alert(
                                    'Unable to delete',
                                    response.message ||
                                        'The offer could not be deleted.',
                                );
                                return;
                            }

                            Alert.alert(
                                'Offer deleted',
                                response.message ||
                                    'The offer has been deleted.',
                            );

                            await refetch({
                                salonId,
                                status: null,
                            });
                        } catch (deleteError: any) {
                            console.error(
                                'Delete offer error:',
                                deleteError,
                            );

                            const message =
                                deleteError?.graphQLErrors?.[0]
                                    ?.message ||
                                deleteError?.networkError
                                    ?.message ||
                                deleteError?.message ||
                                'Something went wrong. Please try again.';

                            Alert.alert(
                                'Unable to delete offer',
                                message,
                            );
                        }
                    },
                },
            ],
        );
    };

    const getDiscountText = (offer: SalonOffer) => {
        if (offer.discountType === 'PERCENTAGE') {
            return `${offer.discountValue}% OFF`;
        }

        return `₹${offer.discountValue} OFF`;
    };

    /**
     * Empty serviceIds means Any Services.
     * One or more service IDs means Particular Services.
     */
    const getOfferServiceText = (offer: SalonOffer) => {
        const serviceIds = Array.isArray(offer.serviceIds)
            ? offer.serviceIds
            : [];

        if (serviceIds.length === 0) {
            return 'Any Services';
        }

        if (serviceIds.length === 1) {
            return '1 Particular Service';
        }

        return `${serviceIds.length} Particular Services`;
    };

    const isAnyServicesOffer = (offer: SalonOffer) => {
        return (
            !Array.isArray(offer.serviceIds) ||
            offer.serviceIds.length === 0
        );
    };

    const getOfferServiceDescription = (
        offer: SalonOffer,
    ) => {
        if (isAnyServicesOffer(offer)) {
            return 'Book any number of services. Discount applies to the full booking subtotal.';
        }

        return 'Discount applies only to selected services. Other services stay at full price.';
    };

    const getStatusLabel = (status: OfferStatus) => {
        switch (status) {
            case 'DRAFT':
                return 'Draft';
            case 'PENDING_APPROVAL':
                return 'Pending Approval';
            case 'ACTIVE':
                return 'Active';
            case 'PAUSED':
                return 'Paused';
            case 'EXPIRED':
                return 'Expired';
            case 'REJECTED':
                return 'Rejected';
            default:
                return status;
        }
    };

    const getStatusIcon = (status: OfferStatus) => {
        switch (status) {
            case 'ACTIVE':
                return 'checkmark-circle';
            case 'PENDING_APPROVAL':
                return 'time';
            case 'PAUSED':
                return 'pause-circle';
            case 'EXPIRED':
                return 'close-circle';
            case 'REJECTED':
                return 'alert-circle';
            case 'DRAFT':
            default:
                return 'document-text';
        }
    };

    const renderOffer = ({ item }: { item: SalonOffer }) => {
        const canDelete = item.status !== 'ACTIVE';
        const anyServices = isAnyServicesOffer(item);

        return (
            <TouchableOpacity
                activeOpacity={0.88}
                style={styles.offerCard}
                onPress={() => handleOfferPress(item)}
            >
                <View style={styles.offerTopRow}>
                    <View style={styles.discountContainer}>
                        <Text style={styles.discountText}>
                            {getDiscountText(item)}
                        </Text>
                    </View>

                    <View
                        style={[
                            styles.statusBadge,
                            getStatusStyle(item.status),
                        ]}
                    >
                        <Ionicons
                            name={getStatusIcon(item.status)}
                            size={14}
                            color={getStatusColor(item.status)}
                        />

                        <Text
                            style={[
                                styles.statusText,
                                {
                                    color: getStatusColor(
                                        item.status,
                                    ),
                                },
                            ]}
                        >
                            {getStatusLabel(item.status)}
                        </Text>
                    </View>
                </View>

                <Text style={styles.offerTitle}>
                    {item.title}
                </Text>

                <Text
                    style={styles.offerDescription}
                    numberOfLines={2}
                >
                    {item.description}
                </Text>

                <View style={styles.serviceTargetBadge}>
                    <View
                        style={[
                            styles.serviceTargetIcon,
                            anyServices &&
                                styles.serviceTargetIconAny,
                        ]}
                    >
                        <Ionicons
                            name={
                                anyServices
                                    ? 'layers-outline'
                                    : 'list-outline'
                            }
                            size={15}
                            color={PRIMARY_DARK}
                        />
                    </View>

                    <View style={styles.serviceTargetContent}>
                        <Text style={styles.serviceTargetTitle}>
                            {getOfferServiceText(item)}
                        </Text>

                        <Text
                            style={
                                styles.serviceTargetDescription
                            }
                        >
                            {getOfferServiceDescription(item)}
                        </Text>
                    </View>
                </View>

                {item.status === 'REJECTED' &&
                item.rejectionReason ? (
                    <View style={styles.rejectionContainer}>
                        <Ionicons
                            name="alert-circle-outline"
                            size={16}
                            color="#DC2626"
                        />

                        <Text
                            style={styles.rejectionText}
                            numberOfLines={3}
                        >
                            {item.rejectionReason}
                        </Text>
                    </View>
                ) : null}

                <View style={styles.divider} />

                <View style={styles.infoRow}>
                    <View style={styles.infoItem}>
                        <Ionicons
                            name="calendar-outline"
                            size={16}
                            color="#6B7280"
                        />

                        <Text style={styles.infoText}>
                            {formatDate(item.startDate)} -{' '}
                            {formatDate(item.endDate)}
                        </Text>
                    </View>
                </View>

                {item.category ? (
                    <View style={styles.infoRow}>
                        <View style={styles.infoItem}>
                            <Ionicons
                                name="grid-outline"
                                size={16}
                                color="#6B7280"
                            />

                            <Text style={styles.infoText}>
                                {item.category}
                            </Text>
                        </View>
                    </View>
                ) : null}

                {item.couponCode ? (
                    <View style={styles.infoRow}>
                        <View style={styles.infoItem}>
                            <Ionicons
                                name="pricetag-outline"
                                size={16}
                                color="#6B7280"
                            />

                            <Text style={styles.infoText}>
                                Code: {item.couponCode}
                            </Text>
                        </View>
                    </View>
                ) : null}

                {item.minimumBookingAmount != null ? (
                    <View style={styles.infoRow}>
                        <View style={styles.infoItem}>
                            <Ionicons
                                name="cart-outline"
                                size={16}
                                color="#6B7280"
                            />

                            <Text style={styles.infoText}>
                                Min. booking ₹
                                {item.minimumBookingAmount}
                            </Text>
                        </View>
                    </View>
                ) : null}

                <View style={styles.bottomRow}>
                    <Text style={styles.usageText}>
                        {item.usageCount}
                        {item.usageLimit != null
                            ? ` / ${item.usageLimit}`
                            : ''}{' '}
                        redemptions
                    </Text>

                    <View style={styles.actionsRow}>
                        <TouchableOpacity
                            style={styles.actionButton}
                            onPress={() => handleOfferPress(item)}
                            activeOpacity={0.75}
                        >
                            <Ionicons
                                name="create-outline"
                                size={17}
                                color={PRIMARY}
                            />

                            <Text style={styles.actionButtonText}>
                                Edit
                            </Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={[
                                styles.actionButton,
                                !canDelete &&
                                    styles.disabledAction,
                            ]}
                            onPress={() => handleDeleteOffer(item)}
                            activeOpacity={0.75}
                            disabled={deleteLoading}
                        >
                            <Ionicons
                                name="trash-outline"
                                size={17}
                                color={
                                    canDelete
                                        ? '#DC2626'
                                        : '#9CA3AF'
                                }
                            />

                            <Text
                                style={[
                                    styles.actionButtonText,
                                    {
                                        color: canDelete
                                            ? '#DC2626'
                                            : '#9CA3AF',
                                    },
                                ]}
                            >
                                Delete
                            </Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </TouchableOpacity>
        );
    };

    const activeCount = offers.filter(
        offer => offer.status === 'ACTIVE',
    ).length;

    const pendingCount = offers.filter(
        offer => offer.status === 'PENDING_APPROVAL',
    ).length;

    const expiredCount = offers.filter(
        offer => offer.status === 'EXPIRED',
    ).length;

    if (!salonId) {
        return (
            <SafeAreaView style={styles.container}>
                <StatusBar
                    barStyle="dark-content"
                    backgroundColor="#FFFFFF"
                />

                <View style={styles.header}>
                    <View style={styles.headerLeftNoMargin}>
                        <Text style={styles.headerTitle}>
                            Offers
                        </Text>

                        <Text style={styles.headerSubtitle}>
                            Manage your salon offers
                        </Text>
                    </View>
                </View>

                <View style={styles.errorContainer}>
                    <View style={styles.errorIconCircle}>
                        <Ionicons
                            name="business-outline"
                            size={42}
                            color={PRIMARY}
                        />
                    </View>

                    <Text style={styles.errorTitle}>
                        Salon information unavailable
                    </Text>

                    <Text style={styles.errorText}>
                        We could not find your salon information.
                        Please log in again.
                    </Text>
                </View>
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView style={styles.container}>
            <StatusBar
                barStyle="dark-content"
                backgroundColor="#FFFFFF"
            />

            <View style={styles.header}>
                <TouchableOpacity
                    style={styles.backButton}
                    onPress={() => navigation.goBack()}
                    activeOpacity={0.75}
                >
                    <Ionicons
                        name="arrow-back"
                        size={23}
                        color="#111827"
                    />
                </TouchableOpacity>

                <View style={styles.headerLeft}>
                    <Text style={styles.headerTitle}>
                        Offers
                    </Text>

                    <Text style={styles.headerSubtitle}>
                        Manage your salon offers
                    </Text>
                </View>

                <TouchableOpacity
                    activeOpacity={0.85}
                    onPress={handleCreateOffer}
                    style={styles.gradientButtonWrapper}
                >
                    <LinearGradient
                        colors={SOFT_PURPLE_GRADIENT}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 1 }}
                        style={styles.addButton}
                    >
                        <Ionicons
                            name="add"
                            size={22}
                            color="#FFFFFF"
                        />

                        <Text style={styles.addButtonText}>
                            Create
                        </Text>
                    </LinearGradient>
                </TouchableOpacity>
            </View>

            <View style={styles.summaryContainer}>
                <SummaryCard
                    icon="checkmark-circle"
                    label="Active"
                    value={activeCount}
                    onPress={() => setSelectedFilter('ACTIVE')}
                />

                <SummaryCard
                    icon="time"
                    label="Pending"
                    value={pendingCount}
                    onPress={() =>
                        setSelectedFilter('PENDING_APPROVAL')
                    }
                />

                <SummaryCard
                    icon="close-circle"
                    label="Expired"
                    value={expiredCount}
                    onPress={() => setSelectedFilter('EXPIRED')}
                />
            </View>

            <View style={styles.filterContainer}>
                <FilterButton
                    label="All"
                    active={selectedFilter === 'ALL'}
                    onPress={() => setSelectedFilter('ALL')}
                />

                <FilterButton
                    label="Active"
                    active={selectedFilter === 'ACTIVE'}
                    onPress={() => setSelectedFilter('ACTIVE')}
                />

                <FilterButton
                    label="Pending"
                    active={
                        selectedFilter === 'PENDING_APPROVAL'
                    }
                    onPress={() =>
                        setSelectedFilter('PENDING_APPROVAL')
                    }
                />

                <FilterButton
                    label="Expired"
                    active={selectedFilter === 'EXPIRED'}
                    onPress={() => setSelectedFilter('EXPIRED')}
                />
            </View>

            {loading && offers.length === 0 ? (
                <View style={styles.loadingContainer}>
                    <ActivityIndicator
                        size="large"
                        color={PRIMARY}
                    />

                    <Text style={styles.loadingText}>
                        Loading your offers...
                    </Text>
                </View>
            ) : error && offers.length === 0 ? (
                <View style={styles.errorContainer}>
                    <View style={styles.errorIconCircle}>
                        <Ionicons
                            name="cloud-offline-outline"
                            size={40}
                            color="#DC2626"
                        />
                    </View>

                    <Text style={styles.errorTitle}>
                        Unable to load offers
                    </Text>

                    <Text style={styles.errorText}>
                        {error.message ||
                            'Something went wrong while loading your offers.'}
                    </Text>

                    <TouchableOpacity
                        style={styles.retryButtonWrapper}
                        onPress={loadOffers}
                        activeOpacity={0.85}
                    >
                        <LinearGradient
                            colors={SOFT_PURPLE_GRADIENT}
                            start={{ x: 0, y: 0 }}
                            end={{ x: 1, y: 1 }}
                            style={styles.retryButton}
                        >
                            <Text style={styles.retryButtonText}>
                                Try Again
                            </Text>
                        </LinearGradient>
                    </TouchableOpacity>
                </View>
            ) : (
                <FlatList
                    data={filteredOffers}
                    keyExtractor={item => item.offerId}
                    renderItem={renderOffer}
                    refreshControl={
                        <RefreshControl
                            refreshing={isRefreshing}
                            onRefresh={loadOffers}
                            tintColor={PRIMARY}
                            colors={[PRIMARY]}
                        />
                    }
                    contentContainerStyle={
                        filteredOffers.length === 0
                            ? styles.emptyList
                            : styles.listContent
                    }
                    showsVerticalScrollIndicator={false}
                    ListHeaderComponent={
                        filteredOffers.length > 0 ? (
                            <View style={styles.listHeader}>
                                <Text style={styles.listTitle}>
                                    My Offers
                                </Text>

                                <Text style={styles.offerCount}>
                                    {filteredOffers.length}
                                </Text>
                            </View>
                        ) : null
                    }
                    ListEmptyComponent={
                        <EmptyOffers
                            onCreateOffer={handleCreateOffer}
                            filter={selectedFilter}
                        />
                    }
                />
            )}
        </SafeAreaView>
    );
}

/**
 * SUMMARY CARD
 */
function SummaryCard({
    icon,
    label,
    value,
    onPress,
}: {
    icon: string;
    label: string;
    value: number;
    onPress: () => void;
}) {
    return (
        <TouchableOpacity
            style={styles.summaryCard}
            activeOpacity={0.8}
            onPress={onPress}
        >
            <View style={styles.summaryIconCircle}>
                <Ionicons
                    name={icon}
                    size={21}
                    color={PRIMARY}
                />
            </View>

            <Text style={styles.summaryValue}>
                {value}
            </Text>

            <Text style={styles.summaryLabel}>
                {label}
            </Text>
        </TouchableOpacity>
    );
}

/**
 * FILTER BUTTON
 */
function FilterButton({
    label,
    active,
    onPress,
}: {
    label: string;
    active: boolean;
    onPress: () => void;
}) {
    return (
        <TouchableOpacity
            style={[
                styles.filterButton,
                active && styles.filterButtonActive,
            ]}
            onPress={onPress}
            activeOpacity={0.8}
        >
            <Text
                style={[
                    styles.filterText,
                    active && styles.filterTextActive,
                ]}
            >
                {label}
            </Text>
        </TouchableOpacity>
    );
}

/**
 * EMPTY OFFERS
 */
function EmptyOffers({
    onCreateOffer,
    filter,
}: {
    onCreateOffer: () => void;
    filter: FilterType;
}) {
    const isFiltered = filter !== 'ALL';

    return (
        <View style={styles.emptyContainer}>
            <View style={styles.emptyIcon}>
                <Ionicons
                    name="pricetags-outline"
                    size={40}
                    color={PRIMARY}
                />
            </View>

            <Text style={styles.emptyTitle}>
                {isFiltered
                    ? 'No offers in this category'
                    : 'No offers found'}
            </Text>

            <Text style={styles.emptyDescription}>
                {isFiltered
                    ? 'There are no offers matching the selected filter.'
                    : 'Create an offer to attract more customers to your salon.'}
            </Text>

            {!isFiltered ? (
                <TouchableOpacity
                    style={styles.emptyButtonWrapper}
                    onPress={onCreateOffer}
                    activeOpacity={0.85}
                >
                    <LinearGradient
                        colors={SOFT_PURPLE_GRADIENT}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 1 }}
                        style={styles.emptyButton}
                    >
                        <Ionicons
                            name="add"
                            size={20}
                            color="#FFFFFF"
                        />

                        <Text style={styles.emptyButtonText}>
                            Create Offer
                        </Text>
                    </LinearGradient>
                </TouchableOpacity>
            ) : null}
        </View>
    );
}

/**
 * DATE HELPER
 */
function formatDate(date: string) {
    if (!date) {
        return '';
    }

    const parsed = new Date(date);

    if (Number.isNaN(parsed.getTime())) {
        return date;
    }

    return parsed.toLocaleDateString('en-IN', {
        day: '2-digit',
        month: 'short',
    });
}

/**
 * STATUS COLORS
 * Status-specific colors are intentionally retained so users
 * can still distinguish active, pending, rejected and expired.
 */
function getStatusColor(status: OfferStatus) {
    switch (status) {
        case 'ACTIVE':
            return '#059669';
        case 'PENDING_APPROVAL':
            return '#D97706';
        case 'PAUSED':
            return '#6B7280';
        case 'EXPIRED':
            return '#DC2626';
        case 'REJECTED':
            return '#DC2626';
        case 'DRAFT':
        default:
            return '#6B7280';
    }
}

function getStatusStyle(status: OfferStatus) {
    switch (status) {
        case 'ACTIVE':
            return {
                backgroundColor: '#ECFDF5',
            };
        case 'PENDING_APPROVAL':
            return {
                backgroundColor: '#FFFBEB',
            };
        case 'PAUSED':
            return {
                backgroundColor: '#F3F4F6',
            };
        case 'EXPIRED':
        case 'REJECTED':
            return {
                backgroundColor: '#FEF2F2',
            };
        case 'DRAFT':
        default:
            return {
                backgroundColor: '#F3F4F6',
            };
    }
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#FAF9FF',
    },

    header: {
        backgroundColor: '#FFFFFF',
        paddingHorizontal: 18,
        paddingTop: 16,
        paddingBottom: 17,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        borderBottomWidth: 1,
        borderBottomColor: '#F0EDFA',
    },

    headerLeft: {
        flex: 1,
        marginLeft: 11,
    },

    headerLeftNoMargin: {
        flex: 1,
    },

    headerTitle: {
        fontSize: 25,
        fontWeight: '700',
        color: '#241A3B',
    },

    headerSubtitle: {
        marginTop: 4,
        fontSize: 13,
        color: '#7A718C',
    },

    gradientButtonWrapper: {
        borderRadius: 12,
        overflow: 'hidden',
        marginLeft: 8,
    },

    addButton: {
        minHeight: 42,
        paddingHorizontal: 13,
        borderRadius: 12,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
    },

    addButtonText: {
        color: '#FFFFFF',
        fontSize: 14,
        fontWeight: '700',
        marginLeft: 4,
    },

    summaryContainer: {
        flexDirection: 'row',
        paddingHorizontal: 14,
        paddingTop: 15,
        paddingBottom: 6,
    },

    summaryCard: {
        flex: 1,
        backgroundColor: '#FFFFFF',
        borderRadius: 15,
        paddingVertical: 12,
        alignItems: 'center',
        marginHorizontal: 4,
        borderWidth: 1,
        borderColor: '#EEE9FC',
    },

    summaryIconCircle: {
        width: 36,
        height: 36,
        borderRadius: 18,
        backgroundColor: PURPLE_LIGHT,
        alignItems: 'center',
        justifyContent: 'center',
    },

    summaryValue: {
        marginTop: 5,
        fontSize: 20,
        fontWeight: '700',
        color: '#241A3B',
    },

    summaryLabel: {
        marginTop: 2,
        fontSize: 12,
        color: '#7A718C',
    },

    filterContainer: {
        flexDirection: 'row',
        paddingHorizontal: 16,
        paddingVertical: 12,
        gap: 7,
    },

    filterButton: {
        paddingHorizontal: 12,
        paddingVertical: 9,
        borderRadius: 20,
        backgroundColor: '#FFFFFF',
        borderWidth: 1,
        borderColor: '#E8E3F5',
    },

    filterButtonActive: {
        backgroundColor: PRIMARY,
        borderColor: PRIMARY,
    },

    filterText: {
        fontSize: 12,
        fontWeight: '600',
        color: '#716780',
    },

    filterTextActive: {
        color: '#FFFFFF',
    },

    listContent: {
        paddingHorizontal: 15,
        paddingBottom: 30,
    },

    listHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 12,
        marginTop: 2,
    },

    listTitle: {
        fontSize: 18,
        fontWeight: '700',
        color: '#241A3B',
    },

    offerCount: {
        marginLeft: 8,
        minWidth: 25,
        height: 25,
        borderRadius: 13,
        backgroundColor: PURPLE_PALE,
        color: PRIMARY_DARK,
        fontSize: 12,
        fontWeight: '700',
        textAlign: 'center',
        textAlignVertical: 'center',
        overflow: 'hidden',
        paddingHorizontal: 6,
        paddingTop: 5,
    },

    offerCard: {
        backgroundColor: '#FFFFFF',
        borderRadius: 18,
        padding: 15,
        marginBottom: 13,
        borderWidth: 1,
        borderColor: '#EDE8F8',
        elevation: 1,
        shadowColor: '#6D28D9',
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.035,
        shadowRadius: 5,
    },

    offerTopRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },

    discountContainer: {
        backgroundColor: PURPLE_LIGHT,
        borderRadius: 10,
        paddingHorizontal: 11,
        paddingVertical: 7,
        borderWidth: 1,
        borderColor: PURPLE_BORDER,
    },

    discountText: {
        color: PRIMARY_DARK,
        fontSize: 14,
        fontWeight: '800',
    },

    statusBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 9,
        paddingVertical: 6,
        borderRadius: 20,
    },

    statusText: {
        fontSize: 11,
        fontWeight: '700',
        marginLeft: 4,
    },

    offerTitle: {
        marginTop: 13,
        fontSize: 17,
        fontWeight: '700',
        color: '#241A3B',
    },

    offerDescription: {
        marginTop: 5,
        fontSize: 13,
        lineHeight: 19,
        color: '#7A718C',
    },

    serviceTargetBadge: {
        marginTop: 12,
        backgroundColor: '#FBFAFF',
        borderWidth: 1,
        borderColor: '#EAE4FA',
        borderRadius: 12,
        padding: 10,
        flexDirection: 'row',
        alignItems: 'center',
    },

    serviceTargetIcon: {
        width: 34,
        height: 34,
        borderRadius: 10,
        backgroundColor: '#EDE9FE',
        alignItems: 'center',
        justifyContent: 'center',
    },

    serviceTargetIconAny: {
        backgroundColor: '#DDD6FE',
    },

    serviceTargetContent: {
        flex: 1,
        marginLeft: 9,
    },

    serviceTargetTitle: {
        fontSize: 12,
        fontWeight: '700',
        color: '#4C3B70',
    },

    serviceTargetDescription: {
        marginTop: 2,
        fontSize: 10,
        lineHeight: 15,
        color: '#7A718C',
    },

    rejectionContainer: {
        marginTop: 10,
        padding: 10,
        backgroundColor: '#FEF2F2',
        borderRadius: 10,
        flexDirection: 'row',
        alignItems: 'flex-start',
    },

    rejectionText: {
        flex: 1,
        marginLeft: 7,
        fontSize: 12,
        lineHeight: 17,
        color: '#B91C1C',
    },

    divider: {
        height: 1,
        backgroundColor: '#F0EDF7',
        marginVertical: 13,
    },

    infoRow: {
        marginBottom: 7,
    },

    infoItem: {
        flexDirection: 'row',
        alignItems: 'center',
    },

    infoText: {
        marginLeft: 7,
        fontSize: 12,
        color: '#777087',
    },

    bottomRow: {
        marginTop: 7,
        paddingTop: 11,
        borderTopWidth: 1,
        borderTopColor: '#F0EDF7',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },

    usageText: {
        flex: 1,
        fontSize: 12,
        color: '#777087',
    },

    actionsRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
    },

    actionButton: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 5,
    },

    disabledAction: {
        opacity: 0.7,
    },

    actionButtonText: {
        marginLeft: 4,
        fontSize: 12,
        fontWeight: '700',
        color: PRIMARY_DARK,
    },

    loadingContainer: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        paddingHorizontal: 30,
    },

    loadingText: {
        marginTop: 12,
        fontSize: 13,
        color: '#7A718C',
    },

    errorContainer: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        paddingHorizontal: 35,
    },

    errorIconCircle: {
        width: 78,
        height: 78,
        borderRadius: 39,
        backgroundColor: PURPLE_LIGHT,
        alignItems: 'center',
        justifyContent: 'center',
    },

    errorTitle: {
        marginTop: 15,
        fontSize: 18,
        fontWeight: '700',
        color: '#241A3B',
        textAlign: 'center',
    },

    errorText: {
        marginTop: 7,
        textAlign: 'center',
        fontSize: 13,
        lineHeight: 20,
        color: '#7A718C',
    },

    backButton: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: '#F3F0FC',
        alignItems: 'center',
        justifyContent: 'center',
    },

    retryButtonWrapper: {
        marginTop: 18,
        borderRadius: 11,
        overflow: 'hidden',
    },

    retryButton: {
        paddingHorizontal: 22,
        paddingVertical: 11,
        borderRadius: 11,
        alignItems: 'center',
        justifyContent: 'center',
    },

    retryButtonText: {
        color: '#FFFFFF',
        fontSize: 13,
        fontWeight: '700',
    },

    emptyList: {
        flexGrow: 1,
        justifyContent: 'center',
        paddingHorizontal: 25,
    },

    emptyContainer: {
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 40,
    },

    emptyIcon: {
        width: 82,
        height: 82,
        borderRadius: 41,
        backgroundColor: PURPLE_LIGHT,
        borderWidth: 1,
        borderColor: PURPLE_BORDER,
        alignItems: 'center',
        justifyContent: 'center',
    },

    emptyTitle: {
        marginTop: 18,
        fontSize: 19,
        fontWeight: '700',
        color: '#241A3B',
        textAlign: 'center',
    },

    emptyDescription: {
        marginTop: 7,
        textAlign: 'center',
        fontSize: 13,
        lineHeight: 20,
        color: '#7A718C',
        maxWidth: 280,
    },

    emptyButtonWrapper: {
        marginTop: 20,
        borderRadius: 12,
        overflow: 'hidden',
    },

    emptyButton: {
        minHeight: 46,
        paddingHorizontal: 20,
        borderRadius: 12,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
    },

    emptyButtonText: {
        color: '#FFFFFF',
        fontSize: 14,
        fontWeight: '700',
        marginLeft: 6,
    },
});
