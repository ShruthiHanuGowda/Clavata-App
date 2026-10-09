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

const WEEK_DAYS = [
    'SUN',
    'MON',
    'TUE',
    'WED',
    'THU',
    'FRI',
    'SAT',
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

    const [hourString, minuteString] =
        time.split(':');

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

function formatDate(
    dateString: string,
): string {
    const date = new Date(
        `${dateString}T00:00:00`,
    );

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

function getStatusStyle(
    status: BookingStatus,
) {
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

    const today = new Date();

    const [currentMonth, setCurrentMonth] =
        useState(
            new Date(
                today.getFullYear(),
                today.getMonth(),
                1,
            ),
        );

    const [selectedDate, setSelectedDate] =
        useState(toDateKey(today));

    const {
        data,
        loading,
        error,
        refetch,
    } = useQuery<CustomerBookingsQuery>(
        CUSTOMER_BOOKINGS,
        {
            variables: {
                customerUserId:
                    currentUser?.userId,
            },

            skip: !currentUser?.userId,

            fetchPolicy: 'network-only',

            // Refresh booking payment status when
            // returning to this screen manually
            notifyOnNetworkStatusChange: true,
        },
    );

    /* =====================================================
       PAYMENT FILTER — IMPORTANT

       Only show bookings whose Clavata booking fee
       has been successfully paid.

       PENDING, FAILED, REFUNDED and other statuses
       will not appear in the calendar or booking list.
    ===================================================== */

    const allBookings =
        data?.customerBookings || [];

    const bookings = useMemo(() => {
        return allBookings.filter(
            booking =>
                String(
                    booking.bookingFeeStatus || '',
                )
                    .trim()
                    .toUpperCase() === 'PAID',
        );
    }, [allBookings]);

    console.log(
        '[ProfileBookings] TOTAL BOOKINGS:',
        allBookings.length,
    );

    console.log(
        '[ProfileBookings] PAID BOOKINGS:',
        bookings.length,
    );

    console.log(
        '[ProfileBookings] EXCLUDED UNPAID BOOKINGS:',
        allBookings
            .filter(
                booking =>
                    String(
                        booking.bookingFeeStatus || '',
                    )
                        .trim()
                        .toUpperCase() !== 'PAID',
            )
            .map(booking => ({
                bookingId: booking.bookingId,
                bookingFeeStatus:
                    booking.bookingFeeStatus,
            })),
    );

    /* =====================================================
       BOOKINGS GROUPED BY DATE

       Because this uses the filtered bookings,
       calendar dots only appear for paid bookings.
    ===================================================== */

    const bookingsByDate = useMemo(() => {
        const result: Record<string, Booking[]> = {};

        bookings.forEach(booking => {
            const date = normalizeDate(
                booking.bookingDate,
            );

            if (!date) {
                return;
            }

            if (!result[date]) {
                result[date] = [];
            }

            result[date].push(booking);
        });

        Object.values(result).forEach(
            dateBookings => {
                dateBookings.sort((a, b) =>
                    a.startTime.localeCompare(
                        b.startTime,
                    ),
                );
            },
        );

        return result;
    }, [bookings]);

    /* =====================================================
       CALENDAR DAYS
    ===================================================== */

    const calendarDays = useMemo(() => {
        const year = currentMonth.getFullYear();
        const month = currentMonth.getMonth();

        const firstDay = new Date(
            year,
            month,
            1,
        ).getDay();

        const daysInMonth = new Date(
            year,
            month + 1,
            0,
        ).getDate();

        const days: Array<Date | null> = [];

        for (
            let i = 0;
            i < firstDay;
            i++
        ) {
            days.push(null);
        }

        for (
            let day = 1;
            day <= daysInMonth;
            day++
        ) {
            days.push(
                new Date(year, month, day),
            );
        }

        return days;
    }, [currentMonth]);

    /* =====================================================
       SELECTED DATE BOOKINGS
    ===================================================== */

    const selectedBookings =
        bookingsByDate[selectedDate] || [];

    /* =====================================================
       MONTH NAVIGATION
    ===================================================== */

    const previousMonth = () => {
        setCurrentMonth(
            new Date(
                currentMonth.getFullYear(),
                currentMonth.getMonth() - 1,
                1,
            ),
        );
    };

    const nextMonth = () => {
        setCurrentMonth(
            new Date(
                currentMonth.getFullYear(),
                currentMonth.getMonth() + 1,
                1,
            ),
        );
    };

    const goToToday = () => {
        const now = new Date();

        setCurrentMonth(
            new Date(
                now.getFullYear(),
                now.getMonth(),
                1,
            ),
        );

        setSelectedDate(toDateKey(now));
    };

    /* =====================================================
       VIEW BOOKING
    ===================================================== */

    const handleViewDetails = (
        booking: Booking,
    ) => {
        navigation.navigate(
            'BookingDetails',
            {
                bookingId: booking.bookingId,
            },
        );
    };

    /* =====================================================
       ERROR
    ===================================================== */

    if (error) {
        return (
            <SafeAreaView
                style={styles.container}
            >
                <View
                    style={styles.errorContainer}
                >
                    <Text
                        style={styles.errorTitle}
                    >
                        Unable to load bookings
                    </Text>

                    <Text
                        style={styles.errorMessage}
                    >
                        {error.message}
                    </Text>

                    <TouchableOpacity
                        style={styles.retryButton}
                        onPress={() => refetch()}
                    >
                        <Text
                            style={styles.retryText}
                        >
                            Try Again
                        </Text>
                    </TouchableOpacity>
                </View>
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView
            style={styles.container}
        >
            <ScrollView
                showsVerticalScrollIndicator={false}
                contentContainerStyle={styles.content}
            >
                {/* HEADER */}

                <View style={styles.header}>
                    <TouchableOpacity
                        onPress={() =>
                            navigation.goBack()
                        }
                        style={styles.backButton}
                    >
                        <Text style={styles.back}>
                            ←
                        </Text>
                    </TouchableOpacity>

                    <Text style={styles.title}>
                        My Bookings
                    </Text>
                </View>

                {/* CALENDAR */}

                <View style={styles.calendarCard}>
                    <View style={styles.monthHeader}>
                        <TouchableOpacity
                            style={styles.monthArrow}
                            onPress={previousMonth}
                        >
                            <Text style={styles.arrowText}>
                                ‹
                            </Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                            onPress={goToToday}
                        >
                            <Text style={styles.monthTitle}>
                                {MONTHS[
                                    currentMonth.getMonth()
                                ]}{' '}
                                {currentMonth.getFullYear()}
                            </Text>

                            <Text style={styles.todayText}>
                                Tap to go to today
                            </Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={styles.monthArrow}
                            onPress={nextMonth}
                        >
                            <Text style={styles.arrowText}>
                                ›
                            </Text>
                        </TouchableOpacity>
                    </View>

                    {/* WEEK DAYS */}

                    <View style={styles.weekRow}>
                        {WEEK_DAYS.map(day => (
                            <View
                                key={day}
                                style={styles.weekDay}
                            >
                                <Text
                                    style={styles.weekDayText}
                                >
                                    {day}
                                </Text>
                            </View>
                        ))}
                    </View>

                    {/* CALENDAR GRID */}

                    <View style={styles.calendarGrid}>
                        {calendarDays.map(
                            (date, index) => {
                                if (!date) {
                                    return (
                                        <View
                                            key={`empty-${index}`}
                                            style={styles.calendarDay}
                                        />
                                    );
                                }

                                const dateKey =
                                    toDateKey(date);

                                // Only paid bookings
                                // create calendar dots.
                                const hasBookings =
                                    Boolean(
                                        bookingsByDate[
                                            dateKey
                                        ]?.length,
                                    );

                                const isSelected =
                                    selectedDate === dateKey;

                                const isToday =
                                    toDateKey(today) ===
                                    dateKey;

                                return (
                                    <TouchableOpacity
                                        key={dateKey}
                                        style={styles.calendarDay}
                                        onPress={() =>
                                            setSelectedDate(
                                                dateKey,
                                            )
                                        }
                                    >
                                        <View
                                            style={[
                                                styles.dateCircle,
                                                isSelected &&
                                                    styles.selectedDateCircle,
                                                isToday &&
                                                    !isSelected &&
                                                    styles.todayCircle,
                                            ]}
                                        >
                                            <Text
                                                style={[
                                                    styles.dateText,
                                                    isSelected &&
                                                        styles.selectedDateText,
                                                    isToday &&
                                                        !isSelected &&
                                                        styles.todayTextNumber,
                                                ]}
                                            >
                                                {date.getDate()}
                                            </Text>
                                        </View>

                                        {hasBookings ? (
                                            <View
                                                style={styles.bookingDot}
                                            />
                                        ) : null}
                                    </TouchableOpacity>
                                );
                            },
                        )}
                    </View>
                </View>

                {/* SELECTED DATE */}

                <View
                    style={styles.selectedDateHeader}
                >
                    <View>
                        <Text
                            style={styles.selectedDateTitle}
                        >
                            {formatDate(selectedDate)}
                        </Text>

                        <Text
                            style={styles.selectedDateSubtitle}
                        >
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
                    <View
                        style={styles.loadingContainer}
                    >
                        <ActivityIndicator
                            size="small"
                            color={PRIMARY}
                        />

                        <Text
                            style={styles.loadingText}
                        >
                            Loading bookings...
                        </Text>
                    </View>
                ) : null}

                {/* NO BOOKINGS */}

                {!loading &&
                selectedBookings.length === 0 ? (
                    <View style={styles.emptyCard}>
                        <Text style={styles.emptyIcon}>
                            📅
                        </Text>

                        <Text style={styles.emptyTitle}>
                            No paid bookings
                        </Text>

                        <Text style={styles.emptyText}>
                            Bookings will appear here
                            after your Clavata booking
                            fee payment is successful.
                        </Text>
                    </View>
                ) : null}

                {/* PAID BOOKINGS ONLY */}

                {!loading &&
                    selectedBookings.map(booking => {
                        const statusStyle =
                            getStatusStyle(
                                booking.bookingStatus,
                            );

                        return (
                            <View
                                key={booking.bookingId}
                                style={styles.bookingCard}
                            >
                                {/* SALON */}

                                <View style={styles.bookingTop}>
                                    <View
                                        style={styles.salonIcon}
                                    >
                                        <Text>✂️</Text>
                                    </View>

                                    <View
                                        style={styles.salonInfo}
                                    >
                                        <Text
                                            style={styles.salonName}
                                        >
                                            {booking.salonName}
                                        </Text>

                                        <Text
                                            style={styles.bookingTime}
                                        >
                                            {formatTime(
                                                booking.startTime,
                                            )}{' '}
                                            -{' '}
                                            {formatTime(
                                                booking.endTime,
                                            )}
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

                                <View
                                    style={styles.servicesContainer}
                                >
                                    {(
                                        booking.services || []
                                    ).map(
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
                                    <Text
                                        style={styles.totalLabel}
                                    >
                                        Total
                                    </Text>

                                    <Text
                                        style={styles.totalAmount}
                                    >
                                        ₹
                                        {Number(
                                            booking.totalAmount || 0,
                                        ).toFixed(0)}
                                    </Text>
                                </View>

                                {/* BOOKING FEE PAYMENT */}

                                <View style={styles.paymentRow}>
                                    <Text
                                        style={styles.paymentLabel}
                                    >
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
                                >
                                    <Text
                                        style={
                                            styles.detailsButtonText
                                        }
                                    >
                                        View Details
                                    </Text>
                                </TouchableOpacity>
                            </View>
                        );
                    })}

                <View style={{ height: 30 }} />
            </ScrollView>
        </SafeAreaView>
    );
}

/* ============================================================
   STYLES
============================================================ */

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F7F8FA',
    },

    content: {
        padding: 16,
    },

    header: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 18,
    },

    backButton: {
        width: 42,
        height: 42,
        alignItems: 'center',
        justifyContent: 'center',
    },

    back: {
        fontSize: 28,
        fontWeight: '700',
        color: '#111827',
    },

    title: {
        fontSize: 27,
        fontWeight: '700',
        color: '#111827',
        marginLeft: 4,
    },

    calendarCard: {
        backgroundColor: '#FFFFFF',
        borderRadius: 18,
        padding: 16,
        elevation: 2,
        shadowColor: '#000',
        shadowOpacity: 0.05,
        shadowRadius: 6,
        shadowOffset: {
            width: 0,
            height: 2,
        },
    },

    monthHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: 18,
    },

    monthArrow: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: '#F3F8F7',
        alignItems: 'center',
        justifyContent: 'center',
    },

    arrowText: {
        fontSize: 28,
        color: PRIMARY,
        lineHeight: 30,
    },

    monthTitle: {
        fontSize: 18,
        fontWeight: '700',
        color: '#111827',
        textAlign: 'center',
    },

    todayText: {
        fontSize: 10,
        color: '#8A8A8A',
        marginTop: 2,
        textAlign: 'center',
    },

    weekRow: {
        flexDirection: 'row',
        marginBottom: 6,
    },

    weekDay: {
        width: '14.2857%',
        alignItems: 'center',
    },

    weekDayText: {
        fontSize: 11,
        fontWeight: '700',
        color: '#9CA3AF',
    },

    calendarGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
    },

    calendarDay: {
        width: '14.2857%',
        height: 52,
        alignItems: 'center',
        justifyContent: 'center',
    },

    dateCircle: {
        width: 36,
        height: 36,
        borderRadius: 18,
        alignItems: 'center',
        justifyContent: 'center',
    },

    selectedDateCircle: {
        backgroundColor: PRIMARY,
    },

    todayCircle: {
        borderWidth: 1,
        borderColor: PRIMARY,
    },

    dateText: {
        fontSize: 14,
        fontWeight: '600',
        color: '#374151',
    },

    selectedDateText: {
        color: '#FFFFFF',
        fontWeight: '700',
    },

    todayTextNumber: {
        color: PRIMARY,
        fontWeight: '700',
    },

    bookingDot: {
        position: 'absolute',
        bottom: 1,
        width: 5,
        height: 5,
        borderRadius: 3,
        backgroundColor: PRIMARY,
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
        shadowColor: '#000',
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