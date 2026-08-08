import React, { useMemo } from 'react';
import {
    SafeAreaView,
    ScrollView,
    Text,
    View,
    Alert,
    ActivityIndicator,
    RefreshControl,
} from 'react-native';

import { useQuery } from '@apollo/client';
import { useNavigation } from '@react-navigation/native';

import styles from './styles';
import { useUser } from '../../../context/UserContext';
import DashboardHeader from './Header';
import SummaryCard from './SummaryCard';
import QuickActions from './QuickActions';
import AppointmentCard from './AppointmentCard';
import ReviewCard from './ReviewCard';

import { SALON_DASHBOARD_QUERY } from '../../../graphql/queries';

type Service = {
    serviceId: string;
    name: string;
    category: string;
    duration: number;
    price: number;
};

type Booking = {
    bookingId: string;
    salonId: string;

    customerUserId: string;
    salonName: string;
    customerName: string;
    customerPhone: string;

    bookingDate: string;
    startTime: string;
    endTime: string;

    services: Service[];

    totalDuration: number;
    subtotal: number;
    discount: number;
    totalAmount: number;

    paymentMethod: string;
    paymentStatus: string;
    bookingStatus: string;

    notes?: string;
    salonNote?: string;

    bookingFee: number;
    bookingFeeStatus: string;
    bookingFeePaidAt?: string;

    remainingAmount: number;

    razorpayOrderId?: string;
    razorpayPaymentId?: string;
    paymentGateway?: string;

    reviewSubmitted?: boolean;
    rating?: number;
    review?: string;
    reviewedAt?: string;

    createdAt: string;
    updatedAt: string;
};

type DashboardQueryData = {
    salonBookings: Booking[];
};

type DashboardQueryVariables = {
    salonId: string;
};

type Props = {
    salonId: string;
};

export default function SalonDashboardScreen() {
    const navigation = useNavigation();
    const { currentUser } = useUser();
    const salonId = currentUser?.salonId;
    const {
        data,
        loading,
        error,
        refetch,
    } = useQuery<DashboardQueryData, DashboardQueryVariables>(
        SALON_DASHBOARD_QUERY,
        {
            variables: {
                salonId: salonId as string,
            },
            skip: !salonId,
            fetchPolicy: 'cache-and-network',
        },
    );

    const bookings = data?.salonBookings ?? [];

    /**
     * Today's date
     */
    const today = new Date();

    const todayString = today.toISOString().split('T')[0];

    /**
     * Today's bookings
     */
    const todaysBookings = useMemo(() => {
        return bookings
            .filter(booking => {
                return booking.bookingDate === todayString;
            })
            .sort((a, b) => {
                return a.startTime.localeCompare(b.startTime);
            });
    }, [bookings, todayString]);

    /**
     * Today's active appointments
     */
    const todaysActiveBookings = useMemo(() => {
        return todaysBookings.filter(booking =>
            ['PENDING', 'CONFIRMED'].includes(
                booking.bookingStatus,
            ),
        );
    }, [todaysBookings]);

    /**
     * Today's completed appointments
     */
    const todaysCompletedBookings = useMemo(() => {
        return todaysBookings.filter(
            booking => booking.bookingStatus === 'COMPLETED',
        );
    }, [todaysBookings]);

    /**
     * Today's cancelled appointments
     */
    const todaysCancelledBookings = useMemo(() => {
        return todaysBookings.filter(
            booking => booking.bookingStatus === 'CANCELLED',
        );
    }, [todaysBookings]);

    /**
     * Today's revenue
     *
     * Only count completed bookings.
     */
    const todaysRevenue = useMemo(() => {
        return todaysCompletedBookings.reduce(
            (total, booking) => total + (booking.totalAmount || 0),
            0,
        );
    }, [todaysCompletedBookings]);

    /**
     * Total revenue from completed bookings
     */
    const totalRevenue = useMemo(() => {
        return bookings
            .filter(
                booking => booking.bookingStatus === 'COMPLETED',
            )
            .reduce(
                (total, booking) =>
                    total + (booking.totalAmount || 0),
                0,
            );
    }, [bookings]);

    /**
     * Total completed bookings
     */
    const totalCompleted = useMemo(() => {
        return bookings.filter(
            booking => booking.bookingStatus === 'COMPLETED',
        ).length;
    }, [bookings]);

    /**
     * Total cancelled bookings
     */
    const totalCancelled = useMemo(() => {
        return bookings.filter(
            booking => booking.bookingStatus === 'CANCELLED',
        ).length;
    }, [bookings]);

    /**
     * Total pending bookings
     */
    const totalPending = useMemo(() => {
        return bookings.filter(
            booking => booking.bookingStatus === 'PENDING',
        ).length;
    }, [bookings]);

    /**
     * Total confirmed bookings
     */
    const totalConfirmed = useMemo(() => {
        return bookings.filter(
            booking => booking.bookingStatus === 'CONFIRMED',
        ).length;
    }, [bookings]);

    /**
     * Reviews available through Booking
     *
     * Because Booking contains:
     * reviewSubmitted
     * rating
     * review
     *
     * we can build recent reviews from bookings.
     */
    const reviews = useMemo(() => {
        return bookings
            .filter(
                booking =>
                    booking.reviewSubmitted === true &&
                    !!booking.rating &&
                    !!booking.review,
            )
            .sort((a, b) => {
                return (
                    new Date(b.reviewedAt || b.updatedAt).getTime() -
                    new Date(a.reviewedAt || a.updatedAt).getTime()
                );
            })
            .slice(0, 5);
    }, [bookings]);

    /**
     * Average rating from available booking reviews
     */
    const averageRating = useMemo(() => {
        const ratedBookings = bookings.filter(
            booking =>
                booking.reviewSubmitted === true &&
                typeof booking.rating === 'number',
        );

        if (ratedBookings.length === 0) {
            return 0;
        }

        const total = ratedBookings.reduce(
            (sum, booking) => sum + (booking.rating || 0),
            0,
        );

        return total / ratedBookings.length;
    }, [bookings]);

    /**
     * Salon name
     *
     * Currently Booking contains salonName.
     */
    const salonName = useMemo(() => {
        return (
            bookings.find(booking => booking.salonName)
                ?.salonName || 'Your Salon'
        );
    }, [bookings]);

    /**
     * Summary cards
     */
    const summaryData = useMemo(() => {
        return [
            {
                id: 'todayAppointments',
                title: "Today's Appointments",
                value: String(todaysBookings.length),
                icon: '📅',
            },
            {
                id: 'todayRevenue',
                title: "Today's Revenue",
                value: `₹${todaysRevenue.toFixed(0)}`,
                icon: '💰',
            },
            {
                id: 'completed',
                title: 'Completed',
                value: String(totalCompleted),
                icon: '✅',
            },
            {
                id: 'rating',
                title: 'Rating',
                value:
                    averageRating > 0
                        ? averageRating.toFixed(1)
                        : '—',
                icon: '⭐',
            },
            {
                id: 'reviews',
                title: 'Reviews',
                value: String(reviews.length),
                icon: '💬',
            },
        ];
    }, [
        todaysBookings.length,
        todaysRevenue,
        totalCompleted,
        averageRating,
        reviews.length,
    ]);

    /**
     * Quick Actions
     */
    const onQuickAction = (action: string) => {
        switch (action) {
            case 'Add Booking':
                Alert.alert(
                    'Add Booking',
                    'Booking creation screen can be connected here.',
                );
                break;

            case 'Add Staff':
                Alert.alert(
                    'Add Staff',
                    'Staff management can be connected here.',
                );
                break;

            case 'Add Service':
                navigation.navigate('Services' as never);
                break;

            case 'Block Time':
                Alert.alert(
                    'Block Time',
                    'Time blocking can be connected here.',
                );
                break;

            default:
                break;
        }
    };

    /**
     * Loading
     */
    if (loading && !data) {
        return (
            <SafeAreaView style={styles.container}>
                <View
                    style={{
                        flex: 1,
                        justifyContent: 'center',
                        alignItems: 'center',
                    }}>
                    <ActivityIndicator size="large" />

                    <Text
                        style={{
                            marginTop: 12,
                            color: '#777',
                        }}>
                        Loading dashboard...
                    </Text>
                </View>
            </SafeAreaView>
        );
    }

    /**
     * Error
     */
    if (error && !data) {
        return (
            <SafeAreaView style={styles.container}>
                <View
                    style={{
                        flex: 1,
                        justifyContent: 'center',
                        alignItems: 'center',
                        padding: 20,
                    }}>
                    <Text
                        style={{
                            fontSize: 18,
                            fontWeight: '600',
                            marginBottom: 8,
                        }}>
                        Unable to load dashboard
                    </Text>

                    <Text
                        style={{
                            textAlign: 'center',
                            color: '#777',
                            marginBottom: 20,
                        }}>
                        {error.message}
                    </Text>
                </View>
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView style={styles.container}>
            <ScrollView
                style={styles.scroll}
                showsVerticalScrollIndicator={false}
                refreshControl={
                    <RefreshControl
                        refreshing={loading}
                        onRefresh={() => refetch()}
                    />
                }>

                {/* Header */}
                <DashboardHeader salonName={salonName} />

                {/* Summary */}
                <Text style={styles.sectionTitle}>
                    Today's Summary
                </Text>

                <ScrollView
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    contentContainerStyle={{
                        paddingHorizontal: 20,
                        paddingBottom: 10,
                    }}>

                    {summaryData.map(item => (
                        <SummaryCard
                            key={item.id}
                            title={item.title}
                            value={item.value}
                            icon={item.icon}
                        />
                    ))}

                </ScrollView>

                {/* Quick Actions */}
                <Text style={styles.sectionTitle}>
                    Quick Actions
                </Text>

                <QuickActions
                    onPress={onQuickAction}
                />

                {/* Today's Appointment Statistics */}
                {todaysBookings.length > 0 && (
                    <>
                        <Text style={styles.sectionTitle}>
                            Today's Status
                        </Text>

                        <View
                            style={{
                                flexDirection: 'row',
                                paddingHorizontal: 20,
                                gap: 10,
                            }}>

                            <View
                                style={{
                                    flex: 1,
                                    padding: 15,
                                    borderRadius: 12,
                                    backgroundColor: '#E8F5E9',
                                }}>
                                <Text
                                    style={{
                                        fontSize: 22,
                                        fontWeight: '700',
                                    }}>
                                    {todaysActiveBookings.length}
                                </Text>

                                <Text
                                    style={{
                                        color: '#666',
                                        marginTop: 4,
                                    }}>
                                    Active
                                </Text>
                            </View>

                            <View
                                style={{
                                    flex: 1,
                                    padding: 15,
                                    borderRadius: 12,
                                    backgroundColor: '#E3F2FD',
                                }}>
                                <Text
                                    style={{
                                        fontSize: 22,
                                        fontWeight: '700',
                                    }}>
                                    {todaysCompletedBookings.length}
                                </Text>

                                <Text
                                    style={{
                                        color: '#666',
                                        marginTop: 4,
                                    }}>
                                    Completed
                                </Text>
                            </View>

                            <View
                                style={{
                                    flex: 1,
                                    padding: 15,
                                    borderRadius: 12,
                                    backgroundColor: '#FFEBEE',
                                }}>
                                <Text
                                    style={{
                                        fontSize: 22,
                                        fontWeight: '700',
                                    }}>
                                    {todaysCancelledBookings.length}
                                </Text>

                                <Text
                                    style={{
                                        color: '#666',
                                        marginTop: 4,
                                    }}>
                                    Cancelled
                                </Text>
                            </View>
                        </View>
                    </>
                )}

                {/* Today's Appointments */}
                <Text style={styles.sectionTitle}>
                    Today's Appointments
                </Text>

                {todaysBookings.length === 0 ? (
                    <View
                        style={{
                            marginHorizontal: 20,
                            padding: 25,
                            borderRadius: 12,
                            alignItems: 'center',
                            backgroundColor: '#F7F7F7',
                        }}>

                        <Text
                            style={{
                                fontSize: 30,
                                marginBottom: 8,
                            }}>
                            📅
                        </Text>

                        <Text
                            style={{
                                fontSize: 16,
                                fontWeight: '600',
                            }}>
                            No appointments today
                        </Text>

                        <Text
                            style={{
                                marginTop: 5,
                                color: '#888',
                            }}>
                            New bookings will appear here.
                        </Text>
                    </View>
                ) : (
                    todaysBookings.map(item => (
                        <AppointmentCard
                            key={item.bookingId}
                            customer={item.customerName}
                            service={
                                item.services
                                    ?.map(service => service.name)
                                    .join(', ') || 'Service'
                            }
                            staff="Not assigned"
                            amount={`₹${item.totalAmount.toFixed(0)}`}
                            time={`${item.startTime} - ${item.endTime}`}
                            status={item.bookingStatus}
                            onPress={() =>
                                Alert.alert(
                                    item.customerName,
                                    `Phone: ${item.customerPhone}\n\nBooking: ${item.bookingId}\n\nPayment: ${item.paymentStatus}`,
                                )
                            }
                        />
                    ))
                )}

                {/* Recent Reviews */}
                {reviews.length > 0 && (
                    <>
                        <Text style={styles.sectionTitle}>
                            Recent Reviews
                        </Text>

                        {reviews.map(item => (
                            <ReviewCard
                                key={item.bookingId}
                                customer={item.customerName}
                                rating={item.rating || 0}
                                review={item.review || ''}
                                onReply={() =>
                                    Alert.alert(
                                        'Reply',
                                        `Reply to ${item.customerName}`,
                                    )
                                }
                            />
                        ))}
                    </>
                )}

                {/* Additional statistics */}
                {bookings.length > 0 && (
                    <>
                        <Text style={styles.sectionTitle}>
                            Business Overview
                        </Text>

                        <View
                            style={{
                                marginHorizontal: 20,
                                padding: 18,
                                borderRadius: 14,
                                backgroundColor: '#F7F7F7',
                            }}>

                            <View
                                style={{
                                    flexDirection: 'row',
                                    justifyContent: 'space-between',
                                    marginBottom: 12,
                                }}>
                                <Text>Total Bookings</Text>
                                <Text style={{ fontWeight: '700' }}>
                                    {bookings.length}
                                </Text>
                            </View>

                            <View
                                style={{
                                    flexDirection: 'row',
                                    justifyContent: 'space-between',
                                    marginBottom: 12,
                                }}>
                                <Text>Confirmed</Text>
                                <Text style={{ fontWeight: '700' }}>
                                    {totalConfirmed}
                                </Text>
                            </View>

                            <View
                                style={{
                                    flexDirection: 'row',
                                    justifyContent: 'space-between',
                                    marginBottom: 12,
                                }}>
                                <Text>Pending</Text>
                                <Text style={{ fontWeight: '700' }}>
                                    {totalPending}
                                </Text>
                            </View>

                            <View
                                style={{
                                    flexDirection: 'row',
                                    justifyContent: 'space-between',
                                    marginBottom: 12,
                                }}>
                                <Text>Completed</Text>
                                <Text style={{ fontWeight: '700' }}>
                                    {totalCompleted}
                                </Text>
                            </View>

                            <View
                                style={{
                                    flexDirection: 'row',
                                    justifyContent: 'space-between',
                                    marginBottom: 12,
                                }}>
                                <Text>Cancelled</Text>
                                <Text style={{ fontWeight: '700' }}>
                                    {totalCancelled}
                                </Text>
                            </View>

                            <View
                                style={{
                                    flexDirection: 'row',
                                    justifyContent: 'space-between',
                                }}>
                                <Text>Total Revenue</Text>
                                <Text
                                    style={{
                                        fontWeight: '700',
                                        fontSize: 16,
                                    }}>
                                    ₹{totalRevenue.toFixed(0)}
                                </Text>
                            </View>

                        </View>
                    </>
                )}

                <Text
                    style={{
                        textAlign: 'center',
                        color: '#999',
                        marginVertical: 25,
                    }}>
                    Version 1.0
                </Text>

            </ScrollView>
        </SafeAreaView>
    );
}