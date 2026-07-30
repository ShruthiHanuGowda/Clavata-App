import React from 'react';
import {
    View,
    Text,
    Image,
    TouchableOpacity,
    StyleSheet,
} from 'react-native';

const PRIMARY = '#008060';

type Props = {
    salon: {
        id: string;
        name: string;
        rating: number;
        reviews?: number;
        distance: string;
        services?: string;
        price?: number;
        image?: string;
    };
};

export default function SalonCard({ salon }: Props) {
    return (
        <TouchableOpacity style={styles.card}>
            <Image
                source={{
                    uri:
                        salon.image ||
                        'https://picsum.photos/300/300',
                }}
                style={styles.image}
            />

            <View style={styles.content}>
                <Text style={styles.name}>
                    {salon.name}
                </Text>

                <Text style={styles.rating}>
                    ⭐ {(salon.rating ?? 0).toFixed(1)}
                    {salon.reviews != null && ` (${salon.reviews})`}
                </Text>

                <Text style={styles.distance}>
                    📍 {salon.distance}
                </Text>

                {!!salon.services && (
                    <Text style={styles.service}>
                        {salon.services}
                    </Text>
                )}

                <View style={styles.bottom}>
                    <Text style={styles.price}>
                        {salon.price
                            ? `Starts ₹${salon.price}`
                            : 'Book Appointment'}
                    </Text>

                    <TouchableOpacity style={styles.button}>
                        <Text style={styles.buttonText}>
                            Book
                        </Text>
                    </TouchableOpacity>
                </View>
            </View>
        </TouchableOpacity>
    );
}

const styles = StyleSheet.create({
    card: {
        marginHorizontal: 20,
        marginBottom: 16,
        padding: 12,
        flexDirection: 'row',
        backgroundColor: '#FFF',
        borderRadius: 16,
        elevation: 2,
    },

    image: {
        width: 100,
        height: 100,
        borderRadius: 12,
        marginRight: 14,
        backgroundColor: '#EEE',
    },

    content: {
        flex: 1,
    },

    name: {
        fontSize: 18,
        fontWeight: '700',
        color: '#111',
    },

    rating: {
        marginTop: 6,
        color: '#666',
        fontSize: 14,
    },

    distance: {
        marginTop: 4,
        color: PRIMARY,
        fontWeight: '600',
        fontSize: 14,
    },

    service: {
        marginTop: 4,
        color: '#666',
        fontSize: 14,
    },

    bottom: {
        marginTop: 12,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },

    price: {
        color: PRIMARY,
        fontWeight: '700',
        fontSize: 15,
    },

    button: {
        backgroundColor: PRIMARY,
        paddingHorizontal: 18,
        paddingVertical: 8,
        borderRadius: 20,
    },

    buttonText: {
        color: '#FFF',
        fontWeight: '700',
        fontSize: 14,
    },
});