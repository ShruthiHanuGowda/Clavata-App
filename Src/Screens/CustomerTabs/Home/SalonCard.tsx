import React from 'react';
import {
    View,
    Text,
    Image,
    TouchableOpacity,
    StyleSheet,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
const PRIMARY = '#008060';
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
        // NEW
        salonStatus?: 'OPEN' | 'CLOSED' | 'TEMPORARILY_CLOSED';
        // NEW
        categories?: string[];
        image?: string;
    };
};

export default function SalonCard({ salon }: Props) {
    const navigation = useNavigation();
    const address = [
        salon.address?.addressLine,
        salon.address?.city,
    ]
        .filter(Boolean)
        .join(', ');

    const handlePress = () => {
        console.log('Navigating to SalonDetails for salonId:', salon.salonId ?? salon.id);
        navigation.navigate('SalonDetails' as any, {
            salonId: salon.salonId ?? salon.id,
            salon,
        } as never);
    };
    // Salon status
    const isOpen = salon.salonStatus === 'OPEN';
    const statusText =
        salon.salonStatus === 'OPEN'
            ? 'Open'
            : salon.salonStatus === 'TEMPORARILY_CLOSED'
                ? 'Temporarily Closed'
                : 'Closed';
    // Show maximum 3 categories on card
    const categoryText =
        salon.categories && salon.categories.length > 0
            ? salon.categories.slice(0, 3).join(' • ')
            : '';
    return (
        <TouchableOpacity
            style={styles.card}
            activeOpacity={0.92}
            onPress={handlePress}
        >
            {/* Salon Image */}
            <View style={styles.imageContainer}>
                <Image
                    source={{
                        uri:
                            salon.image ||
                            'https://picsum.photos/300/300',
                    }}
                    style={styles.image}
                />
                {/* Favorite */}
                <TouchableOpacity
                    style={styles.favorite}
                    activeOpacity={0.8}
                    onPress={() => {
                        console.log(
                            'Favorite salon:',
                            salon.name,
                        );
                    }}
                >
                    <Text style={styles.heart}>♡</Text>
                </TouchableOpacity>
            </View>

            {/* Content */}
            <View style={styles.content}>
                {/* Salon Name + Open/Closed */}
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
                {/* Rating + Distance */}
                <View style={styles.infoRow}>
                    <View style={styles.ratingBox}>
                        <Text style={styles.star}>
                            ★
                        </Text>
                        <Text style={styles.rating}>
                            {(salon.rating ?? 0).toFixed(1)}
                        </Text>

                        {salon.reviews != null && (
                            <Text style={styles.reviews}>
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
                {/* Address */}
                {!!address && (
                    <Text
                        style={styles.address}
                        numberOfLines={1}
                    >
                        📍 {address}
                    </Text>
                )}
                {/* Categories */}
                {!!categoryText && (
                    <Text
                        style={styles.categories}
                        numberOfLines={1}
                    >
                        {categoryText}
                    </Text>
                )}
                {/* View Salon */}
                <TouchableOpacity
                    style={styles.button}
                    activeOpacity={0.85}
                    onPress={handlePress}
                >
                    <Text style={styles.buttonText}>
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
        width: 30,
        height: 30,
        borderRadius: 15,
        backgroundColor: 'rgba(255,255,255,0.95)',
        alignItems: 'center',
        justifyContent: 'center',
    },
    heart: {
        fontSize: 21,
        color: '#333',
        lineHeight: 23,
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
    // STATUS
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
    // RATING + DISTANCE
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
    // ADDRESS
    address: {
        marginTop: 6,
        fontSize: 12,
        color: '#777777',
    },
    // CATEGORIES
    categories: {
        marginTop: 6,
        fontSize: 12,
        color: '#555555',
        fontWeight: '600',
    },
    // BUTTON
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
