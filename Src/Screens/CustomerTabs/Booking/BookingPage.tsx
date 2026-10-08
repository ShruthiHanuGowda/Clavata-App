import React, {
    useCallback,
    useEffect,
    useState,
} from 'react';

import {
    NativeStackNavigationProp,
} from '@react-navigation/native-stack';

import {
    SafeAreaView,
    ScrollView,
    View,
    Text,
    TouchableOpacity,
    StyleSheet,
    Alert,
    RefreshControl,
} from 'react-native';

import {
    useMutation,
    useQuery,
} from '@apollo/client';

import {
    useFocusEffect,
    useNavigation,
} from '@react-navigation/native';

import { gql } from '@apollo/client';

import { useUser } from '../../../context/UserContext';

import {
    CANCEL_BOOKING,
    REQUEST_REFUND,
} from '../../../graphql/queries';

import { WalletStackParamList } from '../../../../types';


// ============================================================
// CUSTOMER BOOKINGS QUERY
// ============================================================

const CUSTOMER_BOOKINGS = gql`
    query CustomerBookings($customerUserId: ID!) {
        customerBookings(
            customerUserId: $customerUserId
        ) {
            bookingId
            salonId
            customerUserId

            salonName
            customerName

            bookingDate
            startTime
            endTime

            reviewSubmitted
            rating
            review
            reviewedAt

            bookingStatus

            salonResponseStatus
            salonResponseDeadline
            salonResponseWindowMinutes

            paymentMethod
            paymentStatus
            preferredPaymentMethod

            bookingFee
            bookingFeeStatus
            bookingFeePaidAt

            remainingAmount
            totalAmount

            bookingFeePaymentDeadline
            bookingFeePaymentWindowMinutes

            services {
                serviceId
                name
                audience
                category
                subcategory
                categoryId
                subcategoryId
                duration
                price
            }
        }
    }
`;


// ============================================================
// COLORS
// ============================================================

const COLORS = {
    background: '#F8F8FA',
    surface: '#FFFFFF',

    badgeColor: '#F9ECEC',

    primary: '#111111',

    text: '#111111',
    textSecondary: '#6B6B6B',
    textMuted: '#8A8A8A',

    border: '#E7E7E7',
    borderStrong: '#D6D6D6',

    white: '#FFFFFF',
    black: '#252525',

    transparent: 'transparent',
};


// ============================================================
// NAVIGATION
// ============================================================

type BookingNavigationProp =
    NativeStackNavigationProp<
        WalletStackParamList,
        'explore'
    >;


// ============================================================
// TAB TYPE
// ============================================================

type BookingTab =
    | 'Upcoming'
    | 'Completed'
    | 'Cancelled'
    | 'Expired';


// ============================================================
// COUNTDOWN HELPER
// ============================================================

function getRemainingMilliseconds(
    deadline: string | null | undefined,
): number {

    if (!deadline) {
        return 0;
    }

    const deadlineTime =
        new Date(deadline).getTime();

    if (
        Number.isNaN(
            deadlineTime,
        )
    ) {
        return 0;
    }

    return Math.max(
        0,
        deadlineTime - Date.now(),
    );
}


// ============================================================
// FORMAT COUNTDOWN
// ============================================================

function formatCountdown(
    milliseconds: number,
): string {

    const totalSeconds =
        Math.max(
            0,
            Math.floor(
                milliseconds / 1000,
            ),
        );

    const minutes =
        Math.floor(
            totalSeconds / 60,
        );

    const seconds =
        totalSeconds % 60;

    return `${String(
        minutes,
    ).padStart(
        2,
        '0',
    )}:${String(
        seconds,
    ).padStart(
        2,
        '0',
    )}`;
}


// ============================================================
// COMPONENT
// ============================================================

export default function BookingPage() {

    const navigation =
        useNavigation<BookingNavigationProp>();


    const [
        tab,
        setTab,
    ] = useState<BookingTab>(
        'Upcoming',
    );


    const [
        refreshing,
        setRefreshing,
    ] = useState(false);


    const [
        cancellingBookingId,
        setCancellingBookingId,
    ] = useState<string | null>(
        null,
    );


    const { currentUser } =
        useUser();


    // ============================================================
    // GET BOOKINGS
    // ============================================================

    const {
        data,
        loading,
        error,
        refetch,
    } = useQuery(
        CUSTOMER_BOOKINGS,
        {
            variables: {
                customerUserId:
                    currentUser?.userId,
            },

            skip:
                !currentUser?.userId,

            fetchPolicy:
                'network-only',

            notifyOnNetworkStatusChange:
                true,
        },
    );


    // ============================================================
    // REFRESH WHEN CUSTOMER RETURNS TO SCREEN
    // ============================================================

    useFocusEffect(
        useCallback(() => {

            if (
                !currentUser?.userId
            ) {
                return;
            }

            refetch().catch(
                refreshError => {

                    console.log(
                        'Booking focus refresh error:',
                        refreshError,
                    );

                },
            );

        }, [
            currentUser?.userId,
            refetch,
        ]),
    );


    // ============================================================
    // AUTOMATIC BOOKING REFRESH
    //
    // Required because EventBridge/Lambda updates DynamoDB
    // after the 15-minute salon response window.
    //
    // This allows:
    //
    // PENDING + PENDING
    //        ↓
    // EXPIRED + EXPIRED
    //
    // to appear automatically in the customer app.
    // ============================================================

    useEffect(() => {

        if (
            !currentUser?.userId
        ) {
            return;
        }

        const intervalId =
            setInterval(
                () => {

                    refetch().catch(
                        refreshError => {

                            console.log(
                                'Automatic booking refresh error:',
                                refreshError,
                            );

                        },
                    );

                },
                10000,
            );

        return () =>
            clearInterval(
                intervalId,
            );

    }, [
        currentUser?.userId,
        refetch,
    ]);


    // ============================================================
    // DEBUG BOOKINGS
    // ============================================================

    useEffect(() => {

        console.log(
            '========== CUSTOMER BOOKINGS ==========',
        );

        console.log(
            JSON.stringify(
                data?.customerBookings,
                null,
                2,
            ),
        );

        if (
            Array.isArray(
                data?.customerBookings,
            )
        ) {

            data.customerBookings.forEach(
                (booking: any) => {

                    console.log(
                        'CUSTOMER BOOKING STATE:',
                        {
                            bookingId:
                                booking?.bookingId,

                            bookingStatus:
                                booking?.bookingStatus,

                            salonResponseStatus:
                                booking?.salonResponseStatus,

                            salonResponseDeadline:
                                booking?.salonResponseDeadline,

                            bookingFeeStatus:
                                booking?.bookingFeeStatus,

                            bookingFeePaymentDeadline:
                                booking?.bookingFeePaymentDeadline,

                            bookingFeePaymentWindowMinutes:
                                booking?.bookingFeePaymentWindowMinutes,

                            calculatedRemainingSalonResponse:
                                getRemainingMilliseconds(
                                    booking?.salonResponseDeadline,
                                ),

                            calculatedRemainingPayment:
                                getRemainingMilliseconds(
                                    booking?.bookingFeePaymentDeadline,
                                ),
                        },
                    );

                },
            );
        }

        console.log(
            '========================================',
        );

    }, [data]);


    // ============================================================
    // CANCEL MUTATION
    // ============================================================

    const [
        cancelBookingMutation,
    ] = useMutation(
        CANCEL_BOOKING,
    );


    // ============================================================
    // REFUND MUTATION
    // ============================================================

    const [
        requestRefundMutation,
    ] = useMutation(
        REQUEST_REFUND,
    );


    // ============================================================
    // REFRESH
    // ============================================================

    const handleRefresh =
        async () => {

            try {

                setRefreshing(true);

                await refetch();

            } catch (refreshError) {

                console.log(
                    'Booking refresh error:',
                    refreshError,
                );

            } finally {

                setRefreshing(false);

            }
        };


    // ============================================================
    // FILTER BOOKINGS
    // ============================================================

    const filteredBookings =
        data?.customerBookings?.filter(
            (booking: any) => {

                const bookingStatus =
                    String(
                        booking?.bookingStatus ??
                        '',
                    ).toUpperCase();

                const salonResponseStatus =
                    String(
                        booking?.salonResponseStatus ??
                        '',
                    ).toUpperCase();


                // ====================================================
                // UPCOMING
                // ====================================================

                if (
                    tab === 'Upcoming'
                ) {

                    return (
                        (
                            bookingStatus ===
                                'PENDING' &&
                            salonResponseStatus ===
                                'PENDING'
                        ) ||

                        bookingStatus ===
                            'CONFIRMED'
                    );
                }


                // ====================================================
                // COMPLETED
                // ====================================================

                if (
                    tab === 'Completed'
                ) {

                    return (
                        bookingStatus ===
                        'COMPLETED'
                    );
                }


                // ====================================================
                // CANCELLED
                // ====================================================

                if (
                    tab === 'Cancelled'
                ) {

                    return (
                        bookingStatus ===
                        'CANCELLED'
                    );
                }


                // ====================================================
                // EXPIRED
                // ====================================================

                if (
                    tab === 'Expired'
                ) {

                    return (
                        bookingStatus ===
                        'EXPIRED'
                    );
                }


                return false;

            },
        ) || [];


    // ============================================================
    // STATUS
    // ============================================================

    const getBookingStatus =
        (booking: any) => {

            const bookingStatus =
                String(
                    booking?.bookingStatus ??
                    '',
                ).toUpperCase();


            const salonResponseStatus =
                String(
                    booking?.salonResponseStatus ??
                    '',
                ).toUpperCase();


            const bookingFeeStatus =
                String(
                    booking?.bookingFeeStatus ??
                    '',
                ).toUpperCase();


            // ====================================================
            // SALON DID NOT RESPOND
            //
            // PENDING + PENDING
            //      ↓
            // EXPIRED + EXPIRED
            // ====================================================

            if (
                bookingStatus ===
                    'EXPIRED' &&
                salonResponseStatus ===
                    'EXPIRED'
            ) {

                return {

                    text:
                        'Salon not available',

                    color:
                        '#A33A3A',

                    background:
                        '#FBEFEF',

                    border:
                        '#EBCACA',

                };
            }


            // ====================================================
            // PAYMENT WINDOW EXPIRED
            //
            // Salon accepted, but customer did not pay.
            //
            // EXPIRED + ACCEPTED
            // ====================================================

            if (
                bookingStatus ===
                    'EXPIRED' &&
                salonResponseStatus ===
                    'ACCEPTED'
            ) {

                return {

                    text:
                        'Payment expired',

                    color:
                        '#A33A3A',

                    background:
                        '#FBEFEF',

                    border:
                        '#EBCACA',

                };
            }


            // ====================================================
            // SALON REJECTED
            // ====================================================

            if (
                bookingStatus ===
                    'CANCELLED' &&
                salonResponseStatus ===
                    'REJECTED'
            ) {

                return {

                    text:
                        'Salon declined',

                    color:
                        '#A33A3A',

                    background:
                        '#FBEFEF',

                    border:
                        '#EBCACA',

                };
            }


            // ====================================================
            // CUSTOMER REQUEST STILL WAITING
            //
            // IMPORTANT:
            //
            // PENDING alone is NOT enough.
            //
            // We require:
            //
            // bookingStatus = PENDING
            // salonResponseStatus = PENDING
            // ====================================================

            if (
                bookingStatus ===
                    'PENDING' &&
                salonResponseStatus ===
                    'PENDING'
            ) {

                return {

                    text:
                        'Waiting for salon',

                    color:
                        '#8A5A00',

                    background:
                        '#FFF8E7',

                    border:
                        '#F3D38A',

                };
            }


            // ====================================================
            // DEFENSIVE PENDING
            //
            // If salonResponseStatus is temporarily missing,
            // do not claim the booking is expired/cancelled.
            // ====================================================

            if (
                bookingStatus ===
                'PENDING'
            ) {

                return {

                    text:
                        'Waiting for salon',

                    color:
                        '#8A5A00',

                    background:
                        '#FFF8E7',

                    border:
                        '#F3D38A',

                };
            }


            // ====================================================
            // SALON ACCEPTED + PAYMENT REQUIRED
            // ====================================================

            if (
                bookingStatus ===
                    'CONFIRMED' &&

                salonResponseStatus ===
                    'ACCEPTED' &&

                bookingFeeStatus !==
                    'PAID'
            ) {

                return {

                    text:
                        'Payment required',

                    color:
                        '#A64B00',

                    background:
                        '#FFF4E8',

                    border:
                        '#F1C49A',

                };
            }


            // ====================================================
            // CONFIRMED + PAID
            // ====================================================

            if (
                bookingStatus ===
                    'CONFIRMED' &&

                salonResponseStatus ===
                    'ACCEPTED' &&

                bookingFeeStatus ===
                    'PAID'
            ) {

                return {

                    text:
                        'Booking confirmed',

                    color:
                        '#3F3F3F',

                    background:
                        '#F2F2F2',

                    border:
                        '#D8D8D8',

                };
            }


            // ====================================================
            // CONFIRMED DEFENSIVE FALLBACK
            // ====================================================

            if (
                bookingStatus ===
                'CONFIRMED'
            ) {

                if (
                    bookingFeeStatus ===
                    'PAID'
                ) {

                    return {

                        text:
                            'Booking confirmed',

                        color:
                            '#3F3F3F',

                        background:
                            '#F2F2F2',

                        border:
                            '#D8D8D8',

                    };

                }


                return {

                    text:
                        'Payment required',

                    color:
                        '#A64B00',

                    background:
                        '#FFF4E8',

                    border:
                        '#F1C49A',

                };
            }


            // ====================================================
            // COMPLETED
            // ====================================================

            if (
                bookingStatus ===
                'COMPLETED'
            ) {

                return {

                    text:
                        'Completed',

                    color:
                        '#3F3F3F',

                    background:
                        '#F2F2F2',

                    border:
                        '#D8D8D8',

                };
            }


            // ====================================================
            // CANCELLED
            // ====================================================

            if (
                bookingStatus ===
                'CANCELLED'
            ) {

                return {

                    text:
                        'Cancelled',

                    color:
                        '#A33A3A',

                    background:
                        '#FBEFEF',

                    border:
                        '#EBCACA',

                };
            }


            // ====================================================
            // EXPIRED DEFENSIVE FALLBACK
            // ====================================================

            if (
                bookingStatus ===
                'EXPIRED'
            ) {

                return {

                    text:
                        'Booking expired',

                    color:
                        '#A33A3A',

                    background:
                        '#FBEFEF',

                    border:
                        '#EBCACA',

                };
            }


            // ====================================================
            // UNKNOWN
            // ====================================================

            return {

                text:
                    'Booking pending',

                color:
                    '#6B5A00',

                background:
                    '#FFFBEA',

                border:
                    '#E8DFA8',

            };

        };


    // ============================================================
    // REFUND MESSAGE
    // ============================================================

    const getRefundMessage =
        (
            refund: any,
            booking: any,
        ) => {

            const originalAmount =
                Number(
                    refund?.originalAmount ??
                    booking?.bookingFee ??
                    0,
                );


            const refundAmount =
                Number(
                    refund?.refundAmount ??
                    0,
                );


            if (
                originalAmount <= 0
            ) {

                return {

                    title:
                        'Booking cancelled',

                    message:
                        'Your booking has been cancelled successfully.',
                };
            }


            if (
                refundAmount >=
                originalAmount
            ) {

                return {

                    title:
                        'Full refund requested',

                    message:
                        `Your ₹${refundAmount.toFixed(
                            2,
                        )} Clavata booking fee is eligible for a full refund under the cancellation policy.`,
                };
            }


            if (
                refundAmount > 0
            ) {

                return {

                    title:
                        'Partial refund requested',

                    message:
                        `₹${refundAmount.toFixed(
                            2,
                        )} of your ₹${originalAmount.toFixed(
                            2,
                        )} Clavata booking fee is eligible for refund under the cancellation policy.`,
                };
            }


            return {

                title:
                    'No customer refund',

                message:
                    `Your ₹${originalAmount.toFixed(
                        2,
                    )} Clavata booking fee is non-refundable because the cancellation was made less than 1 hour before the appointment.`,
            };
        };


    // ============================================================
    // CANCEL BOOKING
    // ============================================================

    const cancelBooking =
        (booking: any) => {

            const bookingId =
                booking?.bookingId;


            if (!bookingId) {

                Alert.alert(
                    'Unable to Cancel',
                    'Booking information is missing.',
                );

                return;
            }


            if (
                cancellingBookingId
            ) {

                return;
            }


            const bookingFee =
                Number(
                    booking?.bookingFee ??
                    0,
                );


            const bookingFeePaid =
                booking?.bookingFeeStatus ===
                'PAID';


            let confirmationMessage =
                'Are you sure you want to cancel this booking?';


            if (
                bookingFeePaid &&
                bookingFee > 0
            ) {

                confirmationMessage =
                    `Are you sure you want to cancel this booking?\n\nYour Clavata booking fee of ₹${bookingFee.toFixed(
                        2,
                    )} will be handled according to the cancellation refund policy.`;
            }


            Alert.alert(

                'Cancel Booking',

                confirmationMessage,

                [

                    {
                        text:
                            'Keep Booking',

                        style:
                            'cancel',
                    },

                    {

                        text:
                            'Cancel Booking',

                        style:
                            'destructive',

                        onPress:
                            async () => {

                                try {

                                    setCancellingBookingId(
                                        bookingId,
                                    );


                                    await cancelBookingMutation(
                                        {
                                            variables: {
                                                bookingId,
                                            },
                                        },
                                    );


                                    if (
                                        bookingFeePaid &&
                                        bookingFee > 0
                                    ) {

                                        try {

                                            const refundResult =
                                                await requestRefundMutation(
                                                    {
                                                        variables: {
                                                            input: {
                                                                bookingId,

                                                                reason:
                                                                    'CUSTOMER_CANCELLED',
                                                            },
                                                        },
                                                    },
                                                );


                                            const refundResponse =
                                                refundResult
                                                    ?.data
                                                    ?.requestRefund;


                                            const refund =
                                                refundResponse
                                                    ?.refund;


                                            if (
                                                refundResponse?.success &&
                                                refund
                                            ) {

                                                const refundMessage =
                                                    getRefundMessage(
                                                        refund,
                                                        booking,
                                                    );


                                                await refetch();


                                                Alert.alert(
                                                    refundMessage.title,

                                                    `${refundMessage.message}\n\nRefund status: ${String(
                                                        refund.status ||
                                                        'REQUESTED',
                                                    ).toLowerCase()}.\n\nOnly the Clavata booking fee is covered by this refund. Any remaining amount is paid directly at the salon and is not part of this refund.`,
                                                );

                                            } else {

                                                await refetch();


                                                Alert.alert(
                                                    'Booking Cancelled',

                                                    `Your booking has been cancelled successfully.\n\nHowever, we could not create the refund request automatically. Please contact Clavata support.\n\n${refundResponse?.message || ''}`,
                                                );
                                            }

                                        } catch (
                                            refundError: any
                                        ) {

                                            console.error(
                                                'Refund request error:',
                                                refundError,
                                            );


                                            await refetch();


                                            Alert.alert(
                                                'Booking Cancelled',

                                                `Your booking has been cancelled successfully.\n\nThe refund request could not be created automatically. Please contact Clavata support.\n\n${refundError?.message || 'Unable to create refund request.'}`,
                                            );
                                        }

                                    } else {

                                        await refetch();


                                        Alert.alert(
                                            'Booking Cancelled',

                                            'Your booking has been cancelled successfully.\n\nNo Clavata booking fee was paid, so there is no refund to process.',
                                        );
                                    }

                                } catch (
                                    cancelError: any
                                ) {

                                    console.error(
                                        'Cancel booking error:',
                                        cancelError,
                                    );


                                    Alert.alert(
                                        'Unable to Cancel',

                                        cancelError?.message ||
                                        'Something went wrong while cancelling your booking.',
                                    );

                                } finally {

                                    setCancellingBookingId(
                                        null,
                                    );

                                }

                            },
                    },

                ],
            );
        };


    // ============================================================
    // BOOK AGAIN
    // ============================================================

    const bookAgain =
        (booking: any) => {

            if (!booking?.salonId) {

                Alert.alert(
                    'Unable to book again',
                    'Salon information is missing from this booking.',
                );

                return;
            }


            if (
                !Array.isArray(
                    booking?.services,
                ) ||
                booking.services.length === 0
            ) {

                Alert.alert(
                    'Unable to book again',
                    'Service information is missing from this booking.',
                );

                return;
            }


            if (
                !currentUser?.userId
            ) {

                Alert.alert(
                    'Unable to book again',
                    'Customer information is missing. Please login again.',
                );

                return;
            }


            const services =
                booking.services
                    .map(
                        (service: any) => ({

                            serviceId:
                                String(
                                    service?.serviceId ??
                                    '',
                                ),

                            name:
                                service?.name ??
                                '',

                            category:
                                service?.category ??
                                '',

                            subcategory:
                                service?.subcategory ??
                                '',

                            audience:
                                service?.audience ??
                                '',

                            price:
                                Number(
                                    service?.price ??
                                    0,
                                ),

                            duration:
                                Number(
                                    service?.duration ??
                                    0,
                                ),
                        }),
                    )
                    .filter(
                        (service: any) =>
                            Boolean(
                                service.serviceId,
                            ),
                    );


            if (
                services.length === 0
            ) {

                Alert.alert(
                    'Unable to book again',
                    'No valid services were found in the previous booking.',
                );

                return;
            }


            const parentNavigation =
                navigation.getParent<any>();


            if (
                !parentNavigation
            ) {

                Alert.alert(
                    'Unable to continue',
                    'Navigation is not available.',
                );

                return;
            }


            parentNavigation.navigate(
                'Home',
                {
                    screen:
                        'BookingDateTime',

                    params: {
                        salonId:
                            booking.salonId,

                        customerUserId:
                            currentUser.userId,

                        services,
                    },
                },
            );
        };


    // ============================================================
    // VIEW BOOKING
    // ============================================================

    const viewBooking =
        (booking: any) => {

            navigation.navigate(
                'BookingDetails',
                {
                    bookingId:
                        booking.bookingId,

                    booking,
                },
            );
        };


    // ============================================================
    // LOADING
    // ============================================================

    if (
        loading &&
        !data
    ) {

        return (

            <SafeAreaView
                style={
                    styles.container
                }
            >

                <View
                    style={
                        styles.loadingContainer
                    }
                >

                    <View
                        style={
                            styles.loadingCircle
                        }
                    />

                    <Text
                        style={
                            styles.loadingText
                        }
                    >
                        Loading your bookings...
                    </Text>

                </View>

            </SafeAreaView>

        );
    }


    // ============================================================
    // ERROR
    // ============================================================

    if (
        error &&
        !data
    ) {

        return (

            <SafeAreaView
                style={
                    styles.container
                }
            >

                <View
                    style={
                        styles.errorContainer
                    }
                >

                    <View
                        style={
                            styles.errorIcon
                        }
                    >

                        <Text
                            style={
                                styles.errorIconText
                            }
                        >
                            !
                        </Text>

                    </View>


                    <Text
                        style={
                            styles.errorTitle
                        }
                    >
                        Unable to load bookings
                    </Text>


                    <Text
                        style={
                            styles.errorMessage
                        }
                    >
                        {error.message}
                    </Text>


                    <TouchableOpacity
                        style={
                            styles.retryButton
                        }
                        onPress={() =>
                            refetch()
                        }
                    >

                        <Text
                            style={
                                styles.retryText
                            }
                        >
                            Try Again
                        </Text>

                    </TouchableOpacity>

                </View>

            </SafeAreaView>

        );
    }


    // ============================================================
    // RENDER
    // ============================================================

    return (

        <SafeAreaView
            style={
                styles.container
            }
        >

            <ScrollView
                showsVerticalScrollIndicator={
                    false
                }
                contentContainerStyle={
                    styles.scrollContent
                }
                refreshControl={
                    <RefreshControl
                        refreshing={
                            refreshing
                        }
                        onRefresh={
                            handleRefresh
                        }
                        tintColor={
                            COLORS.primary
                        }
                    />
                }
            >

                {/* HEADER */}

                <View
                    style={
                        styles.header
                    }
                >

                    <View>

                        <Text
                            style={
                                styles.title
                            }
                        >
                            Bookings
                        </Text>

                        <Text
                            style={
                                styles.subtitle
                            }
                        >
                            Manage your appointments
                        </Text>

                    </View>


                    <View
                        style={
                            styles.headerIcon
                        }
                    >

                        <Text
                            style={
                                styles.headerIconText
                            }
                        >
                            ✓
                        </Text>

                    </View>

                </View>


                {/* TABS */}

                <View
                    style={
                        styles.tabsContainer
                    }
                >

                    {[
                        'Upcoming',
                        'Completed',
                        'Cancelled',
                        'Expired',
                    ].map(
                        item => {

                            const selected =
                                tab === item;


                            return (

                                <TouchableOpacity
                                    key={
                                        item
                                    }
                                    activeOpacity={
                                        0.8
                                    }
                                    style={[
                                        styles.tab,
                                        selected &&
                                        styles.activeTab,
                                    ]}
                                    onPress={() =>
                                        setTab(
                                            item as BookingTab,
                                        )
                                    }
                                >

                                    <Text
                                        style={[
                                            styles.tabText,
                                            selected &&
                                            styles.activeTabText,
                                        ]}
                                        numberOfLines={
                                            1
                                        }
                                    >
                                        {item}
                                    </Text>

                                </TouchableOpacity>

                            );
                        },
                    )}

                </View>


                {/* BOOKING COUNT */}

                {filteredBookings.length >
                    0 && (

                    <Text
                        style={
                            styles.resultText
                        }
                    >
                        {filteredBookings.length}{' '}
                        {filteredBookings.length ===
                        1
                            ? 'booking'
                            : 'bookings'}
                    </Text>

                )}


                {/* BOOKINGS */}

                {filteredBookings.length ===
                0 ? (

                    <View
                        style={
                            styles.emptyContainer
                        }
                    >

                        <View
                            style={
                                styles.emptyIcon
                            }
                        >

                            <Text
                                style={
                                    styles.emptyIconText
                                }
                            >
                                ♢
                            </Text>

                        </View>


                        <Text
                            style={
                                styles.emptyTitle
                            }
                        >
                            No {tab.toLowerCase()}{' '}
                            bookings
                        </Text>


                        <Text
                            style={
                                styles.emptyText
                            }
                        >
                            {tab ===
                            'Upcoming'
                                ? 'Your upcoming salon appointments will appear here.'
                                : tab ===
                                  'Completed'
                                ? 'Completed appointments will appear here.'
                                : tab ===
                                  'Cancelled'
                                ? 'Cancelled appointments will appear here.'
                                : 'Bookings that expired because the salon did not respond or the payment window ended will appear here.'}
                        </Text>

                    </View>

                ) : (

                    filteredBookings.map(
                        (item: any) => (

                            <BookingCard
                                key={
                                    item.bookingId
                                }

                                booking={
                                    item
                                }

                                status={
                                    getBookingStatus(
                                        item,
                                    )
                                }

                                tab={
                                    tab
                                }

                                onCancel={() =>
                                    cancelBooking(
                                        item,
                                    )
                                }

                                onView={() =>
                                    viewBooking(
                                        item,
                                    )
                                }

                                onPay={() => {

                                    console.log(
                                        'PAYMENT BOOKING:',
                                        JSON.stringify(
                                            item,
                                            null,
                                            2,
                                        ),
                                    );


                                    navigation.navigate(
                                        'BookingPayment',
                                        {
                                            booking:
                                                item,
                                        },
                                    );
                                }}

                                onBookAgain={() =>
                                    bookAgain(
                                        item,
                                    )
                                }

                                onExpired={() =>
                                    refetch()
                                }

                                isCancelling={
                                    cancellingBookingId ===
                                    item.bookingId
                                }
                            />

                        ),
                    )

                )}


                {filteredBookings.length >
                    0 && (

                    <Text
                        style={
                            styles.footer
                        }
                    >
                        Keep your appointments organised
                        with Clavata.
                    </Text>

                )}

            </ScrollView>

        </SafeAreaView>
    );
}


// ============================================================
// BOOKING CARD PROPS
// ============================================================

type BookingCardProps = {

    booking: any;

    status: {
        text: string;
        color: string;
        background: string;
        border: string;
    };

    tab: BookingTab;

    onCancel: () => void;

    onView: () => void;

    onPay: () => void;

    onBookAgain: () => void;

    onExpired: () => void;

    isCancelling: boolean;
};


// ============================================================
// BOOKING CARD
// ============================================================

function BookingCard({
    booking,
    status,
    tab,
    onCancel,
    onView,
    onPay,
    onBookAgain,
    onExpired,
    isCancelling,
}: BookingCardProps) {

    const services =
        Array.isArray(
            booking?.services,
        )
            ? booking.services
            : [];


    // ============================================================
    // NORMALIZED STATUS
    // ============================================================

    const bookingStatus =
        String(
            booking?.bookingStatus ??
            '',
        ).toUpperCase();


    const salonResponseStatus =
        String(
            booking?.salonResponseStatus ??
            '',
        ).toUpperCase();


    const bookingFeeStatus =
        String(
            booking?.bookingFeeStatus ??
            '',
        ).toUpperCase();


    // ============================================================
    // SALON RESPONSE COUNTDOWN
    //
    // This is the first 15-minute timer.
    //
    // It is only active while:
    //
    // PENDING + PENDING
    // ============================================================

    const [
        salonRemainingMilliseconds,
        setSalonRemainingMilliseconds,
    ] = useState<number>(
        () =>
            getRemainingMilliseconds(
                booking?.salonResponseDeadline,
            ),
    );


    useEffect(() => {

        const waitingForSalon =
            bookingStatus ===
                'PENDING' &&
            salonResponseStatus ===
                'PENDING';


        if (
            !waitingForSalon
        ) {

            setSalonRemainingMilliseconds(
                0,
            );

            return;
        }


        const deadline =
            booking?.salonResponseDeadline;


        if (!deadline) {

            setSalonRemainingMilliseconds(
                0,
            );

            return;
        }


        const deadlineTime =
            new Date(
                deadline,
            ).getTime();


        if (
            Number.isNaN(
                deadlineTime,
            )
        ) {

            setSalonRemainingMilliseconds(
                0,
            );

            return;
        }


        let expiredHandled =
            false;


        const updateCountdown =
            () => {

                const remaining =
                    Math.max(
                        0,
                        deadlineTime -
                            Date.now(),
                    );


                setSalonRemainingMilliseconds(
                    remaining,
                );


                if (
                    remaining <= 0 &&
                    !expiredHandled
                ) {

                    expiredHandled =
                        true;


                    console.log(
                        'SALON RESPONSE WINDOW EXPIRED:',
                        booking?.bookingId,
                    );


                    onExpired();
                }

            };


        updateCountdown();


        const intervalId =
            setInterval(
                updateCountdown,
                1000,
            );


        return () =>
            clearInterval(
                intervalId,
            );

    }, [
        booking?.bookingId,
        booking?.bookingStatus,
        booking?.salonResponseStatus,
        booking?.salonResponseDeadline,
    ]);


    // ============================================================
    // PAYMENT COUNTDOWN
    //
    // This is the second 15-minute timer.
    //
    // It starts ONLY after:
    //
    // CONFIRMED + ACCEPTED + bookingFeeStatus !== PAID
    // ============================================================

    const [
        remainingMilliseconds,
        setRemainingMilliseconds,
    ] = useState<number>(
        () =>
            getRemainingMilliseconds(
                booking?.bookingFeePaymentDeadline,
            ),
    );


    useEffect(() => {

        const isAccepted =
            bookingStatus ===
                'CONFIRMED' &&

            salonResponseStatus ===
                'ACCEPTED';


        const isPaid =
            bookingFeeStatus ===
            'PAID';


        if (
            !isAccepted ||
            isPaid
        ) {

            setRemainingMilliseconds(
                0,
            );

            return;
        }


        const deadline =
            booking?.bookingFeePaymentDeadline;


        if (!deadline) {

            setRemainingMilliseconds(
                0,
            );

            console.warn(
                'BOOKING PAYMENT DEADLINE MISSING:',
                {
                    bookingId:
                        booking?.bookingId,

                    bookingStatus,

                    salonResponseStatus,

                    bookingFeeStatus,

                    bookingFee:
                        booking?.bookingFee,

                    bookingFeePaymentWindowMinutes:
                        booking?.bookingFeePaymentWindowMinutes,
                },
            );

            return;
        }


        const deadlineTime =
            new Date(
                deadline,
            ).getTime();


        if (
            Number.isNaN(
                deadlineTime,
            )
        ) {

            setRemainingMilliseconds(
                0,
            );

            console.warn(
                'INVALID BOOKING PAYMENT DEADLINE:',
                deadline,
            );

            return;
        }


        let expiredHandled =
            false;


        const updateCountdown =
            () => {

                const remaining =
                    Math.max(
                        0,
                        deadlineTime -
                            Date.now(),
                    );


                setRemainingMilliseconds(
                    remaining,
                );


                if (
                    remaining <= 0 &&
                    !expiredHandled
                ) {

                    expiredHandled =
                        true;


                    console.log(
                        'BOOKING PAYMENT WINDOW EXPIRED:',
                        booking?.bookingId,
                    );


                    onExpired();
                }

            };


        updateCountdown();


        const intervalId =
            setInterval(
                updateCountdown,
                1000,
            );


        return () =>
            clearInterval(
                intervalId,
            );

    }, [
        booking?.bookingId,
        booking?.bookingStatus,
        booking?.salonResponseStatus,
        booking?.bookingFeeStatus,
        booking?.bookingFeePaymentDeadline,
    ]);


    // ============================================================
    // SALON ACCEPTED
    // ============================================================

    const salonAccepted =
        bookingStatus ===
            'CONFIRMED' &&

        salonResponseStatus ===
            'ACCEPTED';


    // ============================================================
    // CONFIRMED + UNPAID
    // ============================================================

    const paymentRequired =
        salonAccepted &&

        bookingFeeStatus !==
            'PAID';


    // ============================================================
    // VALID PAYMENT DEADLINE
    // ============================================================

    const hasPaymentDeadline =
        Boolean(
            booking?.bookingFeePaymentDeadline,
        );


    // ============================================================
    // PAYMENT WINDOW ACTIVE
    // ============================================================

    const paymentWindowActive =
        paymentRequired &&

        hasPaymentDeadline &&

        remainingMilliseconds > 0;


    // ============================================================
    // PAYMENT WINDOW EXPIRED
    // ============================================================

    const paymentWindowExpired =
        paymentRequired &&

        hasPaymentDeadline &&

        remainingMilliseconds <= 0;


    // ============================================================
    // DEADLINE MISSING
    // ============================================================

    const paymentDeadlineMissing =
        paymentRequired &&

        !hasPaymentDeadline;


    // ============================================================
    // WAITING FOR SALON
    // ============================================================

    const waitingForSalon =
        bookingStatus ===
            'PENDING' &&

        salonResponseStatus ===
            'PENDING';


    // ============================================================
    // SALON RESPONSE TIMER ACTIVE
    // ============================================================

    const salonResponseTimerActive =
        waitingForSalon &&

        Boolean(
            booking?.salonResponseDeadline,
        ) &&

        salonRemainingMilliseconds > 0;


    // ============================================================
    // SALON RESPONSE TIMER EXPIRED LOCALLY
    // ============================================================

    const salonResponseTimerExpired =
        waitingForSalon &&

        Boolean(
            booking?.salonResponseDeadline,
        ) &&

        salonRemainingMilliseconds <= 0;


    // ============================================================
    // SALON DID NOT RESPOND
    // ============================================================

    const salonUnavailable =
        bookingStatus ===
            'EXPIRED' &&

        salonResponseStatus ===
            'EXPIRED';


    // ============================================================
    // PAYMENT EXPIRED
    // ============================================================

    const paymentExpired =
        bookingStatus ===
            'EXPIRED' &&

        salonResponseStatus ===
            'ACCEPTED';


    return (

        <View
            style={
                styles.card
            }
        >

            {/* ================================================= */}
            {/* CARD HEADER */}
            {/* ================================================= */}

            <View
                style={
                    styles.cardHeader
                }
            >

                <View
                    style={
                        styles.salonIcon
                    }
                >

                    <Text
                        style={
                            styles.salonIconText
                        }
                    >
                        S
                    </Text>

                </View>


                <View
                    style={
                        styles.salonInfo
                    }
                >

                    <Text
                        style={
                            styles.salonName
                        }
                        numberOfLines={
                            1
                        }
                    >
                        {booking.salonName ||
                            'Salon'}
                    </Text>


                    <Text
                        style={
                            styles.serviceCountText
                        }
                    >
                        {services.length}{' '}
                        {services.length ===
                        1
                            ? 'service'
                            : 'services'}
                    </Text>

                </View>


                <View
                    style={[
                        styles.statusBadge,
                        {
                            backgroundColor:
                                status.background,

                            borderColor:
                                status.border,
                        },
                    ]}
                >

                    <Text
                        style={[
                            styles.statusText,
                            {
                                color:
                                    status.color,
                            },
                        ]}
                    >
                        {status.text}
                    </Text>

                </View>

            </View>


            {/* ================================================= */}
            {/* SERVICES */}
            {/* ================================================= */}

            <View
                style={
                    styles.servicesContainer
                }
            >

                {services.map(
                    (
                        service: any,
                        index: number,
                    ) => {

                        const audience =
                            String(
                                service?.audience ??
                                '',
                            ).toUpperCase();


                        return (

                            <View
                                key={
                                    `${service?.serviceId || 'service'}-${index}`
                                }
                                style={
                                    styles.serviceCard
                                }
                            >

                                <View
                                    style={
                                        styles.serviceTopRow
                                    }
                                >

                                    <View
                                        style={
                                            styles.serviceTitleContainer
                                        }
                                    >

                                        <Text
                                            style={
                                                styles.serviceName
                                            }
                                        >
                                            {service?.name ||
                                                'Service'}
                                        </Text>

                                    </View>


                                    {audience.length >
                                        0 && (

                                        <View
                                            style={
                                                styles.audienceBadge
                                            }
                                        >

                                            <Text
                                                style={
                                                    styles.audienceBadgeText
                                                }
                                            >
                                                {audience}
                                            </Text>

                                        </View>

                                    )}

                                </View>


                                <Text
                                    style={
                                        styles.categoryPath
                                    }
                                >
                                    {service?.category ||
                                        'Category'}

                                    {service?.subcategory
                                        ? `  ›  ${service.subcategory}`
                                        : ''}
                                </Text>


                                <View
                                    style={
                                        styles.serviceInfoRow
                                    }
                                >

                                    <View
                                        style={
                                            styles.serviceInfoItem
                                        }
                                    >

                                        <Text
                                            style={
                                                styles.serviceInfoLabel
                                            }
                                        >
                                            PRICE
                                        </Text>


                                        <Text
                                            style={
                                                styles.serviceInfoValue
                                            }
                                        >
                                            ₹
                                            {Number(
                                                service?.price ??
                                                0,
                                            )}
                                        </Text>

                                    </View>


                                    <View
                                        style={
                                            styles.serviceInfoDivider
                                        }
                                    />


                                    <View
                                        style={
                                            styles.serviceInfoItem
                                        }
                                    >

                                        <Text
                                            style={
                                                styles.serviceInfoLabel
                                            }
                                        >
                                            DURATION
                                        </Text>


                                        <Text
                                            style={
                                                styles.serviceInfoValue
                                            }
                                        >
                                            {Number(
                                                service?.duration ??
                                                0,
                                            )}{' '}
                                            min
                                        </Text>

                                    </View>

                                </View>

                            </View>

                        );
                    },
                )}

            </View>


            {/* ================================================= */}
            {/* DIVIDER */}
            {/* ================================================= */}

            <View
                style={
                    styles.divider
                }
            />


            {/* ================================================= */}
            {/* APPOINTMENT DETAILS */}
            {/* ================================================= */}

            <View
                style={
                    styles.detailsRow
                }
            >

                <View
                    style={
                        styles.detailItem
                    }
                >

                    <Text
                        style={
                            styles.detailLabel
                        }
                    >
                        DATE
                    </Text>


                    <Text
                        style={
                            styles.detailValue
                        }
                    >
                        {booking.bookingDate ||
                            '—'}
                    </Text>

                </View>


                <View
                    style={
                        styles.detailDivider
                    }
                />


                <View
                    style={
                        styles.detailItem
                    }
                >

                    <Text
                        style={
                            styles.detailLabel
                        }
                    >
                        TIME
                    </Text>


                    <Text
                        style={
                            styles.detailValue
                        }
                    >
                        {booking.startTime ||
                            '—'}
                    </Text>

                </View>


                <View
                    style={
                        styles.detailDivider
                    }
                />


                <View
                    style={[
                        styles.detailItem,
                        styles.amountItem,
                    ]}
                >

                    <Text
                        style={
                            styles.detailLabel
                        }
                    >
                        TOTAL
                    </Text>


                    <Text
                        style={
                            styles.amountValue
                        }
                    >
                        ₹
                        {booking.totalAmount ??
                            0}
                    </Text>

                </View>

            </View>


            {/* ================================================= */}
            {/* WAITING FOR SALON */}
            {/* ================================================= */}

            {waitingForSalon && (

                <View
                    style={
                        styles.waitingCard
                    }
                >

                    <View
                        style={
                            styles.waitingHeader
                        }
                    >

                        <View
                            style={
                                styles.waitingIndicator
                            }
                        />

                        <Text
                            style={
                                styles.waitingTitle
                            }
                        >
                            Waiting for salon
                        </Text>

                    </View>


                    <Text
                        style={
                            styles.waitingMessage
                        }
                    >
                        Your booking request has been sent to the
                        salon. The salon has 15 minutes to respond.
                    </Text>


                    {salonResponseTimerActive && (

                        <View
                            style={
                                styles.countdownCard
                            }
                        >

                            <View>

                                <Text
                                    style={
                                        styles.countdownLabel
                                    }
                                >
                                    SALON RESPONSE WITHIN
                                </Text>

                                <Text
                                    style={
                                        styles.countdownSubtext
                                    }
                                >
                                    Waiting for salon confirmation
                                </Text>

                            </View>


                            <Text
                                style={
                                    styles.countdownValue
                                }
                            >
                                {formatCountdown(
                                    salonRemainingMilliseconds,
                                )}
                            </Text>

                        </View>

                    )}


                    {salonResponseTimerExpired && (

                        <View
                            style={
                                styles.timerUnavailableCard
                            }
                        >

                            <View
                                style={
                                    styles.timerUnavailableIcon
                                }
                            >

                                <Text
                                    style={
                                        styles.timerUnavailableIconText
                                    }
                                >
                                    !
                                </Text>

                            </View>


                            <View
                                style={
                                    styles.timerUnavailableContent
                                }
                            >

                                <Text
                                    style={
                                        styles.timerUnavailableTitle
                                    }
                                >
                                    Checking salon response
                                </Text>


                                <Text
                                    style={
                                        styles.timerUnavailableText
                                    }
                                >
                                    The response window has ended.
                                    Refreshing the booking status...
                                </Text>

                            </View>

                        </View>

                    )}

                </View>

            )}


            {/* ================================================= */}
            {/* SALON NOT AVAILABLE */}
            {/* ================================================= */}

            {salonUnavailable && (

                <View
                    style={
                        styles.expiredCard
                    }
                >

                    <Text
                        style={
                            styles.expiredIcon
                        }
                    >
                        !
                    </Text>


                    <View
                        style={
                            styles.expiredContent
                        }
                    >

                        <Text
                            style={
                                styles.expiredTitle
                            }
                        >
                            Salon not available
                        </Text>


                        <Text
                            style={
                                styles.expiredText
                            }
                        >
                            The salon did not respond to your booking
                            request within 15 minutes. No payment was
                            required for this request.
                        </Text>

                    </View>

                </View>

            )}


            {/* ================================================= */}
            {/* PAYMENT REQUIRED */}
            {/* ================================================= */}

            {paymentRequired && (

                <View
                    style={
                        styles.paymentCard
                    }
                >

                    <View
                        style={
                            styles.paymentHeader
                        }
                    >

                        <View
                            style={[
                                styles.paymentIndicator,

                                paymentWindowExpired &&
                                styles.paymentIndicatorExpired,
                            ]}
                        />


                        <Text
                            style={[
                                styles.paymentTitle,

                                paymentWindowExpired &&
                                styles.paymentTitleExpired,
                            ]}
                        >
                            {paymentWindowExpired
                                ? 'Payment window expired'
                                : 'Payment required'}
                        </Text>

                    </View>


                    <Text
                        style={
                            styles.paymentMessage
                        }
                    >
                        {paymentWindowExpired

                            ? 'The 15-minute payment window has expired. This booking can no longer be paid.'

                            : paymentDeadlineMissing

                            ? 'Your booking is confirmed and accepted by the salon. The payment timer is currently unavailable.'

                            : 'Your appointment has been accepted by the salon. Pay the ₹9 Clavata booking fee within 15 minutes to confirm your appointment.'}
                    </Text>


                    {/* COUNTDOWN */}

                    {paymentWindowActive && (

                        <View
                            style={
                                styles.countdownCard
                            }
                        >

                            <View>

                                <Text
                                    style={
                                        styles.countdownLabel
                                    }
                                >
                                    PAY WITHIN
                                </Text>

                                <Text
                                    style={
                                        styles.countdownSubtext
                                    }
                                >
                                    ₹9 Clavata booking fee
                                </Text>

                            </View>


                            <Text
                                style={
                                    styles.countdownValue
                                }
                            >
                                {formatCountdown(
                                    remainingMilliseconds,
                                )}
                            </Text>

                        </View>

                    )}


                    {/* TIMER UNAVAILABLE */}

                    {paymentDeadlineMissing && (

                        <View
                            style={
                                styles.timerUnavailableCard
                            }
                        >

                            <View
                                style={
                                    styles.timerUnavailableIcon
                                }
                            >

                                <Text
                                    style={
                                        styles.timerUnavailableIconText
                                    }
                                >
                                    !
                                </Text>

                            </View>


                            <View
                                style={
                                    styles.timerUnavailableContent
                                }
                            >

                                <Text
                                    style={
                                        styles.timerUnavailableTitle
                                    }
                                >
                                    Payment timer unavailable
                                </Text>


                                <Text
                                    style={
                                        styles.timerUnavailableText
                                    }
                                >
                                    Your booking has been accepted by
                                    the salon, but the payment deadline
                                    has not been returned yet.
                                </Text>

                            </View>

                        </View>

                    )}


                    {/* EXPIRED */}

                    {paymentWindowExpired && (

                        <View
                            style={
                                styles.expiredCard
                            }
                        >

                            <Text
                                style={
                                    styles.expiredIcon
                                }
                            >
                                !
                            </Text>


                            <View
                                style={
                                    styles.expiredContent
                                }
                            >

                                <Text
                                    style={
                                        styles.expiredTitle
                                    }
                                >
                                    Payment window expired
                                </Text>


                                <Text
                                    style={
                                        styles.expiredText
                                    }
                                >
                                    The booking will be updated
                                    automatically.
                                </Text>

                            </View>

                        </View>

                    )}


                    {/* AMOUNTS */}

                    <View
                        style={
                            styles.paymentAmountRow
                        }
                    >

                        <View>

                            <Text
                                style={
                                    styles.paymentLabel
                                }
                            >
                                Booking fee
                            </Text>

                            <Text
                                style={
                                    styles.paymentAmount
                                }
                            >
                                ₹
                                {
                                    booking.bookingFee ??
                                    9
                                }
                            </Text>

                        </View>


                        <View
                            style={
                                styles.remainingBox
                            }
                        >

                            <Text
                                style={
                                    styles.remainingLabel
                                }
                            >
                                Pay at salon
                            </Text>

                            <Text
                                style={
                                    styles.remainingAmount
                                }
                            >
                                ₹
                                {
                                    booking.remainingAmount ??
                                    0
                                }
                            </Text>

                        </View>

                    </View>


                    {/* PAY BUTTON */}

                    {!paymentWindowExpired && (

                        <TouchableOpacity
                            style={
                                styles.payNowButton
                            }
                            activeOpacity={
                                0.85
                            }
                            onPress={
                                onPay
                            }
                        >

                            <Text
                                style={
                                    styles.payNowText
                                }
                            >
                                Pay ₹9 booking fee
                            </Text>


                            <Text
                                style={
                                    styles.payNowArrow
                                }
                            >
                                →
                            </Text>

                        </TouchableOpacity>

                    )}


                    {/* EXPIRED BUTTON */}

                    {paymentWindowExpired && (

                        <View
                            style={
                                styles.expiredButton
                            }
                        >

                            <Text
                                style={
                                    styles.expiredButtonText
                                }
                            >
                                Payment unavailable
                            </Text>

                        </View>

                    )}

                </View>

            )}


            {/* ================================================= */}
            {/* PAYMENT COMPLETED */}
            {/* ================================================= */}

            {salonAccepted &&

                bookingFeeStatus ===
                'PAID' && (

                    <View
                        style={
                            styles.confirmedCard
                        }
                    >

                        <View
                            style={
                                styles.confirmedIcon
                            }
                        >

                            <Text
                                style={
                                    styles.confirmedIconText
                                }
                            >
                                ✓
                            </Text>

                        </View>


                        <View
                            style={
                                styles.confirmedContent
                            }
                        >

                            <Text
                                style={
                                    styles.confirmedTitle
                                }
                            >
                                Booking confirmed
                            </Text>


                            <Text
                                style={
                                    styles.confirmedMessage
                                }
                            >
                                Booking fee received successfully.
                                Remaining ₹
                                {
                                    booking.remainingAmount ??
                                    0
                                }{' '}
                                is payable at the salon.
                            </Text>

                        </View>

                    </View>

                )}


            {/* ================================================= */}
            {/* CANCELLED REFUND INFORMATION */}
            {/* ================================================= */}

            {tab ===
                'Cancelled' &&

                bookingFeeStatus ===
                'REFUNDED' && (

                    <View
                        style={
                            styles.refundCompletedCard
                        }
                    >

                        <View
                            style={
                                styles.refundIcon
                            }
                        >

                            <Text
                                style={
                                    styles.refundIconText
                                }
                            >
                                ✓
                            </Text>

                        </View>


                        <View
                            style={
                                styles.refundContent
                            }
                        >

                            <Text
                                style={
                                    styles.refundTitle
                                }
                            >
                                Booking fee refunded
                            </Text>


                            <Text
                                style={
                                    styles.refundMessage
                                }
                            >
                                Your Clavata booking fee has
                                been refunded according to the
                                applicable cancellation policy.
                            </Text>

                        </View>

                    </View>

                )}


            {/* ================================================= */}
            {/* CANCELLED BUT PAID */}
            {/* ================================================= */}

            {tab ===
                'Cancelled' &&

                bookingFeeStatus !==
                'REFUNDED' &&

                bookingFeeStatus ===
                'PAID' && (

                    <View
                        style={
                            styles.refundPendingCard
                        }
                    >

                        <View
                            style={
                                styles.refundPendingIcon
                            }
                        >

                            <Text
                                style={
                                    styles.refundPendingIconText
                                }
                            >
                                ₹
                            </Text>

                        </View>


                        <View
                            style={
                                styles.refundContent
                            }
                        >

                            <Text
                                style={
                                    styles.refundPendingTitle
                                }
                            >
                                Refund under processing
                            </Text>


                            <Text
                                style={
                                    styles.refundMessage
                                }
                            >
                                Your Clavata booking fee refund
                                is being handled according to
                                the cancellation policy.
                            </Text>

                        </View>

                    </View>

                )}


            {/* ================================================= */}
            {/* EXPIRED HISTORY */}
            {/* ================================================= */}

            {tab ===
                'Expired' &&

                bookingStatus ===
                'EXPIRED' && (

                    <View
                        style={
                            styles.expiredHistoryCard
                        }
                    >

                        <View
                            style={
                                styles.expiredHistoryIcon
                            }
                        >

                            <Text
                                style={
                                    styles.expiredHistoryIconText
                                }
                            >
                                !
                            </Text>

                        </View>


                        <View
                            style={
                                styles.expiredHistoryContent
                            }
                        >

                            <Text
                                style={
                                    styles.expiredHistoryTitle
                            }
                            >
                                {salonUnavailable
                                    ? 'Salon did not respond'
                                    : paymentExpired
                                    ? 'Payment window expired'
                                    : 'Booking expired'}
                            </Text>


                            <Text
                                style={
                                    styles.expiredHistoryText
                                }
                            >
                                {salonUnavailable
                                    ? 'The salon did not respond within the 15-minute booking request window. No booking fee was required.'
                                    : paymentExpired
                                    ? 'The salon accepted your request, but the ₹9 Clavata booking fee was not paid within the 15-minute payment window.'
                                    : 'This booking expired and is no longer active.'}
                            </Text>

                        </View>

                    </View>

                )}


            {/* ================================================= */}
            {/* ACTIONS */}
            {/* ================================================= */}

            {tab ===
            'Upcoming' ? (

                <View
                    style={
                        styles.buttons
                    }
                >

                    <TouchableOpacity
                        style={[
                            styles.cancelButton,

                            isCancelling &&
                            styles.disabledButton,
                        ]}
                        activeOpacity={
                            0.8
                        }
                        onPress={
                            onCancel
                        }
                        disabled={
                            isCancelling
                        }
                    >

                        <Text
                            style={
                                styles.cancelButtonText
                            }
                        >
                            {isCancelling
                                ? 'Cancelling...'
                                : 'Cancel'}
                        </Text>

                    </TouchableOpacity>


                    <TouchableOpacity
                        style={[
                            styles.viewButton,

                            isCancelling &&
                            styles.disabledButtonDark,
                        ]}
                        activeOpacity={
                            0.85
                        }
                        onPress={
                            onView
                        }
                        disabled={
                            isCancelling
                        }
                    >

                        <Text
                            style={
                                styles.viewButtonText
                            }
                        >
                            View booking
                        </Text>


                        <Text
                            style={
                                styles.viewButtonArrow
                            }
                        >
                            →
                        </Text>

                    </TouchableOpacity>

                </View>

            ) : (

                <TouchableOpacity
                    style={
                        styles.bookAgainButton
                    }
                    activeOpacity={
                        0.8
                    }
                    onPress={
                        onBookAgain
                    }
                >

                    <Text
                        style={
                            styles.bookAgainText
                        }
                    >
                        Book again
                    </Text>


                    <Text
                        style={
                            styles.bookAgainArrow
                        }
                    >
                        →
                    </Text>

                </TouchableOpacity>

            )}

        </View>
    );
}


// ============================================================
// STYLES
// ============================================================

const styles =
    StyleSheet.create({

        container: {
            flex: 1,
            backgroundColor:
                COLORS.background,
        },

        scrollContent: {
            paddingHorizontal: 18,
            paddingTop: 18,
            paddingBottom: 40,
        },

        header: {
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: 22,
        },

        title: {
            fontSize: 18,
            fontWeight: '600',
            color: COLORS.text,
            letterSpacing: -0.5,
        },

        subtitle: {
            marginTop: 4,
            fontSize: 13,
            color: COLORS.textSecondary,
        },

        headerIcon: {
            width: 44,
            height: 44,
            borderRadius: 14,
            backgroundColor: COLORS.primary,
            alignItems: 'center',
            justifyContent: 'center',
        },

        headerIconText: {
            color: COLORS.white,
            fontSize: 18,
            fontWeight: '800',
        },

        tabsContainer: {
            flexDirection: 'row',
            backgroundColor: COLORS.surface,
            borderRadius: 13,
            padding: 4,
            borderWidth: 1,
            borderColor: COLORS.border,
            marginBottom: 14,
        },

        tab: {
            flex: 1,
            height: 40,
            alignItems: 'center',
            justifyContent: 'center',
            borderRadius: 10,
            paddingHorizontal: 2,
        },

        activeTab: {
            backgroundColor: COLORS.primary,
        },

        tabText: {
            fontSize: 10,
            fontWeight: '600',
            color: COLORS.textSecondary,
        },

        activeTabText: {
            color: COLORS.white,
            fontWeight: '700',
        },

        resultText: {
            fontSize: 12,
            color: COLORS.textMuted,
            marginBottom: 10,
            marginLeft: 2,
        },

        card: {
            backgroundColor: COLORS.surface,
            borderRadius: 18,
            padding: 15,
            marginBottom: 13,
            borderWidth: 1,
            borderColor: COLORS.border,
            shadowColor: '#000',
            shadowOffset: {
                width: 0,
                height: 2,
            },
            shadowOpacity: 0.04,
            shadowRadius: 8,
            elevation: 2,
        },

        cardHeader: {
            flexDirection: 'row',
            alignItems: 'center',
        },

        salonIcon: {
            width: 48,
            height: 48,
            borderRadius: 14,
            backgroundColor: COLORS.badgeColor,
            alignItems: 'center',
            justifyContent: 'center',
            marginRight: 11,
        },

        salonIconText: {
            fontSize: 17,
            fontWeight: '800',
            color: COLORS.primary,
        },

        salonInfo: {
            flex: 1,
            minWidth: 0,
        },

        salonName: {
            fontSize: 16,
            fontWeight: '700',
            color: COLORS.text,
        },

        serviceCountText: {
            marginTop: 4,
            fontSize: 12,
            lineHeight: 17,
            color: COLORS.textSecondary,
        },

        statusBadge: {
            paddingHorizontal: 8,
            paddingVertical: 5,
            borderRadius: 8,
            borderWidth: 1,
            marginLeft: 8,
            maxWidth: 125,
        },

        statusText: {
            fontSize: 9,
            fontWeight: '700',
            textAlign: 'center',
        },

        servicesContainer: {
            marginTop: 13,
        },

        serviceCard: {
            backgroundColor: '#FAFAFA',
            borderWidth: 1,
            borderColor: COLORS.border,
            borderRadius: 12,
            padding: 11,
            marginBottom: 8,
        },

        serviceTopRow: {
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
        },

        serviceTitleContainer: {
            flex: 1,
            paddingRight: 8,
        },

        serviceName: {
            fontSize: 14,
            fontWeight: '700',
            color: COLORS.text,
        },

        audienceBadge: {
            paddingHorizontal: 8,
            paddingVertical: 4,
            borderRadius: 7,
            backgroundColor: COLORS.badgeColor,
        },

        audienceBadgeText: {
            fontSize: 9,
            fontWeight: '800',
            color: COLORS.primary,
            letterSpacing: 0.4,
        },

        categoryPath: {
            marginTop: 4,
            fontSize: 11,
            color: COLORS.textSecondary,
            fontWeight: '500',
        },

        serviceInfoRow: {
            flexDirection: 'row',
            alignItems: 'center',
            marginTop: 10,
            paddingTop: 9,
            borderTopWidth: 1,
            borderTopColor: COLORS.border,
        },

        serviceInfoItem: {
            flex: 1,
        },

        serviceInfoLabel: {
            fontSize: 8,
            fontWeight: '700',
            color: COLORS.textMuted,
            letterSpacing: 0.5,
            marginBottom: 3,
        },

        serviceInfoValue: {
            fontSize: 13,
            fontWeight: '700',
            color: COLORS.text,
        },

        serviceInfoDivider: {
            width: 1,
            height: 25,
            backgroundColor: COLORS.border,
            marginHorizontal: 12,
        },

        divider: {
            height: 1,
            backgroundColor: COLORS.border,
            marginVertical: 13,
        },

        detailsRow: {
            flexDirection: 'row',
            alignItems: 'center',
        },

        detailItem: {
            flex: 1,
        },

        amountItem: {
            alignItems: 'flex-end',
        },

        detailLabel: {
            fontSize: 9,
            fontWeight: '700',
            color: COLORS.textMuted,
            letterSpacing: 0.5,
            marginBottom: 4,
        },

        detailValue: {
            fontSize: 12,
            fontWeight: '600',
            color: COLORS.text,
        },

        amountValue: {
            fontSize: 14,
            fontWeight: '800',
            color: COLORS.text,
        },

        detailDivider: {
            width: 1,
            height: 27,
            backgroundColor: COLORS.border,
            marginHorizontal: 10,
        },

        // ========================================================
        // WAITING
        // ========================================================

        waitingCard: {
            marginTop: 13,
            backgroundColor: '#FFF8E7',
            borderWidth: 1,
            borderColor: '#F3D38A',
            borderRadius: 13,
            padding: 12,
        },

        waitingHeader: {
            flexDirection: 'row',
            alignItems: 'center',
            marginBottom: 5,
        },

        waitingIndicator: {
            width: 7,
            height: 7,
            borderRadius: 4,
            backgroundColor: '#B07800',
            marginRight: 7,
        },

        waitingTitle: {
            fontSize: 14,
            fontWeight: '700',
            color: '#8A5A00',
        },

        waitingMessage: {
            fontSize: 12,
            lineHeight: 17,
            color: COLORS.textSecondary,
            marginBottom: 12,
        },

        // ========================================================
        // PAYMENT
        // ========================================================

        paymentCard: {
            marginTop: 13,
            backgroundColor: '#FFF8EF',
            borderWidth: 1,
            borderColor: '#F1D2AE',
            borderRadius: 13,
            padding: 12,
        },

        paymentHeader: {
            flexDirection: 'row',
            alignItems: 'center',
            marginBottom: 5,
        },

        paymentIndicator: {
            width: 7,
            height: 7,
            borderRadius: 4,
            backgroundColor: '#B86618',
            marginRight: 7,
        },

        paymentIndicatorExpired: {
            backgroundColor: '#A33A3A',
        },

        paymentTitle: {
            fontSize: 14,
            fontWeight: '700',
            color: '#8B4A10',
        },

        paymentTitleExpired: {
            color: '#A33A3A',
        },

        paymentMessage: {
            fontSize: 12,
            lineHeight: 17,
            color: COLORS.textSecondary,
            marginBottom: 12,
        },

        countdownCard: {
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
            backgroundColor: COLORS.white,
            borderWidth: 1,
            borderColor: '#F1D2AE',
            borderRadius: 11,
            paddingHorizontal: 11,
            paddingVertical: 10,
            marginBottom: 12,
        },

        countdownLabel: {
            fontSize: 9,
            fontWeight: '800',
            color: '#8B4A10',
            letterSpacing: 0.7,
        },

        countdownSubtext: {
            marginTop: 3,
            fontSize: 10,
            color: COLORS.textMuted,
        },

        countdownValue: {
            fontSize: 20,
            fontWeight: '800',
            color: '#8B4A10',
            letterSpacing: 0.5,
        },

        timerUnavailableCard: {
            flexDirection: 'row',
            alignItems: 'center',
            backgroundColor: '#FFFDF9',
            borderWidth: 1,
            borderColor: '#E9D9C6',
            borderRadius: 10,
            padding: 10,
            marginBottom: 12,
        },

        timerUnavailableIcon: {
            width: 27,
            height: 27,
            borderRadius: 14,
            backgroundColor: '#8B4A10',
            alignItems: 'center',
            justifyContent: 'center',
            marginRight: 9,
        },

        timerUnavailableIconText: {
            color: COLORS.white,
            fontSize: 14,
            fontWeight: '800',
        },

        timerUnavailableContent: {
            flex: 1,
        },

        timerUnavailableTitle: {
            fontSize: 12,
            fontWeight: '700',
            color: '#8B4A10',
        },

        timerUnavailableText: {
            marginTop: 2,
            fontSize: 10,
            lineHeight: 15,
            color: COLORS.textSecondary,
        },

        expiredCard: {
            flexDirection: 'row',
            alignItems: 'center',
            backgroundColor: '#FBEFEF',
            borderWidth: 1,
            borderColor: '#EBCACA',
            borderRadius: 10,
            padding: 10,
            marginTop: 13,
            marginBottom: 12,
        },

        expiredIcon: {
            width: 27,
            height: 27,
            borderRadius: 14,
            backgroundColor: '#A33A3A',
            color: COLORS.white,
            textAlign: 'center',
            lineHeight: 27,
            fontSize: 14,
            fontWeight: '800',
            marginRight: 9,
        },

        expiredContent: {
            flex: 1,
        },

        expiredTitle: {
            fontSize: 12,
            fontWeight: '700',
            color: '#A33A3A',
        },

        expiredText: {
            marginTop: 2,
            fontSize: 10,
            color: COLORS.textSecondary,
            lineHeight: 15,
        },

        expiredButton: {
            height: 43,
            borderRadius: 10,
            backgroundColor: '#E5E5E5',
            alignItems: 'center',
            justifyContent: 'center',
        },

        expiredButtonText: {
            fontSize: 13,
            fontWeight: '700',
            color: '#888888',
        },

        paymentAmountRow: {
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: 12,
        },

        paymentLabel: {
            fontSize: 10,
            color: COLORS.textMuted,
            marginBottom: 2,
        },

        paymentAmount: {
            fontSize: 18,
            fontWeight: '800',
            color: COLORS.text,
        },

        remainingBox: {
            alignItems: 'flex-end',
        },

        remainingLabel: {
            fontSize: 10,
            color: COLORS.textMuted,
            marginBottom: 2,
        },

        remainingAmount: {
            fontSize: 14,
            fontWeight: '700',
            color: COLORS.textSecondary,
        },

        payNowButton: {
            height: 46,
            backgroundColor: COLORS.primary,
            borderRadius: 11,
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'center',
            marginTop: 2,
        },

        payNowText: {
            color: COLORS.white,
            fontSize: 13,
            fontWeight: '800',
        },

        payNowArrow: {
            color: COLORS.white,
            fontSize: 18,
            marginLeft: 7,
        },

        // ========================================================
        // CONFIRMED
        // ========================================================

        confirmedCard: {
            marginTop: 13,
            backgroundColor: '#F5F5F5',
            borderWidth: 1,
            borderColor: COLORS.border,
            borderRadius: 13,
            padding: 12,
            flexDirection: 'row',
            alignItems: 'flex-start',
        },

        confirmedIcon: {
            width: 28,
            height: 28,
            borderRadius: 14,
            backgroundColor: COLORS.primary,
            alignItems: 'center',
            justifyContent: 'center',
            marginRight: 9,
        },

        confirmedIconText: {
            color: COLORS.white,
            fontSize: 13,
            fontWeight: '800',
        },

        confirmedContent: {
            flex: 1,
        },

        confirmedTitle: {
            fontSize: 13,
            fontWeight: '700',
            color: COLORS.text,
            marginBottom: 3,
        },

        confirmedMessage: {
            fontSize: 11,
            lineHeight: 16,
            color: COLORS.textSecondary,
        },

        // ========================================================
        // REFUND
        // ========================================================

        refundCompletedCard: {
            marginTop: 13,
            backgroundColor: '#F5F5F5',
            borderWidth: 1,
            borderColor: COLORS.border,
            borderRadius: 13,
            padding: 12,
            flexDirection: 'row',
            alignItems: 'flex-start',
        },

        refundIcon: {
            width: 28,
            height: 28,
            borderRadius: 14,
            backgroundColor: COLORS.primary,
            alignItems: 'center',
            justifyContent: 'center',
            marginRight: 9,
        },

        refundIconText: {
            color: COLORS.white,
            fontSize: 13,
            fontWeight: '800',
        },

        refundPendingCard: {
            marginTop: 13,
            backgroundColor: '#FFF8EF',
            borderWidth: 1,
            borderColor: '#F1D2AE',
            borderRadius: 13,
            padding: 12,
            flexDirection: 'row',
            alignItems: 'flex-start',
        },

        refundPendingIcon: {
            width: 28,
            height: 28,
            borderRadius: 14,
            backgroundColor: '#8B4A10',
            alignItems: 'center',
            justifyContent: 'center',
            marginRight: 9,
        },

        refundPendingIconText: {
            color: COLORS.white,
            fontSize: 12,
            fontWeight: '800',
        },

        refundContent: {
            flex: 1,
        },

        refundTitle: {
            fontSize: 13,
            fontWeight: '700',
            color: COLORS.text,
            marginBottom: 3,
        },

        refundPendingTitle: {
            fontSize: 13,
            fontWeight: '700',
            color: '#8B4A10',
            marginBottom: 3,
        },

        refundMessage: {
            fontSize: 11,
            lineHeight: 16,
            color: COLORS.textSecondary,
        },

        // ========================================================
        // EXPIRED HISTORY
        // ========================================================

        expiredHistoryCard: {
            marginTop: 13,
            backgroundColor: '#FBEFEF',
            borderWidth: 1,
            borderColor: '#EBCACA',
            borderRadius: 13,
            padding: 12,
            flexDirection: 'row',
            alignItems: 'flex-start',
        },

        expiredHistoryIcon: {
            width: 28,
            height: 28,
            borderRadius: 14,
            backgroundColor: '#A33A3A',
            alignItems: 'center',
            justifyContent: 'center',
            marginRight: 9,
        },

        expiredHistoryIconText: {
            color: COLORS.white,
            fontSize: 13,
            fontWeight: '800',
        },

        expiredHistoryContent: {
            flex: 1,
        },

        expiredHistoryTitle: {
            fontSize: 13,
            fontWeight: '700',
            color: '#A33A3A',
            marginBottom: 3,
        },

        expiredHistoryText: {
            fontSize: 11,
            lineHeight: 16,
            color: COLORS.textSecondary,
        },

        // ========================================================
        // BUTTONS
        // ========================================================

        buttons: {
            flexDirection: 'row',
            marginTop: 13,
            gap: 9,
        },

        cancelButton: {
            flex: 0.8,
            height: 42,
            borderRadius: 10,
            borderWidth: 1,
            borderColor: COLORS.borderStrong,
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: COLORS.white,
        },

        cancelButtonText: {
            fontSize: 12,
            fontWeight: '700',
            color: COLORS.textSecondary,
        },

        viewButton: {
            flex: 1.4,
            height: 42,
            borderRadius: 10,
            backgroundColor: COLORS.primary,
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'center',
        },

        viewButtonText: {
            fontSize: 12,
            fontWeight: '700',
            color: COLORS.white,
        },

        viewButtonArrow: {
            fontSize: 16,
            color: COLORS.white,
            marginLeft: 6,
        },

        disabledButton: {
            opacity: 0.55,
        },

        disabledButtonDark: {
            opacity: 0.55,
        },

        bookAgainButton: {
            marginTop: 13,
            height: 42,
            borderRadius: 10,
            borderWidth: 1,
            borderColor: COLORS.primary,
            backgroundColor: COLORS.white,
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'center',
        },

        bookAgainText: {
            fontSize: 12,
            fontWeight: '700',
            color: COLORS.primary,
        },

        bookAgainArrow: {
            marginLeft: 6,
            fontSize: 16,
            color: COLORS.primary,
        },

        // ========================================================
        // EMPTY
        // ========================================================

        emptyContainer: {
            alignItems: 'center',
            justifyContent: 'center',
            paddingVertical: 70,
            paddingHorizontal: 30,
        },

        emptyIcon: {
            width: 68,
            height: 68,
            borderRadius: 22,
            backgroundColor: COLORS.badgeColor,
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: 16,
        },

        emptyIconText: {
            fontSize: 28,
            color: COLORS.primary,
            fontWeight: '700',
        },

        emptyTitle: {
            fontSize: 18,
            fontWeight: '700',
            color: COLORS.text,
        },

        emptyText: {
            marginTop: 7,
            fontSize: 13,
            lineHeight: 19,
            color: COLORS.textSecondary,
            textAlign: 'center',
            maxWidth: 290,
        },

        // ========================================================
        // LOADING
        // ========================================================

        loadingContainer: {
            flex: 1,
            alignItems: 'center',
            justifyContent: 'center',
        },

        loadingCircle: {
            width: 34,
            height: 34,
            borderRadius: 17,
            borderWidth: 3,
            borderColor: COLORS.borderStrong,
            borderTopColor: COLORS.primary,
            marginBottom: 12,
        },

        loadingText: {
            fontSize: 13,
            color: COLORS.textSecondary,
        },

        // ========================================================
        // ERROR
        // ========================================================

        errorContainer: {
            flex: 1,
            alignItems: 'center',
            justifyContent: 'center',
            padding: 30,
        },

        errorIcon: {
            width: 54,
            height: 54,
            borderRadius: 18,
            backgroundColor: COLORS.badgeColor,
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: 14,
        },

        errorIconText: {
            fontSize: 22,
            fontWeight: '800',
            color: '#A33A3A',
        },

        errorTitle: {
            fontSize: 18,
            fontWeight: '700',
            color: COLORS.text,
            marginBottom: 6,
        },

        errorMessage: {
            fontSize: 12,
            lineHeight: 18,
            color: COLORS.textSecondary,
            textAlign: 'center',
        },

        retryButton: {
            marginTop: 18,
            paddingHorizontal: 24,
            height: 42,
            borderRadius: 10,
            backgroundColor: COLORS.primary,
            alignItems: 'center',
            justifyContent: 'center',
        },

        retryText: {
            color: COLORS.white,
            fontSize: 13,
            fontWeight: '700',
        },

        // ========================================================
        // FOOTER
        // ========================================================

        footer: {
            textAlign: 'center',
            marginTop: 10,
            fontSize: 11,
            color: COLORS.textMuted,
            paddingHorizontal: 20,
            lineHeight: 17,
        },

    });