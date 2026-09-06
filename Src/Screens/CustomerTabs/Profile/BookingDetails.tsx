import React, { useMemo, useState } from 'react';

import {
    SafeAreaView,
    ScrollView,
    View,
    Text,
    TouchableOpacity,
    StyleSheet,
    ActivityIndicator,
    Alert,
} from 'react-native';

import {
    useNavigation,
    useRoute,
} from '@react-navigation/native';

import {
    useMutation,
    useQuery,
} from '@apollo/client';

import {
    GET_BOOKING,
    CANCEL_BOOKING,
    REQUEST_REFUND,
} from '../../../graphql/queries';


type BookingDetailsRouteParams = {
    bookingId: string;
};


type CancellationPolicy = {
    percentage: number;
    refundAmount: number;
    clavataAmount: number;
    salonAmount: number;
    title: string;
    description: string;
};


const PRIMARY = '#009D94';


export default function BookingDetails() {

    const navigation = useNavigation<any>();
    const route = useRoute<any>();

    const {
        bookingId,
    } = route.params as BookingDetailsRouteParams;


    const [isCancelling, setIsCancelling] =
        useState(false);


    // ==========================================================
    // GET BOOKING
    // ==========================================================

    const {
        data,
        loading,
        error,
        refetch,
    } = useQuery(GET_BOOKING, {
        variables: {
            bookingId,
        },
        skip: !bookingId,
        fetchPolicy: 'network-only',
    });


    const booking = data?.GetBooking;


    // ==========================================================
    // MUTATIONS
    // ==========================================================

    const [
        cancelBookingMutation,
    ] = useMutation(CANCEL_BOOKING);


    const [
        requestRefundMutation,
    ] = useMutation(REQUEST_REFUND);


    console.log(
        'BookingDetails data:',
        data,
    );


    // ==========================================================
    // HELPERS
    // ==========================================================

    const formatDate = (
        dateString: string,
    ) => {

        if (!dateString) {
            return '';
        }

        const date = new Date(dateString);

        if (Number.isNaN(date.getTime())) {
            return dateString;
        }

        return date.toLocaleDateString(
            'en-IN',
            {
                day: '2-digit',
                month: 'short',
                year: 'numeric',
            },
        );
    };


    const formatTime = (
        time: string,
    ) => {

        if (!time) {
            return '';
        }

        const [
            hoursString,
            minutesString,
        ] = time.split(':');

        let hours = Number(
            hoursString,
        );

        const minutes =
            minutesString || '00';


        if (Number.isNaN(hours)) {
            return time;
        }


        const period =
            hours >= 12
                ? 'PM'
                : 'AM';


        hours =
            hours % 12;


        if (hours === 0) {
            hours = 12;
        }


        return `${String(hours).padStart(
            2,
            '0',
        )}:${minutes} ${period}`;
    };


    const formatCurrency = (
        amount: number,
    ) => {

        return `₹${Number(
            amount || 0,
        ).toLocaleString(
            'en-IN',
            {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
            },
        )}`;
    };


    const getStatusStyle = (
        status: string,
    ) => {

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
                    backgroundColor: '#E0F2FE',
                    color: '#0284C7',
                };

            case 'CANCELLED':
                return {
                    backgroundColor: '#FEE2E2',
                    color: '#DC2626',
                };

            case 'NO_SHOW':
                return {
                    backgroundColor: '#F3F4F6',
                    color: '#6B7280',
                };

            default:
                return {
                    backgroundColor: '#F3F4F6',
                    color: '#6B7280',
                };
        }
    };


    // ==========================================================
    // APPOINTMENT START DATE/TIME
    // ==========================================================

    const getAppointmentStart = (
        bookingData: any,
    ): Date | null => {

        if (
            !bookingData?.bookingDate ||
            !bookingData?.startTime
        ) {
            return null;
        }


        try {

            let year: number;
            let month: number;
            let day: number;


            const bookingDate =
                String(
                    bookingData.bookingDate,
                );


            // --------------------------------------------------
            // Extract YYYY-MM-DD
            // --------------------------------------------------

            const dateMatch =
                bookingDate.match(
                    /^(\d{4})-(\d{2})-(\d{2})/,
                );


            if (dateMatch) {

                year =
                    Number(dateMatch[1]);

                month =
                    Number(dateMatch[2]);

                day =
                    Number(dateMatch[3]);

            } else {

                const parsedDate =
                    new Date(
                        bookingDate,
                    );


                if (
                    Number.isNaN(
                        parsedDate.getTime(),
                    )
                ) {
                    return null;
                }


                year =
                    parsedDate.getFullYear();

                month =
                    parsedDate.getMonth() + 1;

                day =
                    parsedDate.getDate();
            }


            // --------------------------------------------------
            // Extract HH:mm:ss
            // --------------------------------------------------

            const timeParts =
                String(
                    bookingData.startTime,
                ).split(':');


            const hours =
                Number(
                    timeParts[0] || 0,
                );


            const minutes =
                Number(
                    timeParts[1] || 0,
                );


            const seconds =
                Number(
                    timeParts[2] || 0,
                );


            return new Date(
                year,
                month - 1,
                day,
                hours,
                minutes,
                seconds,
                0,
            );

        } catch {

            return null;
        }
    };


    // ==========================================================
    // CANCELLATION POLICY
    // ==========================================================

    const getCancellationPolicy = (
        bookingData: any,
    ): CancellationPolicy => {

        const bookingFee =
            Number(
                bookingData?.bookingFee || 0,
            );


        const appointmentStart =
            getAppointmentStart(
                bookingData,
            );


        let hoursUntilAppointment =
            0;


        if (appointmentStart) {

            const difference =
                appointmentStart.getTime() -
                Date.now();


            hoursUntilAppointment =
                difference /
                (
                    1000 *
                    60 *
                    60
                );
        }


        let percentage = 0;
        let title = '';
        let description = '';


        // ------------------------------------------------------
        // MORE THAN 2 HOURS
        // ------------------------------------------------------

        if (
            hoursUntilAppointment > 2
        ) {

            percentage = 100;

            title =
                '100% Refund';

            description =
                'You are cancelling more than 2 hours before your appointment.';


        // ------------------------------------------------------
        // 1 TO 2 HOURS
        // ------------------------------------------------------

        } else if (
            hoursUntilAppointment >= 1
        ) {

            percentage = 50;

            title =
                '50% Refund';

            description =
                'You are cancelling between 1 and 2 hours before your appointment.';


        // ------------------------------------------------------
        // LESS THAN 1 HOUR
        // ------------------------------------------------------

        } else {

            percentage = 0;

            title =
                'No Refund';

            description =
                'Cancellations less than 1 hour before the appointment are not eligible for a refund.';
        }


        const refundAmount =
            Number(
                (
                    bookingFee *
                    percentage /
                    100
                ).toFixed(2),
            );


        const halfAmount =
            Number(
                (
                    bookingFee *
                    50 /
                    100
                ).toFixed(2),
            );


        let clavataAmount = 0;
        let salonAmount = 0;


        // ------------------------------------------------------
        // >2 HOURS
        // Clavata: 0
        // Salon: 0
        // Customer: 100%
        // ------------------------------------------------------

        if (
            percentage === 100
        ) {

            clavataAmount = 0;
            salonAmount = 0;


        // ------------------------------------------------------
        // 1-2 HOURS
        // Clavata: 50%
        // Salon: 0
        // Customer: 50%
        // ------------------------------------------------------

        } else if (
            percentage === 50
        ) {

            clavataAmount = halfAmount;
            salonAmount = 0;


        // ------------------------------------------------------
        // <1 HOUR
        // Clavata: 50%
        // Salon: 50%
        // Customer: 0%
        // ------------------------------------------------------

        } else {

            clavataAmount = halfAmount;
            salonAmount = halfAmount;
        }


        return {
            percentage,
            refundAmount,
            clavataAmount,
            salonAmount,
            title,
            description,
        };
    };


    // ==========================================================
    // CANCELLATION POLICY
    // ==========================================================

    const cancellationPolicy =
        useMemo(
            () => {

                if (!booking) {

                    return {
                        percentage: 0,
                        refundAmount: 0,
                        clavataAmount: 0,
                        salonAmount: 0,
                        title: 'No Refund',
                        description: '',
                    };
                }


                return getCancellationPolicy(
                    booking,
                );

            },
            [
                booking,
            ],
        );


    // ==========================================================
    // CAN CANCEL?
    // ==========================================================

    const canCancel =
        booking &&
        (
            booking.bookingStatus === 'CONFIRMED' ||
            booking.bookingStatus === 'PENDING'
        );


    // ==========================================================
    // IS ONLINE BOOKING FEE PAID?
    // ==========================================================

    const bookingFeePaid =
        booking?.bookingFeeStatus === 'PAID';


    const isOnlinePayment =
        booking?.paymentMethod === 'ONLINE';


    const refundApplicable =
        bookingFeePaid &&
        isOnlinePayment;


    // ==========================================================
    // CANCEL BOOKING
    // ==========================================================

    const handleCancelBooking = () => {

        if (!booking) {
            return;
        }


        if (!canCancel) {

            Alert.alert(
                'Cannot Cancel',
                'This booking can no longer be cancelled.',
            );

            return;
        }


        const policy =
            getCancellationPolicy(
                booking,
            );


        // ------------------------------------------------------
        // ONLINE PAID BOOKING
        // ------------------------------------------------------

        if (refundApplicable) {

            Alert.alert(
                'Cancellation & Refund Policy',

                `${policy.description}\n\n` +

                `Booking fee: ${formatCurrency(
                    Number(
                        booking.bookingFee || 0,
                    ),
                )}\n` +

                `Your refund: ${formatCurrency(
                    policy.refundAmount,
                )}\n\n` +

                `Clavata: ${formatCurrency(
                    policy.clavataAmount,
                )}\n` +

                `Salon: ${formatCurrency(
                    policy.salonAmount,
                )}\n\n` +

                'Do you want to continue with cancellation?',

                [
                    {
                        text: 'Keep Booking',
                        style: 'cancel',
                    },

                    {
                        text: 'Cancel Booking',
                        style: 'destructive',

                        onPress:
                            () => {
                                performCancellation();
                            },
                    },
                ],
            );

            return;
        }


        // ------------------------------------------------------
        // PAY AT SALON / NO PAID BOOKING FEE
        // ------------------------------------------------------

        Alert.alert(
            'Cancel Booking',

            'You have not made an online booking-fee payment for this booking.\n\n' +
            'Are you sure you want to cancel your appointment?',

            [
                {
                    text: 'Keep Booking',
                    style: 'cancel',
                },

                {
                    text: 'Cancel Booking',
                    style: 'destructive',

                    onPress:
                        () => {
                            performCancellation();
                        },
                },
            ],
        );
    };


    // ==========================================================
    // PERFORM CANCELLATION
    // ==========================================================

    const performCancellation = async () => {

        if (!booking) {
            return;
        }


        setIsCancelling(true);


        try {

            // ==================================================
            // RECALCULATE POLICY
            // ==================================================

            const policy =
                getCancellationPolicy(
                    booking,
                );


            // ==================================================
            // STEP 1: CANCEL BOOKING
            // ==================================================

            const cancelResult =
                await cancelBookingMutation({

                    variables: {
                        bookingId:
                            booking.bookingId,
                    },
                });


            const cancelResponse =
                cancelResult?.data
                    ?.updateBookingStatus;


            if (
                !cancelResponse?.success
            ) {

                throw new Error(
                    cancelResponse?.message ||
                    'Unable to cancel the booking.',
                );
            }


            // ==================================================
            // STEP 2: REQUEST REFUND
            // ==================================================

            let refundResponse:
                any = null;


            if (
                bookingFeePaid &&
                isOnlinePayment
            ) {

                const refundResult =
                    await requestRefundMutation({

                        variables: {

                            input: {

                                bookingId:
                                    booking.bookingId,

                                reason:
                                    'CUSTOMER_CANCELLED',
                            },
                        },
                    });


                refundResponse =
                    refundResult?.data
                        ?.requestRefund;


                if (
                    !refundResponse?.success
                ) {

                    // ------------------------------------------
                    // IMPORTANT:
                    // Booking is already cancelled.
                    // Do NOT tell customer cancellation failed.
                    // ------------------------------------------

                    await refetch();


                    Alert.alert(
                        'Booking Cancelled',

                        'Your booking was cancelled successfully, but we could not create the refund request automatically.\n\n' +
                        'Please contact Clavata support for assistance with your booking-fee refund.',

                        [
                            {
                                text: 'OK',
                            },
                        ],
                    );

                    return;
                }
            }


            // ==================================================
            // REFRESH BOOKING
            // ==================================================

            await refetch();


            // ==================================================
            // SUCCESS MESSAGE
            // ==================================================

            if (
                refundResponse?.success &&
                refundResponse?.refund
            ) {

                const refund =
                    refundResponse.refund;


                const refundAmount =
                    Number(
                        refund.refundAmount ??
                        policy.refundAmount ??
                        0,
                    );


                const refundStatus =
                    refund.status ||
                    'REQUESTED';


                Alert.alert(

                    'Booking Cancelled',

                    'Your booking has been cancelled successfully.\n\n' +

                    `Refund amount: ${formatCurrency(
                        refundAmount,
                    )}\n` +

                    `Refund status: ${refundStatus}`,

                    [
                        {
                            text: 'OK',
                        },
                    ],
                );

            } else {

                Alert.alert(

                    'Booking Cancelled',

                    'Your booking has been cancelled successfully.\n\n' +
                    'No online refund is applicable to this booking.',

                    [
                        {
                            text: 'OK',
                        },
                    ],
                );
            }


        } catch (e: any) {

            console.error(
                'Cancellation error:',
                e,
            );


            Alert.alert(

                'Unable to Cancel',

                e?.message ||
                'Something went wrong while cancelling your booking.',

                [
                    {
                        text: 'OK',
                    },
                ],
            );

        } finally {

            setIsCancelling(false);
        }
    };


    // ==========================================================
    // LOADING
    // ==========================================================

    if (loading) {

        return (
            <SafeAreaView
                style={styles.safeArea}
            >

                <View
                    style={styles.centerContainer}
                >

                    <ActivityIndicator
                        size="large"
                        color={PRIMARY}
                    />

                    <Text
                        style={
                            styles.loadingText
                        }
                    >
                        Loading booking...
                    </Text>

                </View>

            </SafeAreaView>
        );
    }


    // ==========================================================
    // ERROR
    // ==========================================================

    if (error || !booking) {

        return (
            <SafeAreaView
                style={styles.safeArea}
            >

                <View
                    style={styles.centerContainer}
                >

                    <Text
                        style={
                            styles.errorTitle
                        }
                    >
                        Unable to load booking
                    </Text>

                    <Text
                        style={
                            styles.errorText
                        }
                    >
                        {error?.message ||
                            'Booking not found.'}
                    </Text>

                    <TouchableOpacity
                        style={
                            styles.primaryButton
                        }
                        onPress={() =>
                            navigation.goBack()
                        }
                    >

                        <Text
                            style={
                                styles.primaryButtonText
                            }
                        >
                            Go Back
                        </Text>

                    </TouchableOpacity>

                </View>

            </SafeAreaView>
        );
    }


    // ==========================================================
    // STATUS
    // ==========================================================

    const statusStyle =
        getStatusStyle(
            booking.bookingStatus,
        );


    // ==========================================================
    // RENDER
    // ==========================================================

    return (

        <SafeAreaView
            style={styles.safeArea}
        >

            <ScrollView
                contentContainerStyle={
                    styles.scrollContent
                }
                showsVerticalScrollIndicator={
                    false
                }
            >

                {/* ==================================================
                    HEADER
                ================================================== */}

                <View
                    style={styles.header}
                >

                    <TouchableOpacity
                        onPress={() =>
                            navigation.goBack()
                        }
                        style={
                            styles.backButton
                        }
                    >

                        <Text
                            style={
                                styles.backButtonText
                            }
                        >
                            ‹
                        </Text>

                    </TouchableOpacity>


                    <Text
                        style={
                            styles.headerTitle
                        }
                    >
                        Booking Details
                    </Text>

                    <View
                        style={
                            styles.headerSpacer
                        }
                    />

                </View>


                {/* ==================================================
                    STATUS CARD
                ================================================== */}

                <View
                    style={styles.statusCard}
                >

                    <View>

                        <Text
                            style={
                                styles.bookingIdLabel
                            }
                        >
                            Booking ID
                        </Text>

                        <Text
                            style={
                                styles.bookingId
                            }
                        >
                            {booking.bookingId}
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
                            {booking.bookingStatus}
                        </Text>

                    </View>

                </View>


                {/* ==================================================
                    SALON
                ================================================== */}

                <View
                    style={styles.card}
                >

                    <Text
                        style={
                            styles.sectionTitle
                        }
                    >
                        Salon
                    </Text>

                    <Text
                        style={
                            styles.salonName
                        }
                    >
                        {booking.salonName ||
                            'Salon'}
                    </Text>

                </View>


                {/* ==================================================
                    APPOINTMENT
                ================================================== */}

                <View
                    style={styles.card}
                >

                    <Text
                        style={
                            styles.sectionTitle
                        }
                    >
                        Appointment
                    </Text>


                    <View
                        style={
                            styles.infoRow
                        }
                    >

                        <Text
                            style={
                                styles.infoLabel
                            }
                        >
                            Date
                        </Text>

                        <Text
                            style={
                                styles.infoValue
                            }
                        >
                            {formatDate(
                                booking.bookingDate,
                            )}
                        </Text>

                    </View>


                    <View
                        style={
                            styles.infoRow
                        }
                    >

                        <Text
                            style={
                                styles.infoLabel
                            }
                        >
                            Time
                        </Text>

                        <Text
                            style={
                                styles.infoValue
                            }
                        >
                            {formatTime(
                                booking.startTime,
                            )}
                            {' - '}
                            {formatTime(
                                booking.endTime,
                            )}
                        </Text>

                    </View>


                    {booking.staffName ? (

                        <View
                            style={
                                styles.infoRow
                            }
                        >

                            <Text
                                style={
                                    styles.infoLabel
                                }
                            >
                                Staff
                            </Text>

                            <Text
                                style={
                                    styles.infoValue
                                }
                            >
                                {booking.staffName}
                            </Text>

                        </View>

                    ) : null}

                </View>


                {/* ==================================================
                    SERVICES
                ================================================== */}

                <View
                    style={styles.card}
                >

                    <Text
                        style={
                            styles.sectionTitle
                        }
                    >
                        Services
                    </Text>


                    {booking.services?.map(
                        (
                            service: any,
                            index: number,
                        ) => (

                            <View
                                key={
                                    service.serviceId ||
                                    index
                                }
                                style={
                                    styles.serviceRow
                                }
                            >

                                <View
                                    style={
                                        styles.serviceInfo
                                    }
                                >

                                    <Text
                                        style={
                                            styles.serviceName
                                        }
                                    >
                                        {service.name}
                                    </Text>

                                    {service.duration ? (

                                        <Text
                                            style={
                                                styles.serviceDuration
                                            }
                                        >
                                            {service.duration}{' '}
                                            min
                                        </Text>

                                    ) : null}

                                </View>


                                <Text
                                    style={
                                        styles.servicePrice
                                    }
                                >
                                    {formatCurrency(
                                        Number(
                                            service.price ||
                                            0,
                                        ),
                                    )}
                                </Text>

                            </View>

                        ),
                    )}

                </View>


                {/* ==================================================
                    PAYMENT
                ================================================== */}

                <View
                    style={styles.card}
                >

                    <Text
                        style={
                            styles.sectionTitle
                        }
                    >
                        Payment Details
                    </Text>


                    <View
                        style={
                            styles.infoRow
                        }
                    >

                        <Text
                            style={
                                styles.infoLabel
                            }
                        >
                            Subtotal
                        </Text>

                        <Text
                            style={
                                styles.infoValue
                            }
                        >
                            {formatCurrency(
                                Number(
                                    booking.subtotal ||
                                    0,
                                ),
                            )}
                        </Text>

                    </View>


                    <View
                        style={
                            styles.infoRow
                        }
                    >

                        <Text
                            style={
                                styles.infoLabel
                            }
                        >
                            Discount
                        </Text>

                        <Text
                            style={
                                styles.infoValue
                            }
                        >
                            -{formatCurrency(
                                Number(
                                    booking.discount ||
                                    0,
                                ),
                            )}
                        </Text>

                    </View>


                    <View
                        style={[
                            styles.infoRow,
                            styles.totalRow,
                        ]}
                    >

                        <Text
                            style={
                                styles.totalLabel
                            }
                        >
                            Total
                        </Text>

                        <Text
                            style={
                                styles.totalValue
                            }
                        >
                            {formatCurrency(
                                Number(
                                    booking.totalAmount ||
                                    0,
                                ),
                            )}
                        </Text>

                    </View>


                    <View
                        style={
                            styles.infoRow
                        }
                    >

                        <Text
                            style={
                                styles.infoLabel
                            }
                        >
                            Booking Fee
                        </Text>

                        <Text
                            style={
                                styles.infoValue
                            }
                        >
                            {formatCurrency(
                                Number(
                                    booking.bookingFee ||
                                    0,
                                ),
                            )}
                        </Text>

                    </View>


                    {booking.bookingStatus !==
                        'COMPLETED' &&
                    Number(
                        booking.remainingAmount ||
                        0,
                    ) > 0 ? (

                        <View
                            style={
                                styles.infoRow
                            }
                        >

                            <Text
                                style={
                                    styles.infoLabel
                                }
                            >
                                Pay at Salon
                            </Text>

                            <Text
                                style={
                                    styles.infoValue
                                }
                            >
                                {formatCurrency(
                                    Number(
                                        booking.remainingAmount ||
                                        0,
                                    ),
                                )}
                            </Text>

                        </View>

                    ) : null}


                    <View
                        style={
                            styles.infoRow
                        }
                    >

                        <Text
                            style={
                                styles.infoLabel
                            }
                        >
                            Payment Method
                        </Text>

                        <Text
                            style={
                                styles.infoValue
                            }
                        >
                            {booking.paymentMethod ||
                                '-'}
                        </Text>

                    </View>


                    <View
                        style={
                            styles.infoRow
                        }
                    >

                        <Text
                            style={
                                styles.infoLabel
                            }
                        >
                            Payment Status
                        </Text>

                        <Text
                            style={
                                styles.infoValue
                            }
                        >
                            {booking.paymentStatus ||
                                '-'}
                        </Text>

                    </View>

                </View>


                {/* ==================================================
                    CANCELLATION / REFUND POLICY
                ================================================== */}

                {canCancel ? (

                    <View
                        style={
                            styles.refundCard
                        }
                    >

                        <Text
                            style={
                                styles.sectionTitle
                            }
                        >
                            Cancellation & Refund
                        </Text>


                        {refundApplicable ? (

                            <>

                                <View
                                    style={
                                        styles.refundHighlight
                                    }
                                >

                                    <Text
                                        style={
                                            styles.refundTitle
                                        }
                                    >
                                        {cancellationPolicy.title}
                                    </Text>

                                    <Text
                                        style={
                                            styles.refundAmount
                                        }
                                    >
                                        {formatCurrency(
                                            cancellationPolicy.refundAmount,
                                        )}
                                    </Text>

                                </View>


                                <Text
                                    style={
                                        styles.refundDescription
                                    }
                                >
                                    {cancellationPolicy.description}
                                </Text>


                                <View
                                    style={
                                        styles.policyRow
                                    }
                                >

                                    <Text
                                        style={
                                            styles.policyLabel
                                        }
                                    >
                                        Booking fee
                                    </Text>

                                    <Text
                                        style={
                                            styles.policyValue
                                        }
                                    >
                                        {formatCurrency(
                                            Number(
                                                booking.bookingFee ||
                                                0,
                                            ),
                                        )}
                                    </Text>

                                </View>


                                <View
                                    style={
                                        styles.policyRow
                                    }
                                >

                                    <Text
                                        style={
                                            styles.policyLabel
                                        }
                                    >
                                        You receive
                                    </Text>

                                    <Text
                                        style={
                                            styles.policyRefundValue
                                        }
                                    >
                                        {formatCurrency(
                                            cancellationPolicy.refundAmount,
                                        )}
                                    </Text>

                                </View>


                                <Text
                                    style={
                                        styles.policyNote
                                    }
                                >
                                    Refunds are processed according to
                                    the cancellation policy after your
                                    cancellation request is submitted.
                                </Text>

                            </>

                        ) : (

                            <Text
                                style={
                                    styles.refundDescription
                                }
                            >
                                This booking has no online booking-fee
                                payment, so no online refund is applicable.
                            </Text>

                        )}

                    </View>

                ) : null}


                {/* ==================================================
                    NOTES
                ================================================== */}

                {booking.notes ? (

                    <View
                        style={styles.card}
                    >

                        <Text
                            style={
                                styles.sectionTitle
                            }
                        >
                            Notes
                        </Text>

                        <Text
                            style={
                                styles.notesText
                            }
                        >
                            {booking.notes}
                        </Text>

                    </View>

                ) : null}


                {/* ==================================================
                    SALON NOTE
                ================================================== */}

                {booking.salonNote ? (

                    <View
                        style={styles.card}
                    >

                        <Text
                            style={
                                styles.sectionTitle
                            }
                        >
                            Salon Note
                        </Text>

                        <Text
                            style={
                                styles.notesText
                            }
                        >
                            {booking.salonNote}
                        </Text>

                    </View>

                ) : null}


                {/* ==================================================
                    CANCEL BUTTON
                ================================================== */}

                {canCancel ? (

                    <TouchableOpacity
                        style={[
                            styles.cancelButton,
                            isCancelling &&
                                styles.disabledButton,
                        ]}
                        disabled={
                            isCancelling
                        }
                        onPress={
                            handleCancelBooking
                        }
                    >

                        {isCancelling ? (

                            <ActivityIndicator
                                color="#FFFFFF"
                            />

                        ) : (

                            <Text
                                style={
                                    styles.cancelButtonText
                                }
                            >
                                Cancel Booking
                            </Text>

                        )}

                    </TouchableOpacity>

                ) : null}


                {/* ==================================================
                    REVIEW BUTTON
                ================================================== */}

                {booking.bookingStatus ===
                    'COMPLETED' &&
                !booking.reviewSubmitted ? (

                    <TouchableOpacity
                        style={
                            styles.reviewButton
                        }
                        onPress={() => {

                            navigation.navigate(
                                'ReviewBooking',
                                {
                                    bookingId:
                                        booking.bookingId,
                                    booking,
                                },
                            );

                        }}
                    >

                        <Text
                            style={
                                styles.reviewButtonText
                            }
                        >
                            Write a Review
                        </Text>

                    </TouchableOpacity>

                ) : null}


                {/* ==================================================
                    EXISTING REVIEW
                ================================================== */}

                {booking.reviewSubmitted ? (

                    <View
                        style={styles.card}
                    >

                        <Text
                            style={
                                styles.sectionTitle
                            }
                        >
                            Your Review
                        </Text>


                        {booking.rating ? (

                            <Text
                                style={
                                    styles.ratingText
                                }
                            >
                                {'★'.repeat(
                                    Number(
                                        booking.rating,
                                    ),
                                )}
                            </Text>

                        ) : null}


                        {booking.review ? (

                            <Text
                                style={
                                    styles.reviewText
                                }
                            >
                                {booking.review}
                            </Text>

                        ) : null}

                    </View>

                ) : null}


                <View
                    style={{
                        height: 30,
                    }}
                />

            </ScrollView>

        </SafeAreaView>
    );
}


// ================================================================
// STYLES
// ================================================================

const styles = StyleSheet.create({

    safeArea: {
        flex: 1,
        backgroundColor: '#F8FAFC',
    },


    scrollContent: {
        padding: 16,
    },


    centerContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 24,
    },


    loadingText: {
        marginTop: 12,
        fontSize: 14,
        color: '#64748B',
    },


    errorTitle: {
        fontSize: 20,
        fontWeight: '700',
        color: '#111827',
        marginBottom: 8,
    },


    errorText: {
        fontSize: 14,
        color: '#64748B',
        textAlign: 'center',
        marginBottom: 20,
    },


    header: {
        height: 52,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: 12,
    },


    backButton: {
        width: 42,
        height: 42,
        borderRadius: 21,
        backgroundColor: '#FFFFFF',
        alignItems: 'center',
        justifyContent: 'center',
    },


    backButtonText: {
        fontSize: 34,
        lineHeight: 38,
        color: '#111827',
        marginTop: -3,
    },


    headerTitle: {
        fontSize: 20,
        fontWeight: '700',
        color: '#111827',
    },


    headerSpacer: {
        width: 42,
    },


    statusCard: {
        backgroundColor: '#FFFFFF',
        borderRadius: 16,
        padding: 16,
        marginBottom: 12,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },


    bookingIdLabel: {
        fontSize: 12,
        color: '#94A3B8',
        marginBottom: 4,
    },


    bookingId: {
        fontSize: 14,
        fontWeight: '600',
        color: '#334155',
    },


    statusBadge: {
        borderRadius: 20,
        paddingHorizontal: 12,
        paddingVertical: 7,
    },


    statusText: {
        fontSize: 12,
        fontWeight: '700',
    },


    card: {
        backgroundColor: '#FFFFFF',
        borderRadius: 16,
        padding: 16,
        marginBottom: 12,
    },


    sectionTitle: {
        fontSize: 16,
        fontWeight: '700',
        color: '#111827',
        marginBottom: 14,
    },


    salonName: {
        fontSize: 17,
        fontWeight: '600',
        color: '#1E293B',
    },


    infoRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 7,
    },


    infoLabel: {
        fontSize: 14,
        color: '#64748B',
        flex: 1,
    },


    infoValue: {
        fontSize: 14,
        fontWeight: '500',
        color: '#1E293B',
        textAlign: 'right',
        flex: 1,
    },


    totalRow: {
        borderTopWidth: 1,
        borderTopColor: '#E2E8F0',
        marginTop: 6,
        paddingTop: 12,
    },


    totalLabel: {
        fontSize: 15,
        fontWeight: '700',
        color: '#111827',
    },


    totalValue: {
        fontSize: 16,
        fontWeight: '700',
        color: PRIMARY,
    },


    serviceRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 9,
        borderBottomWidth: 1,
        borderBottomColor: '#F1F5F9',
    },


    serviceInfo: {
        flex: 1,
    },


    serviceName: {
        fontSize: 14,
        fontWeight: '600',
        color: '#1E293B',
    },


    serviceDuration: {
        fontSize: 12,
        color: '#94A3B8',
        marginTop: 3,
    },


    servicePrice: {
        fontSize: 14,
        fontWeight: '600',
        color: '#1E293B',
    },


    // ============================================================
    // REFUND CARD
    // ============================================================

    refundCard: {
        backgroundColor: '#FFFFFF',
        borderRadius: 16,
        padding: 16,
        marginBottom: 12,
        borderWidth: 1,
        borderColor: '#DDEFEF',
    },


    refundHighlight: {
        backgroundColor: '#F0FDFA',
        borderRadius: 12,
        padding: 14,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: 12,
    },


    refundTitle: {
        fontSize: 14,
        fontWeight: '700',
        color: '#0F766E',
    },


    refundAmount: {
        fontSize: 20,
        fontWeight: '800',
        color: PRIMARY,
    },


    refundDescription: {
        fontSize: 13,
        lineHeight: 20,
        color: '#64748B',
        marginBottom: 12,
    },


    policyRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingVertical: 6,
    },


    policyLabel: {
        fontSize: 13,
        color: '#64748B',
    },


    policyValue: {
        fontSize: 13,
        fontWeight: '600',
        color: '#334155',
    },


    policyRefundValue: {
        fontSize: 13,
        fontWeight: '700',
        color: PRIMARY,
    },


    policyNote: {
        fontSize: 11,
        lineHeight: 17,
        color: '#94A3B8',
        marginTop: 8,
    },


    notesText: {
        fontSize: 14,
        lineHeight: 21,
        color: '#475569',
    },


    // ============================================================
    // BUTTONS
    // ============================================================

    primaryButton: {
        backgroundColor: PRIMARY,
        borderRadius: 12,
        paddingHorizontal: 24,
        paddingVertical: 13,
    },


    primaryButtonText: {
        color: '#FFFFFF',
        fontSize: 14,
        fontWeight: '700',
    },


    cancelButton: {
        backgroundColor: '#DC2626',
        borderRadius: 14,
        height: 52,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 12,
    },


    cancelButtonText: {
        color: '#FFFFFF',
        fontSize: 15,
        fontWeight: '700',
    },


    disabledButton: {
        opacity: 0.6,
    },


    reviewButton: {
        backgroundColor: PRIMARY,
        borderRadius: 14,
        height: 52,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 12,
    },


    reviewButtonText: {
        color: '#FFFFFF',
        fontSize: 15,
        fontWeight: '700',
    },


    ratingText: {
        fontSize: 22,
        color: '#F59E0B',
        marginBottom: 8,
    },


    reviewText: {
        fontSize: 14,
        lineHeight: 21,
        color: '#475569',
    },

});