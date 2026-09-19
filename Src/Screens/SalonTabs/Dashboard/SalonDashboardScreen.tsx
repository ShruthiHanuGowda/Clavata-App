import React, { useMemo, useState } from 'react';
import {
    SafeAreaView,
    ScrollView,
    Text,
    View,
    Alert,
    ActivityIndicator,
    RefreshControl,
    TouchableOpacity,
} from 'react-native';

import { useQuery } from '@apollo/client';
import { useNavigation } from '@react-navigation/native';

import styles from './styles';
import { useUser } from '../../../context/UserContext';

import DashboardHeader from './Header';
import SummaryCard from './SummaryCard';
import AppointmentCard from './AppointmentCard';
import ReviewCard from './ReviewCard';

import {
    SALON_DASHBOARD_QUERY,
    GET_SALON,
} from '../../../graphql/queries';

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

type CalendarDay = {
    date: Date;
    dateString: string;
    dayNumber: number;
    isCurrentMonth: boolean;
    isToday: boolean;
    isSelected: boolean;
    hasBookings: boolean;
};

const PRIMARY_COLOR = '#009D94';

const WEEK_DAYS = [
    'Mon',
    'Tue',
    'Wed',
    'Thu',
    'Fri',
    'Sat',
    'Sun',
];

const MONTH_NAMES = [
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

/*
 * ================================================================
 * DATE HELPERS
 * ================================================================
 */

const formatDateString = (
    date: Date,
): string => {
    const year =
        date.getFullYear();

    const month = String(
        date.getMonth() + 1,
    ).padStart(2, '0');

    const day = String(
        date.getDate(),
    ).padStart(2, '0');

    return `${year}-${month}-${day}`;
};

const getToday = (): Date => {
    const now = new Date();

    return new Date(
        now.getFullYear(),
        now.getMonth(),
        now.getDate(),
    );
};

const formatCurrency = (
    amount: number,
): string => {
    return `₹${Math.round(
        amount || 0,
    ).toLocaleString('en-IN')}`;
};

const getMondayBasedDayIndex = (
    date: Date,
): number => {
    const day = date.getDay();

    return day === 0
        ? 6
        : day - 1;
};

/*
 * ================================================================
 * SCREEN
 * ================================================================
 */

export default function SalonDashboardScreen() {
    const navigation =
        useNavigation();

    const { currentUser } =
        useUser();

    const salonId =
        currentUser?.salonId;

    /*
     * ============================================================
     * DASHBOARD QUERY
     * ============================================================
     */

    const {
        data,
        loading,
        error,
        refetch,
    } = useQuery<
        DashboardQueryData,
        DashboardQueryVariables
    >(
        SALON_DASHBOARD_QUERY,
        {
            variables: {
                salonId:
                    salonId as string,
            },

            skip: !salonId,

            fetchPolicy:
                'cache-and-network',
        },
    );

    /*
     * ============================================================
     * SALON QUERY
     * ============================================================
     */

    const {
        data: salonData,
        loading: salonLoading,
        error: salonError,
    } = useQuery(
        GET_SALON,
        {
            variables: {
                salonId:
                    salonId as string,
            },

            skip: !salonId,

            fetchPolicy:
                'network-only',
        },
    );

    const bookings =
        data?.salonBookings ?? [];

    /*
     * ============================================================
     * TODAY
     * ============================================================
     */

    const today = useMemo(
        () => getToday(),
        [],
    );

    const todayString =
        useMemo(
            () =>
                formatDateString(
                    today,
                ),
            [today],
        );

    /*
     * ============================================================
     * CALENDAR STATE
     *
     * Calendar is CLOSED by default.
     * ============================================================
     */

    const [
        calendarExpanded,
        setCalendarExpanded,
    ] = useState(false);

    /*
     * ============================================================
     * SELECTED DATE
     *
     * Defaults to today.
     * ============================================================
     */

    const [
        selectedDate,
        setSelectedDate,
    ] = useState<string>(
        todayString,
    );

    /*
     * ============================================================
     * DISPLAYED MONTH
     * ============================================================
     */

    const [
        displayedMonth,
        setDisplayedMonth,
    ] = useState<Date>(
        new Date(
            today.getFullYear(),
            today.getMonth(),
            1,
        ),
    );

    /*
     * ============================================================
     * SALON DETAILS
     * ============================================================
     */

    const salon =
        salonData?.getSalon;

    const salonName =
        salon?.salonName?.trim() ||
        bookings.find(
            booking =>
                booking.salonName,
        )?.salonName ||
        'Your Salon';

    const ownerName =
        salon?.ownerName?.trim() ||
        currentUser?.fullName?.trim() ||
        'Owner';

    const logoUrl =
        salon?.logoUrl?.trim() ||
        salon?.logoMedia?.objectUrl?.trim() ||
        null;

    const coverImageUrl =
        salon?.coverImageUrl?.trim() ||
        salon?.coverMedia?.objectUrl?.trim() ||
        null;

    /*
     * ============================================================
     * TODAY'S BOOKINGS
     * ============================================================
     */

    const todaysBookings =
        useMemo(() => {
            return bookings
                .filter(
                    booking =>
                        booking.bookingDate ===
                        todayString,
                )
                .sort(
                    (a, b) =>
                        a.startTime.localeCompare(
                            b.startTime,
                        ),
                );
        }, [
            bookings,
            todayString,
        ]);

    /*
     * ============================================================
     * TODAY'S CUSTOMERS
     * ============================================================
     */

    const todaysCustomers =
        useMemo(() => {
            const customers =
                new Set<string>();

            todaysBookings.forEach(
                booking => {
                    if (
                        booking.customerUserId
                    ) {
                        customers.add(
                            booking.customerUserId,
                        );
                    } else if (
                        booking.customerPhone
                    ) {
                        customers.add(
                            booking.customerPhone,
                        );
                    }
                },
            );

            return customers.size;
        }, [
            todaysBookings,
        ]);

    /*
     * ============================================================
     * TODAY'S COMPLETED BOOKINGS
     * ============================================================
     */

    const todaysCompletedBookings =
        useMemo(() => {
            return todaysBookings.filter(
                booking =>
                    booking.bookingStatus ===
                    'COMPLETED',
            );
        }, [
            todaysBookings,
        ]);

    /*
     * ============================================================
     * TODAY'S REVENUE
     * ============================================================
     */

    const todaysRevenue =
        useMemo(() => {
            return todaysCompletedBookings.reduce(
                (
                    total,
                    booking,
                ) =>
                    total +
                    (booking.totalAmount ||
                        0),
                0,
            );
        }, [
            todaysCompletedBookings,
        ]);

    /*
     * ============================================================
     * PAID VIA CLAVATA
     * ============================================================
     */

    const todaysClavataPaid =
        useMemo(() => {
            return todaysCompletedBookings.reduce(
                (
                    total,
                    booking,
                ) => {
                    if (
                        booking.bookingFeeStatus ===
                        'PAID'
                    ) {
                        return (
                            total +
                            (booking.bookingFee ||
                                0)
                        );
                    }

                    return total;
                },
                0,
            );
        }, [
            todaysCompletedBookings,
        ]);

    /*
     * ============================================================
     * TO COLLECT AT SALON
     * ============================================================
     */

    const todaysSalonCollection =
        useMemo(() => {
            return Math.max(
                0,
                todaysRevenue -
                    todaysClavataPaid,
            );
        }, [
            todaysRevenue,
            todaysClavataPaid,
        ]);

    /*
     * ============================================================
     * PENDING REQUESTS
     * ============================================================
     */

    const pendingRequests =
        useMemo(() => {
            return bookings.filter(
                booking =>
                    booking.bookingStatus ===
                    'PENDING',
            );
        }, [bookings]);

    /*
     * ============================================================
     * REVIEWS
     * ============================================================
     */

    const reviews =
        useMemo(() => {
            return bookings
                .filter(
                    booking =>
                        booking.reviewSubmitted ===
                            true &&
                        typeof booking.rating ===
                            'number' &&
                        !!booking.review,
                )
                .sort(
                    (a, b) =>
                        new Date(
                            b.reviewedAt ||
                                b.updatedAt,
                        ).getTime() -
                        new Date(
                            a.reviewedAt ||
                                a.updatedAt,
                        ).getTime(),
                )
                .slice(0, 5);
        }, [bookings]);

    /*
     * ============================================================
     * TOTAL REVIEWS
     * ============================================================
     */

    const totalReviews =
        useMemo(() => {
            return bookings.filter(
                booking =>
                    booking.reviewSubmitted ===
                        true &&
                    typeof booking.rating ===
                        'number',
            ).length;
        }, [bookings]);

    /*
     * ============================================================
     * AVERAGE RATING
     * ============================================================
     */

    const averageRating =
        useMemo(() => {
            const ratedBookings =
                bookings.filter(
                    booking =>
                        booking.reviewSubmitted ===
                            true &&
                        typeof booking.rating ===
                            'number',
                );

            if (
                ratedBookings.length ===
                0
            ) {
                return 0;
            }

            const total =
                ratedBookings.reduce(
                    (
                        sum,
                        booking,
                    ) =>
                        sum +
                        (booking.rating ||
                            0),
                    0,
                );

            return (
                total /
                ratedBookings.length
            );
        }, [bookings]);

    /*
     * ============================================================
     * SUMMARY CARDS
     * ============================================================
     */

    const summaryData =
        useMemo(() => {
            return [
                {
                    id:
                        'todayAppointments',
                    title:
                        "Today's Appointments",
                    value:
                        String(
                            todaysBookings.length,
                        ),
                    icon: '📅',
                },

                {
                    id:
                        'todayCustomers',
                    title:
                        "Today's Customers",
                    value:
                        String(
                            todaysCustomers,
                        ),
                    icon: '👥',
                },

                {
                    id:
                        'todayRevenue',
                    title:
                        "Today's Revenue",
                    value:
                        formatCurrency(
                            todaysRevenue,
                        ),
                    icon: '💰',
                },

                {
                    id:
                        'pendingRequests',
                    title:
                        'Pending Requests',
                    value:
                        String(
                            pendingRequests.length,
                        ),
                    icon: '⏳',
                },
            ];
        }, [
            todaysBookings.length,
            todaysCustomers,
            todaysRevenue,
            pendingRequests.length,
        ]);

    /*
     * ============================================================
     * SUMMARY CARD PRESS
     * ============================================================
     */

    const handleSummaryCardPress =
        (
            cardId: string,
        ) => {
            switch (
                cardId
            ) {
                case 'todayAppointments':
                    navigation.navigate(
                        'Bookings' as never,
                    );
                    break;

                case 'todayCustomers':
                    navigation.navigate(
                        'Bookings' as never,
                    );
                    break;

                case 'todayRevenue':
                    navigation.navigate(
                        'Bookings' as never,
                    );
                    break;

                case 'pendingRequests':
                    navigation.navigate(
                        'Bookings' as never,
                    );
                    break;

                default:
                    break;
            }
        };

    /*
     * ============================================================
     * CALENDAR DAYS
     * ============================================================
     */

    const calendarDays =
        useMemo<CalendarDay[]>(() => {
            const year =
                displayedMonth.getFullYear();

            const month =
                displayedMonth.getMonth();

            const firstDay =
                new Date(
                    year,
                    month,
                    1,
                );

            const firstDayIndex =
                getMondayBasedDayIndex(
                    firstDay,
                );

            const daysInMonth =
                new Date(
                    year,
                    month + 1,
                    0,
                ).getDate();

            const daysInPreviousMonth =
                new Date(
                    year,
                    month,
                    0,
                ).getDate();

            const days: CalendarDay[] =
                [];

            /*
             * Previous month days
             */

            for (
                let index = 0;
                index < firstDayIndex;
                index += 1
            ) {
                const dayNumber =
                    daysInPreviousMonth -
                    firstDayIndex +
                    index +
                    1;

                const date =
                    new Date(
                        year,
                        month - 1,
                        dayNumber,
                    );

                const dateString =
                    formatDateString(
                        date,
                    );

                days.push({
                    date,
                    dateString,
                    dayNumber,
                    isCurrentMonth:
                        false,
                    isToday:
                        dateString ===
                        todayString,
                    isSelected:
                        dateString ===
                        selectedDate,
                    hasBookings:
                        bookings.some(
                            booking =>
                                booking.bookingDate ===
                                dateString,
                        ),
                });
            }

            /*
             * Current month days
             */

            for (
                let dayNumber = 1;
                dayNumber <=
                daysInMonth;
                dayNumber += 1
            ) {
                const date =
                    new Date(
                        year,
                        month,
                        dayNumber,
                    );

                const dateString =
                    formatDateString(
                        date,
                    );

                days.push({
                    date,
                    dateString,
                    dayNumber,
                    isCurrentMonth:
                        true,
                    isToday:
                        dateString ===
                        todayString,
                    isSelected:
                        dateString ===
                        selectedDate,
                    hasBookings:
                        bookings.some(
                            booking =>
                                booking.bookingDate ===
                                dateString,
                        ),
                });
            }

            /*
             * Next month days
             */

            const remaining =
                7 -
                (days.length % 7);

            if (
                remaining <
                7
            ) {
                for (
                    let index = 1;
                    index <=
                    remaining;
                    index += 1
                ) {
                    const date =
                        new Date(
                            year,
                            month + 1,
                            index,
                        );

                    const dateString =
                        formatDateString(
                            date,
                        );

                    days.push({
                        date,
                        dateString,
                        dayNumber:
                            index,
                        isCurrentMonth:
                            false,
                        isToday:
                            dateString ===
                            todayString,
                        isSelected:
                            dateString ===
                            selectedDate,
                        hasBookings:
                            bookings.some(
                                booking =>
                                    booking.bookingDate ===
                                    dateString,
                            ),
                    });
                }
            }

            return days;
        }, [
            displayedMonth,
            bookings,
            todayString,
            selectedDate,
        ]);

    /*
     * ============================================================
     * PREVIOUS MONTH
     * ============================================================
     */

    const goToPreviousMonth =
        () => {
            setDisplayedMonth(
                current =>
                    new Date(
                        current.getFullYear(),
                        current.getMonth() -
                            1,
                        1,
                    ),
            );
        };

    /*
     * ============================================================
     * NEXT MONTH
     * ============================================================
     */

    const goToNextMonth =
        () => {
            setDisplayedMonth(
                current =>
                    new Date(
                        current.getFullYear(),
                        current.getMonth() +
                            1,
                        1,
                    ),
            );
        };

    /*
     * ============================================================
     * SELECT DATE
     * ============================================================
     */

    const handleDateSelect =
        (
            day: CalendarDay,
        ) => {
            setSelectedDate(
                day.dateString,
            );

            if (
                !day.isCurrentMonth
            ) {
                setDisplayedMonth(
                    new Date(
                        day.date.getFullYear(),
                        day.date.getMonth(),
                        1,
                    ),
                );
            }
        };

    /*
     * ============================================================
     * GO TO TODAY
     * ============================================================
     */

    const handleTodayPress =
        () => {
            setSelectedDate(
                todayString,
            );

            setDisplayedMonth(
                new Date(
                    today.getFullYear(),
                    today.getMonth(),
                    1,
                ),
            );
        };

    /*
     * ============================================================
     * SELECTED DATE OBJECT
     * ============================================================
     */

    const selectedDateObject =
        useMemo(() => {
            const parts =
                selectedDate.split(
                    '-',
                );

            if (
                parts.length !==
                3
            ) {
                return null;
            }

            return new Date(
                Number(parts[0]),
                Number(parts[1]) -
                    1,
                Number(parts[2]),
            );
        }, [
            selectedDate,
        ]);

    /*
     * ============================================================
     * CALENDAR DATE DISPLAY
     *
     * This is used ONLY on the right side of the
     * Appointments header.
     * ============================================================
     */

    const calendarDateLabel =
        useMemo(() => {
            if (
                !selectedDateObject
            ) {
                return 'Select date';
            }

            const day =
                selectedDateObject.getDate();

            const month =
                MONTH_NAMES[
                    selectedDateObject.getMonth()
                ].slice(0, 3);

            if (
                selectedDate ===
                todayString
            ) {
                return `Today, ${day} ${month}`;
            }

            return `${day} ${month}`;
        }, [
            selectedDateObject,
            selectedDate,
            todayString,
        ]);

    /*
     * ============================================================
     * SELECTED DATE BOOKINGS
     * ============================================================
     */

    const selectedDateBookings =
        useMemo(() => {
            return bookings
                .filter(
                    booking =>
                        booking.bookingDate ===
                        selectedDate,
                )
                .sort(
                    (a, b) =>
                        a.startTime.localeCompare(
                            b.startTime,
                        ),
                );
        }, [
            bookings,
            selectedDate,
        ]);

    /*
     * ============================================================
     * APPOINTMENT PRESS
     * ============================================================
     */

    const handleAppointmentPress =
        (
            booking: Booking,
        ) => {
            Alert.alert(
                booking.customerName ||
                    'Customer',
                [
                    `Phone: ${
                        booking.customerPhone ||
                        'Not available'
                    }`,
                    '',
                    `Booking: ${booking.bookingId}`,
                    '',
                    `Service: ${
                        booking.services
                            ?.map(
                                service =>
                                    service.name,
                            )
                            .join(
                                ', ',
                            ) ||
                        'Service'
                    }`,
                    '',
                    `Time: ${booking.startTime} - ${booking.endTime}`,
                    '',
                    `Status: ${booking.bookingStatus}`,
                    '',
                    `Payment: ${booking.paymentStatus}`,
                ].join('\n'),
            );
        };

    /*
     * ============================================================
     * PENDING REQUESTS
     * ============================================================
     */

    const handlePendingRequestsPress =
        () => {
            navigation.navigate(
                'Bookings' as never,
            );
        };

    /*
     * ============================================================
     * REFRESH
     * ============================================================
     */

    const handleRefresh =
        async () => {
            try {
                await refetch();
            } catch (
                refreshError
            ) {
                console.log(
                    'Dashboard refresh error:',
                    refreshError,
                );
            }
        };

    /*
     * ============================================================
     * LOADING
     * ============================================================
     */

    if (
        loading &&
        !data
    ) {
        return (
            <SafeAreaView
                style={
                    styles.container
                }>

                <View
                    style={{
                        flex: 1,
                        justifyContent:
                            'center',
                        alignItems:
                            'center',
                    }}>

                    <ActivityIndicator
                        size="large"
                    />

                    <Text
                        style={{
                            marginTop:
                                12,
                            color:
                                '#777',
                        }}>
                        Loading dashboard...
                    </Text>
                </View>
            </SafeAreaView>
        );
    }

    /*
     * ============================================================
     * ERROR
     * ============================================================
     */

    if (
        error &&
        !data
    ) {
        return (
            <SafeAreaView
                style={
                    styles.container
                }>

                <View
                    style={{
                        flex: 1,
                        justifyContent:
                            'center',
                        alignItems:
                            'center',
                        padding: 20,
                    }}>

                    <Text
                        style={{
                            fontSize:
                                18,
                            fontWeight:
                                '600',
                            marginBottom:
                                8,
                        }}>
                        Unable to load dashboard
                    </Text>

                    <Text
                        style={{
                            textAlign:
                                'center',
                            color:
                                '#777',
                            marginBottom:
                                20,
                        }}>
                        {
                            error.message
                        }
                    </Text>

                    <TouchableOpacity
                        onPress={
                            handleRefresh
                        }
                        style={{
                            paddingHorizontal:
                                24,
                            paddingVertical:
                                12,
                            borderRadius:
                                10,
                            backgroundColor:
                                PRIMARY_COLOR,
                        }}>

                        <Text
                            style={{
                                color:
                                    '#FFFFFF',
                                fontWeight:
                                    '600',
                            }}>
                            Try Again
                        </Text>
                    </TouchableOpacity>
                </View>
            </SafeAreaView>
        );
    }

    /*
     * ============================================================
     * MAIN DASHBOARD
     * ============================================================
     */

    return (
        <SafeAreaView
            style={
                styles.container
            }>

            <ScrollView
                style={
                    styles.scroll
                }
                showsVerticalScrollIndicator={
                    false
                }
                refreshControl={
                    <RefreshControl
                        refreshing={
                            loading
                        }
                        onRefresh={
                            handleRefresh
                        }
                    />
                }>

                {/* ==================================================
                    HEADER
                ================================================== */}

                <DashboardHeader
                    salonName={
                        salonName
                    }
                    ownerName={
                        ownerName
                    }
                    logoUrl={
                        logoUrl
                    }
                    coverImageUrl={
                        coverImageUrl
                    }
                />

                {/* ==================================================
                    TODAY'S SUMMARY
                ================================================== */}

                <Text
                    style={
                        styles.sectionTitle
                    }>
                    Today's Summary
                </Text>

                <ScrollView
                    horizontal
                    showsHorizontalScrollIndicator={
                        false
                    }
                    contentContainerStyle={{
                        paddingHorizontal:
                            20,
                        paddingBottom:
                            10,
                    }}>

                    {summaryData.map(
                        item => (
                            <SummaryCard
                                key={
                                    item.id
                                }
                                title={
                                    item.title
                                }
                                value={
                                    item.value
                                }
                                icon={
                                    item.icon
                                }
                                onPress={() =>
                                    handleSummaryCardPress(
                                        item.id,
                                    )
                                }
                            />
                        ),
                    )}
                </ScrollView>

                {/* ==================================================
                    REVENUE BREAKDOWN
                ================================================== */}

                {todaysRevenue >
                    0 && (
                    <View
                        style={{
                            marginHorizontal:
                                20,
                            marginTop:
                                4,
                            padding:
                                16,
                            borderRadius:
                                14,
                            backgroundColor:
                                '#F7F7F7',
                        }}>

                        <View
                            style={{
                                flexDirection:
                                    'row',
                                justifyContent:
                                    'space-between',
                                alignItems:
                                    'center',
                            }}>

                            <Text
                                style={{
                                    fontSize:
                                        14,
                                    color:
                                        '#666',
                                    flex:
                                        1,
                                }}>
                                Today's completed
                                service value
                            </Text>

                            <Text
                                style={{
                                    fontSize:
                                        17,
                                    fontWeight:
                                        '700',
                                }}>
                                {formatCurrency(
                                    todaysRevenue,
                                )}
                            </Text>
                        </View>

                        <View
                            style={{
                                height:
                                    1,
                                backgroundColor:
                                    '#E5E5E5',
                                marginVertical:
                                    12,
                            }}
                        />

                        <View
                            style={{
                                flexDirection:
                                    'row',
                                justifyContent:
                                    'space-between',
                                marginBottom:
                                    8,
                            }}>

                            <Text
                                style={{
                                    color:
                                        '#666',
                                }}>
                                Paid via Clavata
                            </Text>

                            <Text
                                style={{
                                    fontWeight:
                                        '600',
                                }}>
                                {formatCurrency(
                                    todaysClavataPaid,
                                )}
                            </Text>
                        </View>

                        <View
                            style={{
                                flexDirection:
                                    'row',
                                justifyContent:
                                    'space-between',
                            }}>

                            <Text
                                style={{
                                    color:
                                        '#666',
                                }}>
                                To collect at salon
                            </Text>

                            <Text
                                style={{
                                    fontWeight:
                                        '600',
                                }}>
                                {formatCurrency(
                                    todaysSalonCollection,
                                )}
                            </Text>
                        </View>
                    </View>
                )}

                {/* ==================================================
                    APPOINTMENTS HEADER
                   
                    LEFT:
                    Appointments

                    RIGHT:
                    Calendar + selected date + chevron

                    This replaces the old duplicated date layout.
                ================================================== */}

                <View
                    style={{
                        marginHorizontal:
                            20,
                        marginTop:
                            16,
                        flexDirection:
                            'row',
                        alignItems:
                            'center',
                        justifyContent:
                            'space-between',
                    }}>

                    {/* LEFT SIDE */}

                    <Text
                        style={{
                            fontSize:
                                18,
                            fontWeight:
                                '700',
                            color:
                                '#222',
                        }}>
                        Appointments
                    </Text>

                    {/* RIGHT SIDE */}

                    <TouchableOpacity
                        activeOpacity={
                            0.75
                        }
                        onPress={() =>
                            setCalendarExpanded(
                                current =>
                                    !current,
                            )
                        }
                        style={{
                            flexDirection:
                                'row',
                            alignItems:
                                'center',
                            paddingVertical:
                                8,
                            paddingLeft:
                                10,
                        }}>

                        <View
                            style={{
                                alignItems:
                                    'flex-end',
                            }}>

                            <Text
                                style={{
                                    fontSize:
                                        12,
                                    color:
                                        '#777',
                                    marginBottom:
                                        2,
                                }}>
                                Calendar
                            </Text>

                            <Text
                                style={{
                                    fontSize:
                                        14,
                                    fontWeight:
                                        '600',
                                    color:
                                        '#222',
                                }}>
                                {
                                    calendarDateLabel
                                }
                            </Text>
                        </View>

                        <Text
                            style={{
                                fontSize:
                                    20,
                                color:
                                    PRIMARY_COLOR,
                                marginLeft:
                                    8,
                                marginTop:
                                    5,
                                transform: [
                                    {
                                        rotate:
                                            calendarExpanded
                                                ? '180deg'
                                                : '0deg',
                                    },
                                ],
                            }}>
                            ⌄
                        </Text>
                    </TouchableOpacity>
                </View>

                {/* ==================================================
                    EXPANDED CALENDAR
                ================================================== */}

                {calendarExpanded && (
                    <View
                        style={{
                            marginHorizontal:
                                20,
                            marginTop:
                                8,
                            padding:
                                16,
                            borderRadius:
                                14,
                            backgroundColor:
                                '#FFFFFF',
                            borderWidth:
                                1,
                            borderColor:
                                '#EEEEEE',
                        }}>

                        {/* MONTH HEADER */}

                        <View
                            style={{
                                flexDirection:
                                    'row',
                                alignItems:
                                    'center',
                                justifyContent:
                                    'space-between',
                                marginBottom:
                                    14,
                            }}>

                            <TouchableOpacity
                                activeOpacity={
                                    0.7
                                }
                                onPress={
                                    goToPreviousMonth
                                }
                                style={{
                                    width:
                                        40,
                                    height:
                                        40,
                                    borderRadius:
                                        20,
                                    alignItems:
                                        'center',
                                    justifyContent:
                                        'center',
                                    backgroundColor:
                                        '#F5F5F5',
                                }}>

                                <Text
                                    style={{
                                        fontSize:
                                            24,
                                        color:
                                            '#333',
                                        marginTop:
                                            -2,
                                    }}>
                                    ‹
                                </Text>
                            </TouchableOpacity>

                            <Text
                                style={{
                                    fontSize:
                                        17,
                                    fontWeight:
                                        '700',
                                    color:
                                        '#222',
                                }}>
                                {
                                    MONTH_NAMES[
                                        displayedMonth.getMonth()
                                    ]
                                }{' '}
                                {
                                    displayedMonth.getFullYear()
                                }
                            </Text>

                            <TouchableOpacity
                                activeOpacity={
                                    0.7
                                }
                                onPress={
                                    goToNextMonth
                                }
                                style={{
                                    width:
                                        40,
                                    height:
                                        40,
                                    borderRadius:
                                        20,
                                    alignItems:
                                        'center',
                                    justifyContent:
                                        'center',
                                    backgroundColor:
                                        '#F5F5F5',
                                }}>

                                <Text
                                    style={{
                                        fontSize:
                                            24,
                                        color:
                                            '#333',
                                        marginTop:
                                            -2,
                                    }}>
                                    ›
                                </Text>
                            </TouchableOpacity>
                        </View>

                        {/* TODAY BUTTON */}

                        <View
                            style={{
                                alignItems:
                                    'center',
                                marginBottom:
                                    12,
                            }}>

                            <TouchableOpacity
                                activeOpacity={
                                    0.7
                                }
                                onPress={
                                    handleTodayPress
                                }
                                style={{
                                    paddingHorizontal:
                                        14,
                                    paddingVertical:
                                        7,
                                    borderRadius:
                                        8,
                                    backgroundColor:
                                        '#E8F7F5',
                                }}>

                                <Text
                                    style={{
                                        color:
                                            PRIMARY_COLOR,
                                        fontWeight:
                                            '600',
                                        fontSize:
                                            13,
                                    }}>
                                    Go to Today
                                </Text>
                            </TouchableOpacity>
                        </View>

                        {/* WEEK DAYS */}

                        <View
                            style={{
                                flexDirection:
                                    'row',
                                marginBottom:
                                    7,
                            }}>

                            {WEEK_DAYS.map(
                                day => (
                                    <View
                                        key={
                                            day
                                        }
                                        style={{
                                            flex:
                                                1,
                                            alignItems:
                                                'center',
                                        }}>

                                        <Text
                                            style={{
                                                fontSize:
                                                    11,
                                                fontWeight:
                                                    '600',
                                                color:
                                                    '#888',
                                            }}>
                                            {day}
                                        </Text>
                                    </View>
                                ),
                            )}
                        </View>

                        {/* CALENDAR GRID */}

                        <View>
                            {Array.from(
                                {
                                    length:
                                        Math.ceil(
                                            calendarDays.length /
                                                7,
                                        ),
                                },
                            ).map(
                                (
                                    _,
                                    weekIndex,
                                ) => {
                                    const week =
                                        calendarDays.slice(
                                            weekIndex *
                                                7,
                                            weekIndex *
                                                7 +
                                                7,
                                        );

                                    return (
                                        <View
                                            key={
                                                `week-${weekIndex}`
                                            }
                                            style={{
                                                flexDirection:
                                                    'row',
                                                marginBottom:
                                                    6,
                                            }}>

                                            {week.map(
                                                day => (
                                                    <View
                                                        key={
                                                            day.dateString
                                                        }
                                                        style={{
                                                            flex:
                                                                1,
                                                            alignItems:
                                                                'center',
                                                        }}>

                                                        <TouchableOpacity
                                                            activeOpacity={
                                                                0.7
                                                            }
                                                            onPress={() =>
                                                                handleDateSelect(
                                                                    day,
                                                                )
                                                            }
                                                            style={{
                                                                width:
                                                                    38,
                                                                height:
                                                                    43,
                                                                borderRadius:
                                                                    11,
                                                                alignItems:
                                                                    'center',
                                                                justifyContent:
                                                                    'center',
                                                                backgroundColor:
                                                                    day.isSelected
                                                                        ? PRIMARY_COLOR
                                                                        : day.isToday
                                                                        ? '#E8F7F5'
                                                                        : 'transparent',
                                                            }}>

                                                            <Text
                                                                style={{
                                                                    fontSize:
                                                                        13,
                                                                    fontWeight:
                                                                        day.isSelected ||
                                                                        day.isToday
                                                                            ? '700'
                                                                            : '500',
                                                                    color:
                                                                        day.isSelected
                                                                            ? '#FFFFFF'
                                                                            : day.isCurrentMonth
                                                                            ? '#222'
                                                                            : '#BDBDBD',
                                                                }}>
                                                                {
                                                                    day.dayNumber
                                                                }
                                                            </Text>

                                                            <View
                                                                style={{
                                                                    width:
                                                                        4,
                                                                    height:
                                                                        4,
                                                                    borderRadius:
                                                                        2,
                                                                    marginTop:
                                                                        3,
                                                                    backgroundColor:
                                                                        day.hasBookings
                                                                            ? day.isSelected
                                                                                ? '#FFFFFF'
                                                                                : PRIMARY_COLOR
                                                                            : 'transparent',
                                                                }}
                                                            />
                                                        </TouchableOpacity>
                                                    </View>
                                                ),
                                            )}
                                        </View>
                                    );
                                },
                            )}
                        </View>
                    </View>
                )}

                {/* ==================================================
                    APPOINTMENT LIST
                   
                    Notice:
                    We DO NOT display the date here again.
                ================================================== */}

                {selectedDateBookings.length ===
                0 ? (
                    <View
                        style={{
                            marginHorizontal:
                                20,
                            marginTop:
                                10,
                            paddingVertical:
                                28,
                            paddingHorizontal:
                                20,
                            borderRadius:
                                14,
                            alignItems:
                                'center',
                            backgroundColor:
                                '#F7F7F7',
                        }}>

                        <Text
                            style={{
                                fontSize:
                                    30,
                                marginBottom:
                                    8,
                            }}>
                            📅
                        </Text>

                        <Text
                            style={{
                                fontSize:
                                    16,
                                fontWeight:
                                    '600',
                                color:
                                    '#333',
                            }}>
                            No appointments
                        </Text>

                        <Text
                            style={{
                                marginTop:
                                    5,
                                color:
                                    '#888',
                                textAlign:
                                    'center',
                            }}>
                            There are no bookings
                            for the selected date.
                        </Text>
                    </View>
                ) : (
                    selectedDateBookings.map(
                        item => (
                            <AppointmentCard
                                key={
                                    item.bookingId
                                }
                                customer={
                                    item.customerName
                                }
                                service={
                                    item.services
                                        ?.map(
                                            service =>
                                                service.name,
                                        )
                                        .join(
                                            ', ',
                                        ) ||
                                    'Service'
                                }
                                staff="Not assigned"
                                amount={formatCurrency(
                                    item.totalAmount,
                                )}
                                time={`${item.startTime} - ${item.endTime}`}
                                status={
                                    item.bookingStatus
                                }
                                onPress={() =>
                                    handleAppointmentPress(
                                        item,
                                    )
                                }
                            />
                        ),
                    )
                )}

                {/* ==================================================
                    ACTION REQUIRED
                ================================================== */}

                {pendingRequests.length >
                    0 && (
                    <View
                        style={{
                            marginTop:
                                6,
                        }}>

                        <Text
                            style={
                                styles.sectionTitle
                            }>
                            Action Required
                        </Text>

                        <TouchableOpacity
                            activeOpacity={
                                0.8
                            }
                            onPress={
                                handlePendingRequestsPress
                            }
                            style={{
                                marginHorizontal:
                                    20,
                                padding:
                                    16,
                                borderRadius:
                                    14,
                                backgroundColor:
                                    '#FFF8E7',
                                borderWidth:
                                    1,
                                borderColor:
                                    '#F0D98A',
                                flexDirection:
                                    'row',
                                alignItems:
                                    'center',
                                justifyContent:
                                    'space-between',
                            }}>

                            <View
                                style={{
                                    flex:
                                        1,
                                    paddingRight:
                                        10,
                                }}>

                                <Text
                                    style={{
                                        fontSize:
                                            15,
                                        fontWeight:
                                            '700',
                                        color:
                                            '#333',
                                    }}>
                                    Pending booking
                                    requests
                                </Text>

                                <Text
                                    style={{
                                        marginTop:
                                            5,
                                        fontSize:
                                            13,
                                        color:
                                            '#777',
                                    }}>
                                    {
                                        pendingRequests.length
                                    }{' '}
                                    request
                                    {pendingRequests.length !==
                                    1
                                        ? 's'
                                        : ''}{' '}
                                    waiting for your
                                    response.
                                </Text>
                            </View>

                            <View
                                style={{
                                    width:
                                        36,
                                    height:
                                        36,
                                    borderRadius:
                                        18,
                                    alignItems:
                                        'center',
                                    justifyContent:
                                        'center',
                                    backgroundColor:
                                        PRIMARY_COLOR,
                                }}>

                                <Text
                                    style={{
                                        color:
                                            '#FFFFFF',
                                        fontSize:
                                            20,
                                        fontWeight:
                                            '700',
                                    }}>
                                    →
                                </Text>
                            </View>
                        </TouchableOpacity>
                    </View>
                )}

                {/* ==================================================
                    RATING & REVIEWS
                ================================================== */}

                <Text
                    style={[
                        styles.sectionTitle,
                        {
                            marginTop:
                                16,
                        },
                    ]}>
                    Rating & Reviews
                </Text>

                <View
                    style={{
                        marginHorizontal:
                            20,
                        padding:
                            18,
                        borderRadius:
                            14,
                        backgroundColor:
                            '#F7F7F7',
                    }}>

                    <View
                        style={{
                            flexDirection:
                                'row',
                            alignItems:
                                'center',
                        }}>

                        <View
                            style={{
                                width:
                                    64,
                                height:
                                    64,
                                borderRadius:
                                    32,
                                backgroundColor:
                                    '#FFFFFF',
                                alignItems:
                                    'center',
                                justifyContent:
                                    'center',
                            }}>

                            <Text
                                style={{
                                    fontSize:
                                        22,
                                    fontWeight:
                                        '700',
                                    color:
                                        '#222',
                                }}>
                                {averageRating >
                                0
                                    ? averageRating.toFixed(
                                          1,
                                      )
                                    : '—'}
                            </Text>

                            <Text
                                style={{
                                    fontSize:
                                        15,
                                    marginTop:
                                        1,
                                }}>
                                ⭐
                            </Text>
                        </View>

                        <View
                            style={{
                                marginLeft:
                                    14,
                                flex:
                                    1,
                            }}>

                            <Text
                                style={{
                                    fontSize:
                                        15,
                                    fontWeight:
                                        '700',
                                    color:
                                        '#333',
                                }}>
                                Your salon rating
                            </Text>

                            <Text
                                style={{
                                    marginTop:
                                        5,
                                    color:
                                        '#777',
                                    fontSize:
                                        13,
                                }}>
                                {
                                    totalReviews
                                }{' '}
                                review
                                {totalReviews !==
                                1
                                    ? 's'
                                    : ''}
                            </Text>
                        </View>
                    </View>
                </View>

                {/* ==================================================
                    LATEST REVIEWS
                ================================================== */}

                {reviews.length >
                    0 && (
                    <View
                        style={{
                            marginTop:
                                4,
                        }}>

                        <Text
                            style={{
                                marginHorizontal:
                                    20,
                                marginTop:
                                    12,
                                marginBottom:
                                    4,
                                fontSize:
                                    14,
                                fontWeight:
                                    '600',
                                color:
                                    '#555',
                            }}>
                            Latest Reviews
                        </Text>

                        {reviews.map(
                            item => (
                                <ReviewCard
                                    key={
                                        item.bookingId
                                    }
                                    customer={
                                        item.customerName
                                    }
                                    rating={
                                        item.rating ||
                                        0
                                    }
                                    review={
                                        item.review ||
                                        ''
                                    }
                                    onReply={() =>
                                        Alert.alert(
                                            'Reply',
                                            `Reply to ${item.customerName}`,
                                        )
                                    }
                                />
                            ),
                        )}
                    </View>
                )}

                {totalReviews ===
                    0 && (
                    <Text
                        style={{
                            marginHorizontal:
                                20,
                            marginTop:
                                12,
                            color:
                                '#888',
                            fontSize:
                                13,
                        }}>
                        Customer reviews will
                        appear here after
                        completed bookings.
                    </Text>
                )}

                {/* ==================================================
                    FOOTER
                ================================================== */}

                <Text
                    style={{
                        textAlign:
                            'center',
                        color:
                            '#999',
                        marginVertical:
                            25,
                    }}>
                    Version 1.0
                </Text>
            </ScrollView>
        </SafeAreaView>
    );
}