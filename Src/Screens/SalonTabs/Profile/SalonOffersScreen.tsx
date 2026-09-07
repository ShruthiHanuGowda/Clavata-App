import React, { useCallback, useMemo, useState } from 'react';
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
import {
    SALON_OFFERS,
    DELETE_OFFER,
} from '../../../graphql/queries';
import { useUser } from '../../../context/UserContext';

const PRIMARY = '#009D94';

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

    const [isRefreshing, setIsRefreshing] =
        useState(false);

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
        {
            loading: deleteLoading,
        },
    ] = useMutation(DELETE_OFFER);

    const offers: SalonOffer[] =
        data?.salonOffers?.offers || [];

    const filteredOffers = useMemo(() => {
        if (selectedFilter === 'ALL') {
            return offers;
        }

        return offers.filter(
            offer =>
                offer.status ===
                selectedFilter,
        );
    }, [
        offers,
        selectedFilter,
    ]);

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
    }, [
        refetch,
        salonId,
    ]);

    useFocusEffect(
        useCallback(() => {
            if (salonId) {
                loadOffers();
            }
        }, [
            salonId,
            loadOffers,
        ]),
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

    const handleOfferPress = (
        offer: SalonOffer,
    ) => {
        if (!salonId) {
            Alert.alert(
                'Salon information missing',
                'Please log in again before managing offers.',
            );
            return;
        }

        navigation.navigate(
            'CreateOffer',
            {
                offerId:
                    offer.offerId,
                offer,
                mode: 'EDIT',
            },
        );
    };

    const handleDeleteOffer = (
        offer: SalonOffer,
    ) => {
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

        if (
            offer.salonId !== salonId
        ) {
            Alert.alert(
                'Unable to delete',
                'This offer does not belong to your salon.',
            );
            return;
        }

        if (
            offer.status === 'ACTIVE'
        ) {
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
                            const {
                                data,
                            } =
                                await deleteOffer({
                                    variables: {
                                        input: {
                                            offerId:
                                                offer.offerId,
                                            salonId,
                                        },
                                    },
                                });

                            const response =
                                data?.deleteOffer;

                            if (!response) {
                                throw new Error(
                                    'No response received from deleteOffer.',
                                );
                            }

                            if (
                                !response.success
                            ) {
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
                        } catch (
                        deleteError: any
                        ) {
                            console.error(
                                'Delete offer error:',
                                deleteError,
                            );

                            const message =
                                deleteError
                                    ?.graphQLErrors?.[0]
                                    ?.message ||
                                deleteError
                                    ?.networkError
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

    const getDiscountText = (
        offer: SalonOffer,
    ) => {
        if (
            offer.discountType ===
            'PERCENTAGE'
        ) {
            return `${offer.discountValue}% OFF`;
        }

        return `₹${offer.discountValue} OFF`;
    };

    const getStatusLabel = (
        status: OfferStatus,
    ) => {
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

    const getStatusIcon = (
        status: OfferStatus,
    ) => {
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

    const renderOffer = ({
        item,
    }: {
        item: SalonOffer;
    }) => {
        const canDelete =
            item.status !==
            'ACTIVE';

        return (
            <TouchableOpacity
                activeOpacity={0.85}
                style={styles.offerCard}
                onPress={() =>
                    handleOfferPress(
                        item,
                    )
                }
            >
                <View
                    style={
                        styles.offerTopRow
                    }
                >
                    <View
                        style={
                            styles.discountContainer
                        }
                    >
                        <Text
                            style={
                                styles.discountText
                            }
                        >
                            {getDiscountText(
                                item,
                            )}
                        </Text>
                    </View>

                    <View
                        style={[
                            styles.statusBadge,
                            getStatusStyle(
                                item.status,
                            ),
                        ]}
                    >
                        <Ionicons
                            name={getStatusIcon(
                                item.status,
                            )}
                            size={14}
                            color={getStatusColor(
                                item.status,
                            )}
                        />

                        <Text
                            style={[
                                styles.statusText,
                                {
                                    color:
                                        getStatusColor(
                                            item.status,
                                        ),
                                },
                            ]}
                        >
                            {getStatusLabel(
                                item.status,
                            )}
                        </Text>
                    </View>
                </View>

                <Text
                    style={
                        styles.offerTitle
                    }
                >
                    {item.title}
                </Text>

                <Text
                    style={
                        styles.offerDescription
                    }
                    numberOfLines={2}
                >
                    {item.description}
                </Text>

                {item.status ===
                    'REJECTED' &&
                    item.rejectionReason ? (
                    <View
                        style={
                            styles.rejectionContainer
                        }
                    >
                        <Ionicons
                            name="alert-circle-outline"
                            size={16}
                            color="#DC2626"
                        />

                        <Text
                            style={
                                styles.rejectionText
                            }
                            numberOfLines={3}
                        >
                            {item.rejectionReason}
                        </Text>
                    </View>
                ) : null}

                <View
                    style={
                        styles.divider
                    }
                />

                <View
                    style={
                        styles.infoRow
                    }
                >
                    <View
                        style={
                            styles.infoItem
                        }
                    >
                        <Ionicons
                            name="calendar-outline"
                            size={16}
                            color="#6B7280"
                        />

                        <Text
                            style={
                                styles.infoText
                            }
                        >
                            {formatDate(
                                item.startDate,
                            )}{' '}
                            -{' '}
                            {formatDate(
                                item.endDate,
                            )}
                        </Text>
                    </View>
                </View>

                {item.category ? (
                    <View
                        style={
                            styles.infoRow
                        }
                    >
                        <View
                            style={
                                styles.infoItem
                            }
                        >
                            <Ionicons
                                name="grid-outline"
                                size={16}
                                color="#6B7280"
                            />

                            <Text
                                style={
                                    styles.infoText
                                }
                            >
                                {
                                    item.category
                                }
                            </Text>
                        </View>
                    </View>
                ) : null}

                {item.couponCode ? (
                    <View
                        style={
                            styles.infoRow
                        }
                    >
                        <View
                            style={
                                styles.infoItem
                            }
                        >
                            <Ionicons
                                name="pricetag-outline"
                                size={16}
                                color="#6B7280"
                            />

                            <Text
                                style={
                                    styles.infoText
                                }
                            >
                                Code:{' '}
                                {
                                    item.couponCode
                                }
                            </Text>
                        </View>
                    </View>
                ) : null}

                {item.minimumBookingAmount !=
                    null ? (
                    <View
                        style={
                            styles.infoRow
                        }
                    >
                        <View
                            style={
                                styles.infoItem
                            }
                        >
                            <Ionicons
                                name="cart-outline"
                                size={16}
                                color="#6B7280"
                            />

                            <Text
                                style={
                                    styles.infoText
                                }
                            >
                                Min. booking ₹
                                {
                                    item.minimumBookingAmount
                                }
                            </Text>
                        </View>
                    </View>
                ) : null}

                <View
                    style={
                        styles.bottomRow
                    }
                >
                    <Text
                        style={
                            styles.usageText
                        }
                    >
                        {item.usageCount}
                        {item.usageLimit !=
                            null
                            ? ` / ${item.usageLimit}`
                            : ''}{' '}
                        redemptions
                    </Text>

                    <View
                        style={
                            styles.actionsRow
                        }
                    >
                        <TouchableOpacity
                            style={
                                styles.actionButton
                            }
                            onPress={() =>
                                handleOfferPress(
                                    item,
                                )
                            }
                            activeOpacity={
                                0.75
                            }
                        >
                            <Ionicons
                                name="create-outline"
                                size={17}
                                color={
                                    PRIMARY
                                }
                            />

                            <Text
                                style={
                                    styles.actionButtonText
                                }
                            >
                                Edit
                            </Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={[
                                styles.actionButton,
                                !canDelete &&
                                styles.disabledAction,
                            ]}
                            onPress={() =>
                                handleDeleteOffer(
                                    item,
                                )
                            }
                            activeOpacity={
                                0.75
                            }
                            disabled={
                                deleteLoading
                            }
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
                                        color:
                                            canDelete
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

    const activeCount =
        offers.filter(
            offer =>
                offer.status ===
                'ACTIVE',
        ).length;

    const pendingCount =
        offers.filter(
            offer =>
                offer.status ===
                'PENDING_APPROVAL',
        ).length;

    const expiredCount =
        offers.filter(
            offer =>
                offer.status ===
                'EXPIRED',
        ).length;

    if (!salonId) {
        return (
            <SafeAreaView
                style={
                    styles.container
                }
            >
                <StatusBar
                    barStyle="dark-content"
                    backgroundColor="#FFFFFF"
                />

                <View
                    style={
                        styles.header
                    }
                >
                    <View
                        style={
                            styles.headerLeft
                        }
                    >
                        <Text
                            style={
                                styles.headerTitle
                            }
                        >
                            Offers
                        </Text>

                        <Text
                            style={
                                styles.headerSubtitle
                            }
                        >
                            Manage your salon
                            offers
                        </Text>
                    </View>
                </View>

                <View
                    style={
                        styles.errorContainer
                    }
                >
                    <Ionicons
                        name="business-outline"
                        size={48}
                        color={
                            PRIMARY
                        }
                    />

                    <Text
                        style={
                            styles.errorTitle
                        }
                    >
                        Salon information
                        unavailable
                    </Text>

                    <Text
                        style={
                            styles.errorText
                        }
                    >
                        We could not find
                        your salon
                        information. Please
                        log in again.
                    </Text>
                </View>
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView
            style={
                styles.container
            }
        >
            <StatusBar
                barStyle="dark-content"
                backgroundColor="#FFFFFF"
            />

            <View
                style={styles.header}
            >
                <TouchableOpacity
                    style={
                        styles.backButton
                    }
                    onPress={() =>
                        navigation.goBack()
                    }
                >
                    <Ionicons
                        name="arrow-back"
                        size={23}
                        color="#111827"
                    />
                </TouchableOpacity>
                <View
                    style={
                        styles.headerLeft
                    }
                >
                    <Text
                        style={
                            styles.headerTitle
                        }
                    >
                        Offers
                    </Text>

                    <Text
                        style={
                            styles.headerSubtitle
                        }
                    >
                        Manage your salon
                        offers
                    </Text>
                </View>

                <TouchableOpacity
                    style={
                        styles.addButton
                    }
                    activeOpacity={
                        0.8
                    }
                    onPress={
                        handleCreateOffer
                    }
                >
                    <Ionicons
                        name="add"
                        size={22}
                        color="#FFFFFF"
                    />

                    <Text
                        style={
                            styles.addButtonText
                        }
                    >
                        Create
                    </Text>
                </TouchableOpacity>
            </View>

            <View
                style={
                    styles.summaryContainer
                }
            >
                <SummaryCard
                    icon="checkmark-circle"
                    label="Active"
                    value={
                        activeCount
                    }
                    onPress={() =>
                        setSelectedFilter(
                            'ACTIVE',
                        )
                    }
                />

                <SummaryCard
                    icon="time"
                    label="Pending"
                    value={
                        pendingCount
                    }
                    onPress={() =>
                        setSelectedFilter(
                            'PENDING_APPROVAL',
                        )
                    }
                />

                <SummaryCard
                    icon="close-circle"
                    label="Expired"
                    value={
                        expiredCount
                    }
                    onPress={() =>
                        setSelectedFilter(
                            'EXPIRED',
                        )
                    }
                />
            </View>

            <View
                style={
                    styles.filterContainer
                }
            >
                <FilterButton
                    label="All"
                    active={
                        selectedFilter ===
                        'ALL'
                    }
                    onPress={() =>
                        setSelectedFilter(
                            'ALL',
                        )
                    }
                />

                <FilterButton
                    label="Active"
                    active={
                        selectedFilter ===
                        'ACTIVE'
                    }
                    onPress={() =>
                        setSelectedFilter(
                            'ACTIVE',
                        )
                    }
                />

                <FilterButton
                    label="Pending"
                    active={
                        selectedFilter ===
                        'PENDING_APPROVAL'
                    }
                    onPress={() =>
                        setSelectedFilter(
                            'PENDING_APPROVAL',
                        )
                    }
                />

                <FilterButton
                    label="Expired"
                    active={
                        selectedFilter ===
                        'EXPIRED'
                    }
                    onPress={() =>
                        setSelectedFilter(
                            'EXPIRED',
                        )
                    }
                />
            </View>

            {loading &&
                offers.length === 0 ? (
                <View
                    style={
                        styles.loadingContainer
                    }
                >
                    <ActivityIndicator
                        size="large"
                        color={
                            PRIMARY
                        }
                    />

                    <Text
                        style={
                            styles.loadingText
                        }
                    >
                        Loading your
                        offers...
                    </Text>
                </View>
            ) : error &&
                offers.length ===
                0 ? (
                <View
                    style={
                        styles.errorContainer
                    }
                >
                    <Ionicons
                        name="cloud-offline-outline"
                        size={45}
                        color="#DC2626"
                    />

                    <Text
                        style={
                            styles.errorTitle
                        }
                    >
                        Unable to load
                        offers
                    </Text>

                    <Text
                        style={
                            styles.errorText
                        }
                    >
                        {error.message ||
                            'Something went wrong while loading your offers.'}
                    </Text>

                    <TouchableOpacity
                        style={
                            styles.retryButton
                        }
                        onPress={
                            loadOffers
                        }
                    >
                        <Text
                            style={
                                styles.retryButtonText
                            }
                        >
                            Try Again
                        </Text>
                    </TouchableOpacity>
                </View>
            ) : (
                <FlatList
                    data={
                        filteredOffers
                    }
                    keyExtractor={item =>
                        item.offerId
                    }
                    renderItem={
                        renderOffer
                    }
                    refreshControl={
                        <RefreshControl
                            refreshing={
                                isRefreshing
                            }
                            onRefresh={
                                loadOffers
                            }
                            tintColor={
                                PRIMARY
                            }
                        />
                    }
                    contentContainerStyle={
                        filteredOffers.length ===
                            0
                            ? styles.emptyList
                            : styles.listContent
                    }
                    showsVerticalScrollIndicator={
                        false
                    }
                    ListHeaderComponent={
                        filteredOffers.length >
                            0 ? (
                            <View
                                style={
                                    styles.listHeader
                                }
                            >
                                <Text
                                    style={
                                        styles.listTitle
                                    }
                                >
                                    My Offers
                                </Text>

                                <Text
                                    style={
                                        styles.offerCount
                                    }
                                >
                                    {
                                        filteredOffers.length
                                    }
                                </Text>
                            </View>
                        ) : null
                    }
                    ListEmptyComponent={
                        <EmptyOffers
                            onCreateOffer={
                                handleCreateOffer
                            }
                            filter={
                                selectedFilter
                            }
                        />
                    }
                />
            )}
        </SafeAreaView>
    );
}

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
            style={
                styles.summaryCard
            }
            activeOpacity={
                0.8
            }
            onPress={onPress}
        >
            <Ionicons
                name={icon}
                size={22}
                color={
                    PRIMARY
                }
            />

            <Text
                style={
                    styles.summaryValue
                }
            >
                {value}
            </Text>

            <Text
                style={
                    styles.summaryLabel
                }
            >
                {label}
            </Text>
        </TouchableOpacity>
    );
}

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
                active &&
                styles.filterButtonActive,
            ]}
            onPress={onPress}
            activeOpacity={
                0.8
            }
        >
            <Text
                style={[
                    styles.filterText,
                    active &&
                    styles.filterTextActive,
                ]}
            >
                {label}
            </Text>
        </TouchableOpacity>
    );
}

function EmptyOffers({
    onCreateOffer,
    filter,
}: {
    onCreateOffer: () => void;
    filter: FilterType;
}) {
    const isFiltered =
        filter !== 'ALL';

    return (
        <View
            style={
                styles.emptyContainer
            }
        >
            <View
                style={
                    styles.emptyIcon
                }
            >
                <Ionicons
                    name="pricetags-outline"
                    size={42}
                    color={
                        PRIMARY
                    }
                />
            </View>

            <Text
                style={
                    styles.emptyTitle
                }
            >
                {isFiltered
                    ? 'No offers in this category'
                    : 'No offers found'}
            </Text>

            <Text
                style={
                    styles.emptyDescription
                }
            >
                {isFiltered
                    ? 'There are no offers matching the selected filter.'
                    : 'Create an offer to attract more customers to your salon.'}
            </Text>

            {!isFiltered ? (
                <TouchableOpacity
                    style={
                        styles.emptyButton
                    }
                    onPress={
                        onCreateOffer
                    }
                    activeOpacity={
                        0.8
                    }
                >
                    <Ionicons
                        name="add"
                        size={20}
                        color="#FFFFFF"
                    />

                    <Text
                        style={
                            styles.emptyButtonText
                        }
                    >
                        Create Offer
                    </Text>
                </TouchableOpacity>
            ) : null}
        </View>
    );
}

function formatDate(
    date: string,
) {
    if (!date) {
        return '';
    }

    const parsed =
        new Date(date);

    if (
        Number.isNaN(
            parsed.getTime(),
        )
    ) {
        return date;
    }

    return parsed.toLocaleDateString(
        'en-IN',
        {
            day: '2-digit',
            month: 'short',
        },
    );
}

function getStatusColor(
    status: OfferStatus,
) {
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

function getStatusStyle(
    status: OfferStatus,
) {
    switch (status) {
        case 'ACTIVE':
            return {
                backgroundColor:
                    '#ECFDF5',
            };
        case 'PENDING_APPROVAL':
            return {
                backgroundColor:
                    '#FFFBEB',
            };
        case 'PAUSED':
            return {
                backgroundColor:
                    '#F3F4F6',
            };
        case 'EXPIRED':
            return {
                backgroundColor:
                    '#FEF2F2',
            };
        case 'REJECTED':
            return {
                backgroundColor:
                    '#FEF2F2',
            };
        case 'DRAFT':
        default:
            return {
                backgroundColor:
                    '#F3F4F6',
            };
    }
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor:
            '#F8FAFC',
    },
    header: {
        backgroundColor:
            '#FFFFFF',
        paddingHorizontal: 20,
        paddingTop: 18,
        paddingBottom: 18,
        flexDirection:
            'row',
        alignItems:
            'center',
        justifyContent:
            'space-between',
    },
    headerLeft: {
        flex: 1,
    },
    headerTitle: {
        fontSize: 26,
        fontWeight:
            '700',
        color:
            '#111827',
    },
    headerSubtitle: {
        marginTop: 4,
        fontSize: 13,
        color:
            '#6B7280',
    },
    addButton: {
        height: 42,
        paddingHorizontal: 15,
        borderRadius: 12,
        backgroundColor:
            PRIMARY,
        flexDirection:
            'row',
        alignItems:
            'center',
        justifyContent:
            'center',
        marginLeft: 12,
    },
    addButtonText: {
        color:
            '#FFFFFF',
        fontSize: 14,
        fontWeight:
            '700',
        marginLeft: 5,
    },
    summaryContainer: {
        flexDirection:
            'row',
        paddingHorizontal: 16,
        paddingTop: 16,
        paddingBottom: 6,
    },
    summaryCard: {
        flex: 1,
        backgroundColor:
            '#FFFFFF',
        borderRadius: 14,
        paddingVertical: 14,
        alignItems:
            'center',
        marginHorizontal: 4,
        borderWidth: 1,
        borderColor:
            '#E5E7EB',
    },
    summaryValue: {
        marginTop: 5,
        fontSize: 20,
        fontWeight:
            '700',
        color:
            '#111827',
    },
    summaryLabel: {
        marginTop: 2,
        fontSize: 12,
        color:
            '#6B7280',
    },
    filterContainer: {
        flexDirection:
            'row',
        paddingHorizontal: 16,
        paddingVertical: 12,
        gap: 8,
    },
    filterButton: {
        paddingHorizontal: 14,
        paddingVertical: 9,
        borderRadius: 20,
        backgroundColor:
            '#FFFFFF',
        borderWidth: 1,
        borderColor:
            '#E5E7EB',
    },
    filterButtonActive: {
        backgroundColor:
            PRIMARY,
        borderColor:
            PRIMARY,
    },
    filterText: {
        fontSize: 13,
        fontWeight:
            '600',
        color:
            '#6B7280',
    },
    filterTextActive: {
        color:
            '#FFFFFF',
    },
    listContent: {
        paddingHorizontal: 16,
        paddingBottom: 30,
    },
    listHeader: {
        flexDirection:
            'row',
        alignItems:
            'center',
        marginBottom: 12,
        marginTop: 2,
    },
    listTitle: {
        fontSize: 18,
        fontWeight:
            '700',
        color:
            '#111827',
    },
    offerCount: {
        marginLeft: 8,
        minWidth: 24,
        height: 24,
        borderRadius: 12,
        backgroundColor:
            '#E6F7F5',
        color:
            PRIMARY,
        fontSize: 12,
        fontWeight:
            '700',
        textAlign:
            'center',
        paddingTop: 5,
    },
    offerCard: {
        backgroundColor:
            '#FFFFFF',
        borderRadius: 18,
        padding: 16,
        marginBottom: 14,
        borderWidth: 1,
        borderColor:
            '#E5E7EB',
    },
    offerTopRow: {
        flexDirection:
            'row',
        alignItems:
            'center',
        justifyContent:
            'space-between',
    },
    discountContainer: {
        backgroundColor:
            '#E6F7F5',
        borderRadius: 10,
        paddingHorizontal: 11,
        paddingVertical: 7,
    },
    discountText: {
        color:
            PRIMARY,
        fontSize: 14,
        fontWeight:
            '800',
    },
    statusBadge: {
        flexDirection:
            'row',
        alignItems:
            'center',
        paddingHorizontal: 9,
        paddingVertical: 6,
        borderRadius: 20,
    },
    statusText: {
        fontSize: 11,
        fontWeight:
            '700',
        marginLeft: 4,
    },
    offerTitle: {
        marginTop: 13,
        fontSize: 17,
        fontWeight:
            '700',
        color:
            '#111827',
    },
    offerDescription: {
        marginTop: 5,
        fontSize: 13,
        lineHeight: 19,
        color:
            '#6B7280',
    },
    rejectionContainer: {
        marginTop: 10,
        padding: 10,
        backgroundColor:
            '#FEF2F2',
        borderRadius: 10,
        flexDirection:
            'row',
        alignItems:
            'flex-start',
    },
    rejectionText: {
        flex: 1,
        marginLeft: 7,
        fontSize: 12,
        lineHeight: 17,
        color:
            '#B91C1C',
    },
    divider: {
        height: 1,
        backgroundColor:
            '#F1F5F9',
        marginVertical: 13,
    },
    infoRow: {
        marginBottom: 7,
    },
    infoItem: {
        flexDirection:
            'row',
        alignItems:
            'center',
    },
    infoText: {
        marginLeft: 7,
        fontSize: 12,
        color:
            '#6B7280',
    },
    bottomRow: {
        marginTop: 7,
        paddingTop: 11,
        borderTopWidth: 1,
        borderTopColor:
            '#F1F5F9',
        flexDirection:
            'row',
        alignItems:
            'center',
        justifyContent:
            'space-between',
    },
    usageText: {
        flex: 1,
        fontSize: 12,
        color:
            '#6B7280',
    },
    actionsRow: {
        flexDirection:
            'row',
        alignItems:
            'center',
        gap: 12,
    },
    actionButton: {
        flexDirection:
            'row',
        alignItems:
            'center',
        paddingVertical: 5,
    },
    disabledAction: {
        opacity: 0.7,
    },
    actionButtonText: {
        marginLeft: 4,
        fontSize: 12,
        fontWeight:
            '700',
        color:
            PRIMARY,
    },
    loadingContainer: {
        flex: 1,
        alignItems:
            'center',
        justifyContent:
            'center',
        paddingHorizontal: 30,
    },
    loadingText: {
        marginTop: 12,
        fontSize: 13,
        color:
            '#6B7280',
    },
    errorContainer: {
        flex: 1,
        alignItems:
            'center',
        justifyContent:
            'center',
        paddingHorizontal: 35,
    },
    errorTitle: {
        marginTop: 15,
        fontSize: 18,
        fontWeight:
            '700',
        color:
            '#111827',
        textAlign:
            'center',
    },
    errorText: {
        marginTop: 7,
        textAlign:
            'center',
        fontSize: 13,
        lineHeight: 20,
        color:
            '#6B7280',
    },
    backButton: {
        width: 42,
        height: 42,
        borderRadius: 21,
        backgroundColor:
            '#F3F4F6',
        alignItems:
            'center',
        justifyContent:
            'center',
    },
    retryButton: {
        marginTop: 18,
        paddingHorizontal: 22,
        paddingVertical: 11,
        borderRadius: 11,
        backgroundColor:
            PRIMARY,
    },
    retryButtonText: {
        color:
            '#FFFFFF',
        fontSize: 13,
        fontWeight:
            '700',
    },
    emptyList: {
        flexGrow: 1,
        justifyContent:
            'center',
        paddingHorizontal: 25,
    },
    emptyContainer: {
        alignItems:
            'center',
        justifyContent:
            'center',
        paddingVertical: 40,
    },
    emptyIcon: {
        width: 82,
        height: 82,
        borderRadius: 41,
        backgroundColor:
            '#E6F7F5',
        alignItems:
            'center',
        justifyContent:
            'center',
    },
    emptyTitle: {
        marginTop: 18,
        fontSize: 19,
        fontWeight:
            '700',
        color:
            '#111827',
        textAlign:
            'center',
    },
    emptyDescription: {
        marginTop: 7,
        textAlign:
            'center',
        fontSize: 13,
        lineHeight: 20,
        color:
            '#6B7280',
        maxWidth: 280,
    },
    emptyButton: {
        marginTop: 20,
        height: 46,
        paddingHorizontal: 20,
        borderRadius: 12,
        backgroundColor:
            PRIMARY,
        flexDirection:
            'row',
        alignItems:
            'center',
        justifyContent:
            'center',
    },
    emptyButtonText: {
        color:
            '#FFFFFF',
        fontSize: 14,
        fontWeight:
            '700',
        marginLeft: 6,
    },
});