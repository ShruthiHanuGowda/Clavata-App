import React, {
    useEffect,
    useMemo,
    useState,
} from 'react';

import {
    SafeAreaView,
    View,
    Text,
    StyleSheet,
    Image,
    TouchableOpacity,
    FlatList,
    ActivityIndicator,
    Alert,
    Modal,
    Pressable,
} from 'react-native';

import {
    useQuery,
    useMutation,
} from '@apollo/client';

import { useUser } from '../../../context/UserContext';

import {
    GET_SALON,
    LIST_SERVICES,
    ADD_FAVORITE_SALON,
    REMOVE_FAVORITE_SALON,
    IS_FAVORITE_SALON,
} from '../../../graphql/queries';

const PRIMARY = '#009D94';

type Props = {
    navigation: any;
    route: any;
};

type Service = {
    serviceId: string;
    salonId?: string;

    name: string;

    categoryId?: string;
    categoryName?: string;

    subcategoryId?: string;
    subcategoryName?: string;

    description?: string | null;

    duration?: number | null;
    durationMinutes?: number | null;

    price?: number | null;

    audience?: string | null;

    popular?: boolean | null;
    active?: boolean | null;

    createdAt?: string;
    updatedAt?: string;
    updatedBy?: string;
};

type BusinessDay = {
    open?: string;
    close?: string;
    isOpen?: boolean;
};

type BusinessHours = {
    MONDAY?: BusinessDay;
    TUESDAY?: BusinessDay;
    WEDNESDAY?: BusinessDay;
    THURSDAY?: BusinessDay;
    FRIDAY?: BusinessDay;
    SATURDAY?: BusinessDay;
    SUNDAY?: BusinessDay;
};

type SalonMedia = {
    imageId?: string;
    salonId?: string;
    mediaType?: string;
    key?: string;
    objectUrl?: string | null;
    status?: string;
    uploadedAt?: string;
    approvedAt?: string;
    approvedBy?: string;
    rejectedAt?: string;
    rejectedBy?: string;
    rejectionReason?: string;
};

type Salon = {
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

    logoUrl?: string;
    coverImageUrl?: string;
    galleryImages?: string[];

    logoMedia?: SalonMedia | null;
    coverMedia?: SalonMedia | null;
    galleryMedia?: SalonMedia[];

    averageRating?: number;
    totalReviews?: number;

    salonStatus?: string;

    MONDAY?: BusinessDay;
    TUESDAY?: BusinessDay;
    WEDNESDAY?: BusinessDay;
    THURSDAY?: BusinessDay;
    FRIDAY?: BusinessDay;
    SATURDAY?: BusinessDay;
    SUNDAY?: BusinessDay;

    businessHours?: BusinessHours;
};

type Offer = {
    offerId: string;
    salonId: string;
    salonName?: string;
    title: string;
    description?: string;

    discountType:
        | 'PERCENTAGE'
        | 'FIXED'
        | string;

    discountValue: number;

    couponCode?: string | null;

    minimumBookingAmount?:
        | number
        | null;

    category?: string | null;

    serviceIds: string[];

    startDate?: string;
    endDate?: string;

    status?: string;
};

type CategoryGroup = {
    key: string;
    name: string;
    subcategories: SubcategoryGroup[];
};

type SubcategoryGroup = {
    key: string;
    name: string;
    services: Service[];
};

type AudienceOption = {
    key: string;
    name: string;
};

const AUDIENCE_OPTIONS: AudienceOption[] = [
    {
        key: 'FEMALE',
        name: 'Female',
    },
    {
        key: 'MALE',
        name: 'Male',
    },
    {
        key: 'KIDS',
        name: 'Kids',
    },
];

export default function SalonDetailsScreen({
    navigation,
    route,
}: Props) {
    const { currentUser } = useUser();

    /**
     * ----------------------------------------------------
     * RESOLVE SALON ID
     * ----------------------------------------------------
     */
    const salonId = useMemo(() => {
        const routeSalonId =
            route?.params?.salonId;

        const routeId =
            route?.params?.id;

        const nestedSalonId =
            route?.params?.salon?.salonId;

        const nestedSalonLegacyId =
            route?.params?.salon?.id;

        const resolved =
            routeSalonId ||
            routeId ||
            nestedSalonId ||
            nestedSalonLegacyId ||
            null;

        return resolved
            ? String(resolved)
            : null;
    }, [
        route?.params?.salonId,
        route?.params?.id,
        route?.params?.salon?.salonId,
        route?.params?.salon?.id,
    ]);

    /**
     * ----------------------------------------------------
     * DEBUG ROUTE
     * ----------------------------------------------------
     */
    useEffect(() => {
        console.log(
            '======================================',
        );

        console.log(
            '[SalonDetails] ROUTE PARAMS:',
            route?.params,
        );

        console.log(
            '[SalonDetails] RESOLVED SALON ID:',
            salonId,
        );

        console.log(
            '======================================',
        );
    }, [
        route?.params,
        salonId,
    ]);

    /**
     * ----------------------------------------------------
     * OFFER FROM PREVIOUS SCREEN
     * ----------------------------------------------------
     */
    const routeOffer =
        route?.params?.offer ?? null;

    const routeOfferId =
        route?.params?.offerId ??
        routeOffer?.offerId ??
        routeOffer?.id ??
        null;

    /**
     * ----------------------------------------------------
     * SELECTED SERVICES
     * ----------------------------------------------------
     */
    const [
        selectedServices,
        setSelectedServices,
    ] = useState<Service[]>([]);

    /**
     * ----------------------------------------------------
     * SELECTED SERVICES PANEL
     * ----------------------------------------------------
     */
    const [
        selectedServicesVisible,
        setSelectedServicesVisible,
    ] = useState(false);

    /**
     * ----------------------------------------------------
     * SELECTED AUDIENCE
     * ----------------------------------------------------
     */
    const [
        selectedAudience,
        setSelectedAudience,
    ] = useState<string | null>(
        null,
    );

    /**
     * ----------------------------------------------------
     * SELECTED CATEGORY
     * ----------------------------------------------------
     */
    const [
        selectedCategory,
        setSelectedCategory,
    ] = useState<string | null>(
        null,
    );

    /**
     * ----------------------------------------------------
     * FAVORITE LOCAL STATE
     * ----------------------------------------------------
     */
    const [
        isFavorite,
        setIsFavorite,
    ] = useState(false);

    const [
        favoriteLoading,
        setFavoriteLoading,
    ] = useState(false);

    /**
     * ----------------------------------------------------
     * MEDIA LOAD STATES
     * ----------------------------------------------------
     */
    const [
        coverLoadFailed,
        setCoverLoadFailed,
    ] = useState(false);

    const [
        galleryLoadFailed,
        setGalleryLoadFailed,
    ] = useState<Record<string, boolean>>({});

    /**
     * ----------------------------------------------------
     * GET SALON
     * ----------------------------------------------------
     */
    const {
        data: salonData,
        loading: salonLoading,
        error: salonError,
        refetch: refetchSalon,
    } = useQuery(GET_SALON, {
        variables: {
            salonId,
        },

        skip: !salonId,

        fetchPolicy: 'network-only',

        notifyOnNetworkStatusChange: true,

        errorPolicy: 'all',
    });

    /**
     * ----------------------------------------------------
     * GET SERVICES
     * ----------------------------------------------------
     */
    const {
        data: servicesData,
        loading: servicesLoading,
        error: servicesError,
        refetch: refetchServices,
    } = useQuery(LIST_SERVICES, {
        variables: {
            salonId,
        },

        skip: !salonId,

        fetchPolicy: 'network-only',

        notifyOnNetworkStatusChange: true,

        errorPolicy: 'all',
    });

    /**
     * ----------------------------------------------------
     * DEBUG GRAPHQL
     * ----------------------------------------------------
     */
    useEffect(() => {
        if (!salonId) {
            return;
        }

        console.log(
            '[SalonDetails] GET_SALON salonId:',
            salonId,
        );
    }, [salonId]);

    useEffect(() => {
        if (salonError) {
            console.error(
                '======================================',
            );

            console.error(
                '[SalonDetails] GET_SALON ERROR:',
                salonError?.message,
            );

            console.error(
                '[SalonDetails] GET_SALON GRAPHQL ERRORS:',
                salonError?.graphQLErrors,
            );

            console.error(
                '[SalonDetails] GET_SALON NETWORK ERROR:',
                salonError?.networkError,
            );

            console.error(
                '======================================',
            );
        }
    }, [salonError]);

    useEffect(() => {
        if (servicesError) {
            console.error(
                '======================================',
            );

            console.error(
                '[SalonDetails] LIST_SERVICES ERROR:',
                servicesError?.message,
            );

            console.error(
                '[SalonDetails] LIST_SERVICES GRAPHQL ERRORS:',
                servicesError?.graphQLErrors,
            );

            console.error(
                '[SalonDetails] LIST_SERVICES NETWORK ERROR:',
                servicesError?.networkError,
            );

            console.error(
                '======================================',
            );
        }
    }, [servicesError]);

    /**
     * ----------------------------------------------------
     * SALON
     * ----------------------------------------------------
     */
    const salon: Salon | null =
        salonData?.getSalon ?? null;

    /**
     * ----------------------------------------------------
     * SERVICES
     * ----------------------------------------------------
     */
    const services: Service[] = useMemo(() => {
        const rawServices =
            servicesData?.listServices;

        if (!Array.isArray(rawServices)) {
            return [];
        }

        return rawServices.filter(
            (service: Service) =>
                service?.active !== false,
        );
    }, [servicesData]);

    /**
     * ----------------------------------------------------
     * APPROVED COVER
     * ----------------------------------------------------
     */
    const approvedCover =
        salon?.coverMedia?.status ===
            'APPROVED' &&
        salon?.coverMedia?.objectUrl
            ? salon.coverMedia.objectUrl
            : null;

    /**
     * ----------------------------------------------------
     * APPROVED GALLERY
     * ----------------------------------------------------
     */
    const approvedGallery =
        useMemo(() => {
            if (
                !Array.isArray(
                    salon?.galleryMedia,
                )
            ) {
                return [];
            }

            return salon.galleryMedia.filter(
                media =>
                    String(
                        media?.status || '',
                    ).toUpperCase() ===
                        'APPROVED' &&
                    Boolean(
                        media?.objectUrl,
                    ),
            );
        }, [
            salon?.galleryMedia,
        ]);

    /**
     * ----------------------------------------------------
     * RESET MEDIA STATES
     * ----------------------------------------------------
     */
    useEffect(() => {
        setCoverLoadFailed(false);
        setGalleryLoadFailed({});
    }, [
        salon?.salonId,
        approvedCover,
        approvedGallery,
    ]);

    /**
     * ----------------------------------------------------
     * NORMALIZE OFFER
     * ----------------------------------------------------
     */
    const normalizedOffer:
        | Offer
        | null = useMemo(() => {
            if (!routeOffer) {
                return null;
            }

            return {
                ...routeOffer,

                discountValue: Number(
                    routeOffer.discountValue || 0,
                ),

                minimumBookingAmount:
                    routeOffer.minimumBookingAmount !==
                        null &&
                    routeOffer.minimumBookingAmount !==
                        undefined
                        ? Number(
                            routeOffer.minimumBookingAmount,
                        )
                        : null,

                serviceIds:
                    Array.isArray(
                        routeOffer.serviceIds,
                    )
                        ? routeOffer.serviceIds
                        : [],
            };
        }, [routeOffer]);

    /**
     * ----------------------------------------------------
     * OFFER VALIDITY
     * ----------------------------------------------------
     */
    const isOfferValid =
        useMemo(() => {
            if (!normalizedOffer) {
                return false;
            }

            if (
                normalizedOffer.status &&
                String(
                    normalizedOffer.status,
                ).toUpperCase() !== 'ACTIVE'
            ) {
                return false;
            }

            const now = new Date();

            if (
                normalizedOffer.startDate
            ) {
                const startDate =
                    new Date(
                        normalizedOffer.startDate,
                    );

                if (
                    !Number.isNaN(
                        startDate.getTime(),
                    ) &&
                    now < startDate
                ) {
                    return false;
                }
            }

            if (
                normalizedOffer.endDate
            ) {
                const endDate =
                    new Date(
                        normalizedOffer.endDate,
                    );

                if (
                    !Number.isNaN(
                        endDate.getTime(),
                    ) &&
                    now > endDate
                ) {
                    return false;
                }
            }

            return true;
        }, [normalizedOffer]);

    /**
     * ----------------------------------------------------
     * CHECK SERVICE OFFER ELIGIBILITY
     * ----------------------------------------------------
     */
    const isServiceEligibleForOffer = (
        service: Service,
    ): boolean => {
        if (
            !normalizedOffer ||
            !isOfferValid
        ) {
            return false;
        }

        const serviceIds =
            normalizedOffer.serviceIds ||
            [];

        if (
            serviceIds.length > 0
        ) {
            return serviceIds.includes(
                service.serviceId,
            );
        }

        if (
            normalizedOffer.category &&
            normalizedOffer.category.trim()
        ) {
            const offerCategory =
                String(
                    normalizedOffer.category,
                )
                    .trim()
                    .toLowerCase();

            const categoryId =
                String(
                    service.categoryId ||
                        '',
                )
                    .trim()
                    .toLowerCase();

            const categoryName =
                String(
                    service.categoryName ||
                        '',
                )
                    .trim()
                    .toLowerCase();

            return (
                offerCategory ===
                    categoryId ||
                offerCategory ===
                    categoryName
            );
        }

        return true;
    };

    /**
     * ----------------------------------------------------
     * FAVORITE STATUS
     * ----------------------------------------------------
     */
    const {
        data: favoriteData,
        loading:
            favoriteStatusLoading,
        refetch:
            refetchFavoriteStatus,
    } = useQuery(
        IS_FAVORITE_SALON,
        {
            variables: {
                userId:
                    currentUser?.userId ??
                    '',
                salonId,
            },

            skip:
                !currentUser?.userId ||
                !salonId,

            fetchPolicy:
                'network-only',

            notifyOnNetworkStatusChange:
                true,
        },
    );

    /**
     * ----------------------------------------------------
     * SYNC FAVORITE
     * ----------------------------------------------------
     */
    useEffect(() => {
        if (
            favoriteData &&
            favoriteData.isFavoriteSalon !==
                undefined
        ) {
            setIsFavorite(
                favoriteData.isFavoriteSalon ===
                    true,
            );
        }
    }, [favoriteData]);

    /**
     * ----------------------------------------------------
     * FAVORITE MUTATIONS
     * ----------------------------------------------------
     */
    const [addFavorite] =
        useMutation(
            ADD_FAVORITE_SALON,
        );

    const [removeFavorite] =
        useMutation(
            REMOVE_FAVORITE_SALON,
        );

    /**
     * ----------------------------------------------------
     * TOGGLE FAVORITE
     * ----------------------------------------------------
     */
    const handleFavorite =
        async () => {
            if (
                !currentUser?.userId
            ) {
                Alert.alert(
                    'Login required',
                    'Please login to add salons to your favorites.',
                );

                return;
            }

            if (!salonId) {
                return;
            }

            if (favoriteLoading) {
                return;
            }

            const previousState =
                isFavorite;

            try {
                setFavoriteLoading(
                    true,
                );

                setIsFavorite(
                    !previousState,
                );

                if (
                    previousState
                ) {
                    const { data } =
                        await removeFavorite(
                            {
                                variables: {
                                    input: {
                                        userId:
                                            currentUser.userId,
                                        salonId,
                                    },
                                },
                            },
                        );

                    if (
                        !data
                            ?.removeFavoriteSalon
                            ?.success
                    ) {
                        setIsFavorite(
                            previousState,
                        );
                    }
                } else {
                    const { data } =
                        await addFavorite(
                            {
                                variables: {
                                    input: {
                                        userId:
                                            currentUser.userId,
                                        salonId,
                                    },
                                },
                            },
                        );

                    if (
                        !data
                            ?.addFavoriteSalon
                            ?.success
                    ) {
                        setIsFavorite(
                            previousState,
                        );
                    }
                }

                await refetchFavoriteStatus();
            } catch (error) {
                console.error(
                    '[SalonDetails] Favorite salon error:',
                    error,
                );

                setIsFavorite(
                    previousState,
                );
            } finally {
                setFavoriteLoading(
                    false,
                );
            }
        };

    /**
     * ----------------------------------------------------
     * AVAILABLE AUDIENCES
     * ----------------------------------------------------
     */
    const availableAudienceKeys =
        useMemo(() => {
            const keys =
                new Set<string>();

            services.forEach(
                service => {
                    const audience =
                        String(
                            service.audience ||
                                '',
                        )
                            .trim()
                            .toUpperCase();

                    if (audience) {
                        keys.add(
                            audience,
                        );
                    }
                },
            );

            return keys;
        }, [services]);

    /**
     * ----------------------------------------------------
     * RESET CATEGORY WHEN AUDIENCE CHANGES
     * ----------------------------------------------------
     */
    useEffect(() => {
        setSelectedCategory(
            null,
        );
    }, [selectedAudience]);

    /**
     * ----------------------------------------------------
     * SERVICES FOR SELECTED AUDIENCE
     * ----------------------------------------------------
     */
    const audienceServices =
        useMemo(() => {
            if (!selectedAudience) {
                return [];
            }

            return services.filter(
                service =>
                    String(
                        service.audience ||
                            '',
                    )
                        .trim()
                        .toUpperCase() ===
                    selectedAudience,
            );
        }, [
            services,
            selectedAudience,
        ]);

    /**
     * ----------------------------------------------------
     * CATEGORY FILTERS
     * ----------------------------------------------------
     */
    const categories =
        useMemo(() => {
            const categoryMap =
                new Map<
                    string,
                    string
                >();

            audienceServices.forEach(
                service => {
                    const key =
                        String(
                            service.categoryId ||
                                service.categoryName ||
                                '',
                        )
                            .trim()
                            .toLowerCase();

                    const name =
                        String(
                            service.categoryName ||
                                service.categoryId ||
                                '',
                        ).trim();

                    if (
                        key &&
                        name
                    ) {
                        if (
                            !categoryMap.has(
                                key,
                            )
                        ) {
                            categoryMap.set(
                                key,
                                name,
                            );
                        }
                    }
                },
            );

            return Array.from(
                categoryMap.entries(),
            )
                .map(
                    ([key, name]) => ({
                        key,
                        name,
                    }),
                )
                .sort(
                    (a, b) =>
                        a.name.localeCompare(
                            b.name,
                        ),
                );
        }, [
            audienceServices,
        ]);

    /**
     * ----------------------------------------------------
     * FILTERED SERVICES
     * ----------------------------------------------------
     */
    const filteredServices =
        useMemo(() => {
            if (!selectedAudience) {
                return [];
            }

            if (!selectedCategory) {
                return audienceServices;
            }

            return audienceServices.filter(
                service => {
                    const categoryId =
                        String(
                            service.categoryId ||
                                '',
                        )
                            .trim()
                            .toLowerCase();

                    const categoryName =
                        String(
                            service.categoryName ||
                                '',
                        )
                            .trim()
                            .toLowerCase();

                    return (
                        selectedCategory ===
                            categoryId ||
                        selectedCategory ===
                            categoryName
                    );
                },
            );
        }, [
            audienceServices,
            selectedAudience,
            selectedCategory,
        ]);

    /**
     * ----------------------------------------------------
     * BUILD CATEGORY → SUBCATEGORY → SERVICE HIERARCHY
     * ----------------------------------------------------
     */
    const serviceHierarchy =
        useMemo(() => {
            const categoryMap =
                new Map<
                    string,
                    {
                        key: string;
                        name: string;
                        subcategoryMap: Map<
                            string,
                            SubcategoryGroup
                        >;
                    }
                >();

            filteredServices.forEach(
                service => {
                    const categoryName =
                        String(
                            service.categoryName ||
                                service.categoryId ||
                                'Other',
                        ).trim();

                    const categoryId =
                        String(
                            service.categoryId ||
                                categoryName,
                        ).trim();

                    const categoryKey =
                        categoryId
                            .toLowerCase();

                    if (
                        !categoryMap.has(
                            categoryKey,
                        )
                    ) {
                        categoryMap.set(
                            categoryKey,
                            {
                                key:
                                    categoryKey,
                                name:
                                    categoryName,
                                subcategoryMap:
                                    new Map(),
                            },
                        );
                    }

                    const categoryGroup =
                        categoryMap.get(
                            categoryKey,
                        )!;

                    const subcategoryName =
                        String(
                            service.subcategoryName ||
                                service.subcategoryId ||
                                'Other',
                        ).trim();

                    const subcategoryId =
                        String(
                            service.subcategoryId ||
                                subcategoryName,
                        ).trim();

                    const subcategoryKey =
                        subcategoryId
                            .toLowerCase();

                    if (
                        !categoryGroup.subcategoryMap.has(
                            subcategoryKey,
                        )
                    ) {
                        categoryGroup.subcategoryMap.set(
                            subcategoryKey,
                            {
                                key:
                                    subcategoryKey,
                                name:
                                    subcategoryName,
                                services: [],
                            },
                        );
                    }

                    categoryGroup.subcategoryMap
                        .get(
                            subcategoryKey,
                        )!
                        .services.push(
                            service,
                        );
                },
            );

            const result: CategoryGroup[] =
                [];

            categoryMap.forEach(
                category => {
                    const subcategories =
                        Array.from(
                            category.subcategoryMap.values(),
                        )
                            .map(
                                subcategory => ({
                                    ...subcategory,
                                    services:
                                        [
                                            ...subcategory.services,
                                        ].sort(
                                            (
                                                a,
                                                b,
                                            ) =>
                                                a.name.localeCompare(
                                                    b.name,
                                                ),
                                        ),
                                }),
                            )
                            .sort(
                                (
                                    a,
                                    b,
                                ) =>
                                    a.name.localeCompare(
                                        b.name,
                                    ),
                            );

                    result.push({
                        key:
                            category.key,
                        name:
                            category.name,
                        subcategories,
                    });
                },
            );

            return result.sort(
                (a, b) =>
                    a.name.localeCompare(
                        b.name,
                    ),
            );
        }, [
            filteredServices,
        ]);

    /**
     * ----------------------------------------------------
     * SUBTOTAL
     * ----------------------------------------------------
     */
    const subtotal =
        useMemo(() => {
            return selectedServices.reduce(
                (
                    sum,
                    item,
                ) =>
                    sum +
                    Number(
                        item.price || 0,
                    ),
                0,
            );
        }, [selectedServices]);

    /**
     * ----------------------------------------------------
     * OFFER ELIGIBLE SUBTOTAL
     * ----------------------------------------------------
     */
    const eligibleSubtotal =
        useMemo(() => {
            return selectedServices.reduce(
                (
                    sum,
                    item,
                ) => {
                    if (
                        !isServiceEligibleForOffer(
                            item,
                        )
                    ) {
                        return sum;
                    }

                    return (
                        sum +
                        Number(
                            item.price || 0,
                        )
                    );
                },
                0,
            );
        }, [
            selectedServices,
            normalizedOffer,
            isOfferValid,
        ]);

    /**
     * ----------------------------------------------------
     * MINIMUM BOOKING AMOUNT
     * ----------------------------------------------------
     */
    const minimumBookingAmountMet =
        useMemo(() => {
            if (
                !normalizedOffer ||
                normalizedOffer.minimumBookingAmount ===
                    null ||
                normalizedOffer.minimumBookingAmount ===
                    undefined
            ) {
                return true;
            }

            return (
                subtotal >=
                Number(
                    normalizedOffer.minimumBookingAmount,
                )
            );
        }, [
            normalizedOffer,
            subtotal,
        ]);

    /**
     * ----------------------------------------------------
     * DISCOUNT
     * ----------------------------------------------------
     */
    const discountAmount =
        useMemo(() => {
            if (
                !normalizedOffer ||
                !isOfferValid ||
                !minimumBookingAmountMet ||
                eligibleSubtotal <= 0
            ) {
                return 0;
            }

            const discountValue =
                Number(
                    normalizedOffer.discountValue ||
                        0,
                );

            if (
                discountValue <= 0
            ) {
                return 0;
            }

            if (
                String(
                    normalizedOffer.discountType,
                ).toUpperCase() ===
                    'PERCENTAGE'
            ) {
                return Math.min(
                    eligibleSubtotal,
                    (
                        eligibleSubtotal *
                        discountValue
                    ) / 100,
                );
            }

            if (
                String(
                    normalizedOffer.discountType,
                ).toUpperCase() ===
                    'FIXED'
            ) {
                return Math.min(
                    eligibleSubtotal,
                    discountValue,
                );
            }

            return 0;
        }, [
            normalizedOffer,
            isOfferValid,
            minimumBookingAmountMet,
            eligibleSubtotal,
        ]);

    /**
     * ----------------------------------------------------
     * FINAL TOTAL
     * ----------------------------------------------------
     */
    const discountedServicesTotal =
        useMemo(() => {
            return Math.max(
                0,
                subtotal -
                    discountAmount,
            );
        }, [
            subtotal,
            discountAmount,
        ]);

    const offerApplied =
        Boolean(
            normalizedOffer &&
                isOfferValid &&
                minimumBookingAmountMet &&
                discountAmount > 0,
        );

    /**
     * ----------------------------------------------------
     * SERVICE DISPLAY PRICE
     * ----------------------------------------------------
     */
    const getServiceDisplayPrice =
        (
            service: Service,
        ): number => {
            const originalPrice =
                Number(
                    service.price || 0,
                );

            if (
                !offerApplied ||
                !isServiceEligibleForOffer(
                    service,
                )
            ) {
                return originalPrice;
            }

            const discountType =
                String(
                    normalizedOffer?.discountType ||
                        '',
                ).toUpperCase();

            if (
                discountType ===
                'PERCENTAGE'
            ) {
                const percentage =
                    Number(
                        normalizedOffer?.discountValue ||
                            0,
                    );

                const serviceDiscount =
                    (
                        originalPrice *
                        percentage
                    ) / 100;

                return Math.max(
                    0,
                    originalPrice -
                        serviceDiscount,
                );
            }

            if (
                discountType ===
                    'FIXED' &&
                eligibleSubtotal >
                    0
            ) {
                const serviceShare =
                    originalPrice /
                    eligibleSubtotal;

                const allocatedDiscount =
                    discountAmount *
                    serviceShare;

                return Math.max(
                    0,
                    originalPrice -
                        allocatedDiscount,
                );
            }

            return originalPrice;
        };

    /**
     * ----------------------------------------------------
     * OFFER TEXT
     * ----------------------------------------------------
     */
    const getOfferDiscountText =
        () => {
            if (
                !normalizedOffer
            ) {
                return '';
            }

            if (
                String(
                    normalizedOffer.discountType,
                ).toUpperCase() ===
                    'PERCENTAGE'
            ) {
                return `${normalizedOffer.discountValue}% OFF`;
            }

            if (
                String(
                    normalizedOffer.discountType,
                ).toUpperCase() ===
                    'FIXED'
            ) {
                return `₹${normalizedOffer.discountValue} OFF`;
            }

            return 'Offer Applied';
        };

    /**
     * ----------------------------------------------------
     * OFFER MESSAGE
     * ----------------------------------------------------
     */
    const offerMessage =
        useMemo(() => {
            if (
                !normalizedOffer
            ) {
                return null;
            }

            if (
                !isOfferValid
            ) {
                return 'This offer is no longer active.';
            }

            if (
                !minimumBookingAmountMet &&
                normalizedOffer.minimumBookingAmount !==
                    null &&
                normalizedOffer.minimumBookingAmount !==
                    undefined
            ) {
                const remaining =
                    Math.max(
                        0,
                        Number(
                            normalizedOffer.minimumBookingAmount,
                        ) -
                            subtotal,
                    );

                return `Add ₹${remaining.toFixed(
                    0,
                )} more to use this offer.`;
            }

            if (
                offerApplied
            ) {
                return `You save ₹${discountAmount.toFixed(
                    0,
                )} with this offer.`;
            }

            return null;
        }, [
            normalizedOffer,
            isOfferValid,
            minimumBookingAmountMet,
            subtotal,
            offerApplied,
            discountAmount,
        ]);

    /**
     * ----------------------------------------------------
     * TOTAL DURATION
     * ----------------------------------------------------
     */
    const totalDuration =
        selectedServices.reduce(
            (
                sum,
                item,
            ) =>
                sum +
                Number(
                    item.duration ??
                        item.durationMinutes ??
                        0,
                ),
            0,
        );

    /**
     * ----------------------------------------------------
     * BUSINESS HOURS
     * ----------------------------------------------------
     */
    const getBusinessDay =
        (
            day:
                | keyof BusinessHours,
        ): BusinessDay | undefined => {
            if (!salon) {
                return undefined;
            }

            const directDay =
                (
                    salon as any
                )?.[day];

            if (
                directDay &&
                typeof directDay ===
                    'object'
            ) {
                return directDay;
            }

            const nestedDay =
                salon.businessHours?.[
                    day
                ];

            if (
                nestedDay &&
                typeof nestedDay ===
                    'object'
            ) {
                return nestedDay;
            }

            return undefined;
        };

    /**
     * ----------------------------------------------------
     * CURRENT DAY
     * ----------------------------------------------------
     */
    const getCurrentDay =
        (): keyof BusinessHours => {
            const day =
                new Date().getDay();

            const days: (
                keyof BusinessHours
            )[] = [
                'SUNDAY',
                'MONDAY',
                'TUESDAY',
                'WEDNESDAY',
                'THURSDAY',
                'FRIDAY',
                'SATURDAY',
            ];

            return days[day];
        };

    const today =
        getCurrentDay();

    const todayHours =
        getBusinessDay(
            today,
        );

    /**
     * ----------------------------------------------------
     * PARSE TIME
     * ----------------------------------------------------
     */
    const parseTimeToMinutes =
        (
            time?: string,
        ): number => {
            if (!time) {
                return NaN;
            }

            const parts =
                String(time).split(
                    ':',
                );

            const hours =
                Number(
                    parts[0],
                );

            const minutes =
                Number(
                    parts[1] || 0,
                );

            if (
                Number.isNaN(
                    hours,
                ) ||
                Number.isNaN(
                    minutes,
                )
            ) {
                return NaN;
            }

            if (
                hours === 24
            ) {
                return 24 * 60;
            }

            return (
                hours * 60 +
                minutes
            );
        };

    /**
     * ----------------------------------------------------
     * CURRENT OPEN STATUS
     * ----------------------------------------------------
     */
    const getIsSalonOpen =
        (): boolean => {
            if (!todayHours) {
                return false;
            }

            if (
                todayHours.isOpen !==
                    true
            ) {
                return false;
            }

            if (
                !todayHours.open ||
                !todayHours.close
            ) {
                return false;
            }

            const now =
                new Date();

            const currentMinutes =
                now.getHours() *
                    60 +
                now.getMinutes();

            const openMinutes =
                parseTimeToMinutes(
                    todayHours.open,
                );

            const closeMinutes =
                parseTimeToMinutes(
                    todayHours.close,
                );

            if (
                Number.isNaN(
                    openMinutes,
                ) ||
                Number.isNaN(
                    closeMinutes,
                )
            ) {
                return false;
            }

            if (
                closeMinutes >
                openMinutes
            ) {
                return (
                    currentMinutes >=
                        openMinutes &&
                    currentMinutes <
                        closeMinutes
                );
            }

            if (
                closeMinutes <
                openMinutes
            ) {
                return (
                    currentMinutes >=
                        openMinutes ||
                    currentMinutes <
                        closeMinutes
                );
            }

            return false;
        };

    const isOpen =
        getIsSalonOpen();

    /**
     * ----------------------------------------------------
     * TOGGLE SERVICE
     * ----------------------------------------------------
     */
    const toggleService =
        (
            service: Service,
        ) => {
            const exists =
                selectedServices.some(
                    item =>
                        item.serviceId ===
                        service.serviceId,
                );

            if (exists) {
                setSelectedServices(
                    prev =>
                        prev.filter(
                            item =>
                                item.serviceId !==
                                service.serviceId,
                        ),
                );
            } else {
                setSelectedServices(
                    prev => [
                        ...prev,
                        service,
                    ],
                );
            }
        };

    /**
     * ----------------------------------------------------
     * REMOVE SERVICE
     * ----------------------------------------------------
     */
    const removeService =
        (
            serviceId: string,
        ) => {
            setSelectedServices(
                prev =>
                    prev.filter(
                        service =>
                            service.serviceId !==
                            serviceId,
                    ),
            );
        };

    /**
     * ----------------------------------------------------
     * CLEAR ALL SERVICES
     * ----------------------------------------------------
     */
    const clearAllServices =
        () => {
            if (
                selectedServices.length ===
                0
            ) {
                return;
            }

            Alert.alert(
                'Clear selected services?',
                'All selected services will be removed.',
                [
                    {
                        text: 'Cancel',
                        style: 'cancel',
                    },
                    {
                        text: 'Clear All',
                        style: 'destructive',
                        onPress: () =>
                            setSelectedServices(
                                [],
                            ),
                    },
                ],
            );
        };

    /**
     * ----------------------------------------------------
     * ADDRESS
     * ----------------------------------------------------
     */
    const address = [
        salon?.address
            ?.addressLine,
        salon?.address?.city,
        salon?.address?.state,
        salon?.address?.pincode,
    ]
        .filter(Boolean)
        .join(', ');

    const serviceQueryFailed =
        Boolean(servicesError);

    /**
     * ----------------------------------------------------
     * DEBUG
     * ----------------------------------------------------
     */
    console.log(
        '[SalonDetails] salonId:',
        salonId,
    );

    console.log(
        '[SalonDetails] salon:',
        salon,
    );

    console.log(
        '[SalonDetails] services:',
        services,
    );

    /**
     * ----------------------------------------------------
     * NO SALON ID
     * ----------------------------------------------------
     */
    if (!salonId) {
        return (
            <SafeAreaView
                style={
                    styles.loadingContainer
                }
            >
                <Text
                    style={
                        styles.errorTitle
                    }
                >
                    Salon unavailable
                </Text>

                <Text
                    style={
                        styles.errorText
                    }
                >
                    The salon ID was not provided.
                    Please go back and try again.
                </Text>

                <TouchableOpacity
                    style={
                        styles.retryButton
                    }
                    onPress={() =>
                        navigation.goBack()
                    }
                >
                    <Text
                        style={
                            styles.retryText
                        }
                    >
                        Go Back
                    </Text>
                </TouchableOpacity>
            </SafeAreaView>
        );
    }

    /**
     * ----------------------------------------------------
     * LOADING
     * ----------------------------------------------------
     */
    if (
        salonLoading &&
        !salon
    ) {
        return (
            <SafeAreaView
                style={
                    styles.loadingContainer
                }
            >
                <ActivityIndicator
                    size="large"
                    color={PRIMARY}
                />

                <Text
                    style={
                        styles.loadingText
                    }
                >
                    Loading salon...
                </Text>
            </SafeAreaView>
        );
    }

    /**
     * ----------------------------------------------------
     * SALON ERROR
     * ----------------------------------------------------
     */
    if (
        salonError &&
        !salon
    ) {
        return (
            <SafeAreaView
                style={
                    styles.loadingContainer
                }
            >
                <Text
                    style={
                        styles.errorTitle
                    }
                >
                    Unable to load salon
                </Text>

                <Text
                    style={
                        styles.errorText
                    }
                >
                    We could not load this salon.
                    Please try again.
                </Text>

                <Text
                    style={
                        styles.debugErrorText
                    }
                >
                    {salonError?.message ||
                        'Unknown error'}
                </Text>

                <TouchableOpacity
                    style={
                        styles.retryButton
                    }
                    onPress={() => {
                        refetchSalon();
                    }}
                >
                    <Text
                        style={
                            styles.retryText
                        }
                    >
                        Try Again
                    </Text>
                </TouchableOpacity>

                <TouchableOpacity
                    style={
                        styles.secondaryButton
                    }
                    onPress={() =>
                        navigation.goBack()
                    }
                >
                    <Text
                        style={
                            styles.secondaryButtonText
                        }
                    >
                        Go Back
                    </Text>
                </TouchableOpacity>
            </SafeAreaView>
        );
    }

    /**
     * ----------------------------------------------------
     * SALON NOT FOUND
     * ----------------------------------------------------
     */
    if (!salon) {
        return (
            <SafeAreaView
                style={
                    styles.loadingContainer
                }
            >
                <Text
                    style={
                        styles.errorTitle
                    }
                >
                    Salon not found
                </Text>

                <Text
                    style={
                        styles.errorText
                    }
                >
                    This salon may no longer be
                    available.
                </Text>

                <TouchableOpacity
                    style={
                        styles.retryButton
                    }
                    onPress={() =>
                        navigation.goBack()
                    }
                >
                    <Text
                        style={
                            styles.retryText
                        }
                    >
                        Go Back
                    </Text>
                </TouchableOpacity>
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView
            style={styles.container}
        >
            <FlatList
                data={serviceHierarchy}
                keyExtractor={item =>
                    item.key
                }
                showsVerticalScrollIndicator={
                    false
                }
                contentContainerStyle={{
                    paddingBottom:
                        selectedServices.length >
                            0
                            ? 145
                            : 30,
                }}
                ListHeaderComponent={
                    <>
                        {/* HEADER */}

                        <View
                            style={
                                styles.header
                            }
                        >
                            <TouchableOpacity
                                style={
                                    styles.headerButton
                                }
                                onPress={() =>
                                    navigation.goBack()
                                }
                            >
                                <Text
                                    style={
                                        styles.back
                                    }
                                >
                                    ‹
                                </Text>
                            </TouchableOpacity>

                            <Text
                                style={
                                    styles.headerTitle
                                }
                                numberOfLines={
                                    1
                                }
                            >
                                {
                                    salon.salonName
                                }
                            </Text>

                            <TouchableOpacity
                                style={
                                    styles.headerButton
                                }
                                activeOpacity={
                                    0.8
                                }
                                disabled={
                                    favoriteLoading ||
                                    favoriteStatusLoading
                                }
                                onPress={
                                    handleFavorite
                                }
                            >
                                <Text
                                    style={[
                                        styles.favorite,
                                        isFavorite &&
                                            styles.favoriteActive,
                                    ]}
                                >
                                    {isFavorite
                                        ? '♥'
                                        : '♡'}
                                </Text>
                            </TouchableOpacity>
                        </View>

                        {/* COVER */}

                        {approvedCover &&
                        !coverLoadFailed ? (
                            <Image
                                source={{
                                    uri:
                                        approvedCover,
                                }}
                                style={
                                    styles.cover
                                }
                                resizeMode="cover"
                                onError={event => {
                                    console.log(
                                        '[SalonDetails] Cover load failed:',
                                        event?.nativeEvent,
                                    );

                                    setCoverLoadFailed(
                                        true,
                                    );
                                }}
                            />
                        ) : (
                            <View
                                style={
                                    styles.cover
                                }
                            />
                        )}

                        {/* SALON INFO */}

                        <View
                            style={
                                styles.salonInfo
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
                                    salon.salonName
                                }
                            </Text>

                            <View
                                style={
                                    styles.ratingRow
                                }
                            >
                                <View
                                    style={
                                        styles.ratingBadge
                                    }
                                >
                                    <Text
                                        style={
                                            styles.ratingStar
                                        }
                                    >
                                        ★
                                    </Text>

                                    <Text
                                        style={
                                            styles.ratingValue
                                        }
                                    >
                                        {Number(
                                            salon.averageRating ??
                                                0,
                                        ).toFixed(
                                            1,
                                        )}
                                    </Text>
                                </View>

                                <Text
                                    style={
                                        styles.reviewCount
                                    }
                                >
                                    {salon.totalReviews ??
                                        0}{' '}
                                    reviews
                                </Text>
                            </View>

                            {!!address && (
                                <Text
                                    style={
                                        styles.address
                                    }
                                    numberOfLines={
                                        2
                                    }
                                >
                                    📍 {address}
                                </Text>
                            )}

                            <View
                                style={
                                    styles.statusRow
                                }
                            >
                                <View
                                    style={[
                                        styles.statusDot,
                                        {
                                            backgroundColor:
                                                isOpen
                                                    ? '#22A06B'
                                                    : '#D64545',
                                        },
                                    ]}
                                />

                                <Text
                                    style={[
                                        styles.statusText,
                                        {
                                            color:
                                                isOpen
                                                    ? '#16834F'
                                                    : '#C03939',
                                        },
                                    ]}
                                >
                                    {isOpen
                                        ? 'Open now'
                                        : 'Closed now'}
                                </Text>

                                {todayHours?.open &&
                                    todayHours?.close && (
                                        <Text
                                            style={
                                                styles.closeText
                                            }
                                        >
                                            •{' '}
                                            {
                                                todayHours.open
                                            }
                                            {' - '}
                                            {
                                                todayHours.close
                                            }
                                        </Text>
                                    )}
                            </View>

                            {!isOpen && (
                                <Text
                                    style={
                                        styles.futureBookingText
                                    }
                                >
                                    You can still choose a
                                    future date and time.
                                </Text>
                            )}
                        </View>

                        {/* GALLERY */}

                        {approvedGallery.length >
                            0 && (
                            <View
                                style={
                                    styles.gallerySection
                                }
                            >
                                <View
                                    style={
                                        styles.galleryHeader
                                    }
                                >
                                    <Text
                                        style={
                                            styles.sectionTitle
                                        }
                                    >
                                        Gallery
                                    </Text>

                                    <Text
                                        style={
                                            styles.galleryCount
                                        }
                                    >
                                        {
                                            approvedGallery.length
                                        }{' '}
                                        {approvedGallery.length ===
                                        1
                                            ? 'photo'
                                            : 'photos'}
                                    </Text>
                                </View>

                                <FlatList
                                    data={
                                        approvedGallery
                                    }
                                    horizontal
                                    showsHorizontalScrollIndicator={
                                        false
                                    }
                                    keyExtractor={(
                                        item,
                                        index,
                                    ) =>
                                        item.imageId ||
                                        item.key ||
                                        `gallery-${index}`
                                    }
                                    contentContainerStyle={
                                        styles.galleryList
                                    }
                                    renderItem={({
                                        item,
                                        index,
                                    }) => {
                                        const galleryKey =
                                            item.imageId ||
                                            item.key ||
                                            String(
                                                index,
                                            );

                                        const failed =
                                            galleryLoadFailed[
                                                galleryKey
                                            ];

                                        if (
                                            failed ||
                                            !item.objectUrl
                                        ) {
                                            return (
                                                <View
                                                    style={
                                                        styles.galleryImagePlaceholder
                                                    }
                                                />
                                            );
                                        }

                                        return (
                                            <Image
                                                source={{
                                                    uri:
                                                        item.objectUrl,
                                                }}
                                                style={
                                                    styles.galleryImage
                                                }
                                                resizeMode="cover"
                                                onError={() => {
                                                    setGalleryLoadFailed(
                                                        previous => ({
                                                            ...previous,
                                                            [galleryKey]:
                                                                true,
                                                        }),
                                                    );
                                                }}
                                            />
                                        );
                                    }}
                                />
                            </View>
                        )}

                        {/* OFFER */}

                        {normalizedOffer && (
                            <View
                                style={
                                    styles.offerBanner
                                }
                            >
                                <View
                                    style={
                                        styles.offerIcon
                                    }
                                >
                                    <Text
                                        style={
                                            styles.offerIconText
                                        }
                                    >
                                        %
                                    </Text>
                                </View>

                                <View
                                    style={
                                        styles.offerContent
                                    }
                                >
                                    <Text
                                        style={
                                            styles.offerTitle
                                        }
                                        numberOfLines={
                                            2
                                        }
                                    >
                                        {
                                            normalizedOffer.title
                                        }
                                    </Text>

                                    {!!normalizedOffer.description && (
                                        <Text
                                            style={
                                                styles.offerDescription
                                            }
                                            numberOfLines={
                                                2
                                            }
                                        >
                                            {
                                                normalizedOffer.description
                                            }
                                        </Text>
                                    )}

                                    <Text
                                        style={
                                            styles.offerDiscountText
                                        }
                                    >
                                        {getOfferDiscountText()}
                                    </Text>

                                    {normalizedOffer.minimumBookingAmount !==
                                        null &&
                                        normalizedOffer.minimumBookingAmount !==
                                            undefined && (
                                            <Text
                                                style={
                                                    styles.offerMinimum
                                                }
                                            >
                                                Minimum booking:
                                                ₹
                                                {Number(
                                                    normalizedOffer.minimumBookingAmount,
                                                ).toFixed(
                                                    0,
                                                )}
                                            </Text>
                                        )}

                                    {!!offerMessage && (
                                        <Text
                                            style={
                                                styles.offerMessage
                                            }
                                        >
                                            {
                                                offerMessage
                                            }
                                        </Text>
                                    )}
                                </View>
                            </View>
                        )}

                        {/* SERVICES AVAILABLE */}

                        <View
                            style={
                                styles.servicesSection
                            }
                        >
                            <Text
                                style={
                                    styles.sectionTitle
                                }
                            >
                                Services available
                            </Text>

                            <Text
                                style={
                                    styles.sectionSubtitle
                                }
                            >
                                Choose who the service is for
                            </Text>

                            {/* AUDIENCE ROW */}

                            <View
                                style={
                                    styles.audienceFilterRow
                                }
                            >
                                {AUDIENCE_OPTIONS.map(
                                    audience => {
                                        const active =
                                            selectedAudience ===
                                            audience.key;

                                        const available =
                                            availableAudienceKeys.has(
                                                audience.key,
                                            );

                                        return (
                                            <TouchableOpacity
                                                key={
                                                    audience.key
                                                }
                                                activeOpacity={
                                                    0.85
                                                }
                                                disabled={
                                                    !available
                                                }
                                                style={[
                                                    styles.audienceFilter,
                                                    active &&
                                                        styles.audienceFilterActive,
                                                    !available &&
                                                        styles.audienceFilterDisabled,
                                                ]}
                                                onPress={() =>
                                                    setSelectedAudience(
                                                        active
                                                            ? null
                                                            : audience.key,
                                                    )
                                                }
                                            >
                                                <Text
                                                    style={[
                                                        styles.audienceFilterText,
                                                        active &&
                                                            styles.audienceFilterTextActive,
                                                        !available &&
                                                            styles.audienceFilterTextDisabled,
                                                    ]}
                                                >
                                                    {
                                                        audience.name
                                                    }
                                                </Text>

                                                {active && (
                                                    <View
                                                        style={
                                                            styles.audienceCheck
                                                        }
                                                    >
                                                        <Text
                                                            style={
                                                                styles.audienceCheckText
                                                            }
                                                        >
                                                            ✓
                                                        </Text>
                                                    </View>
                                                )}
                                            </TouchableOpacity>
                                        );
                                    },
                                )}
                            </View>

                            {/* CATEGORY ROW */}

                            {selectedAudience &&
                                categories.length >
                                    0 && (
                                    <View
                                        style={
                                            styles.categoryArea
                                        }
                                    >
                                        <View
                                            style={
                                                styles.categoryTitleRow
                                            }
                                        >
                                            <Text
                                                style={
                                                    styles.categoryTitle
                                                }
                                            >
                                                Choose a category
                                            </Text>

                                            <Text
                                                style={
                                                    styles.categoryCountText
                                                }
                                            >
                                                {
                                                    categories.length
                                                }{' '}
                                                {categories.length ===
                                                1
                                                    ? 'category'
                                                    : 'categories'}
                                            </Text>
                                        </View>

                                        <FlatList
                                            data={[
                                                {
                                                    key: 'all',
                                                    name: 'All',
                                                },
                                                ...categories,
                                            ]}
                                            horizontal
                                            showsHorizontalScrollIndicator={
                                                false
                                            }
                                            keyExtractor={item =>
                                                item.key
                                            }
                                            contentContainerStyle={
                                                styles.categoryFilterList
                                            }
                                            renderItem={({
                                                item,
                                            }) => {
                                                const active =
                                                    item.key ===
                                                    'all'
                                                        ? selectedCategory ===
                                                          null
                                                        : selectedCategory ===
                                                          item.key;

                                                return (
                                                    <TouchableOpacity
                                                        activeOpacity={
                                                            0.85
                                                        }
                                                        style={[
                                                            styles.categoryFilter,
                                                            active &&
                                                                styles.categoryFilterActive,
                                                        ]}
                                                        onPress={() => {
                                                            if (
                                                                item.key ===
                                                                'all'
                                                            ) {
                                                                setSelectedCategory(
                                                                    null,
                                                                );
                                                            } else {
                                                                setSelectedCategory(
                                                                    active
                                                                        ? null
                                                                        : item.key,
                                                                );
                                                            }
                                                        }}
                                                    >
                                                        <Text
                                                            style={[
                                                                styles.categoryFilterText,
                                                                active &&
                                                                    styles.categoryFilterTextActive,
                                                            ]}
                                                        >
                                                            {
                                                                item.name
                                                            }
                                                        </Text>
                                                    </TouchableOpacity>
                                                );
                                            }}
                                        />
                                    </View>
                                )}

                            {/* NO AUDIENCE SELECTED */}

                            {!selectedAudience &&
                                services.length >
                                    0 && (
                                    <View
                                        style={
                                            styles.chooseAudienceCard
                                        }
                                    >
                                        <View
                                            style={
                                                styles.chooseAudienceIcon
                                            }
                                        >
                                            <Text
                                                style={
                                                    styles.chooseAudienceIconText
                                                }
                                            >
                                                ✦
                                            </Text>
                                        </View>

                                        <View
                                            style={
                                                styles.chooseAudienceContent
                                            }
                                        >
                                            <Text
                                                style={
                                                    styles.chooseAudienceTitle
                                                }
                                            >
                                                Select an audience
                                            </Text>

                                            <Text
                                                style={
                                                    styles.chooseAudienceText
                                                }
                                            >
                                                Choose Female, Male or
                                                Kids to see the services
                                                available for them.
                                            </Text>
                                        </View>
                                    </View>
                                )}

                            {/* NO CATEGORY */}

                            {selectedAudience &&
                                categories.length ===
                                    0 &&
                                !servicesLoading && (
                                    <View
                                        style={
                                            styles.noAudienceServices
                                        }
                                    >
                                        <Text
                                            style={
                                                styles.noAudienceTitle
                                            }
                                        >
                                            No services available
                                        </Text>

                                        <Text
                                            style={
                                                styles.noAudienceText
                                            }
                                        >
                                            This salon has not added
                                            services for this audience
                                            yet.
                                        </Text>
                                    </View>
                                )}
                        </View>

                        {/* SERVICES HEADER */}

                        {selectedAudience && (
                            <View
                                style={
                                    styles.servicesHeader
                                }
                            >
                                <View>
                                    <Text
                                        style={
                                            styles.sectionTitle
                                        }
                                    >
                                        {selectedCategory
                                            ? categories.find(
                                                category =>
                                                    category.key ===
                                                    selectedCategory,
                                            )?.name ||
                                                'Services'
                                            : `${AUDIENCE_OPTIONS.find(
                                                audience =>
                                                    audience.key ===
                                                    selectedAudience,
                                            )?.name || ''} services`}
                                    </Text>

                                    <Text
                                        style={
                                            styles.serviceCount
                                        }
                                    >
                                        {
                                            filteredServices.length
                                        }{' '}
                                        {filteredServices.length ===
                                        1
                                            ? 'service'
                                            : 'services'}{' '}
                                        available
                                    </Text>
                                </View>

                                {selectedCategory && (
                                    <TouchableOpacity
                                        onPress={() =>
                                            setSelectedCategory(
                                                null,
                                            )
                                        }
                                    >
                                        <Text
                                            style={
                                                styles.clearFilterText
                                            }
                                        >
                                            Clear filter
                                        </Text>
                                    </TouchableOpacity>
                                )}
                            </View>
                        )}

                        {/* SERVICE QUERY WARNING */}

                        {serviceQueryFailed && (
                            <View
                                style={
                                    styles.serviceErrorBanner
                                }
                            >
                                <Text
                                    style={
                                        styles.serviceErrorTitle
                                    }
                                >
                                    Services could not be loaded
                                </Text>

                                <Text
                                    style={
                                        styles.serviceErrorText
                                    }
                                >
                                    The salon details are available,
                                    but the services could not be
                                    retrieved right now.
                                </Text>

                                <TouchableOpacity
                                    onPress={() =>
                                        refetchServices()
                                    }
                                >
                                    <Text
                                        style={
                                            styles.serviceRetryText
                                        }
                                    >
                                        Try loading services again
                                    </Text>
                                </TouchableOpacity>
                            </View>
                        )}
                    </>
                }
                renderItem={({
                    item: categoryGroup,
                }) => {
                    return (
                        <View
                            style={
                                styles.categoryGroup
                            }
                        >
                            {/* CATEGORY */}

                            <View
                                style={
                                    styles.hierarchyCategoryHeader
                                }
                            >
                                <View
                                    style={
                                        styles.categoryIcon
                                    }
                                >
                                    <Text
                                        style={
                                            styles.categoryIconText
                                        }
                                    >
                                        C
                                    </Text>
                                </View>

                                <View
                                    style={
                                        styles.categoryHeaderContent
                                    }
                                >
                                    <Text
                                        style={
                                            styles.hierarchyCategoryTitle
                                        }
                                    >
                                        {
                                            categoryGroup.name
                                        }
                                    </Text>

                                    <Text
                                        style={
                                            styles.categorySubtext
                                        }
                                    >
                                        {
                                            categoryGroup.subcategories.length
                                        }{' '}
                                        {categoryGroup.subcategories.length ===
                                        1
                                            ? 'subcategory'
                                            : 'subcategories'}
                                    </Text>
                                </View>

                                <View
                                    style={
                                        styles.hierarchyServiceCount
                                    }
                                >
                                    <Text
                                        style={
                                            styles.hierarchyServiceCountText
                                        }
                                    >
                                        {categoryGroup.subcategories.reduce(
                                            (
                                                total,
                                                subcategory,
                                            ) =>
                                                total +
                                                subcategory
                                                    .services
                                                    .length,
                                            0,
                                        )}
                                    </Text>
                                </View>
                            </View>

                            {/* SUBCATEGORIES */}

                            {categoryGroup.subcategories.map(
                                subcategoryGroup => (
                                    <View
                                        key={`${categoryGroup.key}-${subcategoryGroup.key}`}
                                        style={
                                            styles.subcategoryGroup
                                        }
                                    >
                                        <View
                                            style={
                                                styles.subcategoryHeader
                                            }
                                        >
                                            <View
                                                style={
                                                    styles.subcategoryLine
                                                }
                                            />

                                            <View
                                                style={
                                                    styles.subcategoryHeaderContent
                                                }
                                            >
                                                <Text
                                                    style={
                                                        styles.subcategoryTitle
                                                    }
                                                >
                                                    {
                                                        subcategoryGroup.name
                                                    }
                                                </Text>

                                                <Text
                                                    style={
                                                        styles.subcategoryCount
                                                    }
                                                >
                                                    {
                                                        subcategoryGroup
                                                            .services
                                                            .length
                                                    }{' '}
                                                    {subcategoryGroup
                                                        .services
                                                        .length ===
                                                    1
                                                        ? 'service'
                                                        : 'services'}
                                                </Text>
                                            </View>
                                        </View>

                                        {/* SERVICES */}

                                        {subcategoryGroup.services.map(
                                            service => {
                                                const selected =
                                                    selectedServices.some(
                                                        selectedService =>
                                                            selectedService.serviceId ===
                                                            service.serviceId,
                                                    );

                                                const eligible =
                                                    isServiceEligibleForOffer(
                                                        service,
                                                    );

                                                const originalPrice =
                                                    Number(
                                                        service.price ||
                                                            0,
                                                    );

                                                const displayPrice =
                                                    getServiceDisplayPrice(
                                                        service,
                                                    );

                                                const hasDiscount =
                                                    offerApplied &&
                                                    eligible &&
                                                    displayPrice <
                                                        originalPrice;

                                                const duration =
                                                    Number(
                                                        service.duration ??
                                                            service.durationMinutes ??
                                                            0,
                                                    );

                                                return (
                                                    <View
                                                        key={
                                                            service.serviceId
                                                        }
                                                        style={[
                                                            styles.serviceCard,
                                                            selected &&
                                                                styles.selectedServiceCard,
                                                            offerApplied &&
                                                                eligible &&
                                                                styles.offerEligibleCard,
                                                        ]}
                                                    >
                                                        <TouchableOpacity
                                                            activeOpacity={
                                                                0.9
                                                            }
                                                            onPress={() =>
                                                                toggleService(
                                                                    service,
                                                                )
                                                            }
                                                            style={
                                                                styles.serviceCardMain
                                                            }
                                                        >
                                                            <View
                                                                style={
                                                                    styles.serviceInfo
                                                                }
                                                            >
                                                                <View
                                                                    style={
                                                                        styles.serviceNameRow
                                                                    }
                                                                >
                                                                    <Text
                                                                        style={
                                                                            styles.serviceName
                                                                        }
                                                                        numberOfLines={
                                                                            2
                                                                        }
                                                                    >
                                                                        {
                                                                            service.name
                                                                        }
                                                                    </Text>

                                                                    {service.popular && (
                                                                        <View
                                                                            style={
                                                                                styles.popularBadge
                                                                            }
                                                                        >
                                                                            <Text
                                                                                style={
                                                                                    styles.popularText
                                                                                }
                                                                            >
                                                                                Popular
                                                                            </Text>
                                                                        </View>
                                                                    )}
                                                                </View>

                                                                {!!service.description && (
                                                                    <Text
                                                                        style={
                                                                            styles.description
                                                                        }
                                                                        numberOfLines={
                                                                            2
                                                                        }
                                                                    >
                                                                        {
                                                                            service.description
                                                                        }
                                                                    </Text>
                                                                )}

                                                                <View
                                                                    style={
                                                                        styles.serviceMeta
                                                                    }
                                                                >
                                                                    <View
                                                                        style={
                                                                            styles.servicePriceContainer
                                                                        }
                                                                    >
                                                                        {hasDiscount && (
                                                                            <Text
                                                                                style={
                                                                                    styles.originalPrice
                                                                                }
                                                                            >
                                                                                ₹
                                                                                {originalPrice.toFixed(
                                                                                    0,
                                                                                )}
                                                                            </Text>
                                                                        )}

                                                                        <Text
                                                                            style={[
                                                                                styles.price,
                                                                                hasDiscount &&
                                                                                    styles.discountedPrice,
                                                                            ]}
                                                                        >
                                                                            ₹
                                                                            {displayPrice.toFixed(
                                                                                0,
                                                                            )}
                                                                        </Text>
                                                                    </View>

                                                                    <View
                                                                        style={
                                                                            styles.metaDot
                                                                        }
                                                                    />

                                                                    <Text
                                                                        style={
                                                                            styles.duration
                                                                        }
                                                                    >
                                                                        {
                                                                            duration
                                                                        }{' '}
                                                                        mins
                                                                    </Text>
                                                                </View>

                                                                {offerApplied &&
                                                                    eligible && (
                                                                        <Text
                                                                            style={
                                                                                styles.offerAppliedText
                                                                            }
                                                                        >
                                                                            ✓ Offer applied
                                                                        </Text>
                                                                    )}

                                                                {normalizedOffer &&
                                                                    isOfferValid &&
                                                                    !eligible && (
                                                                        <Text
                                                                            style={
                                                                                styles.notEligibleText
                                                                            }
                                                                        >
                                                                            Offer not applicable
                                                                        </Text>
                                                                    )}
                                                            </View>
                                                        </TouchableOpacity>

                                                        {/* ADD / REMOVE */}

                                                        <TouchableOpacity
                                                            activeOpacity={
                                                                0.85
                                                            }
                                                            onPress={() =>
                                                                toggleService(
                                                                    service,
                                                                )
                                                            }
                                                            style={[
                                                                styles.serviceActionButton,
                                                                selected &&
                                                                    styles.serviceActionButtonRemove,
                                                            ]}
                                                        >
                                                            <Text
                                                                style={[
                                                                    styles.serviceActionIcon,
                                                                    selected &&
                                                                        styles.serviceActionIconRemove,
                                                                ]}
                                                            >
                                                                {selected
                                                                    ? '−'
                                                                    : '+'}
                                                            </Text>

                                                            <Text
                                                                style={[
                                                                    styles.serviceActionText,
                                                                    selected &&
                                                                        styles.serviceActionTextRemove,
                                                                ]}
                                                            >
                                                                {selected
                                                                    ? 'Remove'
                                                                    : 'Add'}
                                                            </Text>
                                                        </TouchableOpacity>
                                                    </View>
                                                );
                                            },
                                        )}
                                    </View>
                                ),
                            )}
                        </View>
                    );
                }}
                ListEmptyComponent={
                    servicesLoading ? (
                        <View
                            style={
                                styles.emptyServices
                            }
                        >
                            <ActivityIndicator
                                size="small"
                                color={PRIMARY}
                            />

                            <Text
                                style={
                                    styles.emptyText
                                }
                            >
                                Loading services...
                            </Text>
                        </View>
                    ) : !selectedAudience ? (
                        <View
                            style={
                                styles.emptyServices
                            }
                        >
                            <Text
                                style={
                                    styles.emptyTitle
                                }
                            >
                                Choose an audience
                            </Text>

                            <Text
                                style={
                                    styles.emptyText
                                }
                            >
                                Select Female, Male or Kids above
                                to explore the available services.
                            </Text>
                        </View>
                    ) : (
                        <View
                            style={
                                styles.emptyServices
                            }
                        >
                            <Text
                                style={
                                    styles.emptyTitle
                                }
                            >
                                No services found
                            </Text>

                            <Text
                                style={
                                    styles.emptyText
                                }
                            >
                                There are no services available
                                for this selection.
                            </Text>
                        </View>
                    )
                }
            />

            {/* ====================================================
                SELECTED SERVICES BOTTOM SHEET
               ==================================================== */}

            <Modal
                visible={
                    selectedServicesVisible
                }
                transparent
                animationType="slide"
                onRequestClose={() =>
                    setSelectedServicesVisible(
                        false,
                    )
                }
            >
                <View
                    style={
                        styles.selectedModalOverlay
                    }
                >
                    <Pressable
                        style={
                            styles.selectedModalBackdrop
                        }
                        onPress={() =>
                            setSelectedServicesVisible(
                                false,
                            )
                        }
                    />

                    <View
                        style={
                            styles.selectedBottomSheet
                        }
                    >
                        {/* SHEET HEADER */}

                        <View
                            style={
                                styles.selectedSheetHandle
                            }
                        />

                        <View
                            style={
                                styles.selectedSheetHeader
                            }
                        >
                            <View
                                style={
                                    styles.selectedSheetHeaderInfo
                                }
                            >
                                <Text
                                    style={
                                        styles.selectedSheetTitle
                                    }
                                >
                                    Selected services
                                </Text>

                                <Text
                                    style={
                                        styles.selectedSheetSubtitle
                                    }
                                >
                                    {
                                        selectedServices.length
                                    }{' '}
                                    {selectedServices.length ===
                                    1
                                        ? 'service'
                                        : 'services'}{' '}
                                    selected
                                </Text>
                            </View>

                            <TouchableOpacity
                                activeOpacity={
                                    0.8
                                }
                                onPress={() =>
                                    setSelectedServicesVisible(
                                        false,
                                    )
                                }
                                style={
                                    styles.selectedSheetClose
                                }
                            >
                                <Text
                                    style={
                                        styles.selectedSheetCloseText
                                    }
                                >
                                    ×
                                </Text>
                            </TouchableOpacity>
                        </View>

                        {/* SELECTED SERVICE LIST */}

                        <FlatList
                            data={
                                selectedServices
                            }
                            keyExtractor={service =>
                                `selected-sheet-${service.serviceId}`
                            }
                            showsVerticalScrollIndicator={
                                false
                            }
                            contentContainerStyle={
                                styles.selectedSheetList
                            }
                            renderItem={({
                                item: service,
                            }) => {
                                const selectedPrice =
                                    getServiceDisplayPrice(
                                        service,
                                    );

                                const duration =
                                    Number(
                                        service.duration ??
                                            service.durationMinutes ??
                                            0,
                                    );

                                const categoryName =
                                    service.categoryName ||
                                    service.categoryId ||
                                    'Category';

                                const subcategoryName =
                                    service.subcategoryName ||
                                    service.subcategoryId ||
                                    'Subcategory';

                                return (
                                    <View
                                        style={
                                            styles.selectedSheetService
                                        }
                                    >
                                        <View
                                            style={
                                                styles.selectedSheetServiceNumber
                                            }
                                        >
                                            <Text
                                                style={
                                                    styles.selectedSheetServiceNumberText
                                                }
                                            >
                                                ✓
                                            </Text>
                                        </View>

                                        <View
                                            style={
                                                styles.selectedSheetServiceInfo
                                            }
                                        >
                                            <Text
                                                style={
                                                    styles.selectedSheetServiceName
                                                }
                                                numberOfLines={
                                                    2
                                                }
                                            >
                                                {
                                                    service.name
                                                }
                                            </Text>

                                            <Text
                                                style={
                                                    styles.selectedSheetServiceHierarchy
                                                }
                                                numberOfLines={
                                                    2
                                                }
                                            >
                                                {
                                                    categoryName
                                                }{' '}
                                                ›{' '}
                                                {
                                                    subcategoryName
                                                }
                                            </Text>

                                            <View
                                                style={
                                                    styles.selectedSheetServiceMeta
                                                }
                                            >
                                                <Text
                                                    style={
                                                        styles.selectedSheetServicePrice
                                                    }
                                                >
                                                    ₹
                                                    {selectedPrice.toFixed(
                                                        0,
                                                    )}
                                                </Text>

                                                <View
                                                    style={
                                                        styles.selectedSheetMetaDot
                                                    }
                                                />

                                                <Text
                                                    style={
                                                        styles.selectedSheetServiceDuration
                                                    }
                                                >
                                                    {
                                                        duration
                                                    }{' '}
                                                    mins
                                                </Text>
                                            </View>
                                        </View>

                                        <TouchableOpacity
                                            activeOpacity={
                                                0.8
                                            }
                                            onPress={() =>
                                                removeService(
                                                    service.serviceId,
                                                )
                                            }
                                            style={
                                                styles.selectedSheetRemoveButton
                                            }
                                        >
                                            <Text
                                                style={
                                                    styles.selectedSheetRemoveIcon
                                                }
                                            >
                                                −
                                            </Text>

                                            <Text
                                                style={
                                                    styles.selectedSheetRemoveText
                                                }
                                            >
                                                Remove
                                            </Text>
                                        </TouchableOpacity>
                                    </View>
                                );
                            }}
                        />

                        {/* SHEET SUMMARY */}

                        <View
                            style={
                                styles.selectedSheetSummary
                            }
                        >
                            <View
                                style={
                                    styles.selectedSheetSummaryRow
                                }
                            >
                                <Text
                                    style={
                                        styles.selectedSheetSummaryLabel
                                    }
                                >
                                    {selectedServices.length}{' '}
                                    {selectedServices.length ===
                                    1
                                        ? 'service'
                                        : 'services'}
                                </Text>

                                <Text
                                    style={
                                        styles.selectedSheetSummaryPrice
                                    }
                                >
                                    ₹
                                    {discountedServicesTotal.toFixed(
                                        0,
                                    )}
                                </Text>
                            </View>

                            <View
                                style={
                                    styles.selectedSheetSummaryRow
                                }
                            >
                                <Text
                                    style={
                                        styles.selectedSheetSummaryDuration
                                    }
                                >
                                    Total duration
                                </Text>

                                <Text
                                    style={
                                        styles.selectedSheetSummaryDurationValue
                                    }
                                >
                                    {
                                        totalDuration
                                    }{' '}
                                    mins
                                </Text>
                            </View>

                            {offerApplied && (
                                <Text
                                    style={
                                        styles.selectedSheetSavings
                                    }
                                >
                                    You save ₹
                                    {discountAmount.toFixed(
                                        0,
                                    )}
                                </Text>
                            )}
                        </View>

                        {/* SHEET ACTIONS */}

                        <View
                            style={
                                styles.selectedSheetActions
                            }
                        >
                            <TouchableOpacity
                                activeOpacity={
                                    0.85
                                }
                                onPress={
                                    clearAllServices
                                }
                                style={
                                    styles.clearAllSheetButton
                                }
                            >
                                <Text
                                    style={
                                        styles.clearAllSheetText
                                    }
                                >
                                    Clear All
                                </Text>
                            </TouchableOpacity>

                            <TouchableOpacity
                                activeOpacity={
                                    0.85
                                }
                                onPress={() =>
                                    setSelectedServicesVisible(
                                        false,
                                    )
                                }
                                style={
                                    styles.doneSheetButton
                                }
                            >
                                <Text
                                    style={
                                        styles.doneSheetText
                                    }
                                >
                                    Done
                                </Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>

           {/* ====================================================
    BOTTOM BOOKING BAR
   ==================================================== */}

{selectedServices.length > 0 && (
    <View
        style={
            styles.bottomBar
        }
    >
        {/* TAP THIS AREA TO VIEW SELECTED SERVICES */}

        <TouchableOpacity
            activeOpacity={
                0.75
            }
            style={
                styles.bottomInfo
            }
            onPress={() =>
                setSelectedServicesVisible(
                    true,
                )
            }
        >
            <View
                style={
                    styles.bottomSelectedRow
                }
            >
                <Text
                    style={
                        styles.selectedText
                    }
                >
                    {
                        selectedServices.length
                    }{' '}
                    {selectedServices.length ===
                    1
                        ? 'service'
                        : 'services'}
                </Text>

                <Text
                    style={
                        styles.bottomViewText
                    }
                >
                    View
                </Text>

                <Text
                    style={
                        styles.bottomViewArrow
                    }
                >
                    ↑
                </Text>
            </View>

            {offerApplied && (
                <Text
                    style={
                        styles.bottomOriginalPrice
                    }
                >
                    ₹
                    {subtotal.toFixed(
                        0,
                    )}
                </Text>
            )}

            {/* SERVICES TOTAL */}

            <Text
                style={
                    styles.totalPrice
                }
            >
                ₹
                {discountedServicesTotal.toFixed(
                    0,
                )}
            </Text>

            {offerApplied && (
                <Text
                    style={
                        styles.bottomSavings
                    }
                >
                    Save ₹
                    {discountAmount.toFixed(
                        0,
                    )}
                </Text>
            )}

            {!offerApplied &&
                normalizedOffer &&
                !minimumBookingAmountMet && (
                    <Text
                        style={
                            styles.minimumAmountWarning
                        }
                    >
                        Add more for offer
                    </Text>
                )}

            {/* FIXED CLAVATA BOOKING FEE */}

            <View
                style={
                    styles.bookingFeeRow
                }
            >
                <Text
                    style={
                        styles.bookingFeeLabel
                    }
                >
                    Booking fee
                </Text>

                <Text
                    style={
                        styles.bookingFeeValue
                    }
                >
                    ₹9
                </Text>
            </View>

            <Text
                style={
                    styles.totalDuration
                }
            >
                {
                    totalDuration
                }{' '}
                mins
            </Text>
        </TouchableOpacity>

        {/* CONTINUE */}

        <TouchableOpacity
            style={
                styles.continueButton
            }
            activeOpacity={
                0.85
            }
            onPress={() => {
                if (
                    !currentUser?.userId
                ) {
                    Alert.alert(
                        'Login required',
                        'Please login to continue booking.',
                    );

                    return;
                }

                if (
                    !salon?.salonId
                ) {
                    Alert.alert(
                        'Salon unavailable',
                        'Salon information is missing. Please try again.',
                    );

                    return;
                }

                if (
                    selectedServices.length ===
                    0
                ) {
                    Alert.alert(
                        'Select a service',
                        'Please select at least one service before continuing.',
                    );

                    return;
                }

                const params = {
                    salonId:
                        salon.salonId,

                    salon,

                    salonName:
                        salon.salonName,

                    customerUserId:
                        currentUser.userId,

                    services:
                        selectedServices,

                    offer:
                        normalizedOffer ||
                        undefined,

                    offerId:
                        routeOfferId ||
                        normalizedOffer?.offerId ||
                        undefined,

                    subtotal,

                    discountAmount,

                    totalPrice:
                        discountedServicesTotal,

                    offerApplied,

                    totalDuration,

                    /*
                     * Fixed Clavata booking fee.
                     *
                     * This is NOT added to totalPrice.
                     * It is collected separately as the
                     * fixed booking fee.
                     */
                    bookingFee: 9,

                    businessHours:
                        salon.businessHours ??
                        {
                            MONDAY:
                                (
                                    salon as any
                                ).MONDAY,

                            TUESDAY:
                                (
                                    salon as any
                                ).TUESDAY,

                            WEDNESDAY:
                                (
                                    salon as any
                                ).WEDNESDAY,

                            THURSDAY:
                                (
                                    salon as any
                                ).THURSDAY,

                            FRIDAY:
                                (
                                    salon as any
                                ).FRIDAY,

                            SATURDAY:
                                (
                                    salon as any
                                ).SATURDAY,

                            SUNDAY:
                                (
                                    salon as any
                                ).SUNDAY,
                        },
                };

                console.log(
                    '[SalonDetails] SENDING TO BOOKING DATETIME:',
                    params,
                );

                navigation.navigate(
                    'BookingDateTime',
                    params,
                );
            }}
        >
            <Text
                style={
                    styles.continueText
                }
            >
                Continue
            </Text>

            <Text
                style={
                    styles.continueArrow
                }
            >
                →
            </Text>
        </TouchableOpacity>
    </View>
)}
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F5F6FA',
    },

    loadingContainer: {
        flex: 1,
        backgroundColor: '#F5F6FA',
        alignItems: 'center',
        justifyContent: 'center',
        paddingHorizontal: 30,
    },

    loadingText: {
        marginTop: 12,
        fontSize: 15,
        color: '#666',
    },

    errorTitle: {
        fontSize: 20,
        fontWeight: '700',
        color: '#111',
        textAlign: 'center',
    },

    errorText: {
        marginTop: 8,
        textAlign: 'center',
        color: '#777',
        fontSize: 14,
        lineHeight: 20,
    },

    debugErrorText: {
        marginTop: 12,
        textAlign: 'center',
        color: '#B33',
        fontSize: 11,
        lineHeight: 17,
    },

    retryButton: {
        marginTop: 20,
        backgroundColor: PRIMARY,
        paddingHorizontal: 25,
        paddingVertical: 12,
        borderRadius: 22,
    },

    retryText: {
        color: '#FFF',
        fontWeight: '700',
    },

    secondaryButton: {
        marginTop: 10,
        paddingHorizontal: 25,
        paddingVertical: 12,
        borderRadius: 22,
        backgroundColor: '#E9E9E9',
    },

    secondaryButtonText: {
        color: '#333',
        fontWeight: '700',
    },

    header: {
        height: 58,
        backgroundColor: '#FFF',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 15,
    },

    headerButton: {
        width: 40,
        height: 40,
        borderRadius: 20,
        alignItems: 'center',
        justifyContent: 'center',
    },

    back: {
        fontSize: 38,
        lineHeight: 40,
        color: '#222',
        fontWeight: '300',
    },

    headerTitle: {
        flex: 1,
        textAlign: 'center',
        fontSize: 17,
        fontWeight: '700',
        color: '#111',
        marginHorizontal: 10,
    },

    favorite: {
        fontSize: 16,
        color: '#333',
        lineHeight: 34,
    },

    favoriteActive: {
        color: '#E53935',
    },

    cover: {
        width: '100%',
        height: 220,
        backgroundColor: '#E8E8E8',
    },

    salonInfo: {
        backgroundColor: '#FFF',
        paddingHorizontal: 18,
        paddingTop: 16,
        paddingBottom: 17,
    },

    salonName: {
        fontSize: 22,
        fontWeight: '800',
        color: '#111',
    },

    ratingRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 9,
    },

    ratingBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#FFF4D9',
        borderRadius: 8,
        paddingHorizontal: 8,
        paddingVertical: 4,
    },

    ratingStar: {
        color: '#F4A623',
        fontSize: 13,
        marginRight: 4,
    },

    ratingValue: {
        color: '#222',
        fontSize: 13,
        fontWeight: '800',
    },

    reviewCount: {
        marginLeft: 8,
        fontSize: 13,
        color: '#777',
    },

    address: {
        marginTop: 10,
        color: '#666',
        fontSize: 13,
        lineHeight: 19,
    },

    statusRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 10,
    },

    statusDot: {
        width: 8,
        height: 8,
        borderRadius: 4,
        marginRight: 7,
    },

    statusText: {
        fontSize: 13,
        fontWeight: '800',
    },

    closeText: {
        marginLeft: 6,
        fontSize: 13,
        color: '#777',
    },

    futureBookingText: {
        marginTop: 7,
        color: PRIMARY,
        fontSize: 12,
        fontWeight: '600',
    },

    gallerySection: {
        backgroundColor: '#FFF',
        marginTop: 8,
        paddingTop: 16,
        paddingBottom: 17,
    },

    galleryHeader: {
        paddingHorizontal: 18,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },

    galleryCount: {
        fontSize: 12,
        color: '#888',
        fontWeight: '600',
    },

    galleryList: {
        paddingLeft: 18,
        paddingRight: 6,
        marginTop: 12,
    },

    galleryImage: {
        width: 170,
        height: 125,
        borderRadius: 13,
        backgroundColor: '#E8E8E8',
        marginRight: 10,
    },

    galleryImagePlaceholder: {
        width: 170,
        height: 125,
        borderRadius: 13,
        backgroundColor: '#E8E8E8',
        marginRight: 10,
    },

    offerBanner: {
        marginTop: 8,
        paddingHorizontal: 18,
        paddingVertical: 16,
        backgroundColor: '#EAF8F3',
        borderTopWidth: 1,
        borderBottomWidth: 1,
        borderColor: '#B9E5D5',
        flexDirection: 'row',
        alignItems: 'center',
    },

    offerIcon: {
        width: 42,
        height: 42,
        borderRadius: 21,
        backgroundColor: PRIMARY,
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 12,
    },

    offerIconText: {
        color: '#FFF',
        fontSize: 20,
        fontWeight: '800',
    },

    offerContent: {
        flex: 1,
    },

    offerTitle: {
        fontSize: 16,
        fontWeight: '800',
        color: '#176B53',
    },

    offerDescription: {
        marginTop: 3,
        color: '#477568',
        fontSize: 12,
        lineHeight: 17,
    },

    offerDiscountText: {
        marginTop: 5,
        color: PRIMARY,
        fontSize: 14,
        fontWeight: '800',
    },

    offerMinimum: {
        marginTop: 3,
        color: '#6B7F78',
        fontSize: 11,
    },

    offerMessage: {
        marginTop: 5,
        color: '#477568',
        fontSize: 11,
        fontWeight: '600',
    },

    /**
     * ----------------------------------------------------
     * SERVICES SECTION
     * ----------------------------------------------------
     */

    servicesSection: {
        marginTop: 8,
        backgroundColor: '#FFF',
        paddingHorizontal: 18,
        paddingTop: 18,
        paddingBottom: 17,
    },

    sectionTitle: {
        fontSize: 18,
        fontWeight: '800',
        color: '#111',
    },

    sectionSubtitle: {
        marginTop: 4,
        fontSize: 12,
        color: '#888',
    },

    /**
     * ----------------------------------------------------
     * AUDIENCE FILTER
     * ----------------------------------------------------
     */

    audienceFilterRow: {
        flexDirection: 'row',
        marginTop: 15,
        gap: 8,
    },

    audienceFilter: {
        flex: 1,
        minHeight: 48,
        borderRadius: 14,
        backgroundColor: '#F3F5F5',
        borderWidth: 1,
        borderColor: '#E2E6E6',
        alignItems: 'center',
        justifyContent: 'center',
        flexDirection: 'row',
        paddingHorizontal: 8,
    },

    audienceFilterActive: {
        backgroundColor: PRIMARY,
        borderColor: PRIMARY,
    },

    audienceFilterDisabled: {
        backgroundColor: '#F7F7F7',
        borderColor: '#EEEEEE',
        opacity: 0.55,
    },

    audienceFilterText: {
        color: '#444',
        fontSize: 13,
        fontWeight: '800',
    },

    audienceFilterTextActive: {
        color: '#FFF',
    },

    audienceFilterTextDisabled: {
        color: '#999',
    },

    audienceCheck: {
        width: 17,
        height: 17,
        borderRadius: 9,
        backgroundColor: 'rgba(255,255,255,0.22)',
        alignItems: 'center',
        justifyContent: 'center',
        marginLeft: 5,
    },

    audienceCheckText: {
        color: '#FFF',
        fontSize: 10,
        fontWeight: '900',
    },

    /**
     * ----------------------------------------------------
     * CATEGORY FILTER
     * ----------------------------------------------------
     */

    categoryArea: {
        marginTop: 18,
    },

    categoryTitleRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },

    categoryTitle: {
        fontSize: 13,
        fontWeight: '800',
        color: '#333',
    },

    categoryCountText: {
        fontSize: 11,
        color: '#999',
        fontWeight: '600',
    },

    categoryFilterList: {
        paddingTop: 10,
        paddingRight: 18,
    },

    categoryFilter: {
        minHeight: 38,
        paddingHorizontal: 16,
        paddingVertical: 9,
        borderRadius: 20,
        backgroundColor: '#F2F4F5',
        borderWidth: 1,
        borderColor: '#E3E6E7',
        marginRight: 8,
        justifyContent: 'center',
    },

    categoryFilterActive: {
        backgroundColor: PRIMARY,
        borderColor: PRIMARY,
    },

    categoryFilterText: {
        color: '#555',
        fontSize: 12,
        fontWeight: '700',
    },

    categoryFilterTextActive: {
        color: '#FFF',
    },

    /**
     * ----------------------------------------------------
     * CHOOSE AUDIENCE
     * ----------------------------------------------------
     */

    chooseAudienceCard: {
        marginTop: 17,
        backgroundColor: '#F7FCFB',
        borderWidth: 1,
        borderColor: '#D5ECE7',
        borderRadius: 15,
        padding: 14,
        flexDirection: 'row',
        alignItems: 'center',
    },

    chooseAudienceIcon: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: '#E1F3EF',
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 11,
    },

    chooseAudienceIconText: {
        color: PRIMARY,
        fontSize: 18,
        fontWeight: '800',
    },

    chooseAudienceContent: {
        flex: 1,
    },

    chooseAudienceTitle: {
        fontSize: 14,
        color: '#222',
        fontWeight: '800',
    },

    chooseAudienceText: {
        marginTop: 3,
        fontSize: 11,
        color: '#777',
        lineHeight: 16,
    },

    noAudienceServices: {
        marginTop: 16,
        padding: 18,
        backgroundColor: '#F8F8F8',
        borderRadius: 14,
        alignItems: 'center',
    },

    noAudienceTitle: {
        fontSize: 14,
        fontWeight: '800',
        color: '#333',
    },

    noAudienceText: {
        marginTop: 5,
        fontSize: 11,
        color: '#888',
        textAlign: 'center',
    },

    /**
     * ----------------------------------------------------
     * SERVICES HEADER
     * ----------------------------------------------------
     */

    servicesHeader: {
        backgroundColor: '#F5F6FA',
        paddingHorizontal: 18,
        paddingTop: 20,
        paddingBottom: 8,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },

    serviceCount: {
        marginTop: 3,
        fontSize: 12,
        color: '#888',
    },

    clearFilterText: {
        color: PRIMARY,
        fontSize: 12,
        fontWeight: '800',
    },

    /**
     * ----------------------------------------------------
     * CATEGORY
     * ----------------------------------------------------
     */

    categoryGroup: {
        marginTop: 4,
        paddingBottom: 2,
    },

    hierarchyCategoryHeader: {
        marginHorizontal: 18,
        paddingHorizontal: 4,
        paddingTop: 13,
        paddingBottom: 8,
        flexDirection: 'row',
        alignItems: 'center',
    },

    categoryIcon: {
        width: 32,
        height: 32,
        borderRadius: 9,
        backgroundColor: '#EAF6F3',
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 10,
    },

    categoryIconText: {
        color: PRIMARY,
        fontSize: 10,
        fontWeight: '900',
    },

    categoryHeaderContent: {
        flex: 1,
    },

    hierarchyCategoryTitle: {
        fontSize: 16,
        fontWeight: '800',
        color: '#222',
    },

    categorySubtext: {
        marginTop: 2,
        fontSize: 10,
        color: '#999',
    },

    hierarchyServiceCount: {
        minWidth: 27,
        height: 27,
        borderRadius: 14,
        backgroundColor: '#F0F1F2',
        alignItems: 'center',
        justifyContent: 'center',
        marginLeft: 8,
    },

    hierarchyServiceCountText: {
        color: '#777',
        fontSize: 10,
        fontWeight: '800',
    },

    /**
     * ----------------------------------------------------
     * SUBCATEGORY
     * ----------------------------------------------------
     */

    subcategoryGroup: {
        marginHorizontal: 15,
        marginTop: 5,
        marginBottom: 8,
    },

    subcategoryHeader: {
        marginLeft: 5,
        paddingLeft: 10,
        flexDirection: 'row',
        alignItems: 'center',
    },

    subcategoryLine: {
        width: 3,
        minHeight: 35,
        borderRadius: 2,
        backgroundColor: PRIMARY,
        marginRight: 9,
    },

    subcategoryHeaderContent: {
        flex: 1,
    },

    subcategoryTitle: {
        fontSize: 14,
        fontWeight: '800',
        color: '#444',
    },

    subcategoryCount: {
        marginTop: 2,
        fontSize: 10,
        color: '#999',
    },

    /**
     * ----------------------------------------------------
     * SERVICE CARD
     * ----------------------------------------------------
     */

    serviceCard: {
        marginTop: 8,
        padding: 13,
        backgroundColor: '#FFF',
        borderRadius: 14,
        flexDirection: 'row',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#EAEAEA',
        shadowColor: '#000',
        shadowOpacity: 0.025,
        shadowRadius: 5,
        shadowOffset: {
            width: 0,
            height: 2,
        },
        elevation: 1,
    },

    selectedServiceCard: {
        borderColor: PRIMARY,
        backgroundColor: '#F7FCFB',
    },

    offerEligibleCard: {
        borderColor: '#B9E5D5',
    },

    serviceCardMain: {
        flex: 1,
    },

    serviceInfo: {
        flex: 1,
        paddingRight: 8,
    },

    serviceNameRow: {
        flexDirection: 'row',
        alignItems: 'flex-start',
    },

    serviceName: {
        flexShrink: 1,
        fontSize: 14,
        fontWeight: '700',
        color: '#111',
    },

    popularBadge: {
        marginLeft: 7,
        backgroundColor: '#FFF2D8',
        paddingHorizontal: 7,
        paddingVertical: 3,
        borderRadius: 8,
    },

    popularText: {
        color: '#B87900',
        fontSize: 9,
        fontWeight: '800',
    },

    description: {
        marginTop: 4,
        color: '#888',
        fontSize: 11,
        lineHeight: 16,
    },

    serviceMeta: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 8,
    },

    servicePriceContainer: {
        alignItems: 'flex-start',
    },

    originalPrice: {
        color: '#999',
        fontSize: 10,
        textDecorationLine:
            'line-through',
    },

    price: {
        color: PRIMARY,
        fontSize: 16,
        fontWeight: '800',
    },

    discountedPrice: {
        color: PRIMARY,
    },

    metaDot: {
        width: 3,
        height: 3,
        borderRadius: 2,
        backgroundColor: '#AAA',
        marginHorizontal: 8,
    },

    duration: {
        color: '#777',
        fontSize: 11,
    },

    offerAppliedText: {
        marginTop: 5,
        color: PRIMARY,
        fontSize: 10,
        fontWeight: '700',
    },

    notEligibleText: {
        marginTop: 5,
        color: '#999',
        fontSize: 10,
    },

    /**
     * ----------------------------------------------------
     * ADD / REMOVE BUTTON
     * ----------------------------------------------------
     */

    serviceActionButton: {
        minWidth: 72,
        height: 36,
        paddingHorizontal: 10,
        borderRadius: 19,
        backgroundColor: '#EAF7F4',
        borderWidth: 1,
        borderColor: '#BFE3DB',
        alignItems: 'center',
        justifyContent: 'center',
        flexDirection: 'row',
        marginLeft: 5,
    },

    serviceActionButtonRemove: {
        backgroundColor: '#FFF0F0',
        borderColor: '#F0C6C6',
    },

    serviceActionIcon: {
        color: PRIMARY,
        fontSize: 18,
        lineHeight: 19,
        fontWeight: '500',
        marginRight: 4,
    },

    serviceActionIconRemove: {
        color: '#D64545',
    },

    serviceActionText: {
        color: PRIMARY,
        fontSize: 10,
        fontWeight: '800',
    },

    serviceActionTextRemove: {
        color: '#D64545',
    },

    /**
     * ----------------------------------------------------
     * SERVICE QUERY ERROR
     * ----------------------------------------------------
     */

    serviceErrorBanner: {
        marginHorizontal: 15,
        marginTop: 8,
        marginBottom: 5,
        paddingHorizontal: 15,
        paddingVertical: 13,
        backgroundColor: '#FFF7E8',
        borderRadius: 12,
        borderWidth: 1,
        borderColor: '#F0D69B',
    },

    serviceErrorTitle: {
        fontSize: 13,
        fontWeight: '800',
        color: '#8A5A00',
    },

    serviceErrorText: {
        marginTop: 4,
        fontSize: 11,
        lineHeight: 16,
        color: '#8A6A2F',
    },

    serviceRetryText: {
        marginTop: 7,
        color: PRIMARY,
        fontSize: 12,
        fontWeight: '800',
    },

    /**
     * ----------------------------------------------------
     * EMPTY SERVICES
     * ----------------------------------------------------
     */

    emptyServices: {
        paddingVertical: 50,
        alignItems: 'center',
        paddingHorizontal: 30,
    },

    emptyTitle: {
        fontSize: 17,
        fontWeight: '700',
        color: '#222',
    },

    emptyText: {
        marginTop: 7,
        textAlign: 'center',
        fontSize: 13,
        color: '#888',
        lineHeight: 19,
    },

    /**
     * ----------------------------------------------------
     * SELECTED SERVICES BOTTOM SHEET
     * ----------------------------------------------------
     */

    selectedModalOverlay: {
        flex: 1,
        justifyContent: 'flex-end',
    },

    selectedModalBackdrop: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: 'rgba(0,0,0,0.42)',
    },

    selectedBottomSheet: {
        backgroundColor: '#FFF',
        borderTopLeftRadius: 24,
        borderTopRightRadius: 24,
        maxHeight: '82%',
        paddingTop: 8,
        paddingBottom: 12,
        shadowColor: '#000',
        shadowOpacity: 0.15,
        shadowRadius: 15,
        shadowOffset: {
            width: 0,
            height: -4,
        },
        elevation: 12,
    },

    selectedSheetHandle: {
        alignSelf: 'center',
        width: 42,
        height: 4,
        borderRadius: 3,
        backgroundColor: '#D6D6D6',
        marginBottom: 10,
    },

    selectedSheetHeader: {
        paddingHorizontal: 18,
        paddingTop: 4,
        paddingBottom: 13,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        borderBottomWidth: 1,
        borderBottomColor: '#EEEEEE',
    },

    selectedSheetHeaderInfo: {
        flex: 1,
    },

    selectedSheetTitle: {
        fontSize: 19,
        fontWeight: '800',
        color: '#111',
    },

    selectedSheetSubtitle: {
        marginTop: 3,
        fontSize: 12,
        color: '#888',
    },

    selectedSheetClose: {
        width: 36,
        height: 36,
        borderRadius: 18,
        backgroundColor: '#F3F4F4',
        alignItems: 'center',
        justifyContent: 'center',
        marginLeft: 12,
    },

    selectedSheetCloseText: {
        fontSize: 25,
        lineHeight: 27,
        color: '#555',
        fontWeight: '300',
    },

    selectedSheetList: {
        paddingHorizontal: 16,
        paddingTop: 10,
        paddingBottom: 8,
    },

    selectedSheetService: {
        backgroundColor: '#F8FCFB',
        borderWidth: 1,
        borderColor: '#DCEDE9',
        borderRadius: 14,
        padding: 12,
        marginBottom: 9,
        flexDirection: 'row',
        alignItems: 'center',
    },

    selectedSheetServiceNumber: {
        width: 32,
        height: 32,
        borderRadius: 16,
        backgroundColor: '#E2F4F0',
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 10,
    },

    selectedSheetServiceNumberText: {
        color: PRIMARY,
        fontSize: 14,
        fontWeight: '900',
    },

    selectedSheetServiceInfo: {
        flex: 1,
        paddingRight: 8,
    },

    selectedSheetServiceName: {
        fontSize: 14,
        fontWeight: '800',
        color: '#222',
    },

    selectedSheetServiceHierarchy: {
        marginTop: 3,
        fontSize: 10,
        color: '#888',
        fontWeight: '600',
    },

    selectedSheetServiceMeta: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 5,
    },

    selectedSheetServicePrice: {
        color: PRIMARY,
        fontSize: 13,
        fontWeight: '800',
    },

    selectedSheetMetaDot: {
        width: 3,
        height: 3,
        borderRadius: 2,
        backgroundColor: '#AAA',
        marginHorizontal: 7,
    },

    selectedSheetServiceDuration: {
        color: '#777',
        fontSize: 11,
        fontWeight: '600',
    },

    selectedSheetRemoveButton: {
        minWidth: 70,
        paddingHorizontal: 9,
        paddingVertical: 7,
        borderRadius: 15,
        backgroundColor: '#FFF0F0',
        borderWidth: 1,
        borderColor: '#F0CACA',
        alignItems: 'center',
        justifyContent: 'center',
        flexDirection: 'row',
    },

    selectedSheetRemoveIcon: {
        color: '#D64545',
        fontSize: 16,
        lineHeight: 16,
        marginRight: 2,
    },

    selectedSheetRemoveText: {
        color: '#D64545',
        fontSize: 9,
        fontWeight: '800',
    },

    selectedSheetSummary: {
        marginHorizontal: 16,
        marginTop: 3,
        paddingHorizontal: 14,
        paddingVertical: 11,
        backgroundColor: '#F6F8F8',
        borderRadius: 13,
    },

    selectedSheetSummaryRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },

    selectedSheetSummaryLabel: {
        fontSize: 12,
        color: '#666',
        fontWeight: '600',
    },

    selectedSheetSummaryPrice: {
        fontSize: 17,
        color: PRIMARY,
        fontWeight: '800',
    },

    selectedSheetSummaryDuration: {
        marginTop: 4,
        fontSize: 11,
        color: '#888',
    },

    selectedSheetSummaryDurationValue: {
        marginTop: 4,
        fontSize: 11,
        color: '#666',
        fontWeight: '700',
    },

    selectedSheetSavings: {
        marginTop: 4,
        color: '#16845E',
        fontSize: 11,
        fontWeight: '700',
    },

    selectedSheetActions: {
        flexDirection: 'row',
        paddingHorizontal: 16,
        paddingTop: 11,
        gap: 10,
    },

    clearAllSheetButton: {
        flex: 1,
        height: 46,
        borderRadius: 23,
        backgroundColor: '#FFF1F1',
        borderWidth: 1,
        borderColor: '#F0CACA',
        alignItems: 'center',
        justifyContent: 'center',
    },

    clearAllSheetText: {
        color: '#D64545',
        fontSize: 13,
        fontWeight: '800',
    },

    doneSheetButton: {
        flex: 1.35,
        height: 46,
        borderRadius: 23,
        backgroundColor: PRIMARY,
        alignItems: 'center',
        justifyContent: 'center',
    },

    doneSheetText: {
        color: '#FFF',
        fontSize: 14,
        fontWeight: '800',
    },

    /**
     * ----------------------------------------------------
     * BOTTOM BOOKING BAR
     * ----------------------------------------------------
     */

    bottomBar: {
        position: 'absolute',
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: '#FFF',
        paddingHorizontal: 17,
        paddingTop: 11,
        paddingBottom: 14,
        borderTopWidth: 1,
        borderTopColor: '#E8E8E8',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },

    bottomInfo: {
        flex: 1,
        paddingRight: 10,
    },

    bottomSelectedRow: {
        flexDirection: 'row',
        alignItems: 'center',
    },

    selectedText: {
        fontSize: 12,
        color: '#555',
        fontWeight: '700',
    },

    bottomViewText: {
        marginLeft: 7,
        color: PRIMARY,
        fontSize: 16,
        fontWeight: '800',
    },

    bottomViewArrow: {
        marginLeft: 3,
        color: PRIMARY,
        fontSize: 18,
        fontWeight: '900',
    },

    bottomOriginalPrice: {
        marginTop: 2,
        color: '#999',
        fontSize: 11,
        textDecorationLine:
            'line-through',
    },

    totalPrice: {
        marginTop: 1,
        fontSize: 19,
        color: PRIMARY,
        fontWeight: '800',
    },

    bottomSavings: {
        marginTop: 1,
        color: '#16845E',
        fontSize: 10,
        fontWeight: '700',
    },

    minimumAmountWarning: {
        marginTop: 2,
        color: '#B87900',
        fontSize: 10,
        fontWeight: '700',
    },

    totalDuration: {
        marginTop: 1,
        fontSize: 10,
        color: '#888',
    },

    continueButton: {
        minWidth: 125,
        backgroundColor: PRIMARY,
        paddingHorizontal: 18,
        paddingVertical: 13,
        borderRadius: 25,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
    },

    continueText: {
        color: '#FFF',
        fontSize: 14,
        fontWeight: '800',
    },

    continueArrow: {
        color: '#FFF',
        fontSize: 18,
        marginLeft: 7,
    },
    bookingFeeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 3,
},

bookingFeeLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#777',
},

bookingFeeValue: {
    marginLeft: 4,
    fontSize: 14,
    fontWeight: '800',
    color: PRIMARY,
},
});