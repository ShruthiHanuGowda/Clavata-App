import React from 'react';
import {
    View,
    Text,
    Image,
    TouchableOpacity,
    StyleSheet,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useUser } from '../../../context/UserContext';
import { useMutation, useQuery } from '@apollo/client';

import {
    ADD_FAVORITE_SALON,
    REMOVE_FAVORITE_SALON,
    IS_FAVORITE_SALON,
} from '../../../graphql/queries';

const PRIMARY = '#008060';

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

type Props = {
    salon: {
        id: string;
        salonId?: string;
        name: string;
        rating: number;
        reviews?: number;
        distance: string;

        address?: {
            addressLine?: string;
            city?: string;
            state?: string;
            pincode?: string;
        };

        salonStatus?: 'OPEN' | 'CLOSED' | 'TEMPORARILY_CLOSED';

        businessHours?: BusinessHours;

        categories?: string[];

        image?: string;
    };
};

const getSalonCurrentStatus = (
    salonStatus?: 'OPEN' | 'CLOSED' | 'TEMPORARILY_CLOSED',
    businessHours?: BusinessHours,
) => {
    if (salonStatus === 'TEMPORARILY_CLOSED') {
        return {
            isOpen: false,
            text: 'Temporarily Closed',
        };
    }

    if (!businessHours) {
        return {
            isOpen: false,
            text: 'Closed',
        };
    }

    const now = new Date();

    const days: Array<keyof BusinessHours> = [
        'SUNDAY',
        'MONDAY',
        'TUESDAY',
        'WEDNESDAY',
        'THURSDAY',
        'FRIDAY',
        'SATURDAY',
    ];

    const today = days[now.getDay()];

    const todayHours = businessHours[today];

    if (!todayHours?.isOpen) {
        return {
            isOpen: false,
            text: 'Closed',
        };
    }

    if (!todayHours.open || !todayHours.close) {
        return {
            isOpen: false,
            text: 'Closed',
        };
    }

    const currentMinutes =
        now.getHours() * 60 + now.getMinutes();

    const [openHour, openMinute] =
        todayHours.open.split(':').map(Number);

    const [closeHour, closeMinute] =
        todayHours.close.split(':').map(Number);

    const openMinutes =
        openHour * 60 + openMinute;

    const closeMinutes =
        closeHour * 60 + closeMinute;

    let isOpen = false;

    if (closeMinutes > openMinutes) {
        isOpen =
            currentMinutes >= openMinutes &&
            currentMinutes < closeMinutes;
    } else if (closeMinutes < openMinutes) {
        isOpen =
            currentMinutes >= openMinutes ||
            currentMinutes < closeMinutes;
    } else {
        isOpen = false;
    }

    return {
        isOpen,
        text: isOpen ? 'Open' : 'Closed',
    };
};

export default function SalonCard({ salon }: Props) {
    const navigation = useNavigation<any>();

    const { currentUser } = useUser();

    const salonId =
        salon.salonId ?? salon.id;

    /**
     * Local favorite state
     *
     * This prevents the heart from visually resetting
     * while Apollo is loading/refetching.
     */
    const [isFavorite, setIsFavorite] =
        React.useState(false);

    const [favoriteLoading, setFavoriteLoading] =
        React.useState(false);

    /**
     * Get favorite status from backend
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
     * Sync backend status -> local state
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
     * Add favorite
     */
    const [addFavorite] =
        useMutation(ADD_FAVORITE_SALON);

    /**
     * Remove favorite
     */
    const [removeFavorite] =
        useMutation(REMOVE_FAVORITE_SALON);

    /**
     * Address
     */
    const address = [
        salon.address?.addressLine,
        salon.address?.city,
    ]
        .filter(Boolean)
        .join(', ');

    /**
     * Navigate to salon
     */
    const handlePress = () => {
        navigation.navigate(
            'SalonDetails',
            {
                salonId,
                salon,
            },
        );
    };

    /**
     * Current salon status
     */
    const {
        isOpen,
        text: statusText,
    } = getSalonCurrentStatus(
        salon.salonStatus,
        salon.businessHours,
    );

    /**
     * Categories
     */
    const categoryText =
        salon.categories &&
            salon.categories.length > 0
            ? salon.categories
                .slice(0, 3)
                .join(' • ')
            : '';

    /**
     * Toggle favorite
     */
    const handleFavorite = async () => {
        if (!currentUser?.userId) {
            console.log(
                'User is not logged in',
            );
            return;
        }

        if (!salonId) {
            console.log(
                'Salon ID is missing',
            );
            return;
        }

        if (favoriteLoading) {
            return;
        }

        try {
            setFavoriteLoading(true);

            /**
             * Save previous state.
             */
            const previousState = isFavorite;

            /**
             * Optimistic UI
             *
             * Immediately change heart.
             */
            setIsFavorite(!previousState);

            if (previousState) {
                /**
                 * REMOVE
                 */
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
                 * Backend failed
                 */
                if (
                    !data?.removeFavoriteSalon?.success
                ) {
                    setIsFavorite(
                        previousState,
                    );

                    console.log(
                        'Remove favorite failed:',
                        data?.removeFavoriteSalon
                            ?.message,
                    );
                }
            } else {
                /**
                 * ADD
                 */
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
                 * Backend failed
                 */
                if (
                    !data?.addFavoriteSalon?.success
                ) {
                    setIsFavorite(
                        previousState,
                    );

                    console.log(
                        'Add favorite failed:',
                        data?.addFavoriteSalon
                            ?.message,
                    );
                }
            }

            /**
             * Refresh backend state.
             *
             * This ensures the local state and
             * DynamoDB eventually agree.
             */
            await refetchFavoriteStatus();
        } catch (error) {
            console.error(
                'Favorite salon error:',
                error,
            );

            /**
             * Rollback UI if request failed.
             */
            setIsFavorite(
                !isFavorite,
            );
        } finally {
            setFavoriteLoading(false);
        }
    };

    return (
        <TouchableOpacity
            style={styles.card}
            activeOpacity={0.92}
            onPress={handlePress}
        >
            <View style={styles.imageContainer}>
                <Image
                    source={{
                        uri:
                            salon.image ||
                            'https://picsum.photos/300/300',
                    }}
                    style={styles.image}
                />

                {/* FAVORITE */}
                <TouchableOpacity
                    style={styles.favorite}
                    activeOpacity={0.8}
                    disabled={
                        favoriteLoading ||
                        favoriteStatusLoading
                    }
                    onPress={handleFavorite}
                >
                    <Text
                        style={[
                            styles.heart,
                            isFavorite &&
                            styles.heartActive,
                        ]}
                    >
                        {isFavorite
                            ? '♥'
                            : '♡'}
                    </Text>
                </TouchableOpacity>
            </View>

            <View style={styles.content}>
                <View style={styles.nameRow}>
                    <Text
                        style={styles.name}
                        numberOfLines={1}
                    >
                        {salon.name}
                    </Text>

                    <View
                        style={[
                            styles.statusBadge,
                            isOpen
                                ? styles.openBadge
                                : styles.closedBadge,
                        ]}
                    >
                        <View
                            style={[
                                styles.statusDot,
                                isOpen
                                    ? styles.openDot
                                    : styles.closedDot,
                            ]}
                        />

                        <Text
                            style={[
                                styles.statusText,
                                isOpen
                                    ? styles.openText
                                    : styles.closedText,
                            ]}
                        >
                            {statusText}
                        </Text>
                    </View>
                </View>

                <View style={styles.infoRow}>
                    <View style={styles.ratingBox}>
                        <Text style={styles.star}>
                            ★
                        </Text>

                        <Text style={styles.rating}>
                            {(salon.rating ?? 0).toFixed(
                                1,
                            )}
                        </Text>

                        {salon.reviews != null && (
                            <Text
                                style={
                                    styles.reviews
                                }
                            >
                                ({salon.reviews})
                            </Text>
                        )}
                    </View>

                    <View style={styles.dot} />

                    <Text
                        style={styles.distance}
                        numberOfLines={1}
                    >
                        {salon.distance}
                    </Text>
                </View>

                {!!address && (
                    <Text
                        style={styles.address}
                        numberOfLines={1}
                    >
                        📍 {address}
                    </Text>
                )}

                {!!categoryText && (
                    <Text
                        style={styles.categories}
                        numberOfLines={1}
                    >
                        {categoryText}
                    </Text>
                )}

                <TouchableOpacity
                    style={styles.button}
                    activeOpacity={0.85}
                    onPress={handlePress}
                >
                    <Text
                        style={styles.buttonText}
                    >
                        View Salon
                    </Text>

                    <Text style={styles.arrow}>
                        →
                    </Text>
                </TouchableOpacity>
            </View>
        </TouchableOpacity>
    );
}

const styles = StyleSheet.create({
    card: {
        marginHorizontal: 16,
        marginBottom: 12,
        padding: 10,
        flexDirection: 'row',
        backgroundColor: '#FFFFFF',
        borderRadius: 16,
        elevation: 2,
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.08,
        shadowRadius: 5,
    },

    imageContainer: {
        width: 105,
        height: 120,
        position: 'relative',
    },

    image: {
        width: '100%',
        height: '100%',
        borderRadius: 13,
        backgroundColor: '#F0F0F0',
    },

    favorite: {
        position: 'absolute',
        top: 7,
        right: 7,
        width: 25,
        height: 25,
        borderRadius: 15,
        backgroundColor:
            'rgba(255,255,255,0.95)',
        alignItems: 'center',
        justifyContent: 'center',
    },

    heart: {
        fontSize: 14,
        color: '#333',
        lineHeight: 23,
    },

    heartActive: {
        color: '#E53935',
    },

    content: {
        flex: 1,
        marginLeft: 12,
        paddingVertical: 2,
        minWidth: 0,
    },

    nameRow: {
        flexDirection: 'row',
        alignItems: 'center',
    },

    name: {
        flex: 1,
        fontSize: 17,
        fontWeight: '700',
        color: '#111111',
        marginRight: 6,
    },

    statusBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 7,
        paddingVertical: 4,
        borderRadius: 10,
    },

    openBadge: {
        backgroundColor: '#E8F7EF',
    },

    closedBadge: {
        backgroundColor: '#FDECEC',
    },

    statusDot: {
        width: 6,
        height: 6,
        borderRadius: 3,
        marginRight: 4,
    },

    openDot: {
        backgroundColor: '#16A34A',
    },

    closedDot: {
        backgroundColor: '#DC2626',
    },

    statusText: {
        fontSize: 10,
        fontWeight: '700',
    },

    openText: {
        color: '#15803D',
    },

    closedText: {
        color: '#B91C1C',
    },

    infoRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 7,
    },

    ratingBox: {
        flexDirection: 'row',
        alignItems: 'center',
    },

    star: {
        fontSize: 14,
        color: '#F5A623',
        marginRight: 3,
    },

    rating: {
        fontSize: 13,
        fontWeight: '700',
        color: '#333333',
    },

    reviews: {
        marginLeft: 3,
        fontSize: 12,
        color: '#888888',
    },

    dot: {
        width: 3,
        height: 3,
        borderRadius: 2,
        backgroundColor: '#AAAAAA',
        marginHorizontal: 8,
    },

    distance: {
        fontSize: 12,
        color: PRIMARY,
        fontWeight: '600',
    },

    address: {
        marginTop: 6,
        fontSize: 12,
        color: '#777777',
    },

    categories: {
        marginTop: 6,
        fontSize: 12,
        color: '#555555',
        fontWeight: '600',
    },

    button: {
        alignSelf: 'flex-start',
        marginTop: 9,
        paddingHorizontal: 13,
        paddingVertical: 6,
        borderRadius: 15,
        backgroundColor: '#E8F6F3',
        flexDirection: 'row',
        alignItems: 'center',
    },

    buttonText: {
        color: PRIMARY,
        fontSize: 12,
        fontWeight: '700',
    },

    arrow: {
        marginLeft: 5,
        color: PRIMARY,
        fontSize: 14,
        fontWeight: '700',
    },
});