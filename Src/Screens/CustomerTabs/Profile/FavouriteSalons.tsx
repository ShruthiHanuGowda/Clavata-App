import React from 'react';

import {
    View,
    Text,
    StyleSheet,
    FlatList,
    TouchableOpacity,
    Image,
    ActivityIndicator,
    Alert,
} from 'react-native';

import {
    useApolloClient,
    useMutation,
} from '@apollo/client';

import { useNavigation } from '@react-navigation/native';

import { useUser } from '../../../context/UserContext';

import BackButton from '../../../common/BackButton';
import ScreenHeader from '../../../common/ScreenHeader';

import {
    GET_FAVORITE_SALONS,
    REMOVE_FAVORITE_SALON,
} from '../../../graphql/queries';

type SalonMedia = {
    imageId?: string;
    mediaType?: string;
    objectUrl?: string | null;
    status?: string;
};

type FavoriteSalonItem = {
    favoriteId: string;
    userId?: string;
    salonId: string;
    salon?: {
        salonId: string;
        salonName: string;
        averageRating?: number | null;
        totalReviews?: number | null;
        logoMedia?: SalonMedia | null;
        coverMedia?: SalonMedia | null;
        address?: {
            addressLine?: string;
            city?: string;
            state?: string;
            pincode?: string;
        } | null;
    } | null;
};

export default function FavouriteSalons() {
    const navigation = useNavigation<any>();
    const client = useApolloClient();
    const { currentUser } = useUser();

    const [salons, setSalons] = React.useState<
        FavoriteSalonItem[]
    >([]);

    const [loading, setLoading] = React.useState(true);

    const [removingFavoriteId, setRemovingFavoriteId] =
        React.useState<string | null>(null);

    const [removeFavorite] = useMutation(
        REMOVE_FAVORITE_SALON,
    );

    const loadFavorites = React.useCallback(
        async (showLoader = true) => {
            if (!currentUser?.userId) {
                setSalons([]);
                setLoading(false);
                return;
            }

            try {
                if (showLoader) {
                    setLoading(true);
                }

                const result = await client.query({
                    query: GET_FAVORITE_SALONS,
                    variables: {
                        userId: currentUser.userId,
                    },
                    fetchPolicy: 'network-only',
                });

                const favorites =
                    result.data?.favoriteSalons ?? [];

                setSalons(
                    Array.isArray(favorites)
                        ? favorites
                        : [],
                );
            } catch (error) {
                console.error(
                    '[FavouriteSalons] Failed to load favorites:',
                    error,
                );

                Alert.alert(
                    'Error',
                    'Unable to load favourite salons. Please try again.',
                );
            } finally {
                setLoading(false);
            }
        },
        [client, currentUser?.userId],
    );

    React.useEffect(() => {
        loadFavorites();
    }, [loadFavorites]);

    const handleRemoveFavorite = async (
        favoriteId: string,
        salonId: string,
    ) => {
        if (
            !currentUser?.userId ||
            removingFavoriteId !== null
        ) {
            return;
        }

        try {
            setRemovingFavoriteId(favoriteId);

            const result = await removeFavorite({
                variables: {
                    input: {
                        userId: currentUser.userId,
                        salonId,
                    },
                },
            });

            const response =
                result.data?.removeFavoriteSalon;

            if (response?.success) {
                setSalons(previous =>
                    previous.filter(
                        item =>
                            item.favoriteId !== favoriteId,
                    ),
                );
            } else {
                Alert.alert(
                    'Error',
                    response?.message ||
                        'Unable to remove favourite salon.',
                );
            }
        } catch (error) {
            console.error(
                '[FavouriteSalons] Failed to remove favorite:',
                error,
            );

            Alert.alert(
                'Error',
                'Unable to remove favourite salon. Please try again.',
            );
        } finally {
            setRemovingFavoriteId(null);
        }
    };

    const renderItem = ({
        item,
    }: {
        item: FavoriteSalonItem;
    }) => {
        const salon = item.salon;

        if (!salon) {
            return null;
        }

        /*
         * Only display approved media with a real URL.
         * No random images or placeholder URLs.
         */
        const logoUrl =
            salon.logoMedia?.status === 'APPROVED'
                ? salon.logoMedia.objectUrl
                : null;

        const coverUrl =
            salon.coverMedia?.status === 'APPROVED'
                ? salon.coverMedia.objectUrl
                : null;

        const imageUrl = logoUrl || coverUrl || null;

        /*
         * Values are read from the latest favoriteSalons
         * network response. The backend must maintain these
         * fields for them to reflect newly submitted reviews.
         */
        const ratingValue = Number(
            salon.averageRating ?? 0,
        );

        const reviewCount = Number(
            salon.totalReviews ?? 0,
        );

        const safeRating =
            Number.isFinite(ratingValue) &&
            ratingValue >= 0
                ? ratingValue
                : 0;

        const safeReviewCount =
            Number.isFinite(reviewCount) &&
            reviewCount >= 0
                ? reviewCount
                : 0;

        const location = [
            salon.address?.city,
            salon.address?.state,
        ]
            .filter(Boolean)
            .join(', ');

        return (
            <TouchableOpacity
                style={styles.card}
                activeOpacity={0.85}
                onPress={() =>
                    navigation.navigate('SalonDetails', {
                        salonId: salon.salonId,
                        salon,
                    })
                }
                accessibilityRole="button"
                accessibilityLabel={`View ${salon.salonName}`}
            >
                {imageUrl ? (
                    <Image
                        source={{ uri: imageUrl }}
                        style={styles.image}
                        resizeMode="cover"
                    />
                ) : null}

                <View style={styles.info}>
                    <Text
                        style={styles.name}
                        numberOfLines={2}
                    >
                        {salon.salonName || 'Salon'}
                    </Text>

                    {!!location && (
                        <Text
                            style={styles.location}
                            numberOfLines={1}
                        >
                            {location}
                        </Text>
                    )}

                    <View style={styles.ratingRow}>
                        <Text style={styles.rating}>
                            ★ {safeRating.toFixed(1)}
                        </Text>

                        <Text style={styles.reviewCount}>
                            ({safeReviewCount}{' '}
                            {safeReviewCount === 1
                                ? 'review'
                                : 'reviews'})
                        </Text>
                    </View>
                </View>

                <TouchableOpacity
                    style={styles.favoriteButton}
                    activeOpacity={0.7}
                    disabled={
                        removingFavoriteId ===
                        item.favoriteId
                    }
                    onPress={() =>
                        handleRemoveFavorite(
                            item.favoriteId,
                            salon.salonId,
                        )
                    }
                    accessibilityRole="button"
                    accessibilityLabel="Remove favourite salon"
                >
                    {removingFavoriteId ===
                    item.favoriteId ? (
                        <ActivityIndicator
                            size="small"
                            color="#E53935"
                        />
                    ) : (
                        <Text style={styles.heart}>
                            ♥
                        </Text>
                    )}
                </TouchableOpacity>
            </TouchableOpacity>
        );
    };

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <BackButton />

                <View style={styles.headerTitle}>
                    <ScreenHeader
                        title="Favourite Salons"
                        showBackButton={false}
                    />
                </View>
            </View>

            {loading ? (
                <View style={styles.center}>
                    <ActivityIndicator
                        size="large"
                        color="#009D94"
                    />

                    <Text style={styles.loadingText}>
                        Loading favourite salons...
                    </Text>
                </View>
            ) : salons.length === 0 ? (
                <View style={styles.center}>
                    <View style={styles.emptyIcon}>
                        <Text style={styles.emptyHeart}>
                            ♥
                        </Text>
                    </View>

                    <Text style={styles.emptyTitle}>
                        No Favourite Salons
                    </Text>

                    {/* <Text style={styles.emptyText}>
                        Salons you favourite will appear
                        here.
                    </Text> */}
                </View>
            ) : (
                <FlatList
                    data={salons}
                    keyExtractor={(item, index) =>
                        String(
                            item.favoriteId ??
                                item.salonId ??
                                index,
                        )
                    }
                    renderItem={renderItem}
                    showsVerticalScrollIndicator={false}
                    contentContainerStyle={
                        styles.listContent
                    }
                    refreshing={loading}
                    onRefresh={() => loadFavorites()}
                />
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F7F8FA',
        paddingHorizontal: 20,
        paddingTop: 10,
    },

    header: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 18,
    },

    headerTitle: {
        flex: 1,
        minWidth: 0,
    },

    listContent: {
        paddingBottom: 24,
    },

    card: {
        backgroundColor: '#FFFFFF',
        padding: 14,
        borderRadius: 16,
        flexDirection: 'row',
        marginBottom: 14,
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#EEEEF2',
    },

    image: {
        height: 80,
        width: 80,
        borderRadius: 12,
        marginRight: 14,
        backgroundColor: '#F1F1F5',
    },

    info: {
        flex: 1,
        justifyContent: 'center',
        minWidth: 0,
    },

    name: {
        fontSize: 16,
        fontWeight: '700',
        color: '#111827',
    },

    location: {
        marginTop: 5,
        color: '#6B7280',
        fontSize: 13,
    },

    ratingRow: {
        flexDirection: 'row',
        alignItems: 'center',
        flexWrap: 'wrap',
        marginTop: 7,
    },

    rating: {
        color: '#B7791F',
        fontSize: 13,
        fontWeight: '700',
    },

    reviewCount: {
        color: '#6B7280',
        fontSize: 12,
        marginLeft: 5,
    },

    favoriteButton: {
        width: 36,
        height: 36,
        borderRadius: 18,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#FFF0F0',
        marginLeft: 10,
    },

    heart: {
        fontSize: 16,
        color: '#E53935',
    },

    center: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        paddingHorizontal: 24,
    },

    loadingText: {
        marginTop: 12,
        color: '#6B7280',
        fontSize: 14,
    },

    emptyIcon: {
        width: 64,
        height: 64,
        borderRadius: 32,
        backgroundColor: '#F3E8FF',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 16,
    },

    emptyHeart: {
        fontSize: 30,
        color: '#7C3AED',
    },

    emptyTitle: {
        fontSize: 18,
        fontWeight: '700',
        color: '#111827',
        textAlign: 'center',
    },

    emptyText: {
        marginTop: 8,
        color: '#6B7280',
        fontSize: 14,
        textAlign: 'center',
        lineHeight: 21,
    },
});

