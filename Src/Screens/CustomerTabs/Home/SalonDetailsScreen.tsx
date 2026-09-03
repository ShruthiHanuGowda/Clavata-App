import React, { useState } from 'react';
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

const PRIMARY = '#008060';

type Props = {
    navigation: any;
    route: any;
};

type Service = {
    serviceId: string;
    salonId: string;
    name: string;
    category: string;
    description?: string;
    duration: number;
    price: number;
    gender: string;
    popular: boolean;
    active: boolean;
};

type BusinessDay = {
    open: string;
    close: string;
    isOpen: boolean;
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

    averageRating?: number;
    totalReviews?: number;

    salonStatus?: string;

    businessHours?: {
        MONDAY: BusinessDay;
        TUESDAY: BusinessDay;
        WEDNESDAY: BusinessDay;
        THURSDAY: BusinessDay;
        FRIDAY: BusinessDay;
        SATURDAY: BusinessDay;
        SUNDAY: BusinessDay;
    };
};

export default function SalonDetailsScreen({
    navigation,
    route,
}: Props) {
    const { currentUser } = useUser();

    const salonId = route.params?.salonId;

    const [selectedServices, setSelectedServices] =
        useState<Service[]>([]);

    /**
     * ----------------------------------------------------
     * FAVORITE LOCAL STATE
     * ----------------------------------------------------
     *
     * Local state prevents the heart from visually
     * resetting while Apollo is loading/refetching.
     */
    const [isFavorite, setIsFavorite] =
        useState(false);

    const [favoriteLoading, setFavoriteLoading] =
        useState(false);

    /**
     * ----------------------------------------------------
     * GET SALON
     * ----------------------------------------------------
     */
    const {
        data: salonData,
        loading: salonLoading,
        error: salonError,
    } = useQuery(GET_SALON, {
        variables: {
            salonId,
        },
        skip: !salonId,
        fetchPolicy: 'network-only',
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
    } = useQuery(LIST_SERVICES, {
        variables: {
            salonId,
        },
        skip: !salonId,
        fetchPolicy: 'network-only',
    });

    const salon: Salon | null =
        salonData?.getSalon ?? null;

    const services: Service[] = (
        servicesData?.listServices ?? []
    ).filter(
        (service: Service) => service.active,
    );

    /**
     * ----------------------------------------------------
     * GET FAVORITE STATUS
     * ----------------------------------------------------
     */
    const {
        data: favoriteData,
        loading: favoriteStatusLoading,
        refetch: refetchFavoriteStatus,
    } = useQuery(IS_FAVORITE_SALON, {
        variables: {
            userId: currentUser?.userId ?? '',
            salonId,
        },

        skip:
            !currentUser?.userId ||
            !salonId,

        fetchPolicy: 'network-only',

        notifyOnNetworkStatusChange: true,
    });

    /**
     * ----------------------------------------------------
     * SYNC BACKEND FAVORITE STATUS
     * ----------------------------------------------------
     */
    React.useEffect(() => {
        if (
            favoriteData &&
            favoriteData.isFavoriteSalon !== undefined
        ) {
            setIsFavorite(
                favoriteData.isFavoriteSalon === true,
            );
        }
    }, [favoriteData]);

    /**
     * ----------------------------------------------------
     * ADD FAVORITE
     * ----------------------------------------------------
     */
    const [addFavorite] =
        useMutation(ADD_FAVORITE_SALON);

    /**
     * ----------------------------------------------------
     * REMOVE FAVORITE
     * ----------------------------------------------------
     */
    const [removeFavorite] =
        useMutation(REMOVE_FAVORITE_SALON);

    /**
     * ----------------------------------------------------
     * TOGGLE FAVORITE
     * ----------------------------------------------------
     */
    const handleFavorite = async () => {
        /**
         * User must be logged in.
         */
        if (!currentUser?.userId) {
            Alert.alert(
                'Login required',
                'Please login to add salons to your favorites.',
            );

            return;
        }

        /**
         * Salon ID must exist.
         */
        if (!salonId) {
            console.log(
                'Salon ID is missing',
            );

            return;
        }

        /**
         * Prevent duplicate clicks.
         */
        if (favoriteLoading) {
            return;
        }

        try {
            setFavoriteLoading(true);

            /**
             * Save previous state.
             *
             * This is important for rollback if
             * the backend request fails.
             */
            const previousState =
                isFavorite;

            /**
             * ------------------------------------------------
             * OPTIMISTIC UI
             * ------------------------------------------------
             *
             * Change the heart immediately.
             */
            setIsFavorite(
                !previousState,
            );

            /**
             * ------------------------------------------------
             * REMOVE FAVORITE
             * ------------------------------------------------
             */
            if (previousState) {
                const { data } =
                    await removeFavorite({
                        variables: {
                            input: {
                                userId:
                                    currentUser.userId,

                                salonId,
                            },
                        },
                    });

                console.log(
                    'Remove favorite response:',
                    data?.removeFavoriteSalon,
                );

                /**
                 * Backend failed.
                 *
                 * Restore previous heart.
                 */
                if (
                    !data?.removeFavoriteSalon
                        ?.success
                ) {
                    setIsFavorite(
                        previousState,
                    );

                    console.log(
                        'Remove favorite failed:',
                        data
                            ?.removeFavoriteSalon
                            ?.message,
                    );
                }
            }

            /**
             * ------------------------------------------------
             * ADD FAVORITE
             * ------------------------------------------------
             */
            else {
                const { data } =
                    await addFavorite({
                        variables: {
                            input: {
                                userId:
                                    currentUser.userId,

                                salonId,
                            },
                        },
                    });

                console.log(
                    'Add favorite response:',
                    data?.addFavoriteSalon,
                );

                /**
                 * Backend failed.
                 *
                 * Restore previous heart.
                 */
                if (
                    !data?.addFavoriteSalon
                        ?.success
                ) {
                    setIsFavorite(
                        previousState,
                    );

                    console.log(
                        'Add favorite failed:',
                        data
                            ?.addFavoriteSalon
                            ?.message,
                    );
                }
            }

            /**
             * ------------------------------------------------
             * REFRESH BACKEND STATUS
             * ------------------------------------------------
             *
             * Makes sure UI and DynamoDB agree.
             */
            await refetchFavoriteStatus();
        } catch (error) {
            console.error(
                'Favorite salon error:',
                error,
            );

            /**
             * Roll back to the state that existed
             * before the request.
             */
            setIsFavorite(
                isFavorite
                    ? true
                    : false,
            );
        } finally {
            setFavoriteLoading(false);
        }
    };

    /**
     * ----------------------------------------------------
     * CATEGORIES
     * ----------------------------------------------------
     */
    const categories = Array.from(
        new Set(
            services
                .map(
                    service =>
                        service.category,
                )
                .filter(Boolean),
        ),
    );

    /**
     * ----------------------------------------------------
     * TOTAL PRICE
     * ----------------------------------------------------
     */
    const totalPrice =
        selectedServices.reduce(
            (sum, item) =>
                sum +
                Number(
                    item.price || 0,
                ),
            0,
        );

    /**
     * ----------------------------------------------------
     * TOTAL DURATION
     * ----------------------------------------------------
     */
    const totalDuration =
        selectedServices.reduce(
            (sum, item) =>
                sum +
                Number(
                    item.duration || 0,
                ),
            0,
        );

    console.log(
        '======================================',
    );

    console.log(
        'SALON DETAILS',
    );

    console.log(
        'Salon:',
        salon,
    );

    console.log(
        'Services:',
        services,
    );

    console.log(
        'Favorite:',
        isFavorite,
    );

    console.log(
        '======================================',
    );

    /**
     * ----------------------------------------------------
     * LOADING
     * ----------------------------------------------------
     */
    if (
        salonLoading ||
        servicesLoading
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
     * ERROR
     * ----------------------------------------------------
     */
    if (
        salonError ||
        servicesError
    ) {
        console.log(
            'Salon Error:',
            salonError,
        );

        console.log(
            'Services Error:',
            servicesError,
        );

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
                    Please check your internet
                    connection and try again.
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

    /**
     * ----------------------------------------------------
     * CURRENT DAY
     * ----------------------------------------------------
     */
    const getCurrentDay =
        (): keyof NonNullable<
            Salon['businessHours']
        > => {
            const day =
                new Date().getDay();

            const days: (
                keyof NonNullable<
                    Salon['businessHours']
                >
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
        salon.businessHours?.[
            today
        ];

    /**
     * ----------------------------------------------------
     * CONVERT HH:mm TO MINUTES
     *
     * 09:00 => 540
     * 19:00 => 1140
     * 24:00 => 1440
     * ----------------------------------------------------
     */
    const parseTimeToMinutes = (
        time: string,
    ): number => {
        const parts =
            time.split(':');

        const hours =
            Number(parts[0]);

        const minutes =
            Number(parts[1] || 0);

        /**
         * 24:00 means midnight/end of day.
         */
        if (hours === 24) {
            return 24 * 60;
        }

        return (
            hours * 60 +
            minutes
        );
    };

    /**
     * ----------------------------------------------------
     * CURRENT OPEN/CLOSED STATUS
     * ----------------------------------------------------
     */
    const getIsSalonOpen =
        (): boolean => {
            /**
             * No hours.
             */
            if (!todayHours) {
                return false;
            }

            /**
             * Today is marked closed.
             */
            if (
                todayHours.isOpen !==
                true
            ) {
                return false;
            }

            /**
             * Missing hours.
             */
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

            console.log(
                '======================================',
            );

            console.log(
                'SALON OPEN STATUS',
            );

            console.log(
                'Salon Status from backend:',
                salon.salonStatus,
            );

            console.log(
                'Today:',
                today,
            );

            console.log(
                'Today Hours:',
                todayHours,
            );

            console.log(
                'Current Time:',
                now.toLocaleTimeString(),
            );

            console.log(
                'Current Minutes:',
                currentMinutes,
            );

            console.log(
                'Open Minutes:',
                openMinutes,
            );

            console.log(
                'Close Minutes:',
                closeMinutes,
            );

            /**
             * ------------------------------------------------
             * CASE 1
             *
             * 09:00 -> 19:00
             * ------------------------------------------------
             */
            if (
                closeMinutes >
                openMinutes
            ) {
                const result =
                    currentMinutes >=
                        openMinutes &&
                    currentMinutes <
                        closeMinutes;

                console.log(
                    'Normal schedule result:',
                    result,
                );

                return result;
            }

            /**
             * ------------------------------------------------
             * CASE 2
             *
             * 18:00 -> 02:00
             *
             * Overnight schedule
             * ------------------------------------------------
             */
            if (
                closeMinutes <
                openMinutes
            ) {
                const result =
                    currentMinutes >=
                        openMinutes ||
                    currentMinutes <
                        closeMinutes;

                console.log(
                    'Overnight schedule result:',
                    result,
                );

                return result;
            }

            /**
             * ------------------------------------------------
             * CASE 3
             *
             * 09:00 -> 09:00
             *
             * Treat as closed.
             * ------------------------------------------------
             */
            console.log(
                'Opening and closing time are identical.',
            );

            return false;
        };

    const isOpen =
        getIsSalonOpen();

    /**
     * ----------------------------------------------------
     * TOGGLE SERVICE
     * ----------------------------------------------------
     */
    const toggleService = (
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
     * ADDRESS
     * ----------------------------------------------------
     */
    const address = [
        salon?.address
            ?.addressLine,
        salon?.address?.city,
    ]
        .filter(Boolean)
        .join(', ');

    /**
     * ----------------------------------------------------
     * COVER IMAGE
     * ----------------------------------------------------
     */
    const coverImage =
        salon.coverImageUrl ||
        salon.logoUrl ||
        'https://picsum.photos/800/500';

    return (
        <SafeAreaView
            style={styles.container}
        >
            <FlatList
                data={services}
                keyExtractor={item =>
                    item.serviceId
                }
                showsVerticalScrollIndicator={
                    false
                }
                contentContainerStyle={{
                    paddingBottom:
                        selectedServices.length >
                        0
                            ? 130
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
                            {/* BACK */}

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

                            {/* TITLE */}

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

                            {/* FAVORITE */}

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

                        <Image
                            source={{
                                uri: coverImage,
                            }}
                            style={
                                styles.cover
                            }
                        />

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

                            {/* RATING */}

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
                                        {(
                                            salon.averageRating ??
                                            0
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

                            {/* ADDRESS */}

                            {!!address && (
                                <Text
                                    style={
                                        styles.address
                                    }
                                    numberOfLines={
                                        2
                                    }
                                >
                                    📍{' '}
                                    {address}
                                </Text>
                            )}

                            {/* OPEN / CLOSED */}

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
                                        : 'Closed'}
                                </Text>

                                {isOpen &&
                                    todayHours?.close && (
                                        <Text
                                            style={
                                                styles.closeText
                                            }
                                        >
                                            • Closes at{' '}
                                            {
                                                todayHours.close
                                            }
                                        </Text>
                                    )}
                            </View>
                        </View>

                        {/* CATEGORIES */}

                        {categories.length >
                            0 && (
                            <View
                                style={
                                    styles.categorySection
                                }
                            >
                                <Text
                                    style={
                                        styles.sectionTitle
                                    }
                                >
                                    Services available
                                </Text>

                                <View
                                    style={
                                        styles.categoryRow
                                    }
                                >
                                    {categories.map(
                                        category => (
                                            <View
                                                key={
                                                    category
                                                }
                                                style={
                                                    styles.categoryChip
                                                }
                                            >
                                                <Text
                                                    style={
                                                        styles.categoryText
                                                    }
                                                >
                                                    {
                                                        category
                                                    }
                                                </Text>
                                            </View>
                                        ),
                                    )}
                                </View>
                            </View>
                        )}

                        {/* SERVICES HEADER */}

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
                                    Services
                                </Text>

                                <Text
                                    style={
                                        styles.serviceCount
                                    }
                                >
                                    {
                                        services.length
                                    }{' '}
                                    services
                                    available
                                </Text>
                            </View>
                        </View>
                    </>
                }
                renderItem={({ item }) => {
                    const selected =
                        selectedServices.some(
                            service =>
                                service.serviceId ===
                                item.serviceId,
                        );

                    return (
                        <View
                            style={[
                                styles.serviceCard,
                                selected &&
                                    styles.selectedServiceCard,
                            ]}
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
                                            1
                                        }
                                    >
                                        {
                                            item.name
                                        }
                                    </Text>

                                    {item.popular && (
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

                                {!!item.category && (
                                    <Text
                                        style={
                                            styles.serviceCategory
                                        }
                                    >
                                        {
                                            item.category
                                        }
                                    </Text>
                                )}

                                {!!item.description && (
                                    <Text
                                        style={
                                            styles.description
                                        }
                                        numberOfLines={
                                            2
                                        }
                                    >
                                        {
                                            item.description
                                        }
                                    </Text>
                                )}

                                <View
                                    style={
                                        styles.serviceMeta
                                    }
                                >
                                    <Text
                                        style={
                                            styles.price
                                        }
                                    >
                                        ₹
                                        {
                                            item.price
                                        }
                                    </Text>

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
                                            item.duration
                                        }{' '}
                                        mins
                                    </Text>
                                </View>
                            </View>

                            <TouchableOpacity
                                style={[
                                    styles.addButton,
                                    selected &&
                                        styles.selectedAddButton,
                                ]}
                                onPress={() =>
                                    toggleService(
                                        item,
                                    )
                                }
                                activeOpacity={
                                    0.8
                                }
                            >
                                <Text
                                    style={[
                                        styles.addButtonText,
                                        selected &&
                                            styles.selectedAddButtonText,
                                    ]}
                                >
                                    {selected
                                        ? '✓'
                                        : '+'}
                                </Text>
                            </TouchableOpacity>
                        </View>
                    );
                }}
                ListEmptyComponent={
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
                            No services available
                        </Text>

                        <Text
                            style={
                                styles.emptyText
                            }
                        >
                            This salon has not
                            added any services
                            yet.
                        </Text>
                    </View>
                }
            />

            {/* BOTTOM BOOKING BAR */}

            {selectedServices.length >
                0 && (
                <View
                    style={
                        styles.bottomBar
                    }
                >
                    <View
                        style={
                            styles.bottomInfo
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
                                styles.totalPrice
                            }
                        >
                            ₹{totalPrice}
                        </Text>

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
                    </View>

                    <TouchableOpacity
                        style={[
                            styles.continueButton,
                            !isOpen &&
                                styles.disabledButton,
                        ]}
                        disabled={!isOpen}
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

                            const params = {
                                salonId:
                                    salon.salonId,

                                salon,

                                customerUserId:
                                    currentUser.userId,

                                services:
                                    selectedServices,
                            };

                            console.log(
                                'Sending to BookingDateTime:',
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
                            {isOpen
                                ? 'Continue'
                                : 'Currently Closed'}
                        </Text>

                        {isOpen && (
                            <Text
                                style={
                                    styles.continueArrow
                                }
                            >
                                →
                            </Text>
                        )}
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
    },

    errorText: {
        marginTop: 8,
        textAlign: 'center',
        color: '#777',
        fontSize: 14,
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

    categorySection: {
        backgroundColor: '#FFF',
        marginTop: 8,
        paddingHorizontal: 18,
        paddingVertical: 17,
    },

    sectionTitle: {
        fontSize: 18,
        fontWeight: '800',
        color: '#111',
    },

    categoryRow: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        marginTop: 11,
    },

    categoryChip: {
        backgroundColor: '#EAF6F3',
        borderRadius: 18,
        paddingHorizontal: 13,
        paddingVertical: 7,
        marginRight: 7,
        marginBottom: 7,
    },

    categoryText: {
        color: PRIMARY,
        fontSize: 12,
        fontWeight: '700',
    },

    servicesHeader: {
        backgroundColor: '#F5F6FA',
        paddingHorizontal: 18,
        paddingTop: 20,
        paddingBottom: 8,
    },

    serviceCount: {
        marginTop: 3,
        fontSize: 12,
        color: '#888',
    },

    serviceCard: {
        marginHorizontal: 15,
        marginVertical: 6,
        padding: 15,
        backgroundColor: '#FFF',
        borderRadius: 15,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        borderWidth: 1,
        borderColor: '#F0F0F0',
    },

    selectedServiceCard: {
        borderColor: PRIMARY,
        backgroundColor: '#F7FCFB',
    },

    serviceInfo: {
        flex: 1,
        paddingRight: 12,
    },

    serviceNameRow: {
        flexDirection: 'row',
        alignItems: 'center',
    },

    serviceName: {
        flexShrink: 1,
        fontSize: 16,
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

    serviceCategory: {
        marginTop: 4,
        fontSize: 11,
        color: PRIMARY,
        fontWeight: '600',
    },

    description: {
        marginTop: 5,
        color: '#888',
        fontSize: 11,
        lineHeight: 16,
    },

    serviceMeta: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 8,
    },

    price: {
        color: PRIMARY,
        fontSize: 16,
        fontWeight: '800',
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
        fontSize: 12,
    },

    addButton: {
        width: 38,
        height: 38,
        borderRadius: 19,
        backgroundColor: PRIMARY,
        alignItems: 'center',
        justifyContent: 'center',
    },

    selectedAddButton: {
        backgroundColor: '#E6F5F1',
        borderWidth: 1,
        borderColor: PRIMARY,
    },

    addButtonText: {
        color: '#FFF',
        fontSize: 24,
        fontWeight: '500',
        lineHeight: 27,
    },

    selectedAddButtonText: {
        color: PRIMARY,
        fontSize: 18,
        fontWeight: '800',
    },

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
    },

    bottomBar: {
        position: 'absolute',
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: '#FFF',
        paddingHorizontal: 17,
        paddingTop: 13,
        paddingBottom: 14,
        borderTopWidth: 1,
        borderTopColor: '#E8E8E8',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },

    bottomInfo: {
        flex: 1,
    },

    selectedText: {
        fontSize: 12,
        color: '#777',
        fontWeight: '600',
    },

    totalPrice: {
        marginTop: 2,
        fontSize: 20,
        color: PRIMARY,
        fontWeight: '800',
    },

    totalDuration: {
        marginTop: 1,
        fontSize: 11,
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

    disabledButton: {
        backgroundColor: '#BDBDBD',
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
});