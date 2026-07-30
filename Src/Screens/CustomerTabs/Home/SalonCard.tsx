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
        services?: string;
        price?: number;
        image?: string;
    };
};

export default function SalonCard({ salon }: Props) {
    const navigation = useNavigation<any>();

    return (
        <TouchableOpacity
            style={styles.card}
            activeOpacity={0.9}
            onPress={() =>
                navigation.navigate('SalonDetails', {
                    salonId: salon.salonId ?? salon.id,
                })
            }
        >
            <Image
                source={{
                    uri: salon.image || 'https://picsum.photos/300/300',
                }}
                style={styles.image}
            />

            <View style={styles.content}>
                <Text style={styles.name}>{salon.name}</Text>

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
                    <TouchableOpacity
                        style={styles.button}
                        onPress={() =>
                            navigation.navigate('SalonDetails', {
                                salonId: salon.salonId ?? salon.id,
                            })
                        }
                    >
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
        justifyContent: 'flex-end',
        alignItems: 'center',
    },

    button: {
        backgroundColor: PRIMARY,
        paddingHorizontal: 20,
        paddingVertical: 10,
        borderRadius: 20,
    },

    buttonText: {
        color: '#FFF',
        fontWeight: '700',
        fontSize: 14,
    },
});