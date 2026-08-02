import React from 'react';
import {
    SafeAreaView,
    View,
    Text,
    TouchableOpacity,
    StyleSheet,
} from 'react-native';

const PRIMARY = '#008060';

export default function BookingSuccessScreen({
    navigation,
}: any) {
    const bookingId = 'NX458291';

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.content}>
                <Text style={styles.icon}>✅</Text>
                <Text style={styles.title}>
                    Booking Confirmed
                </Text>
                <Text style={styles.subtitle}>
                    Your appointment has been booked successfully.
                </Text>

                <View style={styles.card}>

                    <Text style={styles.label}>
                        Salon
                    </Text>

                    <Text style={styles.value}>
                        Rajeev Beauty Salon
                    </Text>

                    <View style={styles.divider} />

                    <Text style={styles.label}>
                        Date
                    </Text>

                    <Text style={styles.value}>
                        Monday, 10 Aug
                    </Text>

                    <View style={styles.divider} />

                    <Text style={styles.label}>
                        Time
                    </Text>

                    <Text style={styles.value}>
                        11:30 AM
                    </Text>

                    <View style={styles.divider} />

                    <Text style={styles.label}>
                        Booking ID
                    </Text>

                    <Text style={styles.bookingId}>
                        {bookingId}
                    </Text>
                </View>
                <TouchableOpacity
                    style={styles.primaryButton}
                    onPress={() =>
                        navigation.navigate('Bookings')
                    }
                >
                    <Text style={styles.primaryText}>
                        View Booking
                    </Text>
                </TouchableOpacity>

                <TouchableOpacity
                    style={styles.secondaryButton}
                    onPress={() =>
                        navigation.navigate('Home')
                    }
                >
                    <Text style={styles.secondaryText}>
                        Back to Home
                    </Text>
                </TouchableOpacity>

            </View>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({

    container: {
        flex: 1,
        backgroundColor: '#F6F7FB',
    },

    content: {
        flex: 1,
        justifyContent: 'center',
        padding: 24,
    },

    icon: {
        fontSize: 70,
        textAlign: 'center',
    },

    title: {
        marginTop: 20,
        fontSize: 28,
        fontWeight: '700',
        textAlign: 'center',
    },

    subtitle: {
        marginTop: 10,
        color: '#666',
        textAlign: 'center',
        fontSize: 15,
        marginBottom: 35,
    },

    card: {
        backgroundColor: '#FFF',
        borderRadius: 16,
        padding: 20,
        elevation: 2,
    },

    label: {
        color: '#888',
        fontSize: 13,
    },

    value: {
        marginTop: 4,
        fontWeight: '700',
        fontSize: 17,
        color: '#111',
    },

    bookingId: {
        marginTop: 4,
        color: PRIMARY,
        fontWeight: '700',
        fontSize: 20,
    },

    divider: {
        height: 1,
        backgroundColor: '#EEE',
        marginVertical: 18,
    },

    primaryButton: {
        marginTop: 40,
        height: 55,
        borderRadius: 28,
        backgroundColor: PRIMARY,
        justifyContent: 'center',
        alignItems: 'center',
    },

    primaryText: {
        color: '#FFF',
        fontWeight: '700',
        fontSize: 16,
    },

    secondaryButton: {
        marginTop: 15,
        height: 55,
        borderRadius: 28,
        borderWidth: 1,
        borderColor: PRIMARY,
        justifyContent: 'center',
        alignItems: 'center',
    },

    secondaryText: {
        color: PRIMARY,
        fontWeight: '700',
        fontSize: 16,
    },

});