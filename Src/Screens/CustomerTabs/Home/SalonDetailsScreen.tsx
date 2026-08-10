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

import { useQuery } from '@apollo/client';
import { useUser } from '../../../context/UserContext';

import {
    GET_SALON,
    LIST_SERVICES,
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

    /**
     * We only need salonId from the previous screen.
     *
     * SalonCard sends:
     *
     * navigation.navigate('SalonDetails', {
     *   salonId: salon.salonId ?? salon.id,
     * });
     */
    const salonId = route.params?.salonId;

    console.log('======================================');
    console.log('SALON DETAILS SCREEN');
    console.log('Salon ID:', salonId);
    console.log('Route Params:', route.params);
    console.log('======================================');

    const [selectedServices, setSelectedServices] = useState<Service[]>([]);

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

    const salon: Salon | null = salonData?.getSalon ?? null;

    const services: Service[] = (
        servicesData?.listServices ?? []
    ).filter((service: Service) => service.active);

    const categories = Array.from(
        new Set(
            services
                .map(service => service.category)
                .filter(Boolean)
        )
    );

    const totalPrice = selectedServices.reduce(
        (sum, item) => sum + Number(item.price || 0),
        0
    );

    const totalDuration = selectedServices.reduce(
        (sum, item) => sum + Number(item.duration || 0),
        0
    );

    console.log('Salon:', salon);
    console.log('Services:', services);

    /**
     * ----------------------------------------------------
     * LOADING
     * ----------------------------------------------------
     */
    if (salonLoading || servicesLoading) {
        return (
            <SafeAreaView style={styles.loadingContainer}>
                <ActivityIndicator
                    size="large"
                    color={PRIMARY}
                />

                <Text style={styles.loadingText}>
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
    if (salonError || servicesError) {
        console.log('Salon Error:', salonError);
        console.log('Services Error:', servicesError);

        return (
            <SafeAreaView style={styles.loadingContainer}>
                <Text style={styles.errorTitle}>
                    Unable to load salon
                </Text>

                <Text style={styles.errorText}>
                    Please check your internet connection and try again.
                </Text>

                <TouchableOpacity
                    style={styles.retryButton}
                    onPress={() => navigation.goBack()}
                >
                    <Text style={styles.retryText}>
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
            <SafeAreaView style={styles.loadingContainer}>
                <Text style={styles.errorTitle}>
                    Salon not found
                </Text>

                <Text style={styles.errorText}>
                    This salon may no longer be available.
                </Text>

                <TouchableOpacity
                    style={styles.retryButton}
                    onPress={() => navigation.goBack()}
                >
                    <Text style={styles.retryText}>
                        Go Back
                    </Text>
                </TouchableOpacity>
            </SafeAreaView>
        );
    }

    /**
     * ----------------------------------------------------
     * CURRENT DAY / OPEN STATUS
     * ----------------------------------------------------
     */
    const getCurrentDay = (): keyof NonNullable<
        Salon['businessHours']
    > => {
        const day = new Date().getDay();

        const days: (
            keyof NonNullable<Salon['businessHours']>
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

    const today = getCurrentDay();

    const todayHours =
        salon.businessHours?.[today];

    const isOpen =
        salon.salonStatus === 'OPEN' &&
        todayHours?.isOpen === true;

    /**
     * ----------------------------------------------------
     * CATEGORY LIST
     * ----------------------------------------------------
     *
     * Example:
     *
     * Hair • Facial • Spa • Beard
     */
    // const categories = useMemo(() => {
    //     const unique = Array.from(
    //         new Set(
    //             services
    //                 .map(service => service.category)
    //                 .filter(Boolean)
    //         )
    //     );

    //     return unique;
    // }, [services]);

    /**
     * ----------------------------------------------------
     * TOGGLE SERVICE
     * ----------------------------------------------------
     */
    const toggleService = (service: Service) => {
        const exists = selectedServices.some(
            item =>
                item.serviceId === service.serviceId
        );

        if (exists) {
            setSelectedServices(prev =>
                prev.filter(
                    item =>
                        item.serviceId !== service.serviceId
                )
            );
        } else {
            setSelectedServices(prev => [
                ...prev,
                service,
            ]);
        }
    };

    /**
     * ----------------------------------------------------
     * TOTAL PRICE
     * ----------------------------------------------------
     */
    // const totalPrice = useMemo(() => {
    //     return selectedServices.reduce(
    //         (sum, item) => sum + Number(item.price || 0),
    //         0
    //     );
    // }, [selectedServices]);

    /**
     * ----------------------------------------------------
     * TOTAL DURATION
     * ----------------------------------------------------
     */
    // const totalDuration = useMemo(() => {
    //     return selectedServices.reduce(
    //         (sum, item) =>
    //             sum + Number(item.duration || 0),
    //         0
    //     );
    // }, [selectedServices]);

    /**
     * ----------------------------------------------------
     * ADDRESS
     * ----------------------------------------------------
     */
    const address = [
        salon.address?.addressLine,
        salon.address?.city,
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
        <SafeAreaView style={styles.container}>
            <FlatList
                data={services}
                keyExtractor={item =>
                    item.serviceId
                }
                showsVerticalScrollIndicator={false}
                contentContainerStyle={{
                    paddingBottom:
                        selectedServices.length > 0
                            ? 130
                            : 30,
                }}

                /**
                 * ------------------------------------------------
                 * HEADER
                 * ------------------------------------------------
                 */
                ListHeaderComponent={
                    <>
                        {/* TOP HEADER */}

                        <View style={styles.header}>
                            <TouchableOpacity
                                style={styles.headerButton}
                                onPress={() =>
                                    navigation.goBack()
                                }
                            >
                                <Text style={styles.back}>
                                    ‹
                                </Text>
                            </TouchableOpacity>

                            <Text
                                style={styles.headerTitle}
                                numberOfLines={1}
                            >
                                {salon.salonName}
                            </Text>

                            <TouchableOpacity
                                style={styles.headerButton}
                                onPress={() =>
                                    console.log(
                                        'Favorite salon:',
                                        salon.salonId
                                    )
                                }
                            >
                                <Text style={styles.favorite}>
                                    ♡
                                </Text>
                            </TouchableOpacity>
                        </View>

                        {/* COVER */}

                        <Image
                            source={{
                                uri: coverImage,
                            }}
                            style={styles.cover}
                        />

                        {/* SALON INFORMATION */}

                        <View style={styles.salonInfo}>
                            <Text
                                style={styles.salonName}
                                numberOfLines={1}
                            >
                                {salon.salonName}
                            </Text>

                            {/* RATING */}

                            <View style={styles.ratingRow}>
                                <View style={styles.ratingBadge}>
                                    <Text style={styles.ratingStar}>
                                        ★
                                    </Text>

                                    <Text style={styles.ratingValue}>
                                        {(salon.averageRating ?? 0).toFixed(
                                            1
                                        )}
                                    </Text>
                                </View>

                                <Text style={styles.reviewCount}>
                                    {salon.totalReviews ?? 0} reviews
                                </Text>
                            </View>

                            {/* ADDRESS */}

                            {!!address && (
                                <Text
                                    style={styles.address}
                                    numberOfLines={2}
                                >
                                    📍 {address}
                                </Text>
                            )}

                            {/* OPEN / CLOSED */}

                            <View style={styles.statusRow}>
                                <View
                                    style={[
                                        styles.statusDot,
                                        {
                                            backgroundColor: isOpen
                                                ? '#22A06B'
                                                : '#D64545',
                                        },
                                    ]}
                                />

                                <Text
                                    style={[
                                        styles.statusText,
                                        {
                                            color: isOpen
                                                ? '#16834F'
                                                : '#C03939',
                                        },
                                    ]}
                                >
                                    {isOpen
                                        ? 'Open now'
                                        : 'Closed'}
                                </Text>

                                {todayHours?.isOpen &&
                                    todayHours.close && (
                                        <Text style={styles.closeText}>
                                            • Closes at {todayHours.close}
                                        </Text>
                                    )}
                            </View>
                        </View>

                        {/* CATEGORIES */}

                        {categories.length > 0 && (
                            <View style={styles.categorySection}>
                                <Text style={styles.sectionTitle}>
                                    Services available
                                </Text>

                                <View style={styles.categoryRow}>
                                    {categories.map(category => (
                                        <View
                                            key={category}
                                            style={styles.categoryChip}
                                        >
                                            <Text
                                                style={styles.categoryText}
                                            >
                                                {category}
                                            </Text>
                                        </View>
                                    ))}
                                </View>
                            </View>
                        )}

                        {/* SECTION TITLE */}

                        <View style={styles.servicesHeader}>
                            <View>
                                <Text style={styles.sectionTitle}>
                                    Services
                                </Text>

                                <Text style={styles.serviceCount}>
                                    {services.length} services available
                                </Text>
                            </View>
                        </View>
                    </>
                }

                /**
                 * ------------------------------------------------
                 * SERVICE CARD
                 * ------------------------------------------------
                 */
                renderItem={({ item }) => {
                    const selected =
                        selectedServices.some(
                            service =>
                                service.serviceId ===
                                item.serviceId
                        );

                    return (
                        <View
                            style={[
                                styles.serviceCard,
                                selected &&
                                styles.selectedServiceCard,
                            ]}
                        >
                            <View style={styles.serviceInfo}>
                                <View style={styles.serviceNameRow}>
                                    <Text
                                        style={styles.serviceName}
                                        numberOfLines={1}
                                    >
                                        {item.name}
                                    </Text>

                                    {item.popular && (
                                        <View style={styles.popularBadge}>
                                            <Text
                                                style={styles.popularText}
                                            >
                                                Popular
                                            </Text>
                                        </View>
                                    )}
                                </View>

                                {!!item.category && (
                                    <Text
                                        style={styles.serviceCategory}
                                    >
                                        {item.category}
                                    </Text>
                                )}

                                {!!item.description && (
                                    <Text
                                        style={styles.description}
                                        numberOfLines={2}
                                    >
                                        {item.description}
                                    </Text>
                                )}

                                <View style={styles.serviceMeta}>
                                    <Text style={styles.price}>
                                        ₹{item.price}
                                    </Text>

                                    <View style={styles.metaDot} />

                                    <Text style={styles.duration}>
                                        {item.duration} mins
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
                                    toggleService(item)
                                }
                                activeOpacity={0.8}
                            >
                                <Text
                                    style={[
                                        styles.addButtonText,
                                        selected &&
                                        styles.selectedAddButtonText,
                                    ]}
                                >
                                    {selected ? '✓' : '+'}
                                </Text>
                            </TouchableOpacity>
                        </View>
                    );
                }}

                ListEmptyComponent={
                    <View style={styles.emptyServices}>
                        <Text style={styles.emptyTitle}>
                            No services available
                        </Text>

                        <Text style={styles.emptyText}>
                            This salon has not added any services yet.
                        </Text>
                    </View>
                }
            />

            {/* -----------------------------------------------
          BOTTOM BOOKING BAR
      ----------------------------------------------- */}

            {selectedServices.length > 0 && (
                <View style={styles.bottomBar}>
                    <View style={styles.bottomInfo}>
                        <Text style={styles.selectedText}>
                            {selectedServices.length}{' '}
                            {selectedServices.length === 1
                                ? 'service'
                                : 'services'}
                        </Text>

                        <Text style={styles.totalPrice}>
                            ₹{totalPrice}
                        </Text>

                        <Text style={styles.totalDuration}>
                            {totalDuration} mins
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
                            if (!currentUser?.userId) {
                                Alert.alert(
                                    'Login required',
                                    'Please login to continue booking.'
                                );
                                return;
                            }

                            const params = {
                                salonId: salon.salonId,
                                salon,
                                customerUserId:
                                    currentUser.userId,
                                services: selectedServices,
                            };

                            console.log(
                                'Sending to BookingDateTime:',
                                params
                            );

                            navigation.navigate(
                                'BookingDateTime',
                                params
                            );
                        }}
                    >
                        <Text style={styles.continueText}>
                            {isOpen
                                ? 'Continue'
                                : 'Currently Closed'}
                        </Text>

                        {isOpen && (
                            <Text style={styles.continueArrow}>
                                →
                            </Text>
                        )}
                    </TouchableOpacity>
                </View>
            )}
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F5F6FA',
    },

    /* -----------------------------------------------
       LOADING / ERROR
    ----------------------------------------------- */

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

    /* -----------------------------------------------
       HEADER
    ----------------------------------------------- */

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
        fontSize: 30,
        color: '#222',
    },

    /* -----------------------------------------------
       COVER
    ----------------------------------------------- */

    cover: {
        width: '100%',
        height: 220,
        backgroundColor: '#E8E8E8',
    },

    /* -----------------------------------------------
       SALON INFO
    ----------------------------------------------- */

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

    /* -----------------------------------------------
       CATEGORIES
    ----------------------------------------------- */

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

    /* -----------------------------------------------
       SERVICES HEADER
    ----------------------------------------------- */

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

    /* -----------------------------------------------
       SERVICE CARD
    ----------------------------------------------- */

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

    /* -----------------------------------------------
       EMPTY SERVICES
    ----------------------------------------------- */

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

    /* -----------------------------------------------
       BOTTOM BAR
    ----------------------------------------------- */

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

