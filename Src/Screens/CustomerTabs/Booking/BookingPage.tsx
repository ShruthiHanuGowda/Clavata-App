import React, { useState } from 'react';
import {
    SafeAreaView,
    ScrollView,
    View,
    Text,
    TouchableOpacity,
    StyleSheet,
    Alert,
} from 'react-native';
import { useMutation, useQuery } from '@apollo/client';
import { useUser } from '../../../context/UserContext';
import { CUSTOMER_BOOKINGS, CANCEL_BOOKING } from '../../../graphql/queries';
import { useNavigation } from '@react-navigation/native';

export default function BookingPage() {
    const navigation = useNavigation<any>();
    const [tab, setTab] = useState('Upcoming');
    const { currentUser } = useUser();
    const { data, loading, error, refetch } = useQuery(
        CUSTOMER_BOOKINGS,
        {
            variables: {
                customerUserId: currentUser?.userId,
            },
            skip: !currentUser,
            fetchPolicy: 'network-only',
        },
    );

    const [cancelBookingMutation] =
        useMutation(CANCEL_BOOKING);

    const filteredBookings =
        data?.customerBookings?.filter((booking: any) => {
            if (tab === 'Upcoming') {
                return (
                    booking.bookingStatus === 'PENDING' ||
                    booking.bookingStatus === 'CONFIRMED'
                );
            }

            if (tab === 'Completed') {
                return booking.bookingStatus === 'COMPLETED';
            }

            if (tab === 'Cancelled') {
                return booking.bookingStatus === 'CANCELLED';
            }

            return false;
        }) || [];

    const getBookingStatus = (booking: any) => {
        if (booking.bookingStatus === 'PENDING') {
            return {
                text: '🟡 Waiting for Salon',
                color: '#F59E0B',
                background: '#FFF7E6',
            };
        }

        if (
            booking.bookingStatus === 'CONFIRMED' &&
            booking.bookingFeeStatus !== 'PAID'
        ) {
            return {
                text: '🟠 Payment Required',
                color: '#EA580C',
                background: '#FFF3E8',
            };
        }

        if (
            booking.bookingStatus === 'CONFIRMED' &&
            booking.bookingFeeStatus === 'PAID'
        ) {
            return {
                text: '🟢 Booking Confirmed',
                color: '#16A34A',
                background: '#ECFDF5',
            };
        }

        if (booking.bookingStatus === 'COMPLETED') {
            return {
                text: '✅ Completed',
                color: '#16A34A',
                background: '#ECFDF5',
            };
        }

        return {
            text: '❌ Cancelled',
            color: '#DC2626',
            background: '#FEF2F2',
        };
    };

    if (loading) {
        return (
            <SafeAreaView style={styles.container}>
                <Text
                    style={{
                        textAlign: 'center',
                        marginTop: 40,
                    }}>
                    Loading bookings...
                </Text>
            </SafeAreaView>
        );
    }

    if (error) {
        return (
            <SafeAreaView style={styles.container}>
                <Text
                    style={{
                        textAlign: 'center',
                        marginTop: 40,
                        color: 'red',
                    }}>
                    {error.message}
                </Text>
            </SafeAreaView>
        );
    }

    const cancelBooking = (bookingId: string) => {
        Alert.alert(
            'Cancel Booking',
            'Are you sure you want to cancel this booking?',
            [
                {
                    text: 'No',
                    style: 'cancel',
                },
                {
                    text: 'Yes',
                    onPress: async () => {
                        try {
                            await cancelBookingMutation({
                                variables: {
                                    bookingId,
                                },
                            });

                            refetch();

                            Alert.alert(
                                'Success',
                                'Booking cancelled.'
                            );
                        } catch (e: any) {
                            Alert.alert(
                                'Error',
                                e.message
                            );
                        }
                    },
                },
            ],
        );
    };

    const viewBooking = (bookingId: string) => {
        console.log(bookingId);

        // navigation.navigate(...)
    };

    return (
        <SafeAreaView style={styles.container}>
            <ScrollView
                contentContainerStyle={{ paddingBottom: 30 }}
                refreshControl={undefined}>
                <Text style={styles.title}>
                    Bookings
                </Text>

                <View style={styles.tabs}>
                    {[
                        'Upcoming',
                        'Completed',
                        'Cancelled',
                    ].map(item => (
                        <TouchableOpacity
                            key={item}
                            style={[
                                styles.tab,
                                tab === item &&
                                styles.activeTab,
                            ]}
                            onPress={() =>
                                setTab(item)
                            }>
                            <Text
                                style={[
                                    styles.tabText,
                                    tab === item &&
                                    styles.activeText,
                                ]}>
                                {item}
                            </Text>
                        </TouchableOpacity>
                    ))}
                </View>

                {filteredBookings.length === 0 ? (
                    <Text
                        style={{
                            textAlign: 'center',
                            marginTop: 40,
                            color: '#666',
                        }}>
                        No bookings found
                    </Text>
                ) : (
                    filteredBookings.map(
                        (item: any) => (
                            <TouchableOpacity
                                key={
                                    item.bookingId
                                }
                                style={
                                    styles.card
                                }>
                                <View
                                    style={
                                        styles.image
                                    }
                                />

                                <View
                                    style={{
                                        flex: 1,
                                    }}>
                                    <Text
                                        style={
                                            styles.name
                                        }>
                                        {
                                            item.salonName
                                        }
                                    </Text>

                                    <Text>
                                        {item.services
                                            .map(
                                                (
                                                    s: any,
                                                ) =>
                                                    s.name,
                                            )
                                            .join(
                                                ', ',
                                            )}
                                    </Text>

                                    <Text>
                                        {
                                            item.bookingDate
                                        }{' '}
                                        •{' '}
                                        {
                                            item.startTime
                                        }
                                    </Text>

                                    <View
                                        style={[
                                            styles.statusContainer,
                                            {
                                                backgroundColor:
                                                    getBookingStatus(item).background,
                                            },
                                        ]}>
                                        <Text
                                            style={[
                                                styles.statusText,
                                                {
                                                    color:
                                                        getBookingStatus(item).color,
                                                },
                                            ]}>
                                            {getBookingStatus(item).text}
                                        </Text>
                                    </View>

                                    <Text
                                        style={
                                            styles.price
                                        }>
                                        ₹
                                        {
                                            item.totalAmount
                                        }
                                    </Text>
                                    {item.bookingStatus === 'CONFIRMED' &&
                                        item.bookingFeeStatus === 'PENDING' && (

                                            <View style={styles.paymentCard}>

                                                <Text style={styles.paymentTitle}>
                                                    🟠 Payment Required
                                                </Text>

                                                <Text style={styles.paymentMessage}>
                                                    Your appointment has been accepted by the salon.
                                                </Text>

                                                <Text style={styles.paymentAmount}>
                                                    Pay ₹{item.bookingFee} to secure your booking.
                                                </Text>

                                                <Text style={styles.remainingAmount}>
                                                    Remaining ₹{item.remainingAmount} will be paid at the salon.
                                                </Text>

                                                <TouchableOpacity
                                                    style={styles.payNowButton}
                                                    onPress={() =>
                                                        navigation.navigate(
                                                            'BookingPayment',
                                                            {
                                                                booking: item,
                                                            },
                                                        )
                                                    }>

                                                    <Text style={styles.payNowText}>
                                                        Pay Now
                                                    </Text>

                                                </TouchableOpacity>

                                            </View>

                                        )}
                                    {item.bookingStatus === 'CONFIRMED' &&
                                        item.bookingFeeStatus === 'PAID' && (

                                            <View style={styles.confirmedCard}>

                                                <Text style={styles.confirmedTitle}>
                                                    🟢 Booking Confirmed
                                                </Text>

                                                <Text style={styles.confirmedMessage}>
                                                    Booking fee received successfully.
                                                </Text>

                                                <Text style={styles.remainingAmount}>
                                                    Remaining ₹{item.remainingAmount} will be paid at salon.
                                                </Text>

                                            </View>

                                        )}

                                    {tab ===
                                        'Upcoming' ? (
                                        <View style={styles.buttons}>

                                            <TouchableOpacity
                                                style={styles.secondaryButton}
                                                onPress={() =>
                                                    cancelBooking(item.bookingId)
                                                }>

                                                <Text
                                                    style={styles.secondaryText}>
                                                    Cancel
                                                </Text>

                                            </TouchableOpacity>

                                            <TouchableOpacity
                                                style={styles.primaryButton}
                                                onPress={() =>
                                                    viewBooking(item.bookingId)
                                                }>

                                                <Text style={styles.primaryText}>
                                                    View Bookings
                                                </Text>

                                            </TouchableOpacity>

                                        </View>
                                    ) : (
                                        <View
                                            style={
                                                styles.buttons
                                            }>
                                            <TouchableOpacity
                                                style={
                                                    styles.secondaryButton
                                                }>
                                                <Text>
                                                    Book
                                                    Again
                                                </Text>
                                            </TouchableOpacity>
                                        </View>
                                    )}
                                </View>
                            </TouchableOpacity>
                        ),
                    )
                )}
            </ScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F7F8FA',
    },

    title: {
        fontSize: 30,
        fontWeight: '700',
        margin: 20,
    },

    tabs: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        marginBottom: 20,
    },

    tab: {
        paddingVertical: 10,
        paddingHorizontal: 18,
        borderRadius: 25,
        backgroundColor: '#fff',
    },

    activeTab: {
        backgroundColor: '#008060',
    },

    tabText: {
        color: '#666',
    },

    activeText: {
        color: '#fff',
        fontWeight: '700',
    },

    card: {
        backgroundColor: '#fff',
        marginHorizontal: 20,
        marginBottom: 15,
        borderRadius: 18,
        padding: 15,
        flexDirection: 'row',
    },

    image: {
        height: 80,
        width: 80,
        backgroundColor: '#ddd',
        borderRadius: 12,
        marginRight: 15,
    },

    name: {
        fontSize: 18,
        fontWeight: '700',
    },

    price: {
        marginTop: 8,
        fontWeight: '700',
        color: '#008060',
    },

    buttons: {
        marginTop: 12,
    },

    primaryButton: {
        backgroundColor: '#008060',
        padding: 10,
        borderRadius: 10,
        alignItems: 'center',
    },

    primaryText: {
        color: '#fff',
        fontWeight: '700',
    },
    secondaryText: {
        color: '#008060',
        fontWeight: '700',
    },

    secondaryButton: {
        borderWidth: 1,
        borderColor: '#008060',
        padding: 10,
        borderRadius: 10,
        alignItems: 'center',
    },
    statusContainer: {
        alignSelf: 'flex-start',
        marginTop: 8,
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 20,
    },

    statusText: {
        fontSize: 13,
        fontWeight: '700',
    },
    paymentCard: {
        marginTop: 12,
        backgroundColor: '#FFF7ED',
        borderWidth: 1,
        borderColor: '#FDBA74',
        borderRadius: 12,
        padding: 12,
    },

    paymentTitle: {
        fontSize: 15,
        fontWeight: '700',
        color: '#C2410C',
        marginBottom: 6,
    },

    paymentMessage: {
        fontSize: 14,
        color: '#444',
        marginBottom: 6,
    },

    paymentAmount: {
        fontSize: 15,
        fontWeight: '700',
        color: '#111827',
    },

    remainingAmount: {
        marginTop: 5,
        color: '#666',
        fontSize: 13,
    },

    confirmedCard: {
        marginTop: 12,
        backgroundColor: '#ECFDF5',
        borderWidth: 1,
        borderColor: '#86EFAC',
        borderRadius: 12,
        padding: 12,
    },

    confirmedTitle: {
        fontSize: 15,
        fontWeight: '700',
        color: '#15803D',
        marginBottom: 6,
    },

    confirmedMessage: {
        fontSize: 14,
        color: '#444',
    },
    payNowButton: {
        marginTop: 15,
        backgroundColor: '#009D94',
        borderRadius: 10,
        height: 46,
        justifyContent: 'center',
        alignItems: 'center',
    },

    payNowText: {
        color: '#FFF',
        fontWeight: '700',
        fontSize: 16,
    },
});