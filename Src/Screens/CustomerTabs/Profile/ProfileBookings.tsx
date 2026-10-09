
import React, { useMemo, useState } from 'react';

import {
    ActivityIndicator,
    SafeAreaView,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';

import { useNavigation } from '@react-navigation/native';
import { useQuery } from '@apollo/client';

import CalendarPicker from '../../../common/CalendarPicker';
import ScreenHeader from '../../../common/ScreenHeader';
import { CUSTOMER_BOOKINGS } from '../../../graphql/queries';
import { useUser } from '../../../context/UserContext';

type BookingStatus =
    | 'PENDING'
    | 'CONFIRMED'
    | 'COMPLETED'
    | 'CANCELLED'
    | 'NO_SHOW';

type PaymentStatus =
    | 'PENDING'
    | 'PARTIALLY_PAID'
    | 'PAID'
    | 'FAILED'
    | 'REFUNDED';

type BookedService = {
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

    staffId?: string | null;
    staffName?: string | null;

    services: BookedService[];

    totalDuration: number;
    subtotal: number;
    discount: number;
    totalAmount: number;

    paymentMethod: string;
    paymentStatus: PaymentStatus;

    bookingStatus: BookingStatus;

    notes?: string | null;
    salonNote?: string | null;

    bookingFee: number;
    bookingFeeStatus: PaymentStatus;
    bookingFeePaidAt?: string | null;

    remainingAmount: number;

    reviewSubmitted?: boolean | null;
    rating?: number | null;
    review?: string | null;
    reviewedAt?: string | null;

    createdAt: string;
    updatedAt: string;
};

type CustomerBookingsQuery = {
    customerBookings: Booking[];
};

/* =========================================================
   HELPERS
========================================================= */

const MONTHS = [
    'January',
    'February',
    'March',
    'April',
    'May',
    'June',
    'July',
    'August',
    'September',
    'October',
    'November',
    'December',
];

const PRIMARY = '#009D94';

function pad(value: number): string {
    return String(value).padStart(2, '0');
}

function normalizeDate(
    date?: string | null,
): string {
    if (!date) {
        return '';
    }

    return date.substring(0, 10);
}

function formatTime(
    time?: string | null,
): string {
    if (!time) {
        return '';
    }

    const [hourString, minuteString] = time.split(':');

    let hour = Number(hourString);
    const minute = minuteString || '00';

    if (!Number.isFinite(hour)) {
        return time;
    }

    const period = hour >= 12 ? 'PM' : 'AM';

    hour = hour % 12;

    if (hour === 0) {
        hour = 12;
    }

    return `${pad(hour)}:${minute} ${period}`;
}

function formatDate(dateString: string): string {
    const date = new Date(`${dateString}T00:00:00`);

    if (Number.isNaN(date.getTime())) {
        return dateString;
    }

    return `${date.getDate()} ${
        MONTHS[date.getMonth()].substring(0, 3)
    } ${date.getFullYear()}`;
}

function toDateKey(date: Date): string {
    return `${date.getFullYear()}-${pad(
        date.getMonth() + 1,
    )}-${pad(date.getDate())}`;
}

function getStatusLabel(
    status: BookingStatus,
): string {
    switch (status) {
        case 'PENDING':
            return 'Pending';

        case 'CONFIRMED':
            return 'Confirmed';

        case 'COMPLETED':
            return 'Completed';

        case 'CANCELLED':
            return 'Cancelled';

        case 'NO_SHOW':
            return 'No Show';

        default:
            return status;
    }
}

function getStatusStyle(status: BookingStatus) {
    switch (status) {
        case 'CONFIRMED':
            return {
                backgroundColor: '#DCFCE7',
                color: '#16A34A',
            };

        case 'PENDING':
            return {
                backgroundColor: '#FEF3C7',
                color: '#D97706',
            };

        case 'COMPLETED':
            return {
                backgroundColor: '#E5E7EB',
                color: '#4B5563',
            };

        case 'CANCELLED':
            return {
                backgroundColor: '#FEE2E2',
                color: '#DC2626',
            };

        case 'NO_SHOW':
            return {
                backgroundColor: '#F3E8FF',
                color: '#9333EA',
            };

        default:
            return {
                backgroundColor: '#E5E7EB',
                color: '#4B5563',
            };
    }
}

/* =========================================================
   COMPONENT
========================================================= */

export default function ProfileBookings() {
    const navigation = useNavigation<any>();
    const { currentUser } = useUser();

    const [selectedDate, setSelectedDate] = useState(
        () => toDateKey(new Date()),
    );

    const {
        data,
        loading,
        error,
        refetch,
    } = useQuery<CustomerBookingsQuery>(
        CUSTOMER_BOOKINGS,
        {
            variables: {
                customerUserId: currentUser?.userId,
            },
            skip: !currentUser?.userId,
            fetchPolicy: 'network-only',
            notifyOnNetworkStatusChange: true,
        },
    );

    const allBookings = data?.customerBookings || [];

    // Only bookings with a successfully paid
    // Clavata booking fee are shown.
    const bookings = useMemo(() => {
        return allBookings.filter(
            booking =>
                String(booking.bookingFeeStatus || '')
                    .trim()
                    .toUpperCase() === 'PAID',
        );
    }, [allBookings]);

    const bookingsByDate = useMemo(() => {
        const result: Record<string, Booking[]> = {};

        bookings.forEach(booking => {
            const date = normalizeDate(booking.bookingDate);

            if (!date) {
                return;
            }

            if (!result[date]) {
                result[date] = [];
            }

            result[date].push(booking);
        });

        Object.values(result).forEach(dateBookings => {
            dateBookings.sort((a, b) =>
                a.startTime.localeCompare(b.startTime),
            );
        });

        return result;
    }, [bookings]);

    const selectedBookings =
        bookingsByDate[selectedDate] || [];

    const handleViewDetails = (booking: Booking) => {
        navigation.navigate('BookingDetails', {
            bookingId: booking.bookingId,
        });
    };

    if (error) {
        return (
            <SafeAreaView style={styles.container}>
                <View style={styles.errorContainer}>
                    <Text style={styles.errorTitle}>
                        Unable to load bookings
                    </Text>

                    <Text style={styles.errorMessage}>
                        {error.message}
                    </Text>

                    <TouchableOpacity
                        style={styles.retryButton}
                        onPress={() => refetch()}
                        activeOpacity={0.8}
                    >
                        <Text style={styles.retryText}>
                            Try Again
                        </Text>
                    </TouchableOpacity>
                </View>
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView style={styles.container}>
            <ScrollView
                showsVerticalScrollIndicator={false}
                contentContainerStyle={styles.content}
            >
                {/* GENERIC HEADER */}

                <ScreenHeader title="My Bookings" />

                {/* GENERIC CALENDAR */}

                <CalendarPicker
                    selectedDate={selectedDate}
                    onDateSelect={setSelectedDate}
                    markedDates={Object.keys(bookingsByDate)}
                    primaryColor={PRIMARY}
                />

                {/* SELECTED DATE */}

                <View style={styles.selectedDateHeader}>
                    <View>
                        <Text style={styles.selectedDateTitle}>
                            {formatDate(selectedDate)}
                        </Text>

                        <Text style={styles.selectedDateSubtitle}>
                            {selectedBookings.length === 0
                                ? 'No paid bookings'
                                : `${selectedBookings.length} ${
                                      selectedBookings.length === 1
                                          ? 'booking'
                                          : 'bookings'
                                  }`}
                        </Text>
                    </View>
                </View>

                {/* LOADING */}

                {loading ? (
                    <View style={styles.loadingContainer}>
                        <ActivityIndicator
                            size="small"
                            color={PRIMARY}
                        />

                        <Text style={styles.loadingText}>
                            Loading bookings...
                        </Text>
                    </View>
                ) : null}

                {/* EMPTY STATE */}

                {!loading && selectedBookings.length === 0 ? (
                    <View style={styles.emptyCard}>
                        <Text style={styles.emptyIcon}>
                            📅
                        </Text>

                        <Text style={styles.emptyTitle}>
                            No paid bookings
                        </Text>

                        <Text style={styles.emptyText}>
                            Bookings will appear here after
                            your Clavata booking fee payment
                            is successful.
                        </Text>
                    </View>
                ) : null}

                {/* PAID BOOKINGS */}

                {!loading &&
                    selectedBookings.map(booking => {
                        const statusStyle = getStatusStyle(
                            booking.bookingStatus,
                        );

                        return (
                            <View
                                key={booking.bookingId}
                                style={styles.bookingCard}
                            >
                                {/* SALON */}

                                <View style={styles.bookingTop}>
                                    <View style={styles.salonIcon}>
                                        <Text>✂️</Text>
                                    </View>

                                    <View style={styles.salonInfo}>
                                        <Text style={styles.salonName}>
                                            {booking.salonName}
                                        </Text>

                                        <Text style={styles.bookingTime}>
                                            {formatTime(booking.startTime)}
                                            {' - '}
                                            {formatTime(booking.endTime)}
                                        </Text>
                                    </View>

                                    <View
                                        style={[
                                            styles.statusBadge,
                                            {
                                                backgroundColor:
                                                    statusStyle.backgroundColor,
                                            },
                                        ]}
                                    >
                                        <Text
                                            style={[
                                                styles.statusText,
                                                {
                                                    color:
                                                        statusStyle.color,
                                                },
                                            ]}
                                        >
                                            {getStatusLabel(
                                                booking.bookingStatus,
                                            )}
                                        </Text>
                                    </View>
                                </View>

                                {/* SERVICES */}

                                <View style={styles.servicesContainer}>
                                    {(booking.services || []).map(
                                        (service, index) => (
                                            <View
                                                key={
                                                    service.serviceId ||
                                                    `${service.name}-${index}`
                                                }
                                                style={styles.serviceRow}
                                            >
                                                <Text
                                                    style={styles.serviceName}
                                                >
                                                    {service.name}
                                                </Text>

                                                <Text
                                                    style={styles.servicePrice}
                                                >
                                                    ₹
                                                    {Number(
                                                        service.price || 0,
                                                    ).toFixed(0)}
                                                </Text>
                                            </View>
                                        ),
                                    )}
                                </View>

                                {/* TOTAL */}

                                <View style={styles.totalRow}>
                                    <Text style={styles.totalLabel}>
                                        Total
                                    </Text>

                                    <Text style={styles.totalAmount}>
                                        ₹
                                        {Number(
                                            booking.totalAmount || 0,
                                        ).toFixed(0)}
                                    </Text>
                                </View>

                                {/* BOOKING FEE */}

                                <View style={styles.paymentRow}>
                                    <Text style={styles.paymentLabel}>
                                        Clavata booking fee
                                    </Text>

                                    <Text
                                        style={[
                                            styles.paymentValue,
                                            styles.paidPaymentValue,
                                        ]}
                                    >
                                        PAID
                                    </Text>
                                </View>

                                {/* DETAILS */}

                                <TouchableOpacity
                                    style={styles.detailsButton}
                                    onPress={() =>
                                        handleViewDetails(booking)
                                    }
                                    activeOpacity={0.8}
                                >
                                    <Text
                                        style={styles.detailsButtonText}
                                    >
                                        View Details
                                    </Text>
                                </TouchableOpacity>
                            </View>
                        );
                    })}

                <View style={styles.bottomSpacer} />
            </ScrollView>
        </SafeAreaView>
    );
}

/* =========================================================
   STYLES
========================================================= */

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F7F8FA',
    },

    content: {
        padding: 16,
    },

    selectedDateHeader: {
        marginTop: 24,
        marginBottom: 12,
    },

    selectedDateTitle: {
        fontSize: 19,
        fontWeight: '700',
        color: '#111827',
    },

    selectedDateSubtitle: {
        marginTop: 3,
        fontSize: 13,
        color: '#6B7280',
    },

    loadingContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 30,
    },

    loadingText: {
        marginLeft: 8,
        fontSize: 13,
        color: '#6B7280',
    },

    emptyCard: {
        backgroundColor: '#FFFFFF',
        borderRadius: 16,
        paddingVertical: 40,
        paddingHorizontal: 20,
        alignItems: 'center',
    },

    emptyIcon: {
        fontSize: 35,
        marginBottom: 10,
    },

    emptyTitle: {
        fontSize: 17,
        fontWeight: '700',
        color: '#111827',
    },

    emptyText: {
        marginTop: 5,
        fontSize: 13,
        color: '#6B7280',
        textAlign: 'center',
        lineHeight: 20,
    },

    bookingCard: {
        backgroundColor: '#FFFFFF',
        borderRadius: 16,
        padding: 16,
        marginBottom: 14,
        elevation: 2,
        shadowColor: '#000000',
        shadowOpacity: 0.04,
        shadowRadius: 5,
        shadowOffset: {
            width: 0,
            height: 2,
        },
    },

    bookingTop: {
        flexDirection: 'row',
        alignItems: 'center',
    },

    salonIcon: {
        width: 44,
        height: 44,
        borderRadius: 12,
        backgroundColor: '#E8F8F6',
        alignItems: 'center',
        justifyContent: 'center',
    },

    salonInfo: {
        flex: 1,
        marginLeft: 11,
    },

    salonName: {
        fontSize: 16,
        fontWeight: '700',
        color: '#111827',
    },

    bookingTime: {
        marginTop: 4,
        fontSize: 12,
        color: '#6B7280',
    },

    statusBadge: {
        paddingHorizontal: 9,
        paddingVertical: 6,
        borderRadius: 20,
        marginLeft: 8,
    },

    statusText: {
        fontSize: 10,
        fontWeight: '700',
    },

    servicesContainer: {
        marginTop: 16,
        paddingTop: 12,
        borderTopWidth: 1,
        borderTopColor: '#F0F0F0',
    },

    serviceRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingVertical: 4,
    },

    serviceName: {
        flex: 1,
        fontSize: 14,
        color: '#374151',
    },

    servicePrice: {
        fontSize: 14,
        color: '#374151',
        fontWeight: '600',
    },

    totalRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginTop: 12,
        paddingTop: 12,
        borderTopWidth: 1,
        borderTopColor: '#F0F0F0',
    },

    totalLabel: {
        fontSize: 14,
        fontWeight: '600',
        color: '#6B7280',
    },

    totalAmount: {
        fontSize: 16,
        fontWeight: '700',
        color: '#111827',
    },

    paymentRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginTop: 7,
    },

    paymentLabel: {
        fontSize: 12,
        color: '#9CA3AF',
    },

    paymentValue: {
        fontSize: 12,
        fontWeight: '600',
        color: '#6B7280',
    },

    paidPaymentValue: {
        color: '#16A34A',
    },

    detailsButton: {
        marginTop: 15,
        height: 44,
        borderRadius: 11,
        backgroundColor: PRIMARY,
        alignItems: 'center',
        justifyContent: 'center',
    },

    detailsButtonText: {
        color: '#FFFFFF',
        fontSize: 14,
        fontWeight: '700',
    },

    bottomSpacer: {
        height: 30,
    },

    errorContainer: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        padding: 30,
    },

    errorTitle: {
        fontSize: 18,
        fontWeight: '700',
        color: '#111827',
    },

    errorMessage: {
        marginTop: 8,
        fontSize: 13,
        color: '#6B7280',
        textAlign: 'center',
    },

    retryButton: {
        marginTop: 20,
        backgroundColor: PRIMARY,
        paddingHorizontal: 25,
        paddingVertical: 12,
        borderRadius: 10,
    },

    retryText: {
        color: '#FFFFFF',
        fontWeight: '700',
    },
});

