import React, {
    useEffect,
    useMemo,
    useState,
} from 'react';

import {
    SafeAreaView,
    FlatList,
    StyleSheet,
    View,
    Text,
    TouchableOpacity,
    ActivityIndicator,
} from 'react-native';

import {
    useApolloClient,
} from '@apollo/client';

import {
    useNavigation,
    useRoute,
} from '@react-navigation/native';

import SalonCard from './SalonCard';

import {
    GET_NEARBY_SALONS,
} from '../../../graphql/queries';

import {
    COLORS,
    SPACING,
} from '../../../constants/constants';

// ============================================================
// TYPES
// ============================================================

type ServiceAudience =
    | 'FEMALE'
    | 'MALE'
    | 'KIDS';

type NearbySalonService = {
    serviceId: string;
    name: string;
    category: string;
    categoryId?: string;
    subcategoryId?: string;
    subcategoryName?: string;
    audience?: ServiceAudience;
    price: number;
};

type Salon = {
    id: string;
    salonId: string;
    name: string;
    rating: number;
    reviews: number;
    distance: string;
    distanceValue: number;
    address: any;
    price?: number;
    image: string;
    salonStatus?:
    | 'OPEN'
    | 'CLOSED'
    | 'TEMPORARILY_CLOSED';
    businessHours?: any;
    minServicePrice?: number;
    matchingServices?: NearbySalonService[];
};

type SearchParams = {
    latitude: number;
    longitude: number;
    radius: number;

    search?: string;

    audience?: ServiceAudience[];

    categoryId?: string;

    category?: string;

    subcategoryIds?: string[];

    minPrice?: number;

    maxPrice?: number;

    budgetLabel?: string;

    location?: string;
};

// ============================================================
// COMPONENT
// ============================================================

export default function SalonSearchResults() {
    const client =
        useApolloClient();

    const navigation =
        useNavigation<any>();

    const route =
        useRoute<any>();

    const params =
        (route.params ||
            {}) as SearchParams;

    const [
        salons,
        setSalons,
    ] = useState<Salon[]>([]);

    const [
        loading,
        setLoading,
    ] = useState(true);

    const [
        errorMessage,
        setErrorMessage,
    ] = useState('');

    // ==========================================================
    // LOAD SALONS
    // ==========================================================

    const loadSalons =
        async () => {
            try {
                setLoading(true);
                setErrorMessage('');

                // ----------------------------------------------------
                // NORMALIZE
                // ----------------------------------------------------

                const latitude =
                    Number(
                        params.latitude,
                    );

                const longitude =
                    Number(
                        params.longitude,
                    );

                const radius =
                    Number(
                        params.radius || 10,
                    );

                const cleanSearch =
                    String(
                        params.search ||
                        '',
                    ).trim();

                const categoryId =
                    String(
                        params.categoryId ||
                        '',
                    ).trim();

                const subcategoryIds =
                    Array.from(
                        new Set(
                            Array.isArray(
                                params.subcategoryIds,
                            )
                                ? params.subcategoryIds
                                    .map(id =>
                                        String(
                                            id ?? '',
                                        ).trim(),
                                    )
                                    .filter(Boolean)
                                : [],
                        ),
                    );

                const audiences =
                    Array.from(
                        new Set(
                            Array.isArray(
                                params.audience,
                            )
                                ? params.audience.filter(
                                    audience =>
                                        audience ===
                                        'FEMALE' ||
                                        audience ===
                                        'MALE' ||
                                        audience ===
                                        'KIDS',
                                )
                                : [],
                        ),
                    );

                // ----------------------------------------------------
                // SEARCH MODE
                //
                // If customer searched text,
                // use search instead of category.
                // ----------------------------------------------------

                const finalSearch =
                    cleanSearch.length > 0
                        ? cleanSearch
                        : null;

                const finalCategoryId =
                    cleanSearch.length === 0 &&
                        categoryId.length > 0
                        ? categoryId
                        : null;

                const finalSubcategoryIds =
                    cleanSearch.length === 0 &&
                        subcategoryIds.length > 0
                        ? subcategoryIds
                        : null;

                // ----------------------------------------------------
                // PRICE
                // ----------------------------------------------------

                const hasPriceFilter =
                    cleanSearch.length === 0 &&
                    finalCategoryId !== null &&
                    params.minPrice != null;

                const minPrice =
                    hasPriceFilter
                        ? Number(
                            params.minPrice,
                        )
                        : null;

                const maxPrice =
                    hasPriceFilter &&
                        params.maxPrice != null
                        ? Number(
                            params.maxPrice,
                        )
                        : null;

                // ----------------------------------------------------
                // VALIDATE LOCATION
                // ----------------------------------------------------

                if (
                    !Number.isFinite(
                        latitude,
                    ) ||
                    !Number.isFinite(
                        longitude,
                    )
                ) {
                    setErrorMessage(
                        'Location is not available.',
                    );

                    setSalons([]);

                    return;
                }

                // ----------------------------------------------------
                // GRAPHQL VARIABLES
                // ----------------------------------------------------

                const variables = {
                    latitude,
                    longitude,

                    radius:
                        Number.isFinite(
                            radius,
                        )
                            ? radius
                            : 10,

                    search:
                        finalSearch,

                    audience:
                        audiences.length > 0
                            ? audiences
                            : null,

                    categoryId:
                        finalCategoryId,

                    subcategoryIds:
                        finalSubcategoryIds,

                    minPrice,

                    maxPrice,
                };

                console.log(
                    '========================================',
                );

                console.log(
                    '🔍 SALON RESULTS SEARCH',
                );

                console.log(
                    JSON.stringify(
                        variables,
                        null,
                        2,
                    ),
                );

                console.log(
                    '========================================',
                );

                // ----------------------------------------------------
                // API
                // ----------------------------------------------------

                const response =
                    await client.query({
                        query:
                            GET_NEARBY_SALONS,

                        variables,

                        fetchPolicy:
                            'network-only',
                    });

                const nearbySalons =
                    response?.data
                        ?.nearbySalons || [];

                // ----------------------------------------------------
                // FORMAT SALONS
                // ----------------------------------------------------

                const formatted: Salon[] =
                    nearbySalons.map(
                        (
                            item: any,
                        ) => {
                            const numericDistance =
                                Number(
                                    item?.distance ??
                                    0,
                                );

                            // ----------------------------------------------
                            // MATCHING SERVICES
                            // ----------------------------------------------

                            const matchingServices:
                                NearbySalonService[] =
                                Array.isArray(
                                    item?.matchingServices,
                                )
                                    ? item.matchingServices
                                        .map(
                                            (
                                                service: any,
                                            ) => ({
                                                serviceId:
                                                    String(
                                                        service?.serviceId ??
                                                        '',
                                                    ),

                                                name:
                                                    service?.name ??
                                                    '',

                                                category:
                                                    service?.category ??
                                                    service?.categoryName ??
                                                    '',

                                                categoryId:
                                                    service?.categoryId ??
                                                    undefined,

                                                subcategoryId:
                                                    service?.subcategoryId ??
                                                    undefined,

                                                subcategoryName:
                                                    service?.subcategoryName ??
                                                    undefined,

                                                audience:
                                                    service?.audience ??
                                                    undefined,

                                                price:
                                                    Number(
                                                        service?.price,
                                                    ),
                                            }),
                                        )
                                        .filter(
                                            (
                                                service: any,
                                            ) =>
                                                service.serviceId &&
                                                Number.isFinite(
                                                    service.price,
                                                ) &&
                                                service.price >= 0,
                                        )
                                    : [];

                            // ----------------------------------------------
                            // SERVICE PRICES
                            // ----------------------------------------------

                            const servicePrices =
                                matchingServices
                                    .map(
                                        service =>
                                            Number(
                                                service.price,
                                            ),
                                    )
                                    .filter(
                                        price =>
                                            Number.isFinite(
                                                price,
                                            ) &&
                                            price >= 0,
                                    );

                            // ----------------------------------------------
                            // BACKEND PRICES
                            // ----------------------------------------------

                            const backendPriceCandidates =
                                [
                                    item?.minServicePrice,
                                    item?.price,
                                    item?.servicePrice,
                                    item?.startingPrice,
                                    item?.minimumPrice,
                                ];

                            const backendPrices =
                                backendPriceCandidates
                                    .map(
                                        value =>
                                            Number(value),
                                    )
                                    .filter(
                                        price =>
                                            Number.isFinite(
                                                price,
                                            ) &&
                                            price >= 0,
                                    );

                            // ----------------------------------------------
                            // FINAL PRICE
                            // ----------------------------------------------

                            let minServicePrice:
                                | number
                                | undefined;

                            if (
                                servicePrices.length >
                                0
                            ) {
                                minServicePrice =
                                    Math.min(
                                        ...servicePrices,
                                    );
                            } else if (
                                backendPrices.length >
                                0
                            ) {
                                minServicePrice =
                                    Math.min(
                                        ...backendPrices,
                                    );
                            }

                            return {
                                id:
                                    String(
                                        item?.salonId ??
                                        '',
                                    ),

                                salonId:
                                    String(
                                        item?.salonId ??
                                        '',
                                    ),

                                name:
                                    item?.salonName ||
                                    'Salon',

                                rating:
                                    Number(
                                        item?.averageRating ??
                                        0,
                                    ),

                                reviews:
                                    Number(
                                        item?.totalReviews ??
                                        0,
                                    ),

                                distance:
                                    Number.isFinite(
                                        numericDistance,
                                    )
                                        ? numericDistance <
                                            1
                                            ? `${Math.round(
                                                numericDistance *
                                                1000,
                                            )} m`
                                            : `${numericDistance.toFixed(
                                                1,
                                            )} km`
                                        : '',

                                distanceValue:
                                    numericDistance,

                                address:
                                    item?.address ??
                                    {},

                                price:
                                    minServicePrice,

                                minServicePrice:
                                    minServicePrice,

                                matchingServices:
                                    matchingServices,

                                image:
                                    item?.logoUrl ||
                                    'https://picsum.photos/300/300',

                                salonStatus:
                                    item?.salonStatus,

                                businessHours:
                                    item?.businessHours,
                            };
                        },
                    );

                setSalons(
                    formatted,
                );
            } catch (
            error: any
            ) {
                console.log(
                    '❌ SALON RESULTS ERROR:',
                    error,
                );

                console.log(
                    '❌ MESSAGE:',
                    error?.message,
                );

                console.log(
                    '❌ GRAPHQL:',
                    error?.graphQLErrors,
                );

                setSalons([]);

                setErrorMessage(
                    'Unable to find salons right now. Please try again.',
                );
            } finally {
                setLoading(false);
            }
        };

    // ==========================================================
    // LOAD ON PAGE OPEN
    // ==========================================================

    useEffect(() => {
        loadSalons();
        // Search must execute only
        // when this page opens.
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    // ==========================================================
    // TITLE
    // ==========================================================

    const resultTitle =
        useMemo(() => {
            if (
                params.search?.trim()
            ) {
                return 'Search results';
            }

            if (
                params.category?.trim()
            ) {
                return params.category;
            }

            return 'Salons near you';
        }, [
            params.search,
            params.category,
        ]);

    // ==========================================================
    // AUDIENCE LABEL
    // ==========================================================

    const audienceLabel =
        useMemo(() => {
            return (
                params.audience
                    ?.map(
                        audience => {
                            if (
                                audience ===
                                'FEMALE'
                            ) {
                                return 'Female';
                            }

                            if (
                                audience ===
                                'MALE'
                            ) {
                                return 'Male';
                            }

                            return 'Kids';
                        },
                    )
                    .join(', ') ||
                'All'
            );
        }, [
            params.audience,
        ]);

    // ==========================================================
    // RENDER SALON
    // ==========================================================

    const renderSalon =
        ({
            item,
        }: {
            item: Salon;
        }) => {
            return (
                <SalonCard
                    salon={item}
                />
            );
        };

    // ==========================================================
    // RENDER
    // ==========================================================

    return (
        <SafeAreaView
            style={
                styles.container
            }
        >
            {/* ====================================================
          HEADER
      ==================================================== */}

            <View
                style={
                    styles.header
                }
            >
                <TouchableOpacity
                    style={
                        styles.backButton
                    }
                    onPress={() =>
                        navigation.goBack()
                    }
                    activeOpacity={
                        0.8
                    }
                >
                    <Text
                        style={
                            styles.backText
                        }
                    >
                        ‹
                    </Text>
                </TouchableOpacity>

                <View
                    style={
                        styles.headerCenter
                    }
                >
                    <Text
                        style={
                            styles.headerTitle
                        }
                        numberOfLines={1}
                    >
                        {resultTitle}
                    </Text>

                    <Text
                        style={
                            styles.headerLocation
                        }
                        numberOfLines={1}
                    >
                        {params.location ||
                            'Selected location'}
                    </Text>
                </View>

                <View
                    style={
                        styles.headerSpacer
                    }
                />
            </View>

            {/* ====================================================
          SEARCH SUMMARY
      ==================================================== */}

            <View
                style={
                    styles.summary
                }
            >
                <View
                    style={
                        styles.summaryItem
                    }
                >
                    <Text
                        style={
                            styles.summaryLabel
                        }
                    >
                        For
                    </Text>

                    <Text
                        style={
                            styles.summaryValue
                        }
                        numberOfLines={1}
                    >
                        {
                            audienceLabel
                        }
                    </Text>
                </View>

                <View
                    style={
                        styles.summaryDivider
                    }
                />

                <View
                    style={
                        styles.summaryItem
                    }
                >
                    <Text
                        style={
                            styles.summaryLabel
                        }
                    >
                        Distance
                    </Text>

                    <Text
                        style={
                            styles.summaryValue
                        }
                    >
                        {params.radius ||
                            10}{' '}
                        km
                    </Text>
                </View>

                {params.budgetLabel &&
                    params.budgetLabel !==
                    'Any' && (
                        <>
                            <View
                                style={
                                    styles.summaryDivider
                                }
                            />

                            <View
                                style={
                                    styles.summaryItem
                                }
                            >
                                <Text
                                    style={
                                        styles.summaryLabel
                                    }
                                >
                                    Budget
                                </Text>

                                <Text
                                    style={
                                        styles.summaryValue
                                    }
                                    numberOfLines={
                                        1
                                    }
                                >
                                    {
                                        params.budgetLabel
                                    }
                                </Text>
                            </View>
                        </>
                    )}
            </View>

            {/* ====================================================
          LIST
      ==================================================== */}

            <FlatList
                data={salons}
                keyExtractor={item =>
                    String(
                        item.id ||
                        item.salonId,
                    )
                }
                renderItem={
                    renderSalon
                }
                contentContainerStyle={[
                    styles.listContent,
                    salons.length === 0 &&
                    styles.emptyListContent,
                ]}
                showsVerticalScrollIndicator={
                    false
                }
                ListHeaderComponent={
                    loading ? null : (
                        <View
                            style={
                                styles.resultsHeader
                            }
                        >
                            <Text
                                style={
                                    styles.resultsTitle
                                }
                            >
                                {salons.length}{' '}
                                {salons.length ===
                                    1
                                    ? 'salon'
                                    : 'salons'}{' '}
                                found
                            </Text>

                            {params.search ? (
                                <Text
                                    style={
                                        styles.resultsSubtitle
                                    }
                                    numberOfLines={
                                        1
                                    }
                                >
                                    Search: "
                                    {
                                        params.search
                                    }
                                    "
                                </Text>
                            ) : params.category ? (
                                <Text
                                    style={
                                        styles.resultsSubtitle
                                    }
                                    numberOfLines={
                                        1
                                    }
                                >
                                    {
                                        params.category
                                    }
                                </Text>
                            ) : null}
                        </View>
                    )
                }
                ListEmptyComponent={
                    loading ? (
                        <View
                            style={
                                styles.loadingContainer
                            }
                        >
                            <ActivityIndicator
                                size="large"
                                color={
                                    COLORS.themeColor
                                }
                            />

                            <Text
                                style={
                                    styles.loadingTitle
                                }
                            >
                                Finding nearby salons
                            </Text>

                            <Text
                                style={
                                    styles.loadingText
                                }
                            >
                                Searching within{' '}
                                {params.radius ||
                                    10}{' '}
                                km
                            </Text>
                        </View>
                    ) : (
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
                                <Text
                                    style={
                                        styles.emptyIconText
                                    }
                                >
                                    ⌕
                                </Text>
                            </View>

                            <Text
                                style={
                                    styles.emptyTitle
                                }
                            >
                                No salons found
                            </Text>

                            <Text
                                style={
                                    styles.emptyText
                                }
                            >
                                {errorMessage ||
                                    'Try increasing the distance or changing your service selection.'}
                            </Text>

                            <TouchableOpacity
                                style={
                                    styles.changeSearchButton
                                }
                                onPress={() =>
                                    navigation.goBack()
                                }
                                activeOpacity={
                                    0.85
                                }
                            >
                                <Text
                                    style={
                                        styles.changeSearchText
                                    }
                                >
                                    Change search
                                </Text>
                            </TouchableOpacity>
                        </View>
                    )
                }
            />
        </SafeAreaView>
    );
}

// ============================================================
// STYLES
// ============================================================

const styles =
    StyleSheet.create({
        container: {
            flex: 1,
            backgroundColor:
                COLORS.background,
        },

        header: {
            minHeight: 68,
            backgroundColor:
                COLORS.themeColor,
            flexDirection:
                'row',
            alignItems:
                'center',
            paddingHorizontal:
                SPACING.xl,
        },

        backButton: {
            width: 42,
            height: 42,
            borderRadius: 21,
            alignItems:
                'center',
            justifyContent:
                'center',
            backgroundColor:
                COLORS.white,
        },

        backText: {
            color:
                COLORS.themeColor,
            fontSize: 34,
            fontWeight: '300',
            marginTop: -4,
        },

        headerCenter: {
            flex: 1,
            marginHorizontal: 12,
        },

        headerTitle: {
            color:
                COLORS.white,
            fontSize: 17,
            fontWeight: '700',
        },

        headerLocation: {
            marginTop: 2,
            color:
                COLORS.white,
            opacity: 0.75,
            fontSize: 10,
        },

        headerSpacer: {
            width: 42,
        },

        summary: {
            marginHorizontal:
                SPACING.xl,
            marginTop: 12,
            marginBottom: 5,
            minHeight: 62,
            borderRadius: 16,
            backgroundColor:
                COLORS.white,
            borderWidth: 1,
            borderColor:
                '#E6E6E6',
            flexDirection:
                'row',
            alignItems:
                'center',
            paddingHorizontal: 13,
        },

        summaryItem: {
            flex: 1,
        },

        summaryLabel: {
            color:
                COLORS.textMuted,
            fontSize: 9,
            fontWeight: '600',
            marginBottom: 3,
        },

        summaryValue: {
            color:
                COLORS.themeColor,
            fontSize: 11,
            fontWeight: '700',
        },

        summaryDivider: {
            width: 1,
            height: 28,
            backgroundColor:
                '#E5E5E5',
            marginHorizontal: 8,
        },

        resultsHeader: {
            marginHorizontal:
                SPACING.xl,
            marginTop: 16,
            marginBottom: 10,
        },

        resultsTitle: {
            color:
                COLORS.black,
            fontSize: 19,
            fontWeight: '700',
        },

        resultsSubtitle: {
            marginTop: 3,
            color:
                COLORS.textMuted,
            fontSize: 11,
        },

        listContent: {
            paddingBottom: 35,
        },

        emptyListContent: {
            flexGrow: 1,
        },

        loadingContainer: {
            flex: 1,
            alignItems:
                'center',
            justifyContent:
                'center',
            paddingHorizontal: 30,
            paddingTop: 100,
        },

        loadingTitle: {
            marginTop: 16,
            color:
                COLORS.black,
            fontSize: 16,
            fontWeight: '700',
        },

        loadingText: {
            marginTop: 5,
            color:
                COLORS.textMuted,
            fontSize: 12,
        },

        emptyContainer: {
            flex: 1,
            alignItems:
                'center',
            justifyContent:
                'center',
            paddingHorizontal: 35,
            paddingTop: 80,
        },

        emptyIcon: {
            width: 62,
            height: 62,
            borderRadius: 31,
            backgroundColor:
                COLORS.themeColor,
            alignItems:
                'center',
            justifyContent:
                'center',
        },

        emptyIconText: {
            color:
                COLORS.white,
            fontSize: 28,
        },

        emptyTitle: {
            marginTop: 18,
            color:
                COLORS.black,
            fontSize: 19,
            fontWeight: '700',
        },

        emptyText: {
            marginTop: 7,
            color:
                COLORS.textMuted,
            fontSize: 12,
            textAlign: 'center',
            lineHeight: 18,
        },

        changeSearchButton: {
            marginTop: 20,
            minHeight: 46,
            paddingHorizontal: 22,
            borderRadius: 13,
            backgroundColor:
                COLORS.themeColor,
            alignItems:
                'center',
            justifyContent:
                'center',
        },

        changeSearchText: {
            color:
                COLORS.white,
            fontSize: 13,
            fontWeight: '700',
        },
    });