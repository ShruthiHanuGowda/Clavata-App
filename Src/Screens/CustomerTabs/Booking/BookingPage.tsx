import React, { useState } from 'react';
import {
    SafeAreaView,
    ScrollView,
    View,
    Text,
    TouchableOpacity,
    StyleSheet,
} from 'react-native';
import { useQuery } from '@apollo/client';
import { useUser } from '../../../context/UserContext';
import { CUSTOMER_BOOKINGS } from '../../../graphql/queries';

export default function BookingPage() {
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

                                    <Text>
                                        Status:{' '}
                                        {
                                            item.bookingStatus
                                        }
                                    </Text>

                                    <Text
                                        style={
                                            styles.price
                                        }>
                                        ₹
                                        {
                                            item.totalAmount
                                        }
                                    </Text>

                                    {tab ===
                                    'Upcoming' ? (
                                        <View
                                            style={
                                                styles.buttons
                                            }>
                                            <TouchableOpacity
                                                style={
                                                    styles.primaryButton
                                                }>
                                                <Text
                                                    style={
                                                        styles.primaryText
                                                    }>
                                                    View
                                                    Booking
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

    secondaryButton: {
        borderWidth: 1,
        borderColor: '#008060',
        padding: 10,
        borderRadius: 10,
        alignItems: 'center',
    },
});