import React, {
    useCallback,
    useEffect,
    useMemo,
    useState,
} from 'react';

import {
    SafeAreaView,
    FlatList,
    View,
    Text,
    TextInput,
    TouchableOpacity,
    StyleSheet,
    Image,
    ActivityIndicator,
    RefreshControl,
} from 'react-native';

import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';

import { useApolloClient } from '@apollo/client';

import { useNavigation } from '@react-navigation/native';

import { GET_NEARBY_SALONS } from '../../../graphql/queries';

import { getSavedLocation } from '../../../services/locationStorage';

// ============================================================
// TYPES
// ============================================================

type FilterType =
    | 'Nearby'
    | 'Top Rated'
    | 'Open Now';

type BusinessDay = {
    open: string;
    close: string;
    isOpen: boolean;
};

type BusinessHours = {
    MONDAY: BusinessDay;
    TUESDAY: BusinessDay;
    WEDNESDAY: BusinessDay;
    THURSDAY: BusinessDay;
    FRIDAY: BusinessDay;
    SATURDAY: BusinessDay;
    SUNDAY: BusinessDay;
};

type Salon = {
    salonId: string;
    salonName: string;
    businessType?: string;

    address?: {
        addressLine: string;
        city: string;
        state: string;
        pincode: string;
    };

    latitude?: number;
    longitude?: number;
    distance?: number;

    logoUrl?: string;
    coverImageUrl?: string;
    galleryImages?: string[];

    businessHours?: BusinessHours;

    salonStatus?: string;

    isActive?: boolean;
    isVisible?: boolean;
    isDeleted?: boolean;

    averageRating: number;
    totalReviews: number;
    totalAppointments?: number;
};

// ============================================================
// FILTERS
// ============================================================

const filters: FilterType[] = [
    'Nearby',
    'Top Rated',
    'Open Now',
];

// ============================================================
// SERVICE CATEGORIES
// ============================================================

const categories = [
    {
        name: 'All',
        icon: 'view-grid-outline',
    },
    {
        name: 'Hair',
        icon: 'content-cut',
    },
    {
        name: 'Face',
        icon: 'face-woman-outline',
    },
    {
        name: 'Skin',
        icon: 'face-outline',
    },
    {
        name: 'Nails',
        icon: 'hand-back-right-outline',
    },
    {
        name: 'Makeup',
        icon: 'lipstick',
    },
    {
        name: 'Beard',
        icon: 'face-man-outline',
    },
    {
        name: 'Spa',
        icon: 'spa-outline',
    },
    {
        name: 'Massage',
        icon: 'hand-heart-outline',
    },
    {
        name: 'Waxing',
        icon: 'hair-dryer',
    },
    {
        name: 'Threading',
        icon: 'eye-outline',
    },
    {
        name: 'Bridal',
        icon: 'ring',
    },
    {
        name: "Men's Grooming",
        icon: 'account-tie-outline',
    },
];

// ============================================================
// HARD CODED LOCATION
// ============================================================

const HARDCODED_LATITUDE = 12.963694;
const HARDCODED_LONGITUDE = 77.4014239;

const DEFAULT_RADIUS = 10;

// ============================================================
// GET CURRENT DAY
// ============================================================

const getCurrentDay = (): keyof BusinessHours => {
    const day = new Date().getDay();

    const days: Array<keyof BusinessHours> = [
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

// ============================================================
// CONVERT TIME TO MINUTES
// ============================================================

const convertTimeToMinutes = (
    time: string,
): number | null => {
    if (!time) {
        return null;
    }

    const value = time.trim().toUpperCase();

    const match = value.match(
        /^(\d{1,2}):(\d{2})\s*(AM|PM)?$/,
    );

    if (!match) {
        return null;
    }

    let hour = Number(match[1]);
    const minute = Number(match[2]);
    const period = match[3];

    if (period === 'AM') {
        if (hour === 12) {
            hour = 0;
        }
    }

    if (period === 'PM') {
        if (hour !== 12) {
            hour += 12;
        }
    }

    return hour * 60 + minute;
};

// ============================================================
// CHECK SALON OPEN NOW
// ============================================================

const isSalonOpenNow = (
    salon: Salon,
): boolean => {
    if (
        salon.salonStatus === 'CLOSED' ||
        salon.salonStatus === 'TEMPORARILY_CLOSED'
    ) {
        return false;
    }

    if (!salon.businessHours) {
        return false;
    }

    const today =
        salon.businessHours[getCurrentDay()];

    if (!today || !today.isOpen) {
        return false;
    }

    const openMinutes =
        convertTimeToMinutes(today.open);

    const closeMinutes =
        convertTimeToMinutes(today.close);

    if (
        openMinutes === null ||
        closeMinutes === null
    ) {
        return false;
    }

    const now = new Date();

    const currentMinutes =
        now.getHours() * 60 +
        now.getMinutes();

    // Normal opening
    if (closeMinutes > openMinutes) {
        return (
            currentMinutes >= openMinutes &&
            currentMinutes < closeMinutes
        );
    }

    // Overnight opening
    return (
        currentMinutes >= openMinutes ||
        currentMinutes < closeMinutes
    );
};

// ============================================================
// FORMAT DISTANCE
// ============================================================

const formatDistance = (
    distance?: number,
): string => {
    if (
        distance === undefined ||
        distance === null
    ) {
        return '';
    }

    if (distance < 1) {
        return `${Math.round(
            distance * 1000,
        )} m`;
    }

    return `${distance.toFixed(1)} km`;
};

// ============================================================
// MAIN COMPONENT
// ============================================================

export default function ExplorePage() {
    const client = useApolloClient();

    const navigation =
        useNavigation<any>();

    // ========================================================
    // STATE
    // ========================================================
    console.log(
        'EXPLORE PAGE NAVIGATION STATE:',
        navigation.getState()
    );
    const [salons, setSalons] =
        useState<Salon[]>([]);

    const [search, setSearch] =
        useState('');

    const [activeFilter, setActiveFilter] =
        useState<FilterType>('Nearby');

    const [selectedCategory, setSelectedCategory] =
        useState('All');

    const [loading, setLoading] =
        useState(true);

    const [refreshing, setRefreshing] =
        useState(false);

    const [error, setError] =
        useState('');

    const [selectedLocation, setSelectedLocation] =
        useState('Nearby');

    // ========================================================
    // LOCATION DISPLAY ONLY
    // LOCATION COORDINATES REMAIN HARDCODED
    // ========================================================

    const loadLocation = async () => {
        try {
            const location =
                await getSavedLocation();

            if (location) {
                setSelectedLocation(
                    location.address,
                );
            }
        } catch (error) {
            console.log(
                'Explore location error:',
                error,
            );
        }
    };

    // ========================================================
    // FETCH SALONS
    // ========================================================

    const fetchSalons = useCallback(
        async (
            searchText = '',
            category = selectedCategory,
        ) => {
            try {
                setError('');

                setLoading(true);

                const cleanSearch =
                    searchText.trim();

                const cleanCategory =
                    category === 'All'
                        ? null
                        : category;

                const variables = {
                    latitude:
                        HARDCODED_LATITUDE,

                    longitude:
                        HARDCODED_LONGITUDE,

                    radius:
                        DEFAULT_RADIUS,

                    search:
                        cleanSearch
                            ? cleanSearch
                            : null,

                    category:
                        cleanCategory,
                };

                console.log(
                    '======================================',
                );

                console.log(
                    'EXPLORE - FETCH SALONS',
                );

                console.log(
                    'Variables:',
                    variables,
                );

                console.log(
                    '======================================',
                );

                const { data } =
                    await client.query({
                        query:
                            GET_NEARBY_SALONS,

                        variables,

                        fetchPolicy:
                            'network-only',
                    });

                const results =
                    data?.nearbySalons || [];

                console.log(
                    'Explore salons:',
                    results,
                );

                setSalons(results);
            } catch (err) {
                console.log(
                    'Explore fetch error:',
                    err,
                );

                setError(
                    'Unable to load salons. Please try again.',
                );
            } finally {
                setLoading(false);
            }
        },
        [
            client,
            selectedCategory,
        ],
    );

    // ========================================================
    // INITIAL LOAD
    // ========================================================

    useEffect(() => {
        loadLocation();

        fetchSalons('', 'All');
    }, []);

    // ========================================================
    // SEARCH DEBOUNCE
    // ========================================================

    useEffect(() => {
        const timer =
            setTimeout(() => {
                fetchSalons(
                    search,
                    selectedCategory,
                );
            }, 500);

        return () => {
            clearTimeout(timer);
        };
    }, [
        search,
        selectedCategory,
    ]);

    // ========================================================
    // CATEGORY SELECT
    // ========================================================

    const handleCategorySelect = (
        category: string,
    ) => {
        console.log(
            'Selected category:',
            category,
        );

        setSelectedCategory(
            category,
        );

        setActiveFilter(
            'Nearby',
        );
    };

    // ========================================================
    // REFRESH
    // ========================================================

    const handleRefresh =
        async () => {
            setRefreshing(true);

            await fetchSalons(
                search,
                selectedCategory,
            );

            setRefreshing(false);
        };

    // ========================================================
    // FILTER / SORT
    // ========================================================

    const displayedSalons =
        useMemo(() => {
            let result = [
                ...salons,
            ];

            // Remove invalid salons
            result = result.filter(
                salon =>
                    salon.isActive !== false &&
                    salon.isVisible !== false &&
                    salon.isDeleted !== true,
            );

            // Open Now
            if (
                activeFilter ===
                'Open Now'
            ) {
                result =
                    result.filter(
                        salon =>
                            isSalonOpenNow(
                                salon,
                            ),
                    );
            }

            // Top Rated
            if (
                activeFilter ===
                'Top Rated'
            ) {
                result.sort(
                    (a, b) =>
                        (b.averageRating || 0) -
                        (a.averageRating || 0),
                );
            }

            // Nearby
            if (
                activeFilter ===
                'Nearby'
            ) {
                result.sort(
                    (a, b) =>
                        (a.distance || 999) -
                        (b.distance || 999),
                );
            }

            return result;
        }, [
            salons,
            activeFilter,
        ]);

    // ========================================================
    // SECTION TITLE
    // ========================================================

    const getHeading = () => {
        if (
            search.trim()
        ) {
            return `Results for "${search.trim()}"`;
        }

        if (
            selectedCategory !==
            'All'
        ) {
            return `${selectedCategory} Salons`;
        }

        if (
            activeFilter ===
            'Top Rated'
        ) {
            return 'Top Rated Salons';
        }

        if (
            activeFilter ===
            'Open Now'
        ) {
            return 'Salons Open Now';
        }

        return 'Nearby Salons';
    };

    // ========================================================
    // SALON CARD
    // ========================================================

    const renderSalon = ({
        item,
    }: {
        item: Salon;
    }) => {
        const image =
            item.coverImageUrl ||
            item.logoUrl ||
            item.galleryImages?.[0];

        const openNow =
            isSalonOpenNow(item);
        const handlePress = () => {
            console.log('Salon selected:', item.salonId);

            navigation.navigate('SalonDetails', {
                salonId: item.salonId,
            });
        };

        return (
            <TouchableOpacity
                activeOpacity={0.9}
                style={styles.card}
                onPress={handlePress}
            >
                {/* IMAGE */}

                <View
                    style={
                        styles.imageWrapper
                    }
                >
                    {image ? (
                        <Image
                            source={{
                                uri: image,
                            }}
                            style={
                                styles.image
                            }
                            resizeMode="cover"
                        />
                    ) : (
                        <View
                            style={
                                styles.imagePlaceholder
                            }
                        >
                            <MaterialCommunityIcons
                                name="storefront-outline"
                                size={42}
                                color="#AAAAAA"
                            />

                            <Text
                                style={
                                    styles.placeholderText
                                }
                            >
                                No image
                            </Text>
                        </View>
                    )}

                    {/* IMAGE GRADIENT-LIKE OVERLAY */}

                    <View
                        style={
                            styles.imageOverlay
                        }
                    />

                    {/* OPEN STATUS */}

                    <View
                        style={[
                            styles.statusBadge,
                            openNow
                                ? styles.openBadge
                                : styles.closedBadge,
                        ]}
                    >
                        <View
                            style={[
                                styles.statusDot,
                                openNow
                                    ? styles.openDot
                                    : styles.closedDot,
                            ]}
                        />

                        <Text
                            style={
                                styles.statusText
                            }
                        >
                            {openNow
                                ? 'Open Now'
                                : 'Closed'}
                        </Text>
                    </View>

                    {/* DISTANCE */}

                    {item.distance !==
                        undefined && (
                            <View
                                style={
                                    styles.distanceBadge
                                }
                            >
                                <MaterialCommunityIcons
                                    name="map-marker-distance"
                                    size={13}
                                    color="#FFFFFF"
                                />

                                <Text
                                    style={
                                        styles.distanceBadgeText
                                    }
                                >
                                    {formatDistance(
                                        item.distance,
                                    )}
                                </Text>
                            </View>
                        )}
                </View>

                {/* CONTENT */}

                <View
                    style={
                        styles.cardContent
                    }
                >
                    {/* NAME */}

                    <View
                        style={
                            styles.nameRow
                        }
                    >
                        <Text
                            numberOfLines={1}
                            style={
                                styles.name
                            }
                        >
                            {item.salonName}
                        </Text>

                        <MaterialCommunityIcons
                            name="chevron-right"
                            size={22}
                            color="#999999"
                        />
                    </View>

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
                            <MaterialCommunityIcons
                                name="star"
                                size={13}
                                color="#FFFFFF"
                            />

                            <Text
                                style={
                                    styles.ratingText
                                }
                            >
                                {(
                                    item.averageRating ||
                                    0
                                ).toFixed(1)}
                            </Text>
                        </View>

                        <Text
                            style={
                                styles.reviewText
                            }
                        >
                            {item.totalReviews ||
                                0}{' '}
                            reviews
                        </Text>
                    </View>

                    {/* ADDRESS */}

                    <View
                        style={
                            styles.infoRow
                        }
                    >
                        <MaterialCommunityIcons
                            name="map-marker-outline"
                            size={17}
                            color="#777777"
                        />

                        <Text
                            numberOfLines={1}
                            style={
                                styles.infoText
                            }
                        >
                            {item.address
                                ?.addressLine ||
                                item.address
                                    ?.city ||
                                'Location unavailable'}
                        </Text>
                    </View>

                    {/* BUSINESS TYPE */}

                    {item.businessType && (
                        <View
                            style={
                                styles.typeRow
                            }
                        >
                            <MaterialCommunityIcons
                                name="store-outline"
                                size={16}
                                color="#009D94"
                            />

                            <Text
                                style={
                                    styles.typeText
                                }
                            >
                                {
                                    item.businessType
                                }
                            </Text>
                        </View>
                    )}

                    {/* BOOK BUTTON */}

                    <View
                        style={
                            styles.bottomRow
                        }
                    >
                        <Text
                            style={
                                styles.viewText
                            }

                        >
                            View salon
                        </Text>

                        <MaterialCommunityIcons
                            name="arrow-right"
                            size={18}
                            color="#009D94"
                        />
                    </View>
                </View>
            </TouchableOpacity>
        );
    };

    // ========================================================
    // EMPTY STATE
    // ========================================================

    const renderEmpty = () => {
        if (loading) {
            return (
                <View
                    style={
                        styles.emptyContainer
                    }
                >
                    <ActivityIndicator
                        size="large"
                        color="#009D94"
                    />

                    <Text
                        style={
                            styles.emptyTitle
                        }
                    >
                        Finding salons nearby...
                    </Text>

                    <Text
                        style={
                            styles.emptySubtitle
                        }
                    >
                        Please wait a moment
                    </Text>
                </View>
            );
        }

        if (error) {
            return (
                <View
                    style={
                        styles.emptyContainer
                    }
                >
                    <MaterialCommunityIcons
                        name="wifi-off"
                        size={46}
                        color="#AAAAAA"
                    />

                    <Text
                        style={
                            styles.emptyTitle
                        }
                    >
                        Something went wrong
                    </Text>

                    <Text
                        style={
                            styles.emptySubtitle
                        }
                    >
                        {error}
                    </Text>

                    <TouchableOpacity
                        style={
                            styles.retryButton
                        }
                        onPress={() =>
                            fetchSalons(
                                search,
                                selectedCategory,
                            )
                        }
                    >
                        <Text
                            style={
                                styles.retryText
                            }
                        >
                            Try Again
                        </Text>
                    </TouchableOpacity>
                </View>
            );
        }

        return (
            <View
                style={
                    styles.emptyContainer
                }
            >
                <MaterialCommunityIcons
                    name="store-search-outline"
                    size={58}
                    color="#BBBBBB"
                />

                <Text
                    style={
                        styles.emptyTitle
                    }
                >
                    No salons found
                </Text>

                <Text
                    style={
                        styles.emptySubtitle
                    }
                >
                    Try another category,
                    search, or filter.
                </Text>

                {selectedCategory !==
                    'All' && (
                        <TouchableOpacity
                            style={
                                styles.clearCategoryButton
                            }
                            onPress={() =>
                                setSelectedCategory(
                                    'All',
                                )
                            }
                        >
                            <Text
                                style={
                                    styles.clearCategoryText
                                }
                            >
                                View all salons
                            </Text>
                        </TouchableOpacity>
                    )}
            </View>
        );
    };

    // ========================================================
    // HEADER
    // ========================================================

    const renderHeader = () => (
        <View>
            {/* HEADER */}

            <View
                style={
                    styles.header
                }
            >
                <View
                    style={
                        styles.headerTextContainer
                    }
                >
                    <Text
                        style={
                            styles.smallTitle
                        }
                    >
                        Discover
                    </Text>

                    <Text
                        style={
                            styles.title
                        }
                    >
                        Explore Salons
                    </Text>
                </View>

                <TouchableOpacity
                    activeOpacity={0.8}
                    style={
                        styles.locationButton
                    }
                >
                    <MaterialCommunityIcons
                        name="map-marker"
                        size={17}
                        color="#009D94"
                    />

                    <Text
                        numberOfLines={1}
                        style={
                            styles.locationText
                        }
                    >
                        {selectedLocation}
                    </Text>
                </TouchableOpacity>
            </View>

            {/* SEARCH */}

            <View
                style={
                    styles.searchContainer
                }
            >
                <MaterialCommunityIcons
                    name="magnify"
                    size={23}
                    color="#777777"
                />

                <TextInput
                    value={search}
                    onChangeText={
                        setSearch
                    }
                    placeholder="Search salons or services"
                    placeholderTextColor="#999999"
                    style={
                        styles.searchInput
                    }
                    returnKeyType="search"
                />

                {search.length > 0 && (
                    <TouchableOpacity
                        onPress={() =>
                            setSearch('')
                        }
                    >
                        <MaterialCommunityIcons
                            name="close-circle"
                            size={20}
                            color="#AAAAAA"
                        />
                    </TouchableOpacity>
                )}
            </View>

            {/* ==================================================
                SERVICE CATEGORY CAROUSEL
            ================================================== */}

            <View
                style={
                    styles.categorySection
                }
            >
                <View
                    style={
                        styles.categoryHeader
                    }
                >
                    <Text
                        style={
                            styles.categoryTitle
                        }
                    >
                        Services
                    </Text>

                    <Text
                        style={
                            styles.categoryHint
                        }
                    >
                        Explore by service
                    </Text>
                </View>

                <FlatList
                    horizontal
                    data={categories}
                    keyExtractor={item =>
                        item.name
                    }
                    showsHorizontalScrollIndicator={
                        false
                    }
                    contentContainerStyle={
                        styles.categoryList
                    }
                    renderItem={({
                        item,
                    }) => {
                        const selected =
                            selectedCategory ===
                            item.name;

                        return (
                            <TouchableOpacity
                                activeOpacity={
                                    0.8
                                }
                                onPress={() =>
                                    handleCategorySelect(
                                        item.name,
                                    )
                                }
                                style={[
                                    styles.categoryItem,
                                    selected &&
                                    styles.selectedCategoryItem,
                                ]}
                            >
                                <View
                                    style={[
                                        styles.categoryIcon,
                                        selected &&
                                        styles.selectedCategoryIcon,
                                    ]}
                                >
                                    <MaterialCommunityIcons
                                        name={
                                            item.icon
                                        }
                                        size={
                                            25
                                        }
                                        color={
                                            selected
                                                ? '#FFFFFF'
                                                : '#009D94'
                                        }
                                    />
                                </View>

                                <Text
                                    numberOfLines={
                                        1
                                    }
                                    style={[
                                        styles.categoryText,
                                        selected &&
                                        styles.selectedCategoryText,
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

            {/* ==================================================
                FILTERS
            ================================================== */}

            <FlatList
                horizontal
                data={filters}
                keyExtractor={item =>
                    item
                }
                showsHorizontalScrollIndicator={
                    false
                }
                contentContainerStyle={
                    styles.filterList
                }
                renderItem={({
                    item,
                }) => {
                    const selected =
                        activeFilter ===
                        item;

                    let icon =
                        'filter-outline';

                    if (
                        item ===
                        'Nearby'
                    ) {
                        icon =
                            'map-marker-radius-outline';
                    }

                    if (
                        item ===
                        'Top Rated'
                    ) {
                        icon =
                            'star-outline';
                    }

                    if (
                        item ===
                        'Open Now'
                    ) {
                        icon =
                            'clock-outline';
                    }

                    return (
                        <TouchableOpacity
                            activeOpacity={
                                0.8
                            }
                            onPress={() =>
                                setActiveFilter(
                                    item,
                                )
                            }
                            style={[
                                styles.filter,
                                selected &&
                                styles.selectedFilter,
                            ]}
                        >
                            <MaterialCommunityIcons
                                name={
                                    icon
                                }
                                size={
                                    17
                                }
                                color={
                                    selected
                                        ? '#FFFFFF'
                                        : '#555555'
                                }
                            />

                            <Text
                                style={[
                                    styles.filterText,
                                    selected &&
                                    styles.selectedFilterText,
                                ]}
                            >
                                {
                                    item
                                }
                            </Text>
                        </TouchableOpacity>
                    );
                }}
            />

            {/* SECTION */}

            <View
                style={
                    styles.sectionHeader
                }
            >
                <View>
                    <Text
                        style={
                            styles.heading
                        }
                    >
                        {getHeading()}
                    </Text>

                    <Text
                        style={
                            styles.resultCount
                        }
                    >
                        {
                            displayedSalons.length
                        }{' '}
                        salons found
                    </Text>
                </View>
            </View>
        </View>
    );

    // ========================================================
    // MAIN UI
    // ========================================================

    return (
        <SafeAreaView
            style={
                styles.container
            }
        >
            <FlatList
                data={
                    displayedSalons
                }
                keyExtractor={item =>
                    item.salonId
                }
                renderItem={
                    renderSalon
                }
                ListHeaderComponent={
                    renderHeader()
                }
                ListEmptyComponent={
                    renderEmpty()
                }
                refreshControl={
                    <RefreshControl
                        refreshing={
                            refreshing
                        }
                        onRefresh={
                            handleRefresh
                        }
                        tintColor="#009D94"
                    />
                }
                contentContainerStyle={
                    displayedSalons.length ===
                        0
                        ? styles.emptyList
                        : styles.list
                }
                showsVerticalScrollIndicator={
                    false
                }
            />
        </SafeAreaView>
    );
}

// ============================================================
// STYLES
// ============================================================

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F7F8FA',
    },

    list: {
        paddingBottom: 30,
    },

    emptyList: {
        flexGrow: 1,
    },

    // ========================================================
    // HEADER
    // ========================================================

    header: {
        paddingHorizontal: 20,
        paddingTop: 15,
        paddingBottom: 18,

        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },

    headerTextContainer: {
        flex: 1,
    },

    smallTitle: {
        fontSize: 13,
        color: '#777777',
        marginBottom: 2,
    },

    title: {
        fontSize: 27,
        fontWeight: '800',
        color: '#171717',
    },

    locationButton: {
        maxWidth: 145,

        flexDirection: 'row',
        alignItems: 'center',

        backgroundColor: '#EAF8F6',

        paddingHorizontal: 10,
        paddingVertical: 8,

        borderRadius: 20,
    },

    locationText: {
        marginLeft: 4,
        fontSize: 11,
        fontWeight: '600',
        color: '#007F77',
    },

    // ========================================================
    // SEARCH
    // ========================================================

    searchContainer: {
        marginHorizontal: 20,

        height: 54,

        backgroundColor: '#FFFFFF',

        borderRadius: 16,

        paddingHorizontal: 15,

        flexDirection: 'row',
        alignItems: 'center',

        borderWidth: 1,
        borderColor: '#EEEEEE',

        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.04,
        shadowRadius: 5,

        elevation: 2,
    },

    searchInput: {
        flex: 1,

        marginLeft: 10,

        fontSize: 14,
        color: '#222222',
    },

    // ========================================================
    // CATEGORIES
    // ========================================================

    categorySection: {
        marginTop: 22,
    },

    categoryHeader: {
        paddingHorizontal: 20,

        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',

        marginBottom: 12,
    },

    categoryTitle: {
        fontSize: 18,
        fontWeight: '800',
        color: '#171717',
    },

    categoryHint: {
        fontSize: 11,
        color: '#999999',
    },

    categoryList: {
        paddingHorizontal: 20,
        paddingBottom: 5,
    },

    categoryItem: {
        width: 76,

        alignItems: 'center',

        marginRight: 12,
    },

    selectedCategoryItem: {
        transform: [
            {
                scale: 1.02,
            },
        ],
    },

    categoryIcon: {
        width: 58,
        height: 58,

        borderRadius: 18,

        backgroundColor: '#EAF8F6',

        alignItems: 'center',
        justifyContent: 'center',

        borderWidth: 1,
        borderColor: '#D8F0ED',
    },

    selectedCategoryIcon: {
        backgroundColor: '#009D94',
        borderColor: '#009D94',
    },

    categoryText: {
        marginTop: 7,

        fontSize: 11,
        fontWeight: '600',

        color: '#555555',

        textAlign: 'center',
    },

    selectedCategoryText: {
        color: '#009D94',
        fontWeight: '800',
    },

    // ========================================================
    // FILTERS
    // ========================================================

    filterList: {
        paddingHorizontal: 20,
        paddingTop: 18,
        paddingBottom: 16,
    },

    filter: {
        height: 40,

        paddingHorizontal: 15,

        borderRadius: 20,

        backgroundColor: '#FFFFFF',

        borderWidth: 1,
        borderColor: '#E5E5E5',

        marginRight: 9,

        flexDirection: 'row',
        alignItems: 'center',
    },

    selectedFilter: {
        backgroundColor: '#009D94',
        borderColor: '#009D94',
    },

    filterText: {
        marginLeft: 6,

        fontSize: 13,
        fontWeight: '600',

        color: '#555555',
    },

    selectedFilterText: {
        color: '#FFFFFF',
    },

    // ========================================================
    // SECTION
    // ========================================================

    sectionHeader: {
        paddingHorizontal: 20,
        marginBottom: 12,
    },

    heading: {
        fontSize: 21,
        fontWeight: '800',
        color: '#171717',
    },

    resultCount: {
        marginTop: 3,

        fontSize: 12,
        color: '#888888',
    },

    // ========================================================
    // CARD
    // ========================================================

    card: {
        marginHorizontal: 20,
        marginBottom: 16,

        backgroundColor: '#FFFFFF',

        borderRadius: 20,

        overflow: 'hidden',

        borderWidth: 1,
        borderColor: '#EEEEEE',

        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 3,
        },
        shadowOpacity: 0.05,
        shadowRadius: 8,

        elevation: 3,
    },

    // ========================================================
    // CARD IMAGE
    // ========================================================

    imageWrapper: {
        width: '100%',
        height: 185,

        position: 'relative',
    },

    image: {
        width: '100%',
        height: '100%',
    },

    imageOverlay: {
        position: 'absolute',

        left: 0,
        right: 0,
        bottom: 0,

        height: 65,

        backgroundColor: 'rgba(0,0,0,0.10)',
    },

    imagePlaceholder: {
        flex: 1,

        backgroundColor: '#F0F1F3',

        alignItems: 'center',
        justifyContent: 'center',
    },

    placeholderText: {
        marginTop: 5,

        fontSize: 11,
        color: '#999999',
    },

    // ========================================================
    // STATUS
    // ========================================================

    statusBadge: {
        position: 'absolute',

        top: 12,
        right: 12,

        paddingHorizontal: 10,
        paddingVertical: 6,

        borderRadius: 15,

        flexDirection: 'row',
        alignItems: 'center',
    },

    openBadge: {
        backgroundColor: '#E8F8F2',
    },

    closedBadge: {
        backgroundColor: '#F5F5F5',
    },

    statusDot: {
        width: 7,
        height: 7,

        borderRadius: 4,

        marginRight: 5,
    },

    openDot: {
        backgroundColor: '#16A34A',
    },

    closedDot: {
        backgroundColor: '#999999',
    },

    statusText: {
        fontSize: 11,
        fontWeight: '700',
        color: '#333333',
    },

    // ========================================================
    // DISTANCE BADGE
    // ========================================================

    distanceBadge: {
        position: 'absolute',

        bottom: 12,
        left: 12,

        flexDirection: 'row',
        alignItems: 'center',

        backgroundColor:
            'rgba(0,0,0,0.60)',

        paddingHorizontal: 9,
        paddingVertical: 6,

        borderRadius: 14,
    },

    distanceBadgeText: {
        marginLeft: 4,

        color: '#FFFFFF',

        fontSize: 11,
        fontWeight: '700',
    },

    // ========================================================
    // CARD CONTENT
    // ========================================================

    cardContent: {
        padding: 15,
    },

    nameRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },

    name: {
        flex: 1,

        fontSize: 18,
        fontWeight: '800',

        color: '#171717',

        marginRight: 8,
    },

    // ========================================================
    // RATING
    // ========================================================

    ratingRow: {
        flexDirection: 'row',
        alignItems: 'center',

        marginTop: 8,
    },

    ratingBadge: {
        backgroundColor: '#009D94',

        borderRadius: 6,

        paddingHorizontal: 7,
        paddingVertical: 4,

        flexDirection: 'row',
        alignItems: 'center',
    },

    ratingText: {
        marginLeft: 3,

        color: '#FFFFFF',

        fontSize: 12,
        fontWeight: '700',
    },

    reviewText: {
        marginLeft: 7,

        color: '#888888',

        fontSize: 12,
    },

    // ========================================================
    // INFO
    // ========================================================

    infoRow: {
        flexDirection: 'row',
        alignItems: 'center',

        marginTop: 11,
    },

    infoText: {
        flex: 1,

        marginLeft: 5,

        fontSize: 12,
        color: '#666666',
    },

    typeRow: {
        flexDirection: 'row',
        alignItems: 'center',

        marginTop: 8,
    },

    typeText: {
        marginLeft: 5,

        fontSize: 11,
        fontWeight: '600',

        color: '#009D94',
    },

    // ========================================================
    // VIEW SALON
    // ========================================================

    bottomRow: {
        marginTop: 14,

        paddingTop: 12,

        borderTopWidth: 1,
        borderTopColor: '#F0F0F0',

        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },

    viewText: {
        fontSize: 13,
        fontWeight: '700',
        color: '#009D94',
    },

    // ========================================================
    // EMPTY
    // ========================================================

    emptyContainer: {
        flex: 1,

        minHeight: 350,

        alignItems: 'center',
        justifyContent: 'center',

        paddingHorizontal: 30,
    },

    emptyTitle: {
        marginTop: 15,

        fontSize: 18,
        fontWeight: '700',

        color: '#333333',

        textAlign: 'center',
    },

    emptySubtitle: {
        marginTop: 7,

        fontSize: 13,

        color: '#888888',

        textAlign: 'center',
    },

    retryButton: {
        marginTop: 18,

        paddingHorizontal: 22,
        paddingVertical: 10,

        backgroundColor: '#009D94',

        borderRadius: 20,
    },

    retryText: {
        color: '#FFFFFF',

        fontSize: 13,
        fontWeight: '700',
    },

    clearCategoryButton: {
        marginTop: 18,

        paddingHorizontal: 20,
        paddingVertical: 10,

        backgroundColor: '#EAF8F6',

        borderRadius: 20,
    },

    clearCategoryText: {
        color: '#009D94',

        fontSize: 13,
        fontWeight: '700',
    },
});