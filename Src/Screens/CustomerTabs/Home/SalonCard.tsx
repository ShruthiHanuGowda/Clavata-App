import React from 'react';

import {
    View,
    Text,
    Image,
    TouchableOpacity,
    StyleSheet,
} from 'react-native';

const PRIMARY = '#008060';

export default function SalonCard({ salon }: any) {

    return (

        <TouchableOpacity style={styles.card}>

            <Image

                source={{ uri: salon.image }}

                style={styles.image}

            />

            <View style={{ flex: 1 }}>

                <Text style={styles.name}>
                    {salon.name}
                </Text>

                <Text style={styles.rating}>
                    ⭐ {salon.rating} ({salon.reviews})
                </Text>

                <Text style={styles.distance}>
                    📍 {salon.distance}
                </Text>

                <Text style={styles.service}>
                    {salon.services}
                </Text>

                <View style={styles.bottom}>

                    <Text style={styles.price}>
                        Starts ₹{salon.price}
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
        backgroundColor: '#FFF',
        borderRadius: 16,
        marginBottom: 16,
        padding: 12,
        flexDirection: 'row',
        elevation: 2,
    },

    image: {
        width: 100,
        height: 100,
        borderRadius: 12,
        marginRight: 14,
    },

    name: {
        fontSize: 18,
        fontWeight: '700',
        color: '#111',
    },

    rating: {
        marginTop: 5,
        color: '#666',
    },

    distance: {
        marginTop: 3,
        color: '#666',
    },

    service: {
        marginTop: 5,
        color: '#666',
    },

    bottom: {
        marginTop: 10,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },

    price: {
        color: PRIMARY,
        fontWeight: '700',
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
    }

});