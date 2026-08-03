import React from 'react';
import {
    SafeAreaView,
    View,
    Text,
    TouchableOpacity,
    StyleSheet,
} from 'react-native';

const PRIMARY = '#009D94';

export default function BookingRequestSent({
    navigation,
}: any) {

    return (
        <SafeAreaView style={styles.container}>

            <View style={styles.content}>

                <Text style={styles.icon}>📨</Text>

                <Text style={styles.title}>
                    Booking Request Sent
                </Text>

                <Text style={styles.subtitle}>
                    Your booking request has been sent to the salon.

                    {"\n\n"}

                    We'll notify you once the salon accepts your appointment.

                </Text>

                <TouchableOpacity
                    style={styles.button}
                    onPress={() =>
                        navigation.navigate('Bookings')
                    }>

                    <Text style={styles.buttonText}>
                        View My Bookings
                    </Text>

                </TouchableOpacity>

            </View>

        </SafeAreaView>
    );
}

const styles = StyleSheet.create({

    container: {
        flex: 1,
        backgroundColor: '#F5F7FA',
    },

    content: {
        flex: 1,
        justifyContent: 'center',
        padding: 25,
    },

    icon: {
        fontSize: 70,
        textAlign: 'center',
    },

    title: {
        marginTop: 18,
        fontSize: 28,
        fontWeight: '700',
        textAlign: 'center',
    },

    subtitle: {
        marginTop: 15,
        textAlign: 'center',
        color: '#666',
        lineHeight: 24,
        fontSize: 16,
    },

    button: {
        marginTop: 40,
        height: 56,
        borderRadius: 30,
        backgroundColor: PRIMARY,
        justifyContent: 'center',
        alignItems: 'center',
    },

    buttonText: {
        color: '#FFF',
        fontWeight: '700',
        fontSize: 17,
    },

});