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

import {
    GET_FAVORITE_SALONS,
    REMOVE_FAVORITE_SALON,
} from '../../../graphql/queries';

export default function FavouriteSalons() {
    const navigation = useNavigation<any>();
    const client = useApolloClient();

    const { currentUser } = useUser();

    const [salons, setSalons] = React.useState<any[]>([]);
    const [loading, setLoading] = React.useState(true);

    const [removeFavorite] = useMutation(
        REMOVE_FAVORITE_SALON,
    );

    const loadFavorites = React.useCallback(async () => {
        if (!currentUser?.userId) {
            setSalons([]);
            setLoading(false);
            return;
        }

        try {
            setLoading(true);

            const result = await client.query({
                query: GET_FAVORITE_SALONS,
                variables: {
                    userId: currentUser.userId,
                },
                fetchPolicy: 'network-only',
            });

            const favorites =
                result.data?.favoriteSalons ?? [];

            setSalons(favorites);
        } catch (error) {
            console.error(
                'Failed to load favorite salons:',
                error,
            );

            Alert.alert(
                'Error',
                'Unable to load favourite salons.',
            );
        } finally {
            setLoading(false);
        }
    }, [client, currentUser?.userId]);

    React.useEffect(() => {
        loadFavorites();
    }, [loadFavorites]);

    const handleRemoveFavorite = async (
        favoriteId: string,
        salonId: string,
    ) => {
        if (!currentUser?.userId) {
            return;
        }

        try {
            const result = await removeFavorite({
                variables: {
                    input: {
                        userId: currentUser.userId,
                        salonId,
                    },
                },
            });

            if (
                result.data?.removeFavoriteSalon?.success
            ) {
                setSalons(prev =>
                    prev.filter(
                        item =>
                            item.favoriteId !== favoriteId,
                    ),
                );
            } else {
                Alert.alert(
                    'Error',
                    result.data?.removeFavoriteSalon?.message ||
                        'Unable to remove favourite.',
                );
            }
        } catch (error) {
            console.error(
                'Failed to remove favorite:',
                error,
            );

            Alert.alert(
                'Error',
                'Unable to remove favourite salon.',
            );
        }
    };

    const renderItem = ({ item }: any) => {
        const salon = item.salon;

        if (!salon) {
            return null;
        }

        return (
            <TouchableOpacity
                style={styles.card}
                activeOpacity={0.85}
                onPress={() =>
                    navigation.navigate(
                        'SalonDetails',
                        {
                            salonId: salon.salonId,
                            salon,
                        },
                    )
                }
            >
                <Image
                    source={{
                        uri:
                            salon.logoUrl ||
                            salon.coverImageUrl ||
                            'https://picsum.photos/300/300',
                    }}
                    style={styles.image}
                />

                <View style={styles.info}>
                    <Text
                        style={styles.name}
                        numberOfLines={1}
                    >
                        {salon.salonName}
                    </Text>

                    <Text
                        style={styles.location}
                        numberOfLines={1}
                    >
                        {salon.address?.city ||
                            salon.address?.addressLine ||
                            ''}
                    </Text>

                    <Text style={styles.rating}>
                        ★{' '}
                        {(salon.averageRating ?? 0).toFixed(
                            1,
                        )}{' '}
                        ({salon.totalReviews ?? 0})
                    </Text>
                </View>

                <TouchableOpacity
                    style={styles.favoriteButton}
                    onPress={() =>
                        handleRemoveFavorite(
                            item.favoriteId,
                            salon.salonId,
                        )
                    }
                >
                    <Text style={styles.heart}>♥</Text>
                </TouchableOpacity>
            </TouchableOpacity>
        );
    };

    return (
        <View style={styles.container}>
            <TouchableOpacity
                onPress={() => navigation.goBack()}
                style={styles.backButton}
            >
                <Text style={styles.back}>←</Text>
            </TouchableOpacity>

            <Text style={styles.title}>
                Favourite Salons
            </Text>

            {loading ? (
                <View style={styles.center}>
                    <ActivityIndicator size="large" />
                </View>
            ) : salons.length === 0 ? (
                <View style={styles.center}>
                    <Text style={styles.emptyTitle}>
                        No Favourite Salons
                    </Text>

                    <Text style={styles.emptyText}>
                        Salons you favourite will appear
                        here.
                    </Text>
                </View>
            ) : (
                <FlatList
                    data={salons}
                    keyExtractor={item =>
                        item.favoriteId
                    }
                    renderItem={renderItem}
                    showsVerticalScrollIndicator={false}
                    contentContainerStyle={
                        styles.listContent
                    }
                    refreshing={loading}
                    onRefresh={loadFavorites}
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

    backButton: {
        alignSelf: 'flex-start',
        paddingVertical: 5,
    },

    back: {
        fontSize: 28,
        fontWeight: '700',
    },

    title: {
        fontSize: 28,
        fontWeight: '700',
        marginBottom: 20,
        marginTop: 5,
    },

    listContent: {
        paddingBottom: 20,
    },

    card: {
        backgroundColor: '#fff',
        padding: 15,
        borderRadius: 15,
        flexDirection: 'row',
        marginBottom: 15,
        alignItems: 'center',
    },

    image: {
        height: 80,
        width: 80,
        borderRadius: 12,
        marginRight: 15,
        backgroundColor: '#ddd',
    },

    info: {
        flex: 1,
        justifyContent: 'center',
        minWidth: 0,
    },

    name: {
        fontSize: 18,
        fontWeight: '700',
        color: '#111827',
    },

    location: {
        marginTop: 5,
        color: '#666',
        fontSize: 13,
    },

    rating: {
        marginTop: 5,
        color: '#F5A623',
        fontWeight: '600',
    },

    favoriteButton: {
        width: 40,
        height: 40,
        borderRadius: 20,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#FFF0F0',
        marginLeft: 8,
    },

    heart: {
        fontSize: 22,
        color: '#E53935',
    },

    center: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
    },

    emptyTitle: {
        fontSize: 18,
        fontWeight: '700',
        color: '#111827',
    },

    emptyText: {
        marginTop: 8,
        color: '#777',
        textAlign: 'center',
    },
});

