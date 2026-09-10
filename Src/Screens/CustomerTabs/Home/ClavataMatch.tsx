import React, {
    useCallback,
    useEffect,
    useMemo,
    useState,
} from 'react';

import {
    SafeAreaView,
    View,
    Text,
    FlatList,
    StyleSheet,
    TouchableOpacity,
    ActivityIndicator,
    Image,
} from 'react-native';

import {
    useApolloClient,
} from '@apollo/client';

import {
    useNavigation,
    useRoute,
} from '@react-navigation/native';

import {
    GET_NEARBY_SALONS,
} from '../../../graphql/queries';

import {
    getActiveLocation,
    getCurrentLocation,
    LocationData,
} from '../../../services/locationStorage';

import {
    DEFAULT_LOCATION_RADIUS,
    USE_HARDCODED_LOCATION,
} from '../../../services/locationConfig';

import {
    COLORS,
    SPACING,
} from '../../../constants/constants';


// ============================================================
// TYPES
// ============================================================

type NearbySalonService = {
    serviceId: string;
    name: string;
    category: string;
    price: number;
};


type ClavataSalon = {
    salonId: string;
    salonName: string;
    ownerName?: string;
    businessType?: string;

    address?: {
        addressLine?: string;
        city?: string;
        state?: string;
        pincode?: string;
    };

    latitude?: number;
    longitude?: number;

    distance: number;

    minServicePrice?: number;

    matchingServices: NearbySalonService[];

    logoUrl?: string;
    coverImageUrl?: string;
    galleryImages?: string[];

    salonStatus?: string;

    averageRating: number;
    totalReviews: number;

    totalAppointments?: number;
    totalCompletedAppointments?: number;

    isActive?: boolean;
    isVisible?: boolean;
    isDeleted?: boolean;

    clavataScore: number;

    ratingScore: number;
    distanceScore: number;
    budgetScore: number;
    serviceScore: number;

    reasons: string[];
};


// ============================================================
// RAW GRAPHQL TYPES
// ============================================================

type RawSalonService = {
    serviceId?: string | number | null;
    name?: string | null;
    category?: string | null;
    price?: number | string | null;
};


type RawSalon = {
    salonId?: string | number | null;
    salonName?: string | null;
    ownerName?: string | null;
    businessType?: string | null;

    address?: {
        addressLine?: string | null;
        city?: string | null;
        state?: string | null;
        pincode?: string | null;
    } | null;

    latitude?: number | string | null;
    longitude?: number | string | null;

    distance?: number | string | null;

    minServicePrice?: number | string | null;

    matchingServices?: RawSalonService[] | null;

    logoUrl?: string | null;
    coverImageUrl?: string | null;
    galleryImages?: string[] | null;

    salonStatus?: string | null;

    averageRating?: number | string | null;
    totalReviews?: number | string | null;

    totalAppointments?: number | string | null;
    totalCompletedAppointments?: number | string | null;

    isActive?: boolean | null;
    isVisible?: boolean | null;
    isDeleted?: boolean | null;
};


// ============================================================
// ROUTE PARAMS
// ============================================================

type ClavataRouteParams = {
    service?: string;
    location?: LocationData | null;
    minBudget?: number;
    maxBudget?: number;
    distance?: number;
};


// ============================================================
// CONSTANTS
// ============================================================

const DEFAULT_DISTANCE =
    DEFAULT_LOCATION_RADIUS;

const DEFAULT_RADIUS =
    DEFAULT_LOCATION_RADIUS;

const DEFAULT_MIN_BUDGET =
    0;

const DEFAULT_MAX_BUDGET =
    Infinity;


// ============================================================
// BAYESIAN RATING CONFIGURATION
// ============================================================

const BAYESIAN_PRIOR_RATING =
    4.2;

const BAYESIAN_MIN_REVIEWS =
    20;


// ============================================================
// HELPERS
// ============================================================

function safeNumber(
    value: unknown,
    fallback = 0,
): number {

    const number =
        Number(value);

    return Number.isFinite(number)
        ? number
        : fallback;
}


// ============================================================
// BAYESIAN RATING
// ============================================================

function calculateRatingScore(
    rating: number,
    reviews: number,
): number {

    const r =
        Math.max(
            0,
            Math.min(
                5,
                rating,
            ),
        );

    const v =
        Math.max(
            0,
            reviews,
        );

    const m =
        BAYESIAN_MIN_REVIEWS;

    const c =
        BAYESIAN_PRIOR_RATING;

    const totalReviews =
        v + m;

    if (totalReviews <= 0) {
        return c / 5;
    }

    const weightedRating =
        (
            (v / totalReviews) *
            r
        ) +
        (
            (m / totalReviews) *
            c
        );

    return (
        weightedRating /
        5
    );
}


// ============================================================
// DISTANCE SCORE
// ============================================================

function calculateDistanceScore(
    distance: number,
    radius: number,
): number {

    if (
        !Number.isFinite(distance)
    ) {
        return 0;
    }

    if (
        distance <= 0
    ) {
        return 1;
    }

    const safeRadius =
        radius > 0
            ? radius
            : DEFAULT_RADIUS;

    if (
        distance >= safeRadius
    ) {
        return 0;
    }

    return Math.max(
        0,
        1 -
        (
            distance /
            safeRadius
        ),
    );
}


// ============================================================
// BUDGET SCORE
// ============================================================

function calculateBudgetScore(
    price: number | undefined,
    minBudget: number,
    maxBudget: number,
): number {

    /*
     * No budget selected.
     */
    if (
        minBudget <= 0 &&
        maxBudget === Infinity
    ) {
        return 1;
    }

    /*
     * Unknown price.
     */
    if (
        price === undefined ||
        !Number.isFinite(price)
    ) {
        return 0.35;
    }

    /*
     * Inside budget.
     */
    if (
        price >= minBudget &&
        price <= maxBudget
    ) {

        if (
            maxBudget !== Infinity &&
            maxBudget > minBudget
        ) {

            const range =
                maxBudget -
                minBudget;

            const position =
                (
                    price -
                    minBudget
                ) /
                range;

            return (
                1 -
                (
                    position *
                    0.20
                )
            );
        }

        return 1;
    }

    /*
     * Below minimum.
     */
    if (
        price < minBudget
    ) {

        if (
            minBudget === 0
        ) {
            return 1;
        }

        const difference =
            minBudget -
            price;

        const tolerance =
            Math.max(
                100,
                minBudget * 0.5,
            );

        return Math.max(
            0.75,
            1 -
            (
                difference /
                tolerance
            ) *
            0.25,
        );
    }

    /*
     * Above maximum.
     */
    if (
        maxBudget !== Infinity &&
        price > maxBudget
    ) {

        const difference =
            price -
            maxBudget;

        const tolerance =
            Math.max(
                100,
                maxBudget * 0.5,
            );

        return Math.max(
            0,
            1 -
            (
                difference /
                tolerance
            ),
        );
    }

    return 0;
}


// ============================================================
// SERVICE SCORE
// ============================================================

function calculateServiceScore(
    services: NearbySalonService[],
    requestedService: string,
): number {

    const cleanRequested =
        String(
            requestedService ?? '',
        )
            .trim()
            .toLowerCase();

    /*
     * No service selected.
     */
    if (
        !cleanRequested
    ) {
        return 1;
    }

    /*
     * No services returned.
     */
    if (
        !Array.isArray(services) ||
        services.length === 0
    ) {
        return 0;
    }

    const exactMatch =
        services.some(
            (
                service: NearbySalonService,
            ): boolean => {

                const serviceName =
                    String(
                        service?.name ?? '',
                    )
                        .trim()
                        .toLowerCase();

                const category =
                    String(
                        service?.category ?? '',
                    )
                        .trim()
                        .toLowerCase();

                return (
                    serviceName === cleanRequested ||
                    category === cleanRequested ||
                    serviceName.includes(cleanRequested) ||
                    cleanRequested.includes(serviceName) ||
                    category.includes(cleanRequested) ||
                    cleanRequested.includes(category)
                );
            },
        );

    return exactMatch
        ? 1
        : 0;
}


// ============================================================
// PRICE
// ============================================================

function getMinimumServicePrice(
    salon: {
        matchingServices?: NearbySalonService[];
        minServicePrice?: number;
    },
): number | undefined {

    const servicePrices =
        Array.isArray(
            salon?.matchingServices,
        )
            ? salon.matchingServices
                .map(
                    (
                        service: NearbySalonService,
                    ): number =>
                        Number(
                            service?.price,
                        ),
                )
                .filter(
                    (
                        price: number,
                    ): boolean =>
                        Number.isFinite(
                            price,
                        ) &&
                        price >= 0,
                )
            : [];

    if (
        servicePrices.length > 0
    ) {

        return Math.min(
            ...servicePrices,
        );
    }

    const backendPrice =
        Number(
            salon?.minServicePrice,
        );

    if (
        Number.isFinite(
            backendPrice,
        ) &&
        backendPrice >= 0
    ) {

        return backendPrice;
    }

    return undefined;
}


// ============================================================
// FORMAT DISTANCE
// ============================================================

function formatDistance(
    distance: number,
): string {

    if (
        distance < 1
    ) {

        return `${Math.round(
            distance * 1000,
        )} m`;
    }

    return `${distance.toFixed(
        1,
    )} km`;
}


// ============================================================
// CLAVATA REASONS
// ============================================================

function buildReasons(
    ratingScore: number,
    distanceScore: number,
    budgetScore: number,
    serviceScore: number,
    rating: number,
    reviews: number,
    distance: number,
    price: number | undefined,
    requestedService: string,
): string[] {

    const reasons: string[] = [];

    if (
        serviceScore >= 1 &&
        requestedService.trim()
    ) {

        reasons.push(
            'Matches your service',
        );
    }

    if (
        ratingScore >= 0.88 &&
        reviews >= 20
    ) {

        reasons.push(
            'Highly rated',
        );

    } else if (
        rating >= 4.5 &&
        reviews > 0
    ) {

        reasons.push(
            'Great reviews',
        );
    }

    if (
        distanceScore >= 0.75
    ) {

        reasons.push(
            'Very close to you',
        );

    } else if (
        distanceScore >= 0.5
    ) {

        reasons.push(
            'Nearby',
        );
    }

    if (
        budgetScore >= 0.95 &&
        price !== undefined
    ) {

        reasons.push(
            'Fits your budget',
        );
    }

    if (
        reasons.length === 0
    ) {

        reasons.push(
            'Good overall match',
        );
    }

    return reasons.slice(
        0,
        3,
    );
}


// ============================================================
// COMPONENT
// ============================================================

export default function ClavataMatch() {

    const client =
        useApolloClient();

    const navigation =
        useNavigation<any>();

    const route =
        useRoute<any>();


    const params:
        ClavataRouteParams =
        route?.params ?? {};


    // ==========================================================
    // PARAMETERS
    // ==========================================================

    const requestedService =
        String(
            params?.service ?? '',
        ).trim();


    const requestedLocation =
        params?.location ??
        null;


    const minBudget =
        Number.isFinite(
            Number(
                params?.minBudget,
            ),
        )
            ? Number(
                params?.minBudget,
            )
            : DEFAULT_MIN_BUDGET;


    const maxBudget =
        params?.maxBudget ===
            Infinity
            ? Infinity
            : Number.isFinite(
                Number(
                    params?.maxBudget,
                ),
            )
                ? Number(
                    params?.maxBudget,
                )
                : DEFAULT_MAX_BUDGET;


    const requestedDistance =
        Number.isFinite(
            Number(
                params?.distance,
            ),
        )
            ? Number(
                params?.distance,
            )
            : DEFAULT_DISTANCE;


    // ==========================================================
    // STATE
    // ==========================================================

    const [
        salons,
        setSalons,
    ] =
        useState<ClavataSalon[]>(
            [],
        );


    const [
        loading,
        setLoading,
    ] =
        useState(true);


    const [
        error,
        setError,
    ] =
        useState<string | null>(
            null,
        );


    const [
        location,
        setLocation,
    ] =
        useState<LocationData | null>(
            requestedLocation,
        );


    // ==========================================================
    // GET LOCATION
    // ==========================================================

    const resolveLocation =
        useCallback(
            async (): Promise<LocationData | null> => {

                if (
                    location?.latitude != null &&
                    location?.longitude != null
                ) {

                    return location;
                }

                try {

                    if (
                        USE_HARDCODED_LOCATION
                    ) {

                        const saved =
                            await getActiveLocation();

                        if (
                            saved &&
                            saved.latitude != null &&
                            saved.longitude != null
                        ) {

                            return saved;
                        }
                    }


                    const saved =
                        await getActiveLocation();

                    if (
                        saved &&
                        saved.latitude != null &&
                        saved.longitude != null
                    ) {

                        return saved;
                    }


                    const current =
                        await getCurrentLocation();

                    if (
                        current &&
                        current.latitude != null &&
                        current.longitude != null
                    ) {

                        return current;
                    }


                    return null;

                } catch (
                    locationError: unknown
                ) {

                    console.log(
                        '❌ CLAVATA LOCATION ERROR:',
                        locationError,
                    );

                    return null;
                }
            },
            [
                location,
            ],
        );


    // ==========================================================
    // FETCH
    // ==========================================================

    const fetchMatches =
        useCallback(
            async () => {

                try {

                    setLoading(true);

                    setError(null);


                    const activeLocation =
                        await resolveLocation();


                    if (
                        !activeLocation ||
                        activeLocation.latitude == null ||
                        activeLocation.longitude == null
                    ) {

                        setError(
                            'We need your location to find the best salons nearby.',
                        );

                        setSalons([]);

                        return;
                    }


                    setLocation(
                        activeLocation,
                    );


                    const latitude =
                        Number(
                            activeLocation.latitude,
                        );


                    const longitude =
                        Number(
                            activeLocation.longitude,
                        );


                    // ==================================================
                    // GRAPHQL VARIABLES
                    // ==================================================

                    const variables = {

                        latitude,

                        longitude,

                        radius:
                            requestedDistance > 0
                                ? requestedDistance
                                : DEFAULT_RADIUS,

                        search:
                            null,

                        category:
                            requestedService ||
                            null,

                        minPrice:
                            null,

                        maxPrice:
                            null,
                    };


                    console.log(
                        '========================================',
                    );

                    console.log(
                        '✦ CLAVATA MATCH',
                    );

                    console.log(
                        '📍 Latitude:',
                        latitude,
                    );

                    console.log(
                        '📍 Longitude:',
                        longitude,
                    );

                    console.log(
                        '💇 Service:',
                        requestedService ||
                        'Any',
                    );

                    console.log(
                        '💰 Budget:',
                        minBudget,
                        '-',
                        maxBudget,
                    );

                    console.log(
                        '📏 Radius:',
                        requestedDistance,
                    );

                    console.log(
                        '========================================',
                    );


                    // ==================================================
                    // GRAPHQL QUERY
                    // ==================================================

                    const {
                        data,
                    } =
                        await client.query({
                            query:
                                GET_NEARBY_SALONS,

                            variables,

                            fetchPolicy:
                                'network-only',
                        });


                    const nearby =
                        Array.isArray(
                            data?.nearbySalons,
                        )
                            ? (
                                data.nearbySalons as RawSalon[]
                            )
                            : [];


                    console.log(
                        '🏪 CLAVATA CANDIDATES:',
                        nearby.length,
                    );


                    // ==================================================
                    // FORMAT + SCORE
                    // ==================================================

                    const scored:
                        ClavataSalon[] =
                        nearby
                            .map(
                                (
                                    item: RawSalon,
                                ): ClavataSalon => {

                                    // ----------------------------------
                                    // DISTANCE
                                    // ----------------------------------

                                    const distance =
                                        safeNumber(
                                            item?.distance,
                                            requestedDistance,
                                        );


                                    // ----------------------------------
                                    // RATING
                                    // ----------------------------------

                                    const rating =
                                        safeNumber(
                                            item?.averageRating,
                                            0,
                                        );


                                    // ----------------------------------
                                    // REVIEWS
                                    // ----------------------------------

                                    const reviews =
                                        Math.max(
                                            0,
                                            Math.round(
                                                safeNumber(
                                                    item?.totalReviews,
                                                    0,
                                                ),
                                            ),
                                        );


                                    // ----------------------------------
                                    // SERVICES
                                    // ----------------------------------

                                    const matchingServices:
                                        NearbySalonService[] =
                                        Array.isArray(
                                            item?.matchingServices,
                                        )
                                            ? item.matchingServices
                                                .map(
                                                    (
                                                        service: RawSalonService,
                                                    ): NearbySalonService => ({
                                                        serviceId:
                                                            String(
                                                                service?.serviceId ??
                                                                '',
                                                            ),

                                                        name:
                                                            String(
                                                                service?.name ??
                                                                '',
                                                            ),

                                                        category:
                                                            String(
                                                                service?.category ??
                                                                '',
                                                            ),

                                                        price:
                                                            safeNumber(
                                                                service?.price,
                                                                0,
                                                            ),
                                                    }),
                                                )
                                                .filter(
                                                    (
                                                        service: NearbySalonService,
                                                    ): boolean =>
                                                        Boolean(
                                                            service.serviceId,
                                                        ) &&
                                                        Number.isFinite(
                                                            service.price,
                                                        ),
                                                )
                                            : [];


                                    // ----------------------------------
                                    // PRICE
                                    // ----------------------------------

                                    const price =
                                        getMinimumServicePrice({
                                            matchingServices,
                                            minServicePrice:
                                                safeNumber(
                                                    item?.minServicePrice,
                                                    NaN,
                                                ),
                                        });


                                    // ----------------------------------
                                    // SCORES
                                    // ----------------------------------

                                    const ratingScore =
                                        calculateRatingScore(
                                            rating,
                                            reviews,
                                        );


                                    const distanceScore =
                                        calculateDistanceScore(
                                            distance,
                                            requestedDistance,
                                        );


                                    const budgetScore =
                                        calculateBudgetScore(
                                            price,
                                            minBudget,
                                            maxBudget,
                                        );


                                    const serviceScore =
                                        calculateServiceScore(
                                            matchingServices,
                                            requestedService,
                                        );


                                    // ----------------------------------
                                    // WEIGHTS
                                    // ----------------------------------

                                    let ratingWeight =
                                        0.35;

                                    let distanceWeight =
                                        0.25;

                                    let budgetWeight =
                                        0.20;

                                    let serviceWeight =
                                        0.20;


                                    if (
                                        !requestedService
                                    ) {

                                        ratingWeight =
                                            0.43;

                                        distanceWeight =
                                            0.32;

                                        budgetWeight =
                                            0.25;

                                        serviceWeight =
                                            0;
                                    }


                                    // ----------------------------------
                                    // FINAL SCORE
                                    // ----------------------------------

                                    const clavataScore =
                                        (
                                            ratingScore *
                                            ratingWeight
                                        ) +
                                        (
                                            distanceScore *
                                            distanceWeight
                                        ) +
                                        (
                                            budgetScore *
                                            budgetWeight
                                        ) +
                                        (
                                            serviceScore *
                                            serviceWeight
                                        );


                                    // ----------------------------------
                                    // REASONS
                                    // ----------------------------------

                                    const reasons =
                                        buildReasons(
                                            ratingScore,
                                            distanceScore,
                                            budgetScore,
                                            serviceScore,
                                            rating,
                                            reviews,
                                            distance,
                                            price,
                                            requestedService,
                                        );


                                    // ----------------------------------
                                    // RETURN SALON
                                    // ----------------------------------

                                    return {

                                        salonId:
                                            String(
                                                item?.salonId ??
                                                '',
                                            ),

                                        salonName:
                                            String(
                                                item?.salonName ??
                                                'Salon',
                                            ),

                                        ownerName:
                                            item?.ownerName ??
                                            undefined,

                                        businessType:
                                            item?.businessType ??
                                            undefined,

                                      address:
    item?.address
        ? {
            addressLine:
                item.address.addressLine ??
                undefined,

            city:
                item.address.city ??
                undefined,

            state:
                item.address.state ??
                undefined,

            pincode:
                item.address.pincode ??
                undefined,
        }
        : undefined,

                                        latitude:
                                            item?.latitude != null
                                                ? safeNumber(
                                                    item.latitude,
                                                    0,
                                                )
                                                : undefined,

                                        longitude:
                                            item?.longitude != null
                                                ? safeNumber(
                                                    item.longitude,
                                                    0,
                                                )
                                                : undefined,

                                        distance,

                                        minServicePrice:
                                            price,

                                        matchingServices,

                                        logoUrl:
                                            item?.logoUrl ??
                                            undefined,

                                        coverImageUrl:
                                            item?.coverImageUrl ??
                                            undefined,

                                        galleryImages:
                                            Array.isArray(
                                                item?.galleryImages,
                                            )
                                                ? item.galleryImages
                                                : [],

                                        salonStatus:
                                            item?.salonStatus ??
                                            undefined,

                                        averageRating:
                                            rating,

                                        totalReviews:
                                            reviews,

                                        totalAppointments:
                                            item?.totalAppointments != null
                                                ? safeNumber(
                                                    item.totalAppointments,
                                                    0,
                                                )
                                                : undefined,

                                        totalCompletedAppointments:
                                            item?.totalCompletedAppointments != null
                                                ? safeNumber(
                                                    item.totalCompletedAppointments,
                                                    0,
                                                )
                                                : undefined,

                                        isActive:
                                            item?.isActive ??
                                            undefined,

                                        isVisible:
                                            item?.isVisible ??
                                            undefined,

                                        isDeleted:
                                            item?.isDeleted ??
                                            undefined,

                                        clavataScore,

                                        ratingScore,

                                        distanceScore,

                                        budgetScore,

                                        serviceScore,

                                        reasons,
                                    };
                                },
                            )

                            // ==================================================
                            // FILTER
                            // ==================================================

                            .filter(
                                (
                                    salon: ClavataSalon,
                                ): boolean =>
                                    Boolean(
                                        salon.salonId,
                                    ) &&
                                    salon.isDeleted !== true &&
                                    salon.isActive !== false &&
                                    salon.isVisible !== false &&
                                    salon.salonStatus !==
                                    'TEMPORARILY_CLOSED',
                            )

                            // ==================================================
                            // SORT
                            // ==================================================

                            .sort(
                                (
                                    a: ClavataSalon,
                                    b: ClavataSalon,
                                ): number =>
                                    b.clavataScore -
                                    a.clavataScore,
                            );


                    // ==================================================
                    // DEBUG RANKING
                    // ==================================================

                    console.log(
                        '========================================',
                    );

                    console.log(
                        '✦ CLAVATA RANKING',
                    );


                    scored.forEach(
                        (
                            salon: ClavataSalon,
                            index: number,
                        ): void => {

                            console.log(
                                `${index + 1}. ${salon.salonName}`,
                                {
                                    score:
                                        Number(
                                            salon.clavataScore.toFixed(
                                                4,
                                            ),
                                        ),

                                    rating:
                                        salon.averageRating,

                                    reviews:
                                        salon.totalReviews,

                                    distance:
                                        salon.distance,

                                    price:
                                        salon.minServicePrice,

                                    reasons:
                                        salon.reasons,
                                },
                            );
                        },
                    );


                    console.log(
                        '========================================',
                    );


                    setSalons(
                        scored,
                    );

                } catch (
                    fetchError: unknown
                ) {

                    console.log(
                        '❌ CLAVATA ERROR:',
                        fetchError,
                    );

                    if (
                        fetchError instanceof Error
                    ) {

                        console.log(
                            '❌ MESSAGE:',
                            fetchError.message,
                        );
                    }


                    setError(
                        'We could not find the best salons right now.',
                    );

                    setSalons([]);

                } finally {

                    setLoading(false);
                }

            },
            [
                client,
                resolveLocation,
                requestedDistance,
                requestedService,
                minBudget,
                maxBudget,
            ],
        );


    // ==========================================================
    // LOAD
    // ==========================================================

    useEffect(
        () => {

            fetchMatches();

        },
        [
            fetchMatches,
        ],
    );


    // ==========================================================
    // HEADER
    // ==========================================================

    const headerText =
        useMemo(
            () => {

                if (
                    requestedService
                ) {

                    return `Best ${requestedService} matches`;
                }

                return 'Best salons for you';

            },
            [
                requestedService,
            ],
        );


    // ==========================================================
    // OPEN SALON
    // ==========================================================

    const openSalon =
        (
            salon: ClavataSalon,
        ): void => {

            navigation.navigate(
                'SalonDetails',
                {
                    salonId:
                        salon.salonId,
                },
            );
        };


    // ==========================================================
    // RENDER SALON
    // ==========================================================

    const renderSalon =
        ({
            item,
            index,
        }: {
            item: ClavataSalon;
            index: number;
        }) => {

            const image =
                item.logoUrl ||
                item.coverImageUrl ||
                item.galleryImages?.[0] ||
                'https://picsum.photos/600/400';


            return (

                <TouchableOpacity
                    style={
                        styles.card
                    }
                    activeOpacity={
                        0.92
                    }
                    onPress={() =>
                        openSalon(
                            item,
                        )
                    }
                >

                    {/* ==================================================
                        IMAGE
                    ================================================== */}

                    <View
                        style={
                            styles.imageContainer
                        }
                    >

                        <Image
                            source={{
                                uri:
                                    image,
                            }}
                            style={
                                styles.image
                            }
                            resizeMode="cover"
                        />


                        {/* RANK */}

                        <View
                            style={
                                styles.rankBadge
                            }
                        >

                            <Text
                                style={
                                    styles.rankText
                                }
                            >
                                {index === 0
                                    ? '✦ BEST MATCH'
                                    : `#${index + 1}`}
                            </Text>

                        </View>


                        {/* SCORE */}

                        <View
                            style={
                                styles.scoreBadge
                            }
                        >

                            <Text
                                style={
                                    styles.scoreText
                                }
                            >
                                {Math.round(
                                    item.clavataScore *
                                    100,
                                )}%
                            </Text>

                            <Text
                                style={
                                    styles.scoreLabel
                                }
                            >
                                match
                            </Text>

                        </View>

                    </View>


                    {/* ==================================================
                        BODY
                    ================================================== */}

                    <View
                        style={
                            styles.cardBody
                        }
                    >

                        <View
                            style={
                                styles.nameRow
                            }
                        >

                            <Text
                                style={
                                    styles.salonName
                                }
                                numberOfLines={
                                    1
                                }
                            >
                                {
                                    item.salonName
                                }
                            </Text>


                            {item.salonStatus ===
                                'OPEN' && (

                                <View
                                    style={
                                        styles.openBadge
                                    }
                                >

                                    <Text
                                        style={
                                            styles.openBadgeText
                                        }
                                    >
                                        Open
                                    </Text>

                                </View>

                            )}

                        </View>


                        {/* RATING */}

                        <View
                            style={
                                styles.ratingRow
                            }
                        >

                            <Text
                                style={
                                    styles.star
                                }
                            >
                                ★
                            </Text>

                            <Text
                                style={
                                    styles.rating
                                }
                            >
                                {item.averageRating.toFixed(
                                    1,
                                )}
                            </Text>

                            <Text
                                style={
                                    styles.reviewCount
                                }
                            >
                                (
                                {
                                    item.totalReviews
                                } reviews)
                            </Text>

                            <Text
                                style={
                                    styles.dot
                                }
                            >
                                ·
                            </Text>

                            <Text
                                style={
                                    styles.distance
                                }
                            >
                                {formatDistance(
                                    item.distance,
                                )}
                            </Text>

                        </View>


                        {/* PRICE */}

                        <View
                            style={
                                styles.priceRow
                            }
                        >

                            <Text
                                style={
                                    styles.priceLabel
                                }
                            >
                                From
                            </Text>

                            <Text
                                style={
                                    styles.price
                                }
                            >
                                {item.minServicePrice !==
                                    undefined
                                    ? `₹${Math.round(
                                        item.minServicePrice,
                                    )}`
                                    : 'Price on request'}
                            </Text>

                        </View>


                        {/* ==================================================
                            REASONS
                        ================================================== */}

                        <View
                            style={
                                styles.reasons
                            }
                        >

                            {item.reasons.map(
                                (
                                    reason: string,
                                ) => (

                                    <View
                                        key={
                                            reason
                                        }
                                        style={
                                            styles.reason
                                        }
                                    >

                                        <Text
                                            style={
                                                styles.check
                                            }
                                        >
                                            ✓
                                        </Text>

                                        <Text
                                            style={
                                                styles.reasonText
                                            }
                                        >
                                            {reason}
                                        </Text>

                                    </View>

                                ),
                            )}

                        </View>


                        {/* ==================================================
                            SERVICE
                        ================================================== */}

                        {item.matchingServices
                            .length > 0 && (

                            <View
                                style={
                                    styles.serviceRow
                                }
                            >

                                <Text
                                    style={
                                        styles.serviceLabel
                                    }
                                >
                                    Service
                                </Text>

                                <Text
                                    style={
                                        styles.serviceName
                                    }
                                    numberOfLines={
                                        1
                                    }
                                >
                                    {
                                        item
                                            .matchingServices[0]
                                            ?.name
                                    }
                                </Text>

                            </View>

                        )}


                        {/* ==================================================
                            ACTION
                        ================================================== */}

                        <View
                            style={
                                styles.viewButton
                            }
                        >

                            <Text
                                style={
                                    styles.viewButtonText
                                }
                            >
                                View salon
                            </Text>

                            <Text
                                style={
                                    styles.arrow
                                }
                            >
                                →
                            </Text>

                        </View>

                    </View>

                </TouchableOpacity>

            );
        };


    // ==========================================================
    // LOADING
    // ==========================================================

    if (
        loading
    ) {

        return (

            <SafeAreaView
                style={
                    styles.container
                }
            >

                <View
                    style={
                        styles.loadingScreen
                    }
                >

                    <View
                        style={
                            styles.loadingIcon
                        }
                    >

                        <Text
                            style={
                                styles.loadingIconText
                            }
                        >
                            ✦
                        </Text>

                    </View>


                    <Text
                        style={
                            styles.loadingTitle
                        }
                    >
                        Clavata is choosing
                    </Text>


                    <Text
                        style={
                            styles.loadingText
                        }
                    >
                        Comparing nearby salons, ratings,
                        services and prices...
                    </Text>


                    <ActivityIndicator
                        size="small"
                        color={
                            COLORS.black
                        }
                        style={
                            styles.loader
                        }
                    />

                </View>

            </SafeAreaView>

        );
    }


    // ==========================================================
    // ERROR
    // ==========================================================

    if (
        error
    ) {

        return (

            <SafeAreaView
                style={
                    styles.container
                }
            >

                <View
                    style={
                        styles.errorScreen
                    }
                >

                    <Text
                        style={
                            styles.errorIcon
                        }
                    >
                        ✦
                    </Text>


                    <Text
                        style={
                            styles.errorTitle
                        }
                    >
                        Clavata needs your location
                    </Text>


                    <Text
                        style={
                            styles.errorText
                        }
                    >
                        {error}
                    </Text>


                    <TouchableOpacity
                        style={
                            styles.primaryButton
                        }
                        onPress={
                            fetchMatches
                        }
                    >

                        <Text
                            style={
                                styles.primaryButtonText
                            }
                        >
                            Try again
                        </Text>

                    </TouchableOpacity>


                    <TouchableOpacity
                        style={
                            styles.backButton
                        }
                        onPress={() =>
                            navigation.goBack()
                        }
                    >

                        <Text
                            style={
                                styles.backButtonText
                            }
                        >
                            Go back
                        </Text>

                    </TouchableOpacity>

                </View>

            </SafeAreaView>

        );
    }


    // ==========================================================
    // MAIN
    // ==========================================================

    return (

        <SafeAreaView
            style={
                styles.container
            }
        >

            <FlatList
                data={
                    salons
                }

                keyExtractor={(
                    item: ClavataSalon,
                ): string =>
                    item.salonId
                }

                renderItem={
                    renderSalon
                }

                showsVerticalScrollIndicator={
                    false
                }

                contentContainerStyle={
                    styles.listContent
                }

                // ==================================================
                // HEADER
                // ==================================================

                ListHeaderComponent={

                    <View
                        style={
                            styles.header
                        }
                    >

                        {/* BACK */}

                        <TouchableOpacity
                            style={
                                styles.backTopButton
                            }
                            onPress={() =>
                                navigation.goBack()
                            }
                        >

                            <Text
                                style={
                                    styles.backTopText
                                }
                            >
                                ‹
                            </Text>

                        </TouchableOpacity>


                        {/* TITLE */}

                        <View
                            style={
                                styles.headerTextWrap
                            }
                        >

                            <View
                                style={
                                    styles.clavataTitleRow
                                }
                            >

                                <Text
                                    style={
                                        styles.clavataSymbol
                                    }
                                >
                                    ✦
                                </Text>

                                <Text
                                    style={
                                        styles.clavataSmallTitle
                                    }
                                >
                                    CLAVATA
                                </Text>

                            </View>


                            <Text
                                style={
                                    styles.title
                                }
                            >
                                {headerText}
                            </Text>


                            <Text
                                style={
                                    styles.subtitle
                                }
                            >
                                Ranked using ratings, reviews,
                                distance, service and value.
                            </Text>

                        </View>

                    </View>
                }


                // ==================================================
                // FOOTER
                // ==================================================

                ListFooterComponent={

                    <View
                        style={
                            styles.footer
                        }
                    >

                        <Text
                            style={
                                styles.footerTitle
                            }
                        >
                            How Clavata chooses
                        </Text>


                        <Text
                            style={
                                styles.footerText
                            }
                        >
                            We balance salon quality with
                            proximity, service availability
                            and value. A small number of
                            reviews does not automatically
                            make a salon the best choice.
                        </Text>

                    </View>
                }


                // ==================================================
                // EMPTY
                // ==================================================

                ListEmptyComponent={

                    <View
                        style={
                            styles.empty
                        }
                    >

                        <Text
                            style={
                                styles.emptyIcon
                            }
                        >
                            ✦
                        </Text>


                        <Text
                            style={
                                styles.emptyTitle
                            }
                        >
                            No strong matches found
                        </Text>


                        <Text
                            style={
                                styles.emptyText
                            }
                        >
                            Try increasing the distance or
                            relaxing your budget.
                        </Text>


                        <TouchableOpacity
                            style={
                                styles.primaryButton
                            }
                            onPress={() =>
                                navigation.goBack()
                            }
                        >

                            <Text
                                style={
                                    styles.primaryButtonText
                                }
                            >
                                Adjust filters
                            </Text>

                        </TouchableOpacity>

                    </View>
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

        listContent: {
            paddingBottom:
                40,
        },


        // --------------------------------------------------------
        // HEADER
        // --------------------------------------------------------

        header: {
            paddingHorizontal:
                SPACING.xl,
            paddingTop:
                12,
            paddingBottom:
                22,
            flexDirection:
                'row',
        },

        backTopButton: {
            width: 42,
            height: 42,
            borderRadius:
                21,
            backgroundColor:
                COLORS.white,
            alignItems:
                'center',
            justifyContent:
                'center',
            marginRight:
                12,
        },

        backTopText: {
            fontSize:
                32,
            color:
                COLORS.black,
            fontWeight:
                '300',
            marginTop:
                -3,
        },

        headerTextWrap: {
            flex: 1,
        },

        clavataTitleRow: {
            flexDirection:
                'row',
            alignItems:
                'center',
            marginBottom:
                5,
        },

        clavataSymbol: {
            fontSize:
                14,
            color:
                COLORS.black,
            marginRight:
                5,
        },

        clavataSmallTitle: {
            fontSize:
                10,
            color:
                COLORS.textMuted,
            fontWeight:
                '800',
            letterSpacing:
                1.5,
        },

        title: {
            fontSize:
                25,
            color:
                COLORS.black,
            fontWeight:
                '800',
            letterSpacing:
                -0.6,
        },

        subtitle: {
            marginTop:
                6,
            fontSize:
                12,
            lineHeight:
                18,
            color:
                COLORS.textSecondary,
        },


        // --------------------------------------------------------
        // CARD
        // --------------------------------------------------------

        card: {
            marginHorizontal:
                SPACING.xl,
            marginBottom:
                16,
            backgroundColor:
                COLORS.white,
            borderRadius:
                20,
            overflow:
                'hidden',
            borderWidth:
                1,
            borderColor:
                '#E9E9E9',
        },

        imageContainer: {
            height:
                190,
            position:
                'relative',
            backgroundColor:
                '#F2F2F2',
        },

        image: {
            width:
                '100%',
            height:
                '100%',
        },

        rankBadge: {
            position:
                'absolute',
            left:
                12,
            top:
                12,
            backgroundColor:
                COLORS.black,
            borderRadius:
                14,
            paddingHorizontal:
                11,
            height:
                29,
            alignItems:
                'center',
            justifyContent:
                'center',
        },

        rankText: {
            color:
                COLORS.white,
            fontSize:
                9,
            fontWeight:
                '800',
            letterSpacing:
                0.5,
        },

        scoreBadge: {
            position:
                'absolute',
            right:
                12,
            top:
                12,
            width:
                48,
            height:
                48,
            borderRadius:
                24,
            backgroundColor:
                COLORS.white,
            alignItems:
                'center',
            justifyContent:
                'center',
        },

        scoreText: {
            fontSize:
                13,
            color:
                COLORS.black,
            fontWeight:
                '800',
        },

        scoreLabel: {
            fontSize:
                8,
            color:
                COLORS.textMuted,
            marginTop:
                -1,
        },

        cardBody: {
            padding:
                16,
        },

        nameRow: {
            flexDirection:
                'row',
            alignItems:
                'center',
        },

        salonName: {
            flex: 1,
            fontSize:
                19,
            color:
                COLORS.black,
            fontWeight:
                '800',
        },

        openBadge: {
            marginLeft:
                8,
            paddingHorizontal:
                8,
            height:
                23,
            borderRadius:
                12,
            backgroundColor:
                '#F1F1F1',
            justifyContent:
                'center',
        },

        openBadgeText: {
            fontSize:
                9,
            color:
                COLORS.black,
            fontWeight:
                '700',
        },

        ratingRow: {
            flexDirection:
                'row',
            alignItems:
                'center',
            marginTop:
                7,
        },

        star: {
            fontSize:
                13,
            color:
                COLORS.black,
        },

        rating: {
            marginLeft:
                4,
            fontSize:
                13,
            color:
                COLORS.black,
            fontWeight:
                '700',
        },

        reviewCount: {
            marginLeft:
                3,
            fontSize:
                12,
            color:
                COLORS.textMuted,
        },

        dot: {
            marginHorizontal:
                6,
            fontSize:
                12,
            color:
                COLORS.textMuted,
        },

        distance: {
            fontSize:
                12,
            color:
                COLORS.textSecondary,
            fontWeight:
                '600',
        },

        priceRow: {
            flexDirection:
                'row',
            alignItems:
                'baseline',
            marginTop:
                12,
        },

        priceLabel: {
            fontSize:
                11,
            color:
                COLORS.textMuted,
            marginRight:
                5,
        },

        price: {
            fontSize:
                15,
            color:
                COLORS.black,
            fontWeight:
                '800',
        },


        // --------------------------------------------------------
        // REASONS
        // --------------------------------------------------------

        reasons: {
            marginTop:
                14,
            gap:
                7,
        },

        reason: {
            flexDirection:
                'row',
            alignItems:
                'center',
        },

        check: {
            width:
                19,
            height:
                19,
            borderRadius:
                10,
            backgroundColor:
                '#F2F2F2',
            textAlign:
                'center',
            lineHeight:
                19,
            fontSize:
                11,
            color:
                COLORS.black,
            fontWeight:
                '800',
        },

        reasonText: {
            marginLeft:
                7,
            fontSize:
                12,
            color:
                COLORS.textSecondary,
            fontWeight:
                '600',
        },


        // --------------------------------------------------------
        // SERVICE
        // --------------------------------------------------------

        serviceRow: {
            marginTop:
                14,
            paddingTop:
                12,
            borderTopWidth:
                1,
            borderTopColor:
                '#EEEEEE',
            flexDirection:
                'row',
            alignItems:
                'center',
        },

        serviceLabel: {
            fontSize:
                10,
            color:
                COLORS.textMuted,
            fontWeight:
                '700',
            marginRight:
                8,
        },

        serviceName: {
            flex: 1,
            fontSize:
                12,
            color:
                COLORS.black,
            fontWeight:
                '700',
        },


        // --------------------------------------------------------
        // BUTTON
        // --------------------------------------------------------

        viewButton: {
            marginTop:
                15,
            height:
                46,
            borderRadius:
                13,
            backgroundColor:
                COLORS.black,
            flexDirection:
                'row',
            alignItems:
                'center',
            justifyContent:
                'center',
        },

        viewButtonText: {
            color:
                COLORS.white,
            fontSize:
                13,
            fontWeight:
                '800',
        },

        arrow: {
            marginLeft:
                8,
            color:
                COLORS.white,
            fontSize:
                18,
            fontWeight:
                '300',
        },


        // --------------------------------------------------------
        // LOADING
        // --------------------------------------------------------

        loadingScreen: {
            flex: 1,
            alignItems:
                'center',
            justifyContent:
                'center',
            paddingHorizontal:
                45,
        },

        loadingIcon: {
            width:
                66,
            height:
                66,
            borderRadius:
                33,
            backgroundColor:
                COLORS.black,
            alignItems:
                'center',
            justifyContent:
                'center',
            marginBottom:
                20,
        },

        loadingIconText: {
            color:
                COLORS.white,
            fontSize:
                27,
        },

        loadingTitle: {
            fontSize:
                22,
            color:
                COLORS.black,
            fontWeight:
                '800',
            textAlign:
                'center',
        },

        loadingText: {
            marginTop:
                8,
            fontSize:
                13,
            lineHeight:
                20,
            color:
                COLORS.textSecondary,
            textAlign:
                'center',
        },

        loader: {
            marginTop:
                25,
        },


        // --------------------------------------------------------
        // ERROR
        // --------------------------------------------------------

        errorScreen: {
            flex: 1,
            alignItems:
                'center',
            justifyContent:
                'center',
            paddingHorizontal:
                35,
        },

        errorIcon: {
            fontSize:
                38,
            color:
                COLORS.black,
        },

        errorTitle: {
            marginTop:
                15,
            fontSize:
                20,
            color:
                COLORS.black,
            fontWeight:
                '800',
            textAlign:
                'center',
        },

        errorText: {
            marginTop:
                8,
            fontSize:
                13,
            lineHeight:
                19,
            color:
                COLORS.textSecondary,
            textAlign:
                'center',
        },

        primaryButton: {
            marginTop:
                20,
            height:
                48,
            paddingHorizontal:
                25,
            borderRadius:
                14,
            backgroundColor:
                COLORS.themeColor,
            alignItems:
                'center',
            justifyContent:
                'center',
        },

        primaryButtonText: {
            color:
                COLORS.white,
            fontSize:
                13,
            fontWeight:
                '800',
        },

        backButton: {
            marginTop:
                10,
            height:
                42,
            paddingHorizontal:
                20,
            justifyContent:
                'center',
        },

        backButtonText: {
            color:
                COLORS.black,
            fontSize:
                13,
            fontWeight:
                '600',
        },


        // --------------------------------------------------------
        // EMPTY
        // --------------------------------------------------------

        empty: {
            alignItems:
                'center',
            paddingHorizontal:
                35,
            paddingTop:
                60,
        },

        emptyIcon: {
            fontSize:
                38,
            color:
                COLORS.black,
        },

        emptyTitle: {
            marginTop:
                15,
            fontSize:
                19,
            color:
                COLORS.black,
            fontWeight:
                '800',
            textAlign:
                'center',
        },

        emptyText: {
            marginTop:
                7,
            fontSize:
                13,
            lineHeight:
                19,
            color:
                COLORS.textSecondary,
            textAlign:
                'center',
        },


        // --------------------------------------------------------
        // FOOTER
        // --------------------------------------------------------

        footer: {
            marginHorizontal:
                SPACING.xl,
            marginTop:
                8,
            padding:
                16,
            borderRadius:
                16,
            backgroundColor:
                '#F5F5F5',
        },

        footerTitle: {
            fontSize:
                13,
            color:
                COLORS.black,
            fontWeight:
                '800',
        },

        footerText: {
            marginTop:
                5,
            fontSize:
                11,
            lineHeight:
                17,
            color:
                COLORS.textSecondary,
        },

    });