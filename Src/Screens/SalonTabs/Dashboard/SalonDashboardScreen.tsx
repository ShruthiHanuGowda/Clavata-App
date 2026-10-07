import React, {
    useMemo,
    useState,
} from 'react';

import {
    SafeAreaView,
    ScrollView,
    Text,
    View,
    ActivityIndicator,
    RefreshControl,
    TouchableOpacity,
    Modal,
    Pressable,
} from 'react-native';

import { useQuery } from '@apollo/client';
import { useNavigation } from '@react-navigation/native';

import styles from './styles';
import { useUser } from '../../../context/UserContext';

import DashboardHeader from './Header';
import SummaryCard from './SummaryCard';
import ReviewCard from './ReviewCard';

import {
    SALON_DASHBOARD_QUERY,
    GET_SALON,
} from '../../../graphql/queries';


/*
 * ================================================================
 * TYPES
 * ================================================================
 */

type Service = {
    serviceId: string;
    name: string;
    audience?: string;
    category?: string;
    subcategory?: string;
    categoryId?: string;
    subcategoryId?: string;
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


/*
 * ================================================================
 * CONSTANTS
 * ================================================================
 */

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
    amount?: number,
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
 * FORMAT HELPERS
 * ================================================================
 */

const formatBookingStatus = (
    status?: string,
): string => {
    if (!status) {
        return 'Unknown';
    }

    return status
        .replace(/_/g, ' ')
        .toLowerCase()
        .replace(/\b\w/g, letter =>
            letter.toUpperCase(),
        );
};


const formatPaymentStatus = (
    status?: string,
): string => {
    if (!status) {
        return 'Not available';
    }

    return status
        .replace(/_/g, ' ')
        .toLowerCase()
        .replace(/\b\w/g, letter =>
            letter.toUpperCase(),
        );
};


const formatPaymentMethod = (
    method?: string,
): string => {
    if (!method) {
        return 'Not available';
    }

    return method
        .replace(/_/g, ' ')
        .toLowerCase()
        .replace(/\b\w/g, letter =>
            letter.toUpperCase(),
        );
};


const formatAudience = (
    audience?: string,
): string => {
    if (!audience) {
        return '';
    }

    return audience
        .replace(/_/g, ' ')
        .toLowerCase()
        .replace(/\b\w/g, letter =>
            letter.toUpperCase(),
        );
};


/*
 * ================================================================
 * SALON LOCATION HELPER
 * ================================================================
 */

const getSalonLocation = (
    salon: any,
): string => {
    if (!salon) {
        return 'Location not available';
    }

    /*
     * If address is already a string.
     */

    if (
        typeof salon.address ===
        'string' &&
        salon.address.trim()
    ) {
        return salon.address.trim();
    }

    /*
     * Handle object based address.
     */

    const address =
        salon.address;

    if (
        address &&
        typeof address ===
            'object'
    ) {
        const parts = [
            address.addressLine1,
            address.addressLine2,
            address.area,
            address.locality,
            address.landmark,
            address.city,
            address.district,
            address.state,
            address.pincode,
            address.postalCode,
        ].filter(
            value =>
                value !==
                    undefined &&
                value !== null &&
                String(value).trim(),
        );

        if (parts.length > 0) {
            return parts
                .map(value =>
                    String(value).trim(),
                )
                .join(', ');
        }
    }

    /*
     * Handle flat salon fields.
     */

    const parts = [
        salon.addressLine1,
        salon.addressLine2,
        salon.area,
        salon.locality,
        salon.landmark,
        salon.city,
        salon.district,
        salon.state,
        salon.pincode,
        salon.postalCode,
    ].filter(
        value =>
            value !==
                undefined &&
            value !== null &&
            String(value).trim(),
    );

    if (parts.length > 0) {
        return parts
            .map(value =>
                String(value).trim(),
            )
            .join(', ');
    }

    return 'Location not available';
};


/*
 * ================================================================
 * SERVICE HELPERS
 * ================================================================
 */

const getServiceCategory = (
    service: Service,
): string => {
    return (
        service.category ||
        service.category ||
        'Category not available'
    );
};


const getServiceSubcategory = (
    service: Service,
): string => {
    return (
        service.subcategory ||
        service.subcategory ||
        'Subcategory not available'
    );
};


const getServiceDuration = (
    service: Service,
): number => {
    return (
        service.duration ??
        service.duration ??
        0
    );
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


    /*
     * ============================================================
     * BOOKINGS
     * ============================================================
     */

    const bookings =
        data?.salonBookings ?? [];


    /*
     * ============================================================
     * SALON
     * ============================================================
     */

    const salon =
        salonData?.getSalon;


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
     * ============================================================
     */

    const [
        calendarExpanded,
        setCalendarExpanded,
    ] = useState(false);


    /*
     * ============================================================
     * SELECTED DATE
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
     * SELECTED BOOKING
     *
     * Used by the appointment details modal.
     * ============================================================
     */

    const [
        selectedBooking,
        setSelectedBooking,
    ] = useState<Booking | null>(
        null,
    );


    /*
     * ============================================================
     * SALON DETAILS
     * ============================================================
     */

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

    const salonLocation =
        getSalonLocation(
            salon,
        );


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
     *
     * This is the fixed booking fee.
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
        }, [
            bookings,
        ]);


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
        }, [
            bookings,
        ]);


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
        }, [
            bookings,
        ]);


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
        }, [
            bookings,
        ]);


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
                    icon:
                        'calendar-outline',
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
                    icon:
                        'people-outline',
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
                    icon:
                        'cash-outline',
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
                    icon:
                        'time-outline',
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
                case 'todayCustomers':
                case 'todayRevenue':
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
     * MONTH NAVIGATION
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
                Number(parts[1]) - 1,
                Number(parts[2]),
            );
        }, [
            selectedDate,
        ]);


    /*
     * ============================================================
     * CALENDAR DATE LABEL
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
     *
     * Open the full details modal.
     * ============================================================
     */

    const handleAppointmentPress =
        (
            booking: Booking,
        ) => {
            setSelectedBooking(
                booking,
            );
        };


    /*
     * ============================================================
     * CLOSE APPOINTMENT MODAL
     * ============================================================
     */

    const closeAppointmentDetails =
        () => {
            setSelectedBooking(
                null,
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


                        {/* TODAY */}

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
                        item => {
                            const firstService =
                                item.services?.[0];

                            return (
                                <TouchableOpacity
                                    key={
                                        item.bookingId
                                    }
                                    activeOpacity={
                                        0.82
                                    }
                                    onPress={() =>
                                        handleAppointmentPress(
                                            item,
                                        )
                                    }
                                    style={{
                                        marginHorizontal:
                                            20,
                                        marginTop:
                                            10,
                                        padding:
                                            15,
                                        borderRadius:
                                            14,
                                        backgroundColor:
                                            '#FFFFFF',
                                        borderWidth:
                                            1,
                                        borderColor:
                                            '#EEEEEE',
                                        shadowColor:
                                            '#000',
                                        shadowOffset:
                                            {
                                                width: 0,
                                                height: 1,
                                            },
                                        shadowOpacity:
                                            0.04,
                                        shadowRadius:
                                            4,
                                        elevation:
                                            1,
                                    }}>

                                    {/* TIME + STATUS */}

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
                                                fontWeight:
                                                    '700',
                                                color:
                                                    PRIMARY_COLOR,
                                            }}>
                                            {item.startTime}
                                            {' - '}
                                            {item.endTime}
                                        </Text>

                                        <View
                                            style={{
                                                paddingHorizontal:
                                                    9,
                                                paddingVertical:
                                                    5,
                                                borderRadius:
                                                    8,
                                                backgroundColor:
                                                    item.bookingStatus ===
                                                    'COMPLETED'
                                                        ? '#E8F7F5'
                                                        : item.bookingStatus ===
                                                          'PENDING'
                                                        ? '#FFF8E7'
                                                        : '#F3F3F3',
                                            }}>

                                            <Text
                                                style={{
                                                    fontSize:
                                                        11,
                                                    fontWeight:
                                                        '700',
                                                    color:
                                                        item.bookingStatus ===
                                                        'COMPLETED'
                                                            ? PRIMARY_COLOR
                                                            : item.bookingStatus ===
                                                              'PENDING'
                                                            ? '#A87500'
                                                            : '#666',
                                                }}>
                                                {formatBookingStatus(
                                                    item.bookingStatus,
                                                )}
                                            </Text>
                                        </View>
                                    </View>


                                    {/* CUSTOMER */}

                                    <Text
                                        style={{
                                            marginTop:
                                                10,
                                            fontSize:
                                                16,
                                            fontWeight:
                                                '700',
                                            color:
                                                '#222',
                                        }}>
                                        {
                                            item.customerName ||
                                            'Customer'
                                        }
                                    </Text>

                                    <Text
                                        style={{
                                            marginTop:
                                                3,
                                            fontSize:
                                                13,
                                            color:
                                                '#777',
                                        }}>
                                        {
                                            item.customerPhone ||
                                            'Phone not available'
                                        }
                                    </Text>


                                    {/* SERVICE */}

                                    <View
                                        style={{
                                            marginTop:
                                                12,
                                            padding:
                                                11,
                                            borderRadius:
                                                10,
                                            backgroundColor:
                                                '#F8F8F8',
                                        }}>

                                        <Text
                                            style={{
                                                fontSize:
                                                    13,
                                                fontWeight:
                                                    '700',
                                                color:
                                                    '#333',
                                            }}>
                                            {firstService
                                                ?.name ||
                                                'Service'}
                                        </Text>

                                        <Text
                                            style={{
                                                marginTop:
                                                    4,
                                                fontSize:
                                                    12,
                                                color:
                                                    '#777',
                                            }}>
                                            {firstService
                                                ? `${getServiceCategory(
                                                      firstService,
                                                  )}  •  ${getServiceSubcategory(
                                                      firstService,
                                                  )}`
                                                : 'Service details unavailable'}
                                        </Text>
                                    </View>


                                    {/* BOTTOM ROW */}

                                    <View
                                        style={{
                                            marginTop:
                                                12,
                                            flexDirection:
                                                'row',
                                            alignItems:
                                                'center',
                                            justifyContent:
                                                'space-between',
                                        }}>

                                        <View
                                            style={{
                                                flexDirection:
                                                    'row',
                                                alignItems:
                                                    'center',
                                            }}>

                                            <Text
                                                style={{
                                                    fontSize:
                                                        13,
                                                    color:
                                                        '#777',
                                                }}>
                                                {item.totalDuration ||
                                                    0}{' '}
                                                min
                                            </Text>

                                            <Text
                                                style={{
                                                    marginHorizontal:
                                                        8,
                                                    color:
                                                        '#CCCCCC',
                                                }}>
                                                •
                                            </Text>

                                            <Text
                                                style={{
                                                    fontSize:
                                                        14,
                                                    fontWeight:
                                                        '700',
                                                    color:
                                                        '#222',
                                                }}>
                                                {formatCurrency(
                                                    item.totalAmount,
                                                )}
                                            </Text>
                                        </View>

                                        <Text
                                            style={{
                                                fontSize:
                                                    13,
                                                fontWeight:
                                                    '600',
                                                color:
                                                    PRIMARY_COLOR,
                                            }}>
                                            View details →
                                        </Text>
                                    </View>
                                </TouchableOpacity>
                            );
                        },
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

                {totalReviews ===
                0 ? (
                    <View
                        style={{
                            marginHorizontal:
                                20,
                            paddingVertical:
                                24,
                            paddingHorizontal:
                                18,
                            borderRadius:
                                14,
                            backgroundColor:
                                '#F7F7F7',
                            alignItems:
                                'center',
                            justifyContent:
                                'center',
                        }}>

                        <Text
                            style={{
                                fontSize:
                                    15,
                                fontWeight:
                                    '600',
                                color:
                                    '#555',
                            }}>
                            No reviews yet
                        </Text>

                        <Text
                            style={{
                                marginTop:
                                    6,
                                fontSize:
                                    13,
                                color:
                                    '#888',
                                textAlign:
                                    'center',
                            }}>
                            Customer reviews will
                            appear here after
                            completed bookings.
                        </Text>
                    </View>
                ) : (
                    <>
                        {/* RATING SUMMARY */}

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


                        {/* LATEST REVIEWS */}

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
                                                null
                                            }
                                        />
                                    ),
                                )}
                            </View>
                        )}
                    </>
                )}
            </ScrollView>


            {/* ======================================================
                APPOINTMENT DETAILS MODAL
            ====================================================== */}

            <Modal
                visible={
                    !!selectedBooking
                }
                transparent
                animationType="slide"
                onRequestClose={
                    closeAppointmentDetails
                }>

                <View
                    style={{
                        flex: 1,
                        backgroundColor:
                            'rgba(0,0,0,0.42)',
                        justifyContent:
                            'flex-end',
                    }}>

                    <View
                        style={{
                            maxHeight:
                                '92%',
                            backgroundColor:
                                '#FFFFFF',
                            borderTopLeftRadius:
                                24,
                            borderTopRightRadius:
                                24,
                            overflow:
                                'hidden',
                        }}>

                        {/* MODAL HEADER */}

                        <View
                            style={{
                                paddingHorizontal:
                                    20,
                                paddingTop:
                                    14,
                                paddingBottom:
                                    14,
                                borderBottomWidth:
                                    1,
                                borderBottomColor:
                                    '#EEEEEE',
                            }}>

                            <View
                                style={{
                                    width:
                                        42,
                                    height:
                                        4,
                                    borderRadius:
                                        2,
                                    backgroundColor:
                                        '#D7D7D7',
                                    alignSelf:
                                        'center',
                                    marginBottom:
                                        14,
                                }}
                            />

                            <View
                                style={{
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
                                            12,
                                    }}>

                                    <Text
                                        style={{
                                            fontSize:
                                                20,
                                            fontWeight:
                                                '700',
                                            color:
                                                '#222',
                                        }}>
                                        Appointment Details
                                    </Text>

                                    {selectedBooking && (
                                        <Text
                                            style={{
                                                marginTop:
                                                    3,
                                                fontSize:
                                                    12,
                                                color:
                                                    '#888',
                                            }}>
                                            {
                                                selectedBooking.bookingId
                                            }
                                        </Text>
                                    )}
                                </View>

                                <Pressable
                                    onPress={
                                        closeAppointmentDetails
                                    }
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
                                            '#F3F3F3',
                                    }}>

                                    <Text
                                        style={{
                                            fontSize:
                                                20,
                                            color:
                                                '#555',
                                            marginTop:
                                                -2,
                                        }}>
                                        ×
                                    </Text>
                                </Pressable>
                            </View>
                        </View>


                        {/* MODAL CONTENT */}

                        {selectedBooking && (
                            <ScrollView
                                showsVerticalScrollIndicator={
                                    false
                                }
                                contentContainerStyle={{
                                    padding:
                                        20,
                                    paddingBottom:
                                        35,
                                }}>

                                {/* CUSTOMER */}

                                <View
                                    style={{
                                        padding:
                                            15,
                                        borderRadius:
                                            14,
                                        backgroundColor:
                                            '#F7F7F7',
                                    }}>

                                    <Text
                                        style={{
                                            fontSize:
                                                12,
                                            fontWeight:
                                                '600',
                                            color:
                                                '#888',
                                            marginBottom:
                                                5,
                                        }}>
                                        CUSTOMER
                                    </Text>

                                    <Text
                                        style={{
                                            fontSize:
                                                18,
                                            fontWeight:
                                                '700',
                                            color:
                                                '#222',
                                        }}>
                                        {
                                            selectedBooking.customerName ||
                                            'Customer'
                                        }
                                    </Text>

                                    <Text
                                        style={{
                                            marginTop:
                                                5,
                                            fontSize:
                                                13,
                                            color:
                                                '#666',
                                        }}>
                                        {
                                            selectedBooking.customerPhone ||
                                            'Phone not available'
                                        }
                                    </Text>
                                </View>


                                {/* DATE / TIME / STATUS */}

                                <View
                                    style={{
                                        marginTop:
                                            14,
                                        flexDirection:
                                            'row',
                                        gap:
                                            8,
                                    }}>

                                    <View
                                        style={{
                                            flex:
                                                1,
                                            padding:
                                                13,
                                            borderRadius:
                                                12,
                                            backgroundColor:
                                                '#F7F7F7',
                                        }}>

                                        <Text
                                            style={{
                                                fontSize:
                                                    11,
                                                color:
                                                    '#888',
                                                fontWeight:
                                                    '600',
                                            }}>
                                            DATE
                                        </Text>

                                        <Text
                                            style={{
                                                marginTop:
                                                    5,
                                                fontSize:
                                                    14,
                                                fontWeight:
                                                    '700',
                                                color:
                                                    '#333',
                                            }}>
                                            {
                                                selectedBooking.bookingDate
                                            }
                                        </Text>
                                    </View>

                                    <View
                                        style={{
                                            flex:
                                                1,
                                            padding:
                                                13,
                                            borderRadius:
                                                12,
                                            backgroundColor:
                                                '#F7F7F7',
                                        }}>

                                        <Text
                                            style={{
                                                fontSize:
                                                    11,
                                                color:
                                                    '#888',
                                                fontWeight:
                                                    '600',
                                            }}>
                                            TIME
                                        </Text>

                                        <Text
                                            style={{
                                                marginTop:
                                                    5,
                                                fontSize:
                                                    14,
                                                fontWeight:
                                                    '700',
                                                color:
                                                    '#333',
                                            }}>
                                            {
                                                selectedBooking.startTime
                                            }{' '}
                                            -{' '}
                                            {
                                                selectedBooking.endTime
                                            }
                                        </Text>
                                    </View>
                                </View>


                                {/* STATUS */}

                                <View
                                    style={{
                                        marginTop:
                                            8,
                                        padding:
                                            13,
                                        borderRadius:
                                            12,
                                        backgroundColor:
                                            selectedBooking.bookingStatus ===
                                            'COMPLETED'
                                                ? '#E8F7F5'
                                                : selectedBooking.bookingStatus ===
                                                  'PENDING'
                                                ? '#FFF8E7'
                                                : '#F5F5F5',
                                    }}>

                                    <Text
                                        style={{
                                            fontSize:
                                                11,
                                            color:
                                                '#777',
                                            fontWeight:
                                                '600',
                                        }}>
                                        BOOKING STATUS
                                    </Text>

                                    <Text
                                        style={{
                                            marginTop:
                                                4,
                                            fontSize:
                                                14,
                                            fontWeight:
                                                '700',
                                            color:
                                                selectedBooking.bookingStatus ===
                                                'COMPLETED'
                                                    ? PRIMARY_COLOR
                                                    : '#555',
                                        }}>
                                        {formatBookingStatus(
                                            selectedBooking.bookingStatus,
                                        )}
                                    </Text>
                                </View>


                                {/* SERVICES */}

                                <Text
                                    style={{
                                        marginTop:
                                            20,
                                        marginBottom:
                                            10,
                                        fontSize:
                                            16,
                                        fontWeight:
                                            '700',
                                        color:
                                            '#222',
                                    }}>
                                    Services
                                </Text>

                                {selectedBooking.services?.map(
                                    (
                                        service,
                                        index,
                                    ) => {
                                        const duration =
                                            getServiceDuration(
                                                service,
                                            );

                                        return (
                                            <View
                                                key={
                                                    service.serviceId ||
                                                    `${service.name}-${index}`
                                                }
                                                style={{
                                                    padding:
                                                        14,
                                                    marginBottom:
                                                        9,
                                                    borderRadius:
                                                        13,
                                                    backgroundColor:
                                                        '#F8F8F8',
                                                    borderWidth:
                                                        1,
                                                    borderColor:
                                                        '#EEEEEE',
                                                }}>

                                                {/* SERVICE NAME */}

                                                <View
                                                    style={{
                                                        flexDirection:
                                                            'row',
                                                        justifyContent:
                                                            'space-between',
                                                        alignItems:
                                                            'flex-start',
                                                    }}>

                                                    <Text
                                                        style={{
                                                            flex:
                                                                1,
                                                            paddingRight:
                                                                10,
                                                            fontSize:
                                                                15,
                                                            fontWeight:
                                                                '700',
                                                            color:
                                                                '#222',
                                                        }}>
                                                        {
                                                            service.name
                                                        }
                                                    </Text>

                                                    <Text
                                                        style={{
                                                            fontSize:
                                                                15,
                                                            fontWeight:
                                                                '700',
                                                            color:
                                                                '#222',
                                                        }}>
                                                        {formatCurrency(
                                                            service.price,
                                                        )}
                                                    </Text>
                                                </View>


                                                {/* CATEGORY */}

                                                <View
                                                    style={{
                                                        marginTop:
                                                            9,
                                                    }}>

                                                    <Text
                                                        style={{
                                                            fontSize:
                                                                12,
                                                            color:
                                                                '#888',
                                                        }}>
                                                        Category
                                                    </Text>

                                                    <Text
                                                        style={{
                                                            marginTop:
                                                                2,
                                                            fontSize:
                                                                13,
                                                            fontWeight:
                                                                '600',
                                                            color:
                                                                '#444',
                                                        }}>
                                                        {
                                                            getServiceCategory(
                                                                service,
                                                            )
                                                        }
                                                    </Text>
                                                </View>


                                                {/* SUBCATEGORY */}

                                                <View
                                                    style={{
                                                        marginTop:
                                                            8,
                                                    }}>

                                                    <Text
                                                        style={{
                                                            fontSize:
                                                                12,
                                                            color:
                                                                '#888',
                                                        }}>
                                                        Subcategory
                                                    </Text>

                                                    <Text
                                                        style={{
                                                            marginTop:
                                                                2,
                                                            fontSize:
                                                                13,
                                                            fontWeight:
                                                                '600',
                                                            color:
                                                                '#444',
                                                        }}>
                                                        {
                                                            getServiceSubcategory(
                                                                service,
                                                            )
                                                        }
                                                    </Text>
                                                </View>


                                                {/* DURATION + AUDIENCE */}

                                                <View
                                                    style={{
                                                        marginTop:
                                                            10,
                                                        flexDirection:
                                                            'row',
                                                        alignItems:
                                                            'center',
                                                    }}>

                                                    <View
                                                        style={{
                                                            paddingHorizontal:
                                                                9,
                                                            paddingVertical:
                                                                5,
                                                            borderRadius:
                                                                7,
                                                            backgroundColor:
                                                                '#E8F7F5',
                                                        }}>

                                                        <Text
                                                            style={{
                                                                fontSize:
                                                                    11,
                                                                fontWeight:
                                                                    '600',
                                                                color:
                                                                    PRIMARY_COLOR,
                                                            }}>
                                                            {duration}{' '}
                                                            min
                                                        </Text>
                                                    </View>

                                                    {service.audience && (
                                                        <View
                                                            style={{
                                                                marginLeft:
                                                                    7,
                                                                paddingHorizontal:
                                                                    9,
                                                                paddingVertical:
                                                                    5,
                                                                borderRadius:
                                                                    7,
                                                                backgroundColor:
                                                                    '#F0ECFF',
                                                            }}>

                                                            <Text
                                                                style={{
                                                                    fontSize:
                                                                        11,
                                                                    fontWeight:
                                                                        '600',
                                                                    color:
                                                                        '#6652A8',
                                                                }}>
                                                                {formatAudience(
                                                                    service.audience,
                                                                )}
                                                            </Text>
                                                        </View>
                                                    )}
                                                </View>
                                            </View>
                                        );
                                    },
                                )}


                                {/* TOTAL DURATION */}

                                <View
                                    style={{
                                        marginTop:
                                            3,
                                        padding:
                                            13,
                                        borderRadius:
                                            12,
                                        backgroundColor:
                                            '#F7F7F7',
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
                                        Total duration
                                    </Text>

                                    <Text
                                        style={{
                                            fontWeight:
                                                '700',
                                            color:
                                                '#222',
                                        }}>
                                        {
                                            selectedBooking.totalDuration
                                        }{' '}
                                        minutes
                                    </Text>
                                </View>


                                {/* PRICING */}

                                <Text
                                    style={{
                                        marginTop:
                                            20,
                                        marginBottom:
                                            10,
                                        fontSize:
                                            16,
                                        fontWeight:
                                            '700',
                                        color:
                                            '#222',
                                    }}>
                                    Payment Summary
                                </Text>

                                <View
                                    style={{
                                        padding:
                                            15,
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
                                            marginBottom:
                                                9,
                                        }}>

                                        <Text
                                            style={{
                                                color:
                                                    '#666',
                                            }}>
                                            Subtotal
                                        </Text>

                                        <Text
                                            style={{
                                                fontWeight:
                                                    '600',
                                                color:
                                                    '#333',
                                            }}>
                                            {formatCurrency(
                                                selectedBooking.subtotal,
                                            )}
                                        </Text>
                                    </View>


                                    <View
                                        style={{
                                            flexDirection:
                                                'row',
                                            justifyContent:
                                                'space-between',
                                            marginBottom:
                                                9,
                                        }}>

                                        <Text
                                            style={{
                                                color:
                                                    '#666',
                                            }}>
                                            Discount
                                        </Text>

                                        <Text
                                            style={{
                                                fontWeight:
                                                    '600',
                                                color:
                                                    '#333',
                                            }}>
                                            -{' '}
                                            {formatCurrency(
                                                selectedBooking.discount,
                                            )}
                                        </Text>
                                    </View>


                                    <View
                                        style={{
                                            height:
                                                1,
                                            backgroundColor:
                                                '#E1E1E1',
                                            marginVertical:
                                                4,
                                        }}
                                    />


                                    <View
                                        style={{
                                            flexDirection:
                                                'row',
                                            justifyContent:
                                                'space-between',
                                            marginTop:
                                                9,
                                        }}>

                                        <Text
                                            style={{
                                                fontSize:
                                                    15,
                                                fontWeight:
                                                    '700',
                                                color:
                                                    '#222',
                                            }}>
                                            Total service value
                                        </Text>

                                        <Text
                                            style={{
                                                fontSize:
                                                    16,
                                                fontWeight:
                                                    '700',
                                                color:
                                                    PRIMARY_COLOR,
                                            }}>
                                            {formatCurrency(
                                                selectedBooking.totalAmount,
                                            )}
                                        </Text>
                                    </View>


                                    <View
                                        style={{
                                            marginTop:
                                                14,
                                            paddingTop:
                                                12,
                                            borderTopWidth:
                                                1,
                                            borderTopColor:
                                                '#E1E1E1',
                                        }}>

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
                                                Clavata booking fee
                                            </Text>

                                            <Text
                                                style={{
                                                    fontWeight:
                                                        '600',
                                                    color:
                                                        '#333',
                                                }}>
                                                {formatCurrency(
                                                    selectedBooking.bookingFee,
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
                                                        '700',
                                                    color:
                                                        '#222',
                                                }}>
                                                {formatCurrency(
                                                    selectedBooking.remainingAmount,
                                                )}
                                            </Text>
                                        </View>
                                    </View>
                                </View>


                                {/* PAYMENT DETAILS */}

                                <View
                                    style={{
                                        marginTop:
                                            10,
                                        padding:
                                            15,
                                        borderRadius:
                                            14,
                                        backgroundColor:
                                            '#FFFFFF',
                                        borderWidth:
                                            1,
                                        borderColor:
                                            '#EEEEEE',
                                    }}>

                                    <View
                                        style={{
                                            flexDirection:
                                                'row',
                                            justifyContent:
                                                'space-between',
                                            marginBottom:
                                                9,
                                        }}>

                                        <Text
                                            style={{
                                                color:
                                                    '#777',
                                            }}>
                                            Payment method
                                        </Text>

                                        <Text
                                            style={{
                                                fontWeight:
                                                    '600',
                                                color:
                                                    '#333',
                                            }}>
                                            {formatPaymentMethod(
                                                selectedBooking.paymentMethod,
                                            )}
                                        </Text>
                                    </View>


                                    <View
                                        style={{
                                            flexDirection:
                                                'row',
                                            justifyContent:
                                                'space-between',
                                            marginBottom:
                                                9,
                                        }}>

                                        <Text
                                            style={{
                                                color:
                                                    '#777',
                                            }}>
                                            Payment status
                                        </Text>

                                        <Text
                                            style={{
                                                fontWeight:
                                                    '600',
                                                color:
                                                    '#333',
                                            }}>
                                            {formatPaymentStatus(
                                                selectedBooking.paymentStatus,
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
                                                    '#777',
                                            }}>
                                            Booking fee status
                                        </Text>

                                        <Text
                                            style={{
                                                fontWeight:
                                                    '600',
                                                color:
                                                    selectedBooking.bookingFeeStatus ===
                                                    'PAID'
                                                        ? PRIMARY_COLOR
                                                        : '#A87500',
                                            }}>
                                            {formatPaymentStatus(
                                                selectedBooking.bookingFeeStatus,
                                            )}
                                        </Text>
                                    </View>
                                </View>


                                {/* LOCATION */}

                                <Text
                                    style={{
                                        marginTop:
                                            20,
                                        marginBottom:
                                            10,
                                        fontSize:
                                            16,
                                        fontWeight:
                                            '700',
                                        color:
                                            '#222',
                                    }}>
                                    Salon Location
                                </Text>

                                <View
                                    style={{
                                        padding:
                                            15,
                                        borderRadius:
                                            14,
                                        backgroundColor:
                                            '#F7F7F7',
                                    }}>

                                    <Text
                                        style={{
                                            fontSize:
                                                14,
                                            lineHeight:
                                                21,
                                            color:
                                                '#444',
                                        }}>
                                        📍{' '}
                                        {
                                            salonLocation
                                        }
                                    </Text>
                                </View>


                                {/* CUSTOMER NOTES */}

                                {!!selectedBooking.notes && (
                                    <>
                                        <Text
                                            style={{
                                                marginTop:
                                                    20,
                                                marginBottom:
                                                    10,
                                                fontSize:
                                                    16,
                                                fontWeight:
                                                    '700',
                                                color:
                                                    '#222',
                                            }}>
                                            Customer Notes
                                        </Text>

                                        <View
                                            style={{
                                                padding:
                                                    15,
                                                borderRadius:
                                                    14,
                                                backgroundColor:
                                                    '#FFF8E7',
                                                borderWidth:
                                                    1,
                                                borderColor:
                                                    '#F0D98A',
                                            }}>

                                            <Text
                                                style={{
                                                    fontSize:
                                                        14,
                                                    lineHeight:
                                                        21,
                                                    color:
                                                        '#555',
                                                }}>
                                                {
                                                    selectedBooking.notes
                                                }
                                            </Text>
                                        </View>
                                    </>
                                )}


                                {/* SALON NOTE */}

                                {!!selectedBooking.salonNote && (
                                    <>
                                        <Text
                                            style={{
                                                marginTop:
                                                    20,
                                                marginBottom:
                                                    10,
                                                fontSize:
                                                    16,
                                                fontWeight:
                                                    '700',
                                                color:
                                                    '#222',
                                            }}>
                                            Salon Note
                                        </Text>

                                        <View
                                            style={{
                                                padding:
                                                    15,
                                                borderRadius:
                                                    14,
                                                backgroundColor:
                                                    '#F7F7F7',
                                            }}>

                                            <Text
                                                style={{
                                                    fontSize:
                                                        14,
                                                    lineHeight:
                                                        21,
                                                    color:
                                                        '#555',
                                                }}>
                                                {
                                                    selectedBooking.salonNote
                                                }
                                            </Text>
                                        </View>
                                    </>
                                )}


                                {/* BOOKING INFORMATION */}

                                <Text
                                    style={{
                                        marginTop:
                                            20,
                                        marginBottom:
                                            10,
                                        fontSize:
                                            16,
                                        fontWeight:
                                            '700',
                                        color:
                                            '#222',
                                    }}>
                                    Booking Information
                                </Text>

                                <View
                                    style={{
                                        padding:
                                            15,
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
                                            marginBottom:
                                                8,
                                        }}>

                                        <Text
                                            style={{
                                                color:
                                                    '#777',
                                            }}>
                                            Booking ID
                                        </Text>

                                        <Text
                                            style={{
                                                maxWidth:
                                                    '60%',
                                                textAlign:
                                                    'right',
                                                fontWeight:
                                                    '600',
                                                color:
                                                    '#333',
                                            }}>
                                            {
                                                selectedBooking.bookingId
                                            }
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
                                                    '#777',
                                            }}>
                                            Salon
                                        </Text>

                                        <Text
                                            style={{
                                                maxWidth:
                                                    '60%',
                                                textAlign:
                                                    'right',
                                                fontWeight:
                                                    '600',
                                                color:
                                                    '#333',
                                            }}>
                                            {
                                                selectedBooking.salonName ||
                                                salonName
                                            }
                                        </Text>
                                    </View>
                                </View>


                                {/* CLOSE BUTTON */}

                                <TouchableOpacity
                                    activeOpacity={
                                        0.8
                                    }
                                    onPress={
                                        closeAppointmentDetails
                                    }
                                    style={{
                                        marginTop:
                                            20,
                                        paddingVertical:
                                            14,
                                        borderRadius:
                                            12,
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
                                                15,
                                            fontWeight:
                                                '700',
                                        }}>
                                        Close
                                    </Text>
                                </TouchableOpacity>
                            </ScrollView>
                        )}
                    </View>
                </View>
            </Modal>
        </SafeAreaView>
    );
}