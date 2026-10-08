import React, {
    useEffect,
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
    Alert,
} from 'react-native';

import {
    useQuery,
    useMutation,
} from '@apollo/client';

import {
    useNavigation,
} from '@react-navigation/native';

import styles from './styles';

import {
    useUser,
} from '../../../context/UserContext';

import DashboardHeader from './Header';
import SummaryCard from './SummaryCard';
import ReviewCard from './ReviewCard';

import {
    SALON_DASHBOARD_QUERY,
    GET_SALON,
    SALON_RESPOND_TO_BOOKING,
} from '../../../graphql/queries';


/*
 * ============================================================
 * TYPES
 * ============================================================
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

    bookingCancellationReason?: string;

    salonResponseStatus: string;
    salonResponseDeadline: string;
    salonResponseWindowMinutes: number;

    bookingFeePaymentDeadline?: string;
    bookingFeePaymentWindowMinutes?: number;

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
 * ============================================================
 * CONSTANTS
 * ============================================================
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
 * ============================================================
 * HELPERS
 * ============================================================
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
    const date =
        new Date();

    return new Date(
        date.getFullYear(),
        date.getMonth(),
        date.getDate(),
    );
};


const formatCurrency = (
    amount?: number,
): string => {
    const value =
        Number(amount || 0);

    return `₹${value.toLocaleString(
        'en-IN',
    )}`;
};


const getMondayBasedDayIndex = (
    date: Date,
): number => {
    const day =
        date.getDay();

    return day === 0
        ? 6
        : day - 1;
};


const getRemainingSeconds = (
    deadline?: string | null,
    nowMs?: number,
): number => {
    if (!deadline) {
        return 0;
    }

    const deadlineMs =
        new Date(
            deadline,
        ).getTime();

    if (
        !Number.isFinite(
            deadlineMs,
        )
    ) {
        return 0;
    }

    const currentMs =
        nowMs ?? Date.now();

    return Math.max(
        0,
        Math.floor(
            (deadlineMs -
                currentMs) /
            1000,
        ),
    );
};


const formatCountdown = (
    seconds: number,
): string => {
    const safeSeconds =
        Math.max(
            0,
            Math.floor(
                seconds || 0,
            ),
        );

    const hours =
        Math.floor(
            safeSeconds /
            3600,
        );

    const minutes =
        Math.floor(
            (safeSeconds %
                3600) /
            60,
        );

    const remainingSeconds =
        safeSeconds % 60;

    if (hours > 0) {
        return `${hours}h ${String(
            minutes,
        ).padStart(
            2,
            '0',
        )}m`;
    }

    return `${minutes}m ${String(
        remainingSeconds,
    ).padStart(
        2,
        '0',
    )}s`;
};


const formatBookingStatus = (
    status?: string,
): string => {
    if (!status) {
        return 'Unknown';
    }

    switch (
    status.toUpperCase()
    ) {
        case 'PENDING':
            return 'Pending';

        case 'CONFIRMED':
            return 'Confirmed';

        case 'CANCELLED':
            return 'Cancelled';

        case 'COMPLETED':
            return 'Completed';

        case 'EXPIRED':
            return 'Expired';

        case 'REJECTED':
            return 'Rejected';

        default:
            return status
                .replace(
                    /_/g,
                    ' ',
                )
                .replace(
                    /\b\w/g,
                    char =>
                        char.toUpperCase(),
                );
    }
};


const formatPaymentStatus = (
    status?: string,
): string => {
    if (!status) {
        return 'Unknown';
    }

    switch (
    status.toUpperCase()
    ) {
        case 'PAID':
            return 'Paid';

        case 'PENDING':
            return 'Pending';

        case 'FAILED':
            return 'Failed';

        case 'REFUNDED':
            return 'Refunded';

        case 'CANCELLED':
            return 'Cancelled';

        default:
            return status
                .replace(
                    /_/g,
                    ' ',
                )
                .replace(
                    /\b\w/g,
                    char =>
                        char.toUpperCase(),
                );
    }
};


const formatPaymentMethod = (
    method?: string,
): string => {
    if (!method) {
        return 'Not specified';
    }

    switch (
    method.toUpperCase()
    ) {
        case 'RAZORPAY':
            return 'Razorpay';

        case 'UPI':
            return 'UPI';

        case 'CARD':
            return 'Card';

        case 'CASH':
            return 'Cash';

        case 'ONLINE':
            return 'Online';

        default:
            return method
                .replace(
                    /_/g,
                    ' ',
                )
                .replace(
                    /\b\w/g,
                    char =>
                        char.toUpperCase(),
                );
    }
};


const formatAudience = (
    audience?: string,
): string => {
    if (!audience) {
        return '';
    }

    switch (
    audience.toUpperCase()
    ) {
        case 'FEMALE':
            return 'Female';

        case 'MALE':
            return 'Male';

        case 'KIDS':
            return 'Kids';

        default:
            return audience
                .replace(
                    /_/g,
                    ' ',
                )
                .replace(
                    /\b\w/g,
                    char =>
                        char.toUpperCase(),
                );
    }
};


const getSalonLocation = (
    salon: any,
): string => {
    if (!salon) {
        return 'Location not available';
    }

    const address =
        salon.address;

    if (
        typeof address ===
        'string'
    ) {
        return (
            address.trim() ||
            'Location not available'
        );
    }

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
            address.city,
            address.state,
            address.pincode,
            address.postalCode,
        ].filter(
            value =>
                value !==
                undefined &&
                value !==
                null &&
                String(
                    value,
                ).trim(),
        );

        if (parts.length) {
            return parts.join(
                ', ',
            );
        }
    }

    const parts = [
        salon.addressLine1,
        salon.addressLine2,
        salon.area,
        salon.locality,
        salon.city,
        salon.state,
        salon.pincode,
        salon.postalCode,
    ].filter(
        value =>
            value !==
            undefined &&
            value !== null &&
            String(
                value,
            ).trim(),
    );

    if (parts.length) {
        return parts.join(
            ', ',
        );
    }

    return 'Location not available';
};


const getServiceCategory = (
    service: Service,
): string => {
    return (
        service.category ||
        'Category unavailable'
    );
};


const getServiceSubcategory = (
    service: Service,
): string => {
    return (
        service.subcategory ||
        'Subcategory unavailable'
    );
};


const getServiceDuration = (
    service: Service,
): number => {
    return Number(
        service.duration ||
        0,
    );
};


/*
 * ============================================================
 * SCREEN
 * ============================================================
 */

const SalonDashboardScreen =
    () => {
        const navigation =
            useNavigation<any>();

        const { currentUser } =
            useUser();

        const salonId =
            currentUser?.salonId;


        /*
         * ========================================================
         * QUERIES
         * ========================================================
         */

        const {
            data,
            loading,
            error,
            refetch,
        } =
            useQuery<
                DashboardQueryData,
                DashboardQueryVariables
            >(
                SALON_DASHBOARD_QUERY,
                {
                    variables: {
                        salonId:
                            salonId!,
                    },
                    skip:
                        !salonId,
                    fetchPolicy:
                        'cache-and-network',
                },
            );


        const {
            data: salonData,
            refetch:
            refetchSalon,
        } =
            useQuery(
                GET_SALON,
                {
                    variables: {
                        salonId:
                            salonId!,
                    },
                    skip:
                        !salonId,
                    fetchPolicy:
                        'network-only',
                },
            );


        /*
         * ========================================================
         * MUTATION
         * ========================================================
         */

        const [
            salonRespondToBooking,
            {
                loading:
                respondingMutation,
            },
        ] =
            useMutation(
                SALON_RESPOND_TO_BOOKING,
            );


        /*
         * ========================================================
         * STATE
         * ========================================================
         */

        const [
            nowMs,
            setNowMs,
        ] =
            useState(
                Date.now(),
            );

        const [
            calendarExpanded,
            setCalendarExpanded,
        ] =
            useState(
                false,
            );

        const [
            selectedDate,
            setSelectedDate,
        ] =
            useState(
                formatDateString(
                    getToday(),
                ),
            );

        const [
            displayedMonth,
            setDisplayedMonth,
        ] =
            useState(
                new Date(
                    getToday().getFullYear(),
                    getToday().getMonth(),
                    1,
                ),
            );

        const [
            selectedBooking,
            setSelectedBooking,
        ] =
            useState<
                Booking | null
            >(null);

        const [
            respondingBookingId,
            setRespondingBookingId,
        ] =
            useState<
                string | null
            >(null);


        /*
         * ========================================================
         * TIMER
         * ========================================================
         */

        useEffect(() => {
            const interval =
                setInterval(() => {
                    setNowMs(
                        Date.now(),
                    );
                }, 1000);

            return () =>
                clearInterval(
                    interval,
                );
        }, []);


        /*
         * ========================================================
         * RAW DATA
         * ========================================================
         */

        const bookings =
            data?.salonBookings ??
            [];

        const salon =
            salonData?.getSalon;


        /*
         * ========================================================
         * SALON DETAILS
         * ========================================================
         */

        const salonName =
            salon?.salonName ||
            salon?.businessName ||
            bookings[0]
                ?.salonName ||
            'Your Salon';

        const ownerName =
            salon?.ownerName ||
            '';


        const logoUrl =
            salon?.logoUrl
                ?.trim() ||
            salon?.logoMedia
                ?.objectUrl
                ?.trim() ||
            null;


        const coverImageUrl =
            salon?.coverImageUrl
                ?.trim() ||
            salon?.coverMedia
                ?.objectUrl
                ?.trim() ||
            null;


        const salonLocation =
            getSalonLocation(
                salon,
            );


        /*
         * ========================================================
         * TODAY
         * ========================================================
         */

        const today =
            getToday();

        const todayString =
            formatDateString(
                today,
            );


        /*
         * ========================================================
         * IMPORTANT BOOKING SEPARATION
         *
         * APPOINTMENT:
         *   CONFIRMED + booking fee PAID
         *
         * ACTION REQUIRED:
         *   PENDING + salon response PENDING + timer active
         *
         * CONFIRMED + booking fee PENDING:
         *   NOT APPOINTMENT
         *   NOT ACTION REQUIRED
         * ========================================================
         */

        const isPaidAppointment =
            (
                booking: Booking,
            ): boolean =>
                booking.bookingStatus ===
                'CONFIRMED' &&
                booking.bookingFeeStatus ===
                'PAID';


        const isPendingSalonRequest =
            (
                booking: Booking,
            ): boolean =>
                booking.bookingStatus ===
                'PENDING' &&
                booking.salonResponseStatus ===
                'PENDING' &&
                getRemainingSeconds(
                    booking.salonResponseDeadline,
                    nowMs,
                ) > 0;


        /*
         * ========================================================
         * PAID APPOINTMENTS ONLY
         * ========================================================
         */

        const paidAppointments =
            useMemo(
                () => {
                    return bookings
                        .filter(
                            isPaidAppointment,
                        )
                        .sort(
                            (
                                a,
                                b,
                            ) =>
                                `${a.bookingDate} ${a.startTime}`.localeCompare(
                                    `${b.bookingDate} ${b.startTime}`,
                                ),
                        );
                },
                [
                    bookings,
                ],
            );


        /*
         * ========================================================
         * TODAY'S PAID APPOINTMENTS ONLY
         * ========================================================
         */

        const todaysBookings =
            useMemo(
                () => {
                    return paidAppointments
                        .filter(
                            booking =>
                                booking.bookingDate ===
                                todayString,
                        )
                        .sort(
                            (
                                a,
                                b,
                            ) =>
                                a.startTime.localeCompare(
                                    b.startTime,
                                ),
                        );
                },
                [
                    paidAppointments,
                    todayString,
                ],
            );


        /*
         * ========================================================
         * TODAY'S UNIQUE CUSTOMERS
         * ========================================================
         */

        const todaysCustomers =
            useMemo(
                () => {
                    const customerIds =
                        new Set<string>();

                    todaysBookings.forEach(
                        booking => {
                            const key =
                                booking.customerUserId ||
                                booking.customerPhone ||
                                booking.customerName;

                            if (key) {
                                customerIds.add(
                                    key,
                                );
                            }
                        },
                    );

                    return customerIds.size;
                },
                [
                    todaysBookings,
                ],
            );


        /*
         * ========================================================
         * TODAY'S REVENUE
         *
         * ONLY PAID APPOINTMENTS
         * ========================================================
         */

        const todaysRevenue =
            useMemo(
                () => {
                    return todaysBookings.reduce(
                        (
                            total,
                            booking,
                        ) =>
                            total +
                            Number(
                                booking.totalAmount ||
                                0,
                            ),
                        0,
                    );
                },
                [
                    todaysBookings,
                ],
            );


        /*
         * ========================================================
         * TODAY'S CLAVATA FEE
         *
         * ONLY PAID APPOINTMENTS
         * ========================================================
         */

        const todaysClavataPaid =
            useMemo(
                () => {
                    return todaysBookings.reduce(
                        (
                            total,
                            booking,
                        ) =>
                            total +
                            Number(
                                booking.bookingFee ||
                                0,
                            ),
                        0,
                    );
                },
                [
                    todaysBookings,
                ],
            );


        /*
         * ========================================================
         * TODAY'S SALON COLLECTION
         *
         * SERVICE VALUE MINUS CLAVATA FEE
         * ========================================================
         */

        const todaysSalonCollection =
            useMemo(
                () => {
                    return Math.max(
                        0,
                        todaysRevenue -
                        todaysClavataPaid,
                    );
                },
                [
                    todaysRevenue,
                    todaysClavataPaid,
                ],
            );


        /*
         * ========================================================
         * ACTION REQUIRED
         *
         * ONLY PENDING REQUESTS REQUIRING SALON RESPONSE
         * ========================================================
         */

        const pendingRequests =
            useMemo(
                () => {
                    return bookings
                        .filter(
                            isPendingSalonRequest,
                        )
                        .sort(
                            (
                                a,
                                b,
                            ) =>
                                new Date(
                                    a.salonResponseDeadline,
                                ).getTime() -
                                new Date(
                                    b.salonResponseDeadline,
                                ).getTime(),
                        );
                },
                [
                    bookings,
                    nowMs,
                ],
            );


        /*
         * ========================================================
         * REVIEWS
         * ========================================================
         */

        const reviews =
            useMemo(
                () => {
                    return bookings
                        .filter(
                            booking =>
                                booking.reviewSubmitted ===
                                true &&
                                typeof booking.rating ===
                                'number' &&
                                !!booking.review?.trim(),
                        )
                        .sort(
                            (
                                a,
                                b,
                            ) =>
                                new Date(
                                    b.reviewedAt ||
                                    b.updatedAt,
                                ).getTime() -
                                new Date(
                                    a.reviewedAt ||
                                    a.updatedAt,
                                ).getTime(),
                        )
                        .slice(
                            0,
                            5,
                        );
                },
                [
                    bookings,
                ],
            );


        const totalReviews =
            useMemo(
                () => {
                    return bookings.filter(
                        booking =>
                            booking.reviewSubmitted ===
                            true &&
                            typeof booking.rating ===
                            'number',
                    ).length;
                },
                [
                    bookings,
                ],
            );


        const averageRating =
            useMemo(
                () => {
                    const rated =
                        bookings.filter(
                            booking =>
                                booking.reviewSubmitted ===
                                true &&
                                typeof booking.rating ===
                                'number',
                        );

                    if (
                        rated.length ===
                        0
                    ) {
                        return 0;
                    }

                    const total =
                        rated.reduce(
                            (
                                sum,
                                booking,
                            ) =>
                                sum +
                                Number(
                                    booking.rating ||
                                    0,
                                ),
                            0,
                        );

                    return (
                        total /
                        rated.length
                    );
                },
                [
                    bookings,
                ],
            );


        /*
         * ========================================================
         * SUMMARY
         *
         * APPOINTMENTS = PAID ONLY
         * ========================================================
         */

        const summaryData = [
            {
                id:
                    'todayAppointments',
                title:
                    "Today's Appointments",
                value:
                    todaysBookings.length,
                icon:
                    '📅',
            },
            {
                id:
                    'todayCustomers',
                title:
                    "Today's Customers",
                value:
                    todaysCustomers,
                icon:
                    '👥',
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
                    '₹',
            },
            {
                id:
                    'pendingRequests',
                title:
                    'Action Required',
                value:
                    pendingRequests.length,
                icon:
                    '🔔',
            },
        ];


        /*
         * ========================================================
         * SUMMARY CARD PRESS
         * ========================================================
         */

        const handleSummaryCardPress =
            (
                id: string,
            ) => {
                if (
                    id ===
                    'pendingRequests'
                ) {
                    handlePendingRequestsPress();
                    return;
                }

                navigation.navigate(
                    'Appointments',
                );
            };


        /*
         * ========================================================
         * CALENDAR
         *
         * DOTS ARE BASED ON PAID APPOINTMENTS ONLY
         * ========================================================
         */

        const calendarDays =
            useMemo<CalendarDay[]>(
                () => {
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

                    const lastDay =
                        new Date(
                            year,
                            month + 1,
                            0,
                        );

                    const leadingDays =
                        getMondayBasedDayIndex(
                            firstDay,
                        );

                    const totalDays =
                        lastDay.getDate();

                    const previousMonthLastDay =
                        new Date(
                            year,
                            month,
                            0,
                        ).getDate();

                    const result: CalendarDay[] =
                        [];

                    for (
                        let index = 0;
                        index <
                        leadingDays;
                        index++
                    ) {
                        const dayNumber =
                            previousMonthLastDay -
                            leadingDays +
                            index +
                            1;

                        const date =
                            new Date(
                                year,
                                month -
                                1,
                                dayNumber,
                            );

                        const dateString =
                            formatDateString(
                                date,
                            );

                        const hasBookings =
                            paidAppointments.some(
                                booking =>
                                    booking.bookingDate ===
                                    dateString,
                            );

                        result.push({
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
                            hasBookings,
                        });
                    }

                    for (
                        let day = 1;
                        day <=
                        totalDays;
                        day++
                    ) {
                        const date =
                            new Date(
                                year,
                                month,
                                day,
                            );

                        const dateString =
                            formatDateString(
                                date,
                            );

                        const hasBookings =
                            paidAppointments.some(
                                booking =>
                                    booking.bookingDate ===
                                    dateString,
                            );

                        result.push({
                            date,
                            dateString,
                            dayNumber:
                                day,
                            isCurrentMonth:
                                true,
                            isToday:
                                dateString ===
                                todayString,
                            isSelected:
                                dateString ===
                                selectedDate,
                            hasBookings,
                        });
                    }

                    const remaining =
                        result.length %
                        7;

                    if (
                        remaining !==
                        0
                    ) {
                        const trailingDays =
                            7 -
                            remaining;

                        for (
                            let index = 1;
                            index <=
                            trailingDays;
                            index++
                        ) {
                            const date =
                                new Date(
                                    year,
                                    month +
                                    1,
                                    index,
                                );

                            const dateString =
                                formatDateString(
                                    date,
                                );

                            const hasBookings =
                                paidAppointments.some(
                                    booking =>
                                        booking.bookingDate ===
                                        dateString,
                                );

                            result.push({
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
                                hasBookings,
                            });
                        }
                    }

                    return result;
                },
                [
                    displayedMonth,
                    paidAppointments,
                    selectedDate,
                    todayString,
                ],
            );


        /*
         * ========================================================
         * MONTH NAVIGATION
         * ========================================================
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
         * ========================================================
         * SELECT DATE
         * ========================================================
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
         * ========================================================
         * GO TO TODAY
         * ========================================================
         */

        const handleTodayPress =
            () => {
                const todayDate =
                    getToday();

                setSelectedDate(
                    formatDateString(
                        todayDate,
                    ),
                );

                setDisplayedMonth(
                    new Date(
                        todayDate.getFullYear(),
                        todayDate.getMonth(),
                        1,
                    ),
                );
            };


        /*
         * ========================================================
         * CALENDAR LABEL
         * ========================================================
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
                    Number(
                        parts[0],
                    ),
                    Number(
                        parts[1],
                    ) - 1,
                    Number(
                        parts[2],
                    ),
                );
            }, [
                selectedDate,
            ]);


        const calendarDateLabel =
            selectedDateObject
                ? selectedDate ===
                    todayString
                    ? 'Today'
                    : `${MONTH_NAMES[
                        selectedDateObject.getMonth()
                    ].slice(
                        0,
                        3,
                    )} ${selectedDateObject.getDate()}`
                : 'Select date';


        /*
         * ========================================================
         * SELECTED DATE APPOINTMENTS
         *
         * PAID APPOINTMENTS ONLY
         * ========================================================
         */

        const selectedDateBookings =
            useMemo(
                () => {
                    return paidAppointments
                        .filter(
                            booking =>
                                booking.bookingDate ===
                                selectedDate,
                        )
                        .sort(
                            (
                                a,
                                b,
                            ) =>
                                a.startTime.localeCompare(
                                    b.startTime,
                                ),
                        );
                },
                [
                    paidAppointments,
                    selectedDate,
                ],
            );


        /*
         * ========================================================
         * APPOINTMENT DETAILS
         * ========================================================
         */

        const handleAppointmentPress =
            (
                booking: Booking,
            ) => {
                setSelectedBooking(
                    booking,
                );
            };


        const closeAppointmentDetails =
            () => {
                setSelectedBooking(
                    null,
                );
            };


        /*
         * ========================================================
         * ACCEPT / REJECT
         * ========================================================
         */

        const respondToBooking =
            async (
                booking: Booking,
                response:
                    | 'ACCEPT'
                    | 'REJECT',
            ) => {
                if (
                    !isPendingSalonRequest(
                        booking,
                    )
                ) {
                    Alert.alert(
                        'Request unavailable',
                        'This booking request is no longer available for a salon response.',
                    );
                    return;
                }

                try {
                    setRespondingBookingId(
                        booking.bookingId,
                    );

                    await salonRespondToBooking(
                        {
                            variables: {
                                input: {
                                    bookingId:
                                        booking.bookingId,
                                    response,
                                },
                            },
                        },
                    );

                    setSelectedBooking(
                        null,
                    );

                    await refetch();

                    Alert.alert(
                        response ===
                            'ACCEPT'
                            ? 'Booking confirmed'
                            : 'Booking rejected',
                        response ===
                            'ACCEPT'
                            ? 'The customer has been notified. The customer must now pay the ₹9 Clavata booking fee.'
                            : 'The booking request has been rejected.',
                    );
                } catch (
                mutationError: any
                ) {
                    Alert.alert(
                        'Unable to update booking',
                        mutationError?.message ||
                        'Something went wrong. Please try again.',
                    );
                } finally {
                    setRespondingBookingId(
                        null,
                    );
                }
            };


        const handleAcceptPress =
            (
                booking: Booking,
            ) => {
                Alert.alert(
                    'Accept booking?',
                    'The customer will be notified and can then pay the ₹9 Clavata booking fee.',
                    [
                        {
                            text:
                                'Cancel',
                            style:
                                'cancel',
                        },
                        {
                            text:
                                'Accept',
                            onPress:
                                () =>
                                    respondToBooking(
                                        booking,
                                        'ACCEPT',
                                    ),
                        },
                    ],
                );
            };


        const handleRejectPress =
            (
                booking: Booking,
            ) => {
                Alert.alert(
                    'Reject booking?',
                    'Are you sure you want to reject this booking request?',
                    [
                        {
                            text:
                                'Cancel',
                            style:
                                'cancel',
                        },
                        {
                            text:
                                'Reject',
                            style:
                                'destructive',
                            onPress:
                                () =>
                                    respondToBooking(
                                        booking,
                                        'REJECT',
                                    ),
                        },
                    ],
                );
            };


        /*
         * ========================================================
         * ACTION REQUIRED NAVIGATION
         * ========================================================
         */

        const handlePendingRequestsPress =
            () => {
                navigation.navigate(
                    'Appointments',
                );
            };


        /*
         * ========================================================
         * REFRESH
         * ========================================================
         */

        const handleRefresh =
            async () => {
                try {
                    await Promise.all([
                        refetch(),
                        refetchSalon(),
                    ]);
                } catch {
                    // Query error is already handled by Apollo.
                }
            };


        /*
         * ========================================================
         * AUTO REFRESH
         *
         * We refresh when a pending salon-response window expires.
         *
         * Confirmed + unpaid bookings are NOT an action item.
         * They remain excluded from dashboard appointments until
         * bookingFeeStatus becomes PAID.
         * ========================================================
         */

        useEffect(() => {
            const hasExpiredPendingRequest =
                bookings.some(
                    booking =>
                        booking.bookingStatus ===
                        'PENDING' &&
                        booking.salonResponseStatus ===
                        'PENDING' &&
                        !!booking.salonResponseDeadline &&
                        getRemainingSeconds(
                            booking.salonResponseDeadline,
                            nowMs,
                        ) === 0,
                );

            if (
                hasExpiredPendingRequest
            ) {
                refetch();
            }
        }, [
            nowMs,
            bookings,
            refetch,
        ]);


        /*
         * ========================================================
         * LOADING
         * ========================================================
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
                            alignItems:
                                'center',
                            justifyContent:
                                'center',
                        }}>

                        <ActivityIndicator
                            size="large"
                            color={
                                PRIMARY_COLOR
                            }
                        />

                        <Text
                            style={{
                                marginTop:
                                    10,
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
         * ========================================================
         * ERROR
         * ========================================================
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
                            alignItems:
                                'center',
                            justifyContent:
                                'center',
                            padding:
                                30,
                        }}>

                        <Text
                            style={{
                                fontSize:
                                    17,
                                fontWeight:
                                    '700',
                                color:
                                    '#333',
                                textAlign:
                                    'center',
                            }}>
                            Unable to load dashboard
                        </Text>

                        <Text
                            style={{
                                marginTop:
                                    8,
                                color:
                                    '#777',
                                textAlign:
                                    'center',
                            }}>
                            {error.message ||
                                'Something went wrong.'}
                        </Text>

                        <TouchableOpacity
                            activeOpacity={
                                0.8
                            }
                            onPress={
                                handleRefresh
                            }
                            style={{
                                marginTop:
                                    18,
                                paddingHorizontal:
                                    22,
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
                                        '700',
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
                                    value={String(item.value)}
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
                                        Today's confirmed
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

                        IMPORTANT:
                        selectedDateBookings contains ONLY:
                        CONFIRMED + BOOKING FEE PAID
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
                                There are no paid
                                appointments for
                                the selected date.
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
                                                {
                                                    item.startTime
                                                }
                                                {' - '}
                                                {
                                                    item.endTime
                                                }
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
                                                        '#E8F7F5',
                                                }}>

                                                <Text
                                                    style={{
                                                        fontSize:
                                                            11,
                                                        fontWeight:
                                                            '700',
                                                        color:
                                                            PRIMARY_COLOR,
                                                    }}>
                                                    Appointment
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
                                                    {
                                                        item.totalDuration ||
                                                        0
                                                    }{' '}
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

                        ONLY PENDING SALON RESPONSE REQUESTS
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

                                {pendingRequests.map(
                                    booking => {
                                        const remainingSeconds =
                                            getRemainingSeconds(
                                                booking.salonResponseDeadline,
                                                nowMs,
                                            );

                                        return (
                                            <TouchableOpacity
                                                key={
                                                    booking.bookingId
                                                }
                                                activeOpacity={
                                                    0.82
                                                }
                                                onPress={() =>
                                                    handleAppointmentPress(
                                                        booking,
                                                    )
                                                }
                                                style={{
                                                    marginHorizontal:
                                                        20,
                                                    marginBottom:
                                                        10,
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
                                                }}>

                                                <View
                                                    style={{
                                                        flexDirection:
                                                            'row',
                                                        alignItems:
                                                            'flex-start',
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
                                                            {
                                                                booking.customerName ||
                                                                'Customer'
                                                            }
                                                        </Text>

                                                        <Text
                                                            style={{
                                                                marginTop:
                                                                    4,
                                                                fontSize:
                                                                    13,
                                                                color:
                                                                    '#777',
                                                            }}>
                                                            {
                                                                booking.bookingDate
                                                            }{' '}
                                                            •{' '}
                                                            {
                                                                booking.startTime
                                                            }{' '}
                                                            -{' '}
                                                            {
                                                                booking.endTime
                                                            }
                                                        </Text>

                                                        <Text
                                                            style={{
                                                                marginTop:
                                                                    7,
                                                                fontSize:
                                                                    12,
                                                                fontWeight:
                                                                    '700',
                                                                color:
                                                                    '#A87500',
                                                            }}>
                                                            Respond within{' '}
                                                            {formatCountdown(
                                                                remainingSeconds,
                                                            )}
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
                                                </View>

                                                <Text
                                                    style={{
                                                        marginTop:
                                                            9,
                                                        fontSize:
                                                            12,
                                                        color:
                                                            '#666',
                                                    }}>
                                                    Tap to view the
                                                    booking and accept
                                                    or reject it.
                                                </Text>
                                            </TouchableOpacity>
                                        );
                                    },
                                )}

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
                                        marginTop:
                                            2,
                                        paddingVertical:
                                            11,
                                        alignItems:
                                            'center',
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
                                        View all bookings →
                                    </Text>
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
                                appear here when
                                customers submit them.
                            </Text>
                        </View>
                    ) : (
                        <>
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
                    BOOKING DETAILS MODAL
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
                                            {selectedBooking &&
                                                isPendingSalonRequest(
                                                    selectedBooking,
                                                )
                                                ? 'Booking Request'
                                                : 'Appointment Details'}
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


                                    {/* DATE / TIME */}

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


                                    {/* ==================================================
                                        SALON RESPONSE
                                    ================================================== */}

                                    {selectedBooking.bookingStatus ===
                                        'PENDING' &&
                                        selectedBooking.salonResponseStatus ===
                                        'PENDING' && (
                                            (() => {
                                                const remainingSeconds =
                                                    getRemainingSeconds(
                                                        selectedBooking.salonResponseDeadline,
                                                        nowMs,
                                                    );

                                                const isResponding =
                                                    respondingBookingId ===
                                                    selectedBooking.bookingId;

                                                if (
                                                    remainingSeconds >
                                                    0
                                                ) {
                                                    return (
                                                        <View
                                                            style={{
                                                                marginTop:
                                                                    14,
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
                                                                        12,
                                                                    fontWeight:
                                                                        '700',
                                                                    color:
                                                                        '#A87500',
                                                                }}>
                                                                ACTION REQUIRED
                                                            </Text>

                                                            <Text
                                                                style={{
                                                                    marginTop:
                                                                        5,
                                                                    fontSize:
                                                                        15,
                                                                    fontWeight:
                                                                        '700',
                                                                    color:
                                                                        '#333',
                                                                }}>
                                                                Customer is
                                                                waiting for
                                                                your response
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
                                                                You have{' '}
                                                                {formatCountdown(
                                                                    remainingSeconds,
                                                                )}{' '}
                                                                remaining to
                                                                accept or
                                                                reject this
                                                                booking request.
                                                            </Text>

                                                            <View
                                                                style={{
                                                                    flexDirection:
                                                                        'row',
                                                                    marginTop:
                                                                        14,
                                                                    gap:
                                                                        10,
                                                                }}>

                                                                <TouchableOpacity
                                                                    activeOpacity={
                                                                        0.8
                                                                    }
                                                                    disabled={
                                                                        isResponding
                                                                    }
                                                                    onPress={() =>
                                                                        handleRejectPress(
                                                                            selectedBooking,
                                                                        )
                                                                    }
                                                                    style={{
                                                                        flex:
                                                                            1,
                                                                        paddingVertical:
                                                                            13,
                                                                        borderRadius:
                                                                            11,
                                                                        alignItems:
                                                                            'center',
                                                                        justifyContent:
                                                                            'center',
                                                                        backgroundColor:
                                                                            '#F3F3F3',
                                                                        opacity:
                                                                            isResponding
                                                                                ? 0.6
                                                                                : 1,
                                                                    }}>

                                                                    <Text
                                                                        style={{
                                                                            fontSize:
                                                                                14,
                                                                            fontWeight:
                                                                                '700',
                                                                            color:
                                                                                '#555',
                                                                        }}>
                                                                        Reject
                                                                    </Text>
                                                                </TouchableOpacity>

                                                                <TouchableOpacity
                                                                    activeOpacity={
                                                                        0.8
                                                                    }
                                                                    disabled={
                                                                        isResponding
                                                                    }
                                                                    onPress={() =>
                                                                        handleAcceptPress(
                                                                            selectedBooking,
                                                                        )
                                                                    }
                                                                    style={{
                                                                        flex:
                                                                            1,
                                                                        paddingVertical:
                                                                            13,
                                                                        borderRadius:
                                                                            11,
                                                                        alignItems:
                                                                            'center',
                                                                        justifyContent:
                                                                            'center',
                                                                        backgroundColor:
                                                                            PRIMARY_COLOR,
                                                                        opacity:
                                                                            isResponding
                                                                                ? 0.6
                                                                                : 1,
                                                                    }}>

                                                                    {isResponding ? (
                                                                        <ActivityIndicator
                                                                            color="#FFFFFF"
                                                                        />
                                                                    ) : (
                                                                        <Text
                                                                            style={{
                                                                                fontSize:
                                                                                    14,
                                                                                fontWeight:
                                                                                    '700',
                                                                                color:
                                                                                    '#FFFFFF',
                                                                            }}>
                                                                            Accept
                                                                        </Text>
                                                                    )}
                                                                </TouchableOpacity>
                                                            </View>
                                                        </View>
                                                    );
                                                }

                                                return (
                                                    <View
                                                        style={{
                                                            marginTop:
                                                                14,
                                                            padding:
                                                                15,
                                                            borderRadius:
                                                                14,
                                                            backgroundColor:
                                                                '#F5F5F5',
                                                        }}>

                                                        <Text
                                                            style={{
                                                                fontSize:
                                                                    12,
                                                                fontWeight:
                                                                    '700',
                                                                color:
                                                                    '#777',
                                                            }}>
                                                            RESPONSE WINDOW
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
                                                                    '#555',
                                                            }}>
                                                            Response window
                                                            expired
                                                        </Text>

                                                        <Text
                                                            style={{
                                                                marginTop:
                                                                    5,
                                                                fontSize:
                                                                    13,
                                                                color:
                                                                    '#888',
                                                            }}>
                                                            This request is
                                                            no longer
                                                            available for
                                                            acceptance.
                                                        </Text>
                                                    </View>
                                                );
                                            })()
                                        )}


                                    {/* ==================================================
                                        CONFIRMED / PAID APPOINTMENT
                                    ================================================== */}

                                    {isPaidAppointment(
                                        selectedBooking,
                                    ) && (
                                            <View
                                                style={{
                                                    marginTop:
                                                        14,
                                                    padding:
                                                        15,
                                                    borderRadius:
                                                        14,
                                                    backgroundColor:
                                                        '#E8F7F5',
                                                    borderWidth:
                                                        1,
                                                    borderColor:
                                                        '#CBEDE9',
                                                }}>

                                                <Text
                                                    style={{
                                                        fontSize:
                                                            12,
                                                        fontWeight:
                                                            '700',
                                                        color:
                                                            PRIMARY_COLOR,
                                                    }}>
                                                    APPOINTMENT CONFIRMED
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
                                                            PRIMARY_COLOR,
                                                    }}>
                                                    ₹9 Clavata booking
                                                    fee paid
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
                                                    Remaining{' '}
                                                    {formatCurrency(
                                                        selectedBooking.remainingAmount,
                                                    )}{' '}
                                                    is to be collected
                                                    directly at the salon.
                                                </Text>
                                            </View>
                                        )}


                                    {/* ==================================================
                                        CANCELLED / EXPIRY
                                    ================================================== */}

                                    {(selectedBooking.bookingStatus ===
                                        'CANCELLED' ||
                                        selectedBooking.bookingStatus ===
                                        'EXPIRED') &&
                                        selectedBooking.bookingCancellationReason && (
                                            <View
                                                style={{
                                                    marginTop:
                                                        14,
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
                                                            11,
                                                        color:
                                                            '#888',
                                                        fontWeight:
                                                            '600',
                                                    }}>
                                                    CANCELLATION / EXPIRY
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
                                                            '#555',
                                                    }}>
                                                    {
                                                        selectedBooking.bookingCancellationReason
                                                    }
                                                </Text>
                                            </View>
                                        )}


                                    {/* ==================================================
                                        BOOKING STATUS
                                    ================================================== */}

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
                                                    'CONFIRMED'
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
                                                        'CONFIRMED'
                                                        ? PRIMARY_COLOR
                                                        : '#555',
                                            }}>
                                            {selectedBooking.bookingStatus ===
                                                'PENDING' &&
                                                selectedBooking.salonResponseStatus ===
                                                'PENDING'
                                                ? 'Awaiting Your Response'
                                                : formatBookingStatus(
                                                    selectedBooking.bookingStatus,
                                                )}
                                        </Text>

                                        {selectedBooking.salonResponseStatus && (
                                            <Text
                                                style={{
                                                    marginTop:
                                                        4,
                                                    fontSize:
                                                        12,
                                                    color:
                                                        '#777',
                                                }}>
                                                Salon response:{' '}
                                                {formatBookingStatus(
                                                    selectedBooking.salonResponseStatus,
                                                )}
                                            </Text>
                                        )}
                                    </View>


                                    {/* ==================================================
                                        SERVICES
                                    ================================================== */}

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
                                                                {
                                                                    duration
                                                                }{' '}
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


                                    {/* ==================================================
                                        PAYMENT SUMMARY
                                    ================================================== */}

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


                                    {/* ==================================================
                                        PAYMENT DETAILS
                                    ================================================== */}

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

                                        {selectedBooking.bookingFeePaidAt && (
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
                                                        color:
                                                            '#777',
                                                    }}>
                                                    Fee paid at
                                                </Text>

                                                <Text
                                                    style={{
                                                        fontWeight:
                                                            '600',
                                                        color:
                                                            '#333',
                                                    }}>
                                                    {new Date(
                                                        selectedBooking.bookingFeePaidAt,
                                                    ).toLocaleString(
                                                        'en-IN',
                                                    )}
                                                </Text>
                                            </View>
                                        )}
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
                                                marginBottom:
                                                    8,
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
                                                Response status
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
                                                {formatBookingStatus(
                                                    selectedBooking.salonResponseStatus,
                                                )}
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
    };

export default SalonDashboardScreen;