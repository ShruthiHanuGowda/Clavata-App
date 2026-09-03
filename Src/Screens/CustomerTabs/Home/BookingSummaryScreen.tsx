import React, { useMemo, useState } from 'react';
import {
    SafeAreaView,
    View,
    Text,
    TouchableOpacity,
    FlatList,
    StyleSheet,
    TextInput,
    Alert,
} from 'react-native';
import { useMutation } from '@apollo/client';
import { CREATE_BOOKING } from '../../../graphql/queries';

const PRIMARY = '#008060';

export default function BookingSummaryScreen({
    navigation,
    route,
}: any) {
    const {
        salonId,
        salon,
        customerUserId,
        services,
        date,
        time,
    } = route.params;
    console.log('BookingSummaryScreen params:', route.params);
    console.log("date", date);

    // const temp_bookingDate = '2026-07-30';
    // const temp_startTime = '10:00 AM'

    const [createBooking, { loading }] =
        useMutation(CREATE_BOOKING);

    const [paymentMethod, setPaymentMethod] =
        useState<'SALON' | 'ONLINE'>('SALON');

    const subtotal = useMemo(() => {
        return services.reduce(
            (sum: number, item: any) => sum + item.price,
            0,
        );
    }, [services]);

    const duration = useMemo(() => {
        return services.reduce(
            (sum: number, item: any) => sum + item.duration,
            0,
        );
    }, [services]);

    const platformFee = 20;
    const gst = Math.round(platformFee * 0.18);

    const total =
        subtotal +
        platformFee +
        gst;

    const formatTime = (time: string) => {
        const [clock, period] = time.split(' ');
        let [hour, minute] = clock.split(':');

        let h = parseInt(hour, 10);

        if (period === 'PM' && h !== 12) h += 12;
        if (period === 'AM' && h === 12) h = 0;

        return `${String(h).padStart(2, '0')}:${minute}`;
    };

    const confirmBooking = async () => {
        try {
            const response = await createBooking({
                variables: {
                    input: {
                        salonId,
                        customerUserId,
                        bookingDate: date.date.toISOString().split('T')[0],
                        startTime: formatTime(time),
                        paymentMethod:
                            paymentMethod === 'ONLINE'
                                ? 'ONLINE'
                                : 'PAY_AT_SALON',
                        services: services.map((service: any) => ({
                            serviceId: service.serviceId,
                        })),
                        notes: '',
                    },
                },
            });

            if (response.data.createBooking.success) {

                navigation.replace(
                    'BookingRequestSent',
                    {
                        booking:
                            response.data.createBooking.booking,
                    },
                );

            } else {

                Alert.alert(
                    response.data.createBooking.message,
                );

            }
        } catch (err: any) {
            Alert.alert(err.message);
        }
    };

    return (
        <SafeAreaView style={styles.container}>
            <TouchableOpacity
                onPress={() => navigation.goBack()}>
                <Text style={styles.back}>←</Text>
            </TouchableOpacity>
            <FlatList
                data={services}
                keyExtractor={(item) => item.id}
                ListHeaderComponent={
                    <>
                        <Text style={styles.heading}>
                            Booking Summary
                        </Text>

                        <View style={styles.card}>
                            <Text style={styles.salon}>
                                {salon?.name}
                            </Text>

                            <Text style={styles.address}>
                                📍  {salon?.address?.addressLine}, {salon?.address?.city}
                            </Text>
                        </View>

                        <View style={styles.card}>
                            <Text style={styles.sectionTitle}>
                                Appointment
                            </Text>

                            <Text>
                                📅 {date.label}, {date.dayNumber} {date.month} {date.date.getFullYear()}
                            </Text>

                            <Text style={{ marginTop: 8 }}>
                                🕒 {time}
                            </Text>
                        </View>

                        <View style={styles.card}>
                            <Text style={styles.sectionTitle}>
                                Selected Services
                            </Text>
                        </View>
                    </>
                }
                renderItem={({ item }) => (
                    <View style={styles.serviceRow}>
                        <View>
                            <Text
                                style={styles.service}>
                                {item.name}
                            </Text>

                            <Text
                                style={styles.duration}>
                                {item.duration} mins
                            </Text>
                        </View>

                        <Text style={styles.price}>
                            ₹{item.price}
                        </Text>
                    </View>
                )}
                ListFooterComponent={
                    <>
                        <View style={styles.card}>
                            <Text style={styles.sectionTitle}>
                                Duration
                            </Text>

                            <Text>
                                {duration} mins
                            </Text>
                        </View>

                        <View style={styles.card}>
                            <Text style={styles.sectionTitle}>
                                Promo Code
                            </Text>

                            <TextInput
                                placeholder="Enter coupon"
                                style={styles.input}
                            />

                            <TouchableOpacity
                                style={styles.apply}>
                                <Text
                                    style={{
                                        color: PRIMARY,
                                        fontWeight: '700',
                                    }}>
                                    Apply
                                </Text>
                            </TouchableOpacity>
                        </View>

                        <View style={styles.card}>
                            <Text style={styles.sectionTitle}>
                                Payment
                            </Text>

                            <View
                                style={styles.row}>
                                <Text>
                                    Services
                                </Text>

                                <Text>
                                    ₹{subtotal}
                                </Text>
                            </View>

                            <View
                                style={styles.row}>
                                <Text>
                                    Platform Fee
                                </Text>

                                <Text>
                                    ₹{platformFee}
                                </Text>
                            </View>

                            <View
                                style={styles.row}>
                                <Text>GST</Text>

                                <Text>
                                    ₹{gst}
                                </Text>
                            </View>

                            <View
                                style={[
                                    styles.row,
                                    {
                                        marginTop: 10,
                                    },
                                ]}>
                                <Text
                                    style={{
                                        fontWeight: '700',
                                    }}>
                                    Total
                                </Text>

                                <Text
                                    style={{
                                        fontWeight: '700',
                                        color: PRIMARY,
                                        fontSize: 18,
                                    }}>
                                    ₹{total}
                                </Text>
                            </View>
                        </View>

                        <View style={styles.card}>
                            <Text style={styles.sectionTitle}>
                                Payment Method
                            </Text>

                            <TouchableOpacity
                                style={styles.option}
                                onPress={() =>
                                    setPaymentMethod(
                                        'SALON',
                                    )
                                }>
                                <Text>
                                    {paymentMethod ===
                                        'SALON'
                                        ? '🟢'
                                        : '⚪'}{' '}
                                    Pay at Salon
                                </Text>
                            </TouchableOpacity>

                            <TouchableOpacity
                                style={styles.option}
                                onPress={() =>
                                    setPaymentMethod(
                                        'ONLINE',
                                    )
                                }>
                                <Text>
                                    {paymentMethod ===
                                        'ONLINE'
                                        ? '🟢'
                                        : '⚪'}{' '}
                                    Pay Online
                                </Text>
                            </TouchableOpacity>
                        </View>

                        <TouchableOpacity
                            style={styles.confirm}
                            disabled={loading}
                            onPress={confirmBooking}
                        >
                            <Text style={styles.confirmText}>
                                {loading ? 'Booking...' : 'Confirm Booking'}
                            </Text>
                        </TouchableOpacity>
                    </>
                }
                contentContainerStyle={{
                    paddingBottom: 30,
                }}
            />
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F5F6FA',
    },

    heading: {
        fontSize: 28,
        fontWeight: '700',
        margin: 20,
    },

    card: {
        backgroundColor: '#FFF',
        marginHorizontal: 15,
        marginBottom: 15,
        borderRadius: 14,
        padding: 18,
    },

    salon: {
        fontSize: 20,
        fontWeight: '700',
    },

    address: {
        marginTop: 8,
        color: '#666',
    },

    sectionTitle: {
        fontSize: 18,
        fontWeight: '700',
        marginBottom: 12,
    },

    serviceRow: {
        backgroundColor: '#FFF',
        marginHorizontal: 15,
        marginBottom: 8,
        padding: 18,
        borderRadius: 14,
        flexDirection: 'row',
        justifyContent: 'space-between',
    },

    service: {
        fontWeight: '700',
        fontSize: 16,
    },

    duration: {
        marginTop: 5,
        color: '#777',
    },

    price: {
        color: PRIMARY,
        fontWeight: '700',
        fontSize: 18,
    },

    input: {
        borderWidth: 1,
        borderColor: '#DDD',
        borderRadius: 10,
        paddingHorizontal: 15,
        height: 50,
    },

    apply: {
        alignSelf: 'flex-end',
        marginTop: 12,
    },

    row: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginVertical: 6,
    },

    option: {
        marginVertical: 10,
    },

    confirm: {
        marginHorizontal: 20,
        marginBottom: 30,
        backgroundColor: PRIMARY,
        height: 55,
        borderRadius: 28,
        justifyContent: 'center',
        alignItems: 'center',
    },

    back: {
        fontSize: 28,
        fontWeight: '700',
    },

    confirmText: {
        color: '#FFF',
        fontWeight: '700',
        fontSize: 17,
    },
});