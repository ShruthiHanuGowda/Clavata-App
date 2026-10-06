import React, { useMemo, useState } from 'react';
import {
    SafeAreaView,
    View,
    Text,
    TouchableOpacity,
    FlatList,
    StyleSheet,
    TextInput,
    Alert,
} from 'react-native';
import { useMutation } from '@apollo/client';
import { CREATE_BOOKING } from '../../../graphql/queries';

const PRIMARY = '#009D94';

const BOOKING_FEE = 9;

type Service = {
    serviceId: string;
    salonId?: string;
    name: string;
    category?: string;
    description?: string;
    duration: number;
    price: number;
    gender?: string;
    popular?: boolean;
    active?: boolean;
};

type Offer = {
    offerId: string;
    salonId: string;
    salonName?: string;
    title: string;
    description?: string;
    discountType: 'PERCENTAGE' | 'FIXED' | string;
    discountValue: number;
    couponCode?: string | null;
    minimumBookingAmount?: number | null;
    category?: string | null;
    serviceIds: string[];
    startDate?: string;
    endDate?: string;
    status?: string;
};

export default function BookingSummaryScreen({
    navigation,
    route,
}: any) {
    const {
        salonId,
        salon,
        customerUserId,
        services = [],
        date,
        time,
        offer,

        /*
        These values are passed from BookingDateTimeScreen.

        We still recalculate the pricing here instead of
        blindly trusting values from the previous screen.
        */
        offerId: routeOfferId,
    } = route.params || {};

    console.log(
        '====================================================',
    );

    console.log(
        '[BookingSummary] PARAMS:',
        route?.params,
    );

    console.log(
        '[BookingSummary] DATE:',
        date,
    );

    console.log(
        '[BookingSummary] TIME:',
        time,
    );

    console.log(
        '[BookingSummary] OFFER:',
        offer,
    );

    console.log(
        '====================================================',
    );

    const [createBooking, { loading }] =
        useMutation(CREATE_BOOKING);

    const [couponCode, setCouponCode] =
        useState(
            offer?.couponCode ||
            offer?.code ||
            '',
        );

    /*
    ================================================================
    NORMALIZE OFFER
    ================================================================
    */

    const normalizedOffer: Offer | null =
        useMemo(() => {
            if (!offer) {
                return null;
            }

            return {
                ...offer,

                discountValue: Number(
                    offer.discountValue || 0,
                ),

                minimumBookingAmount:
                    offer.minimumBookingAmount !==
                        null &&
                    offer.minimumBookingAmount !==
                        undefined
                        ? Number(
                            offer.minimumBookingAmount,
                        )
                        : null,

                serviceIds:
                    Array.isArray(
                        offer.serviceIds,
                    )
                        ? offer.serviceIds
                        : [],
            };
        }, [offer]);

    /*
    ================================================================
    OFFER VALIDATION
    ================================================================
    */

    const isOfferValid = useMemo(() => {
        if (!normalizedOffer) {
            return false;
        }

        /*
        If status exists, it must be ACTIVE.
        */
        if (
            normalizedOffer.status &&
            normalizedOffer.status !==
                'ACTIVE'
        ) {
            return false;
        }

        const now = new Date();

        /*
        Start date
        */
        if (
            normalizedOffer.startDate
        ) {
            const startDate =
                new Date(
                    normalizedOffer.startDate,
                );

            if (
                !Number.isNaN(
                    startDate.getTime(),
                ) &&
                now < startDate
            ) {
                return false;
            }
        }

        /*
        End date
        */
        if (
            normalizedOffer.endDate
        ) {
            const endDate =
                new Date(
                    normalizedOffer.endDate,
                );

            if (
                !Number.isNaN(
                    endDate.getTime(),
                ) &&
                now > endDate
            ) {
                return false;
            }
        }

        return true;
    }, [normalizedOffer]);

    /*
    ================================================================
    SERVICE ELIGIBILITY
    ================================================================
    */

    const isServiceEligibleForOffer = (
        service: Service,
    ) => {
        if (
            !normalizedOffer ||
            !isOfferValid
        ) {
            return false;
        }

        const serviceIds =
            normalizedOffer.serviceIds ||
            [];

        /*
        If specific service IDs exist,
        only those services are eligible.
        */
        if (
            serviceIds.length > 0
        ) {
            return serviceIds.includes(
                service.serviceId,
            );
        }

        /*
        Otherwise use category if supplied.
        */
        if (
            normalizedOffer.category &&
            normalizedOffer.category.trim()
        ) {
            return (
                String(
                    service.category || '',
                )
                    .trim()
                    .toLowerCase() ===
                String(
                    normalizedOffer.category,
                )
                    .trim()
                    .toLowerCase()
            );
        }

        /*
        No service IDs and no category:
        offer applies to all selected services.
        */
        return true;
    };

    /*
    ================================================================
    SUBTOTAL
    ================================================================
    */

    const subtotal = useMemo(() => {
        return services.reduce(
            (
                sum: number,
                item: Service,
            ) =>
                sum +
                Number(
                    item.price || 0,
                ),
            0,
        );
    }, [services]);

    /*
    ================================================================
    ELIGIBLE SUBTOTAL
    ================================================================
    */

    const eligibleSubtotal =
        useMemo(() => {
            return services.reduce(
                (
                    sum: number,
                    item: Service,
                ) => {
                    if (
                        !isServiceEligibleForOffer(
                            item,
                        )
                    ) {
                        return sum;
                    }

                    return (
                        sum +
                        Number(
                            item.price || 0,
                        )
                    );
                },
                0,
            );
        }, [
            services,
            normalizedOffer,
            isOfferValid,
        ]);

    /*
    ================================================================
    MINIMUM BOOKING AMOUNT
    ================================================================
    */

    const minimumBookingAmountMet =
        useMemo(() => {
            if (
                !normalizedOffer ||
                normalizedOffer.minimumBookingAmount ===
                    null ||
                normalizedOffer.minimumBookingAmount ===
                    undefined
            ) {
                return true;
            }

            return (
                subtotal >=
                Number(
                    normalizedOffer.minimumBookingAmount,
                )
            );
        }, [
            normalizedOffer,
            subtotal,
        ]);

    /*
    ================================================================
    DISCOUNT
    ================================================================
    */

    const discountAmount =
        useMemo(() => {
            if (
                !normalizedOffer ||
                !isOfferValid ||
                !minimumBookingAmountMet ||
                eligibleSubtotal <= 0
            ) {
                return 0;
            }

            const discountValue =
                Number(
                    normalizedOffer.discountValue ||
                        0,
                );

            if (
                discountValue <= 0
            ) {
                return 0;
            }

            /*
            PERCENTAGE
            */
            if (
                String(
                    normalizedOffer.discountType,
                ).toUpperCase() ===
                'PERCENTAGE'
            ) {
                return Math.min(
                    eligibleSubtotal,
                    (
                        eligibleSubtotal *
                        discountValue
                    ) / 100,
                );
            }

            /*
            FIXED
            */
            if (
                String(
                    normalizedOffer.discountType,
                ).toUpperCase() ===
                'FIXED'
            ) {
                return Math.min(
                    eligibleSubtotal,
                    discountValue,
                );
            }

            return 0;
        }, [
            normalizedOffer,
            isOfferValid,
            minimumBookingAmountMet,
            eligibleSubtotal,
        ]);

    /*
    ================================================================
    FINAL SERVICE TOTAL
    ================================================================

    This is the amount that will be paid at the salon
    AFTER the salon accepts the booking and the booking
    fee is paid.

    The ₹9 booking fee is NOT added here.
    */

    const discountedServicesTotal =
        useMemo(() => {
            return Math.max(
                0,
                subtotal -
                    discountAmount,
            );
        }, [
            subtotal,
            discountAmount,
        ]);

    /*
    ================================================================
    DURATION
    ================================================================
    */

    const duration = useMemo(() => {
        return services.reduce(
            (
                sum: number,
                item: Service,
            ) =>
                sum +
                Number(
                    item.duration || 0,
                ),
            0,
        );
    }, [services]);

    /*
    ================================================================
    OFFER APPLIED
    ================================================================
    */

    const offerApplied =
        Boolean(
            normalizedOffer &&
            isOfferValid &&
            minimumBookingAmountMet &&
            discountAmount > 0,
        );

    /*
    ================================================================
    INDIVIDUAL SERVICE DISPLAY PRICE
    ================================================================
    */

    const getServiceDisplayPrice = (
        service: Service,
    ) => {
        const originalPrice =
            Number(
                service.price || 0,
            );

        if (
            !offerApplied ||
            !isServiceEligibleForOffer(
                service,
            )
        ) {
            return originalPrice;
        }

        const discountType =
            String(
                normalizedOffer?.discountType ||
                    '',
            ).toUpperCase();

        /*
        Percentage offer
        */
        if (
            discountType ===
            'PERCENTAGE'
        ) {
            const percentage =
                Number(
                    normalizedOffer
                        ?.discountValue ||
                        0,
                );

            const serviceDiscount =
                (
                    originalPrice *
                    percentage
                ) / 100;

            return Math.max(
                0,
                originalPrice -
                    serviceDiscount,
            );
        }

        /*
        Fixed offer

        Distribute the fixed discount proportionally
        across eligible services for display.
        */
        if (
            discountType === 'FIXED' &&
            eligibleSubtotal > 0
        ) {
            const serviceShare =
                originalPrice /
                eligibleSubtotal;

            const allocatedDiscount =
                discountAmount *
                serviceShare;

            return Math.max(
                0,
                originalPrice -
                    allocatedDiscount,
            );
        }

        return originalPrice;
    };

    /*
    ================================================================
    OFFER TEXT
    ================================================================
    */

    const getOfferDiscountText =
        () => {
            if (!normalizedOffer) {
                return null;
            }

            if (
                String(
                    normalizedOffer.discountType,
                ).toUpperCase() ===
                'PERCENTAGE'
            ) {
                return `${normalizedOffer.discountValue}% OFF`;
            }

            if (
                String(
                    normalizedOffer.discountType,
                ).toUpperCase() ===
                'FIXED'
            ) {
                return `₹${normalizedOffer.discountValue} OFF`;
            }

            return 'Offer Applied';
        };

    /*
    ================================================================
    OFFER MESSAGE
    ================================================================
    */

    const offerMessage =
        useMemo(() => {
            if (!normalizedOffer) {
                return null;
            }

            if (!isOfferValid) {
                return 'This offer is no longer active.';
            }

            if (
                !minimumBookingAmountMet &&
                normalizedOffer.minimumBookingAmount !==
                    null &&
                normalizedOffer.minimumBookingAmount !==
                    undefined
            ) {
                const remaining =
                    Math.max(
                        0,
                        Number(
                            normalizedOffer.minimumBookingAmount,
                        ) -
                            subtotal,
                    );

                return `Add ₹${remaining.toFixed(
                    0,
                )} more to use this offer.`;
            }

            if (offerApplied) {
                return `You save ₹${discountAmount.toFixed(
                    0,
                )} with this offer.`;
            }

            return null;
        }, [
            normalizedOffer,
            isOfferValid,
            minimumBookingAmountMet,
            subtotal,
            offerApplied,
            discountAmount,
        ]);

    /*
    ================================================================
    CREATE BOOKING REQUEST
    ================================================================

    IMPORTANT FLOW:

    1. Customer reviews booking.
    2. Customer presses "Request Booking".
    3. Booking request is created.
    4. Salon receives the request.
    5. Salon accepts/rejects.
    6. ONLY AFTER SALON ACCEPTS:
       customer pays ₹9 booking fee.
    7. Remaining service amount is paid directly at salon.

    Therefore:
    - NO payment happens here.
    - NO Razorpay/Cashfree is opened here.
    - NO ₹9 is charged here.
    */

    const requestBooking =
        async () => {
            try {
                if (
                    !salonId
                ) {
                    Alert.alert(
                        'Unable to continue',
                        'Salon information is missing.',
                    );

                    return;
                }

                if (
                    !customerUserId
                ) {
                    Alert.alert(
                        'Unable to continue',
                        'Customer information is missing.',
                    );

                    return;
                }

                if (
                    !date?.date
                ) {
                    Alert.alert(
                        'Invalid date',
                        'Please select a valid appointment date.',
                    );

                    return;
                }

                if (
                    !time
                ) {
                    Alert.alert(
                        'Select time',
                        'Please select an appointment time.',
                    );

                    return;
                }

                if (
                    !services ||
                    services.length === 0
                ) {
                    Alert.alert(
                        'No services selected',
                        'Please select at least one service.',
                    );

                    return;
                }

                /*
                ------------------------------------------------
                BOOKING DATE
                ------------------------------------------------
                */

                const bookingDate =
                    date.date
                        .toISOString()
                        .split('T')[0];

                /*
                ------------------------------------------------
                FINAL OFFER ID
                ------------------------------------------------
                */

                const finalOfferId =
                    normalizedOffer
                        ?.offerId ||
                    routeOfferId ||
                    offer?.id;

                /*
                ------------------------------------------------
                CREATE BOOKING REQUEST
                ------------------------------------------------

                We deliberately use PAY_AT_SALON.

                This does NOT mean the customer is paying
                at the salon right now.

                It means the service amount is due at the
                salon after the booking is accepted.

                The separate ₹9 Clavata booking fee will
                only be requested after salon acceptance.
                */

                const response =
                    await createBooking({
                        variables: {
                            input: {
                                salonId,

                                customerUserId,

                                bookingDate,

                                /*
                                Convert displayed time
                                such as "10:30 AM" to
                                backend format "10:30".
                                */
                                startTime:
                                    (() => {
                                        const [clock, period] =
                                            time.split(
                                                ' ',
                                            );

                                        let [
                                            hour,
                                            minute,
                                        ] =
                                            clock.split(
                                                ':',
                                            );

                                        let h =
                                            parseInt(
                                                hour,
                                                10,
                                            );

                                        if (
                                            period ===
                                                'PM' &&
                                            h !==
                                                12
                                        ) {
                                            h +=
                                                12;
                                        }

                                        if (
                                            period ===
                                                'AM' &&
                                            h ===
                                                12
                                        ) {
                                            h = 0;
                                        }

                                        return `${String(
                                            h,
                                        ).padStart(
                                            2,
                                            '0',
                                        )}:${minute}`;
                                    })(),

                                /*
                                ------------------------------------------------
                                PAYMENT METHOD
                                ------------------------------------------------

                                Service amount is paid at salon.

                                ₹9 booking fee is NOT collected
                                at this stage.
                                */
                                paymentMethod:
                                    'PAY_AT_SALON',

                                services:
                                    services.map(
                                        (
                                            service: Service,
                                        ) => ({
                                            serviceId:
                                                service.serviceId,
                                        }),
                                    ),

                                notes: '',

                                /*
                                OFFER

                                Normal booking:
                                    no offerId

                                Offer booking:
                                    offerId is sent.
                                */
                                ...(finalOfferId
                                    ? {
                                        offerId:
                                            finalOfferId,
                                    }
                                    : {}),
                            },
                        },
                    });

                console.log(
                    '[BookingSummary] CREATE BOOKING RESPONSE:',
                    response.data,
                );

                /*
                ========================================================
                SUCCESS
                ========================================================
                */

                if (
                    response.data
                        ?.createBooking
                        ?.success
                ) {
                    const booking =
                        response.data
                            ?.createBooking
                            ?.booking;

                    /*
                    IMPORTANT:

                    We are NOT taking payment here.

                    BookingRequestSent should tell the customer:

                    "Request sent to salon"

                    and then wait for salon acceptance.
                    */

                    navigation.replace(
                        'BookingRequestSent',
                        {
                            booking,

                            /*
                            Pass pricing information
                            for the next stage after
                            salon acceptance.
                            */

                            bookingFee:
                                BOOKING_FEE,

                            serviceTotal:
                                discountedServicesTotal,

                            amountToPayNow:
                                BOOKING_FEE,

                            amountAtSalon:
                                discountedServicesTotal,

                            /*
                            This makes the next screen
                            aware that payment should
                            happen ONLY after salon
                            acceptance.
                            */
                            paymentStatus:
                                'WAITING_FOR_SALON_CONFIRMATION',
                        },
                    );

                    return;
                }

                /*
                ========================================================
                BOOKING FAILED
                ========================================================
                */

                Alert.alert(
                    response.data
                        ?.createBooking
                        ?.message ||
                        'Unable to send booking request.',
                );
            } catch (err: any) {
                console.error(
                    '[BookingSummary] CREATE BOOKING ERROR:',
                    err,
                );

                Alert.alert(
                    err?.message ||
                        'Something went wrong while sending the booking request.',
                );
            }
        };

    /*
    ================================================================
    RENDER
    ================================================================
    */

    return (
        <SafeAreaView
            style={styles.container}
        >
            {/* ===================================================== */}
            {/* BACK */}
            {/* ===================================================== */}

            <TouchableOpacity
                onPress={() =>
                    navigation.goBack()
                }
                style={styles.backButton}
                activeOpacity={0.7}
            >
                <Text
                    style={styles.back}
                >
                    ←
                </Text>
            </TouchableOpacity>

            <FlatList
                data={services}
                keyExtractor={(
                    item,
                    index,
                ) =>
                    item.serviceId ||
                    item.id ||
                    index.toString()
                }

                /* ================================================= */
                /* HEADER */
                /* ================================================= */

                ListHeaderComponent={
                    <View>
                        <Text
                            style={
                                styles.heading
                            }
                        >
                            Booking Summary
                        </Text>

                        {/* ========================================= */}
                        {/* BOOKING REQUEST INFO */}
                        {/* ========================================= */}

                        <View
                            style={
                                styles.requestInfoCard
                            }
                        >
                            <View
                                style={
                                    styles.requestIcon
                                }
                            >
                                <Text
                                    style={
                                        styles.requestIconText
                                    }
                                >
                                    ✓
                                </Text>
                            </View>

                            <View
                                style={
                                    styles.requestInfoContent
                                }
                            >
                                <Text
                                    style={
                                        styles.requestInfoTitle
                                    }
                                >
                                    Request first, pay later
                                </Text>

                                <Text
                                    style={
                                        styles.requestInfoText
                                    }
                                >
                                    Your booking request
                                    will first be sent
                                    to the salon.
                                </Text>

                                <Text
                                    style={
                                        styles.requestInfoText
                                    }
                                >
                                    You will pay the ₹
                                    {BOOKING_FEE}{' '}
                                    booking fee only
                                    after the salon
                                    accepts your request.
                                </Text>
                            </View>
                        </View>

                        {/* ========================================= */}
                        {/* SALON */}
                        {/* ========================================= */}

                        <View
                            style={
                                styles.card
                            }
                        >
                            <Text
                                style={
                                    styles.salon
                                }
                            >
                                {salon?.name ||
                                    salon?.salonName ||
                                    'Salon'}
                            </Text>

                            <Text
                                style={
                                    styles.address
                                }
                            >
                                📍{' '}
                                {salon
                                    ?.address
                                    ?.addressLine}

                                {salon
                                    ?.address
                                    ?.city
                                    ? `, ${salon.address.city}`
                                    : ''}
                            </Text>
                        </View>

                        {/* ========================================= */}
                        {/* APPOINTMENT */}
                        {/* ========================================= */}

                        <View
                            style={
                                styles.card
                            }
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
                                    styles.appointmentRow
                                }
                            >
                                <Text
                                    style={
                                        styles.appointmentIcon
                                    }
                                >
                                    📅
                                </Text>

                                <View
                                    style={
                                        styles.appointmentContent
                                    }
                                >
                                    <Text
                                        style={
                                            styles.appointmentLabel
                                        }
                                    >
                                        Date
                                    </Text>

                                    <Text
                                        style={
                                            styles.appointmentValue
                                        }
                                    >
                                        {date?.label},{' '}
                                        {date?.dayNumber}{' '}
                                        {date?.month}{' '}
                                        {date?.date?.getFullYear?.() ||
                                            ''}
                                    </Text>
                                </View>
                            </View>

                            <View
                                style={[
                                    styles.appointmentRow,
                                    {
                                        marginTop: 14,
                                    },
                                ]}
                            >
                                <Text
                                    style={
                                        styles.appointmentIcon
                                    }
                                >
                                    🕒
                                </Text>

                                <View
                                    style={
                                        styles.appointmentContent
                                    }
                                >
                                    <Text
                                        style={
                                            styles.appointmentLabel
                                        }
                                    >
                                        Time
                                    </Text>

                                    <Text
                                        style={
                                            styles.appointmentValue
                                        }
                                    >
                                        {time}
                                    </Text>
                                </View>
                            </View>
                        </View>

                        {/* ========================================= */}
                        {/* OFFER SUMMARY */}
                        {/* ========================================= */}

                        {offer && (
                            <View
                                style={
                                    styles.offerTopCard
                                }
                            >
                                <View
                                    style={{
                                        flex: 1,
                                    }}
                                >
                                    <Text
                                        style={
                                            styles.offerTopTitle
                                        }
                                    >
                                        {offer.title ||
                                            'Special Offer'}
                                    </Text>

                                    {offerMessage && (
                                        <Text
                                            style={
                                                styles.offerTopMessage
                                            }
                                        >
                                            {
                                                offerMessage
                                            }
                                        </Text>
                                    )}
                                </View>

                                {offerApplied && (
                                    <Text
                                        style={
                                            styles.offerTopDiscount
                                        }
                                    >
                                        -₹
                                        {discountAmount.toFixed(
                                            0,
                                        )}
                                    </Text>
                                )}
                            </View>
                        )}

                        {/* ========================================= */}
                        {/* SELECTED SERVICES HEADER */}
                        {/* ========================================= */}

                        <View
                            style={
                                styles.servicesHeader
                            }
                        >
                            <Text
                                style={
                                    styles.sectionTitle
                                }
                            >
                                Selected Services
                            </Text>

                            <Text
                                style={
                                    styles.serviceCount
                                }
                            >
                                {services.length}{' '}
                                {services.length ===
                                1
                                    ? 'service'
                                    : 'services'}
                            </Text>
                        </View>
                    </View>
                }

                /* ================================================= */
                /* SERVICES */
                /* ================================================= */

                renderItem={({
                    item,
                }) => {
                    const originalPrice =
                        Number(
                            item.price ||
                                0,
                        );

                    const displayPrice =
                        getServiceDisplayPrice(
                            item,
                        );

                    const hasDiscount =
                        displayPrice <
                        originalPrice;

                    const eligible =
                        isServiceEligibleForOffer(
                            item,
                        );

                    return (
                        <View
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
                                        styles.service
                                    }
                                >
                                    {item.name}
                                </Text>

                                <Text
                                    style={
                                        styles.duration
                                    }
                                >
                                    {
                                        item.duration
                                    }{' '}
                                    mins
                                </Text>

                                {offerApplied &&
                                    eligible && (
                                        <Text
                                            style={
                                                styles.eligibleText
                                            }
                                        >
                                            ✓ Offer applied
                                        </Text>
                                    )}
                            </View>

                            <View
                                style={
                                    styles.priceContainer
                                }
                            >
                                {hasDiscount && (
                                    <Text
                                        style={
                                            styles.originalPrice
                                        }
                                    >
                                        ₹
                                        {originalPrice.toFixed(
                                            0,
                                        )}
                                    </Text>
                                )}

                                <Text
                                    style={[
                                        styles.price,
                                        hasDiscount &&
                                            styles.discountedPrice,
                                    ]}
                                >
                                    ₹
                                    {displayPrice.toFixed(
                                        0,
                                    )}
                                </Text>
                            </View>
                        </View>
                    );
                }}

                /* ================================================= */
                /* FOOTER */
                /* ================================================= */

                ListFooterComponent={
                    <View>
                        {/* ========================================= */}
                        {/* DURATION */}
                        {/* ========================================= */}

                        <View
                            style={
                                styles.card
                            }
                        >
                            <View
                                style={
                                    styles.simpleRow
                                }
                            >
                                <View>
                                    <Text
                                        style={
                                            styles.sectionTitleSmall
                                        }
                                    >
                                        Duration
                                    </Text>

                                    <Text
                                        style={
                                            styles.mutedText
                                        }
                                    >
                                        Total appointment
                                        duration
                                    </Text>
                                </View>

                                <Text
                                    style={
                                        styles.durationValue
                                    }
                                >
                                    {duration}{' '}
                                    mins
                                </Text>
                            </View>
                        </View>

                        {/* ========================================= */}
                        {/* PROMO / OFFER */}
                        {/* ========================================= */}

                        <View
                            style={
                                styles.card
                            }
                        >
                            <Text
                                style={
                                    styles.sectionTitle
                                }
                            >
                                Promo Code
                            </Text>

                            <TextInput
                                placeholder="Enter coupon"
                                value={
                                    couponCode
                                }
                                onChangeText={
                                    setCouponCode
                                }
                                editable={
                                    !offer
                                }
                                style={[
                                    styles.input,

                                    offer && {
                                        backgroundColor:
                                            '#F3F3F3',
                                        color:
                                            '#666',
                                    },
                                ]}
                            />

                            {offer ? (
                                <View
                                    style={
                                        styles.offerApplied
                                    }
                                >
                                    <View
                                        style={{
                                            flex: 1,
                                        }}
                                    >
                                        <Text
                                            style={
                                                styles.offerAppliedTitle
                                            }
                                        >
                                            ✓ Offer Applied
                                        </Text>

                                        <Text
                                            style={
                                                styles.offerAppliedText
                                            }
                                        >
                                            {offer.title ||
                                                'Special Offer'}
                                        </Text>

                                        {offer
                                            .description && (
                                            <Text
                                                style={
                                                    styles.offerDescription
                                                }
                                            >
                                                {
                                                    offer.description
                                                }
                                            </Text>
                                        )}
                                    </View>

                                    <Text
                                        style={
                                            styles.offerDiscount
                                        }
                                    >
                                        {getOfferDiscountText()}
                                    </Text>
                                </View>
                            ) : (
                                <TouchableOpacity
                                    style={
                                        styles.apply
                                    }
                                    activeOpacity={
                                        0.7
                                    }
                                >
                                    <Text
                                        style={{
                                            color:
                                                PRIMARY,
                                            fontWeight:
                                                '700',
                                        }}
                                    >
                                        Apply
                                    </Text>
                                </TouchableOpacity>
                            )}
                        </View>

                        {/* ========================================= */}
                        {/* PAYMENT SUMMARY */}
                        {/* ========================================= */}

                        <View
                            style={
                                styles.card
                            }
                        >
                            <Text
                                style={
                                    styles.sectionTitle
                                }
                            >
                                Payment
                            </Text>

                            {/* ------------------------------------- */}
                            {/* SERVICES */}
                            {/* ------------------------------------- */}

                            <View
                                style={
                                    styles.paymentRow
                                }
                            >
                                <View>
                                    <Text
                                        style={
                                            styles.paymentLabel
                                        }
                                    >
                                        Services
                                    </Text>

                                    {offerApplied && (
                                        <Text
                                            style={
                                                styles.paymentSubLabel
                                            }
                                        >
                                            After discount
                                        </Text>
                                    )}
                                </View>

                                <View
                                    style={
                                        styles.paymentPriceContainer
                                    }
                                >
                                    {offerApplied && (
                                        <Text
                                            style={
                                                styles.paymentOriginalPrice
                                            }
                                        >
                                            ₹
                                            {subtotal.toFixed(
                                                0,
                                            )}
                                        </Text>
                                    )}

                                    <Text
                                        style={
                                            styles.paymentAmount
                                        }
                                    >
                                        ₹
                                        {discountedServicesTotal.toFixed(
                                            0,
                                        )}
                                    </Text>
                                </View>
                            </View>

                            {/* ------------------------------------- */}
                            {/* OFFER DISCOUNT */}
                            {/* ------------------------------------- */}

                            {offerApplied && (
                                <View
                                    style={
                                        styles.paymentRow
                                    }
                                >
                                    <Text
                                        style={
                                            styles.discountLabel
                                        }
                                    >
                                        Offer Discount
                                    </Text>

                                    <Text
                                        style={
                                            styles.discountValue
                                        }
                                    >
                                        -₹
                                        {discountAmount.toFixed(
                                            0,
                                        )}
                                    </Text>
                                </View>
                            )}

                            {/* ------------------------------------- */}
                            {/* MINIMUM AMOUNT MESSAGE */}
                            {/* ------------------------------------- */}

                            {offer &&
                                !offerApplied &&
                                !minimumBookingAmountMet && (
                                    <Text
                                        style={
                                            styles.minimumAmountText
                                        }
                                    >
                                        Add more services
                                        to meet the
                                        minimum booking
                                        amount for this
                                        offer.
                                    </Text>
                                )}

                            {/* ------------------------------------- */}
                            {/* DIVIDER */}
                            {/* ------------------------------------- */}

                            <View
                                style={
                                    styles.divider
                                }
                            />

                            {/* ------------------------------------- */}
                            {/* AFTER SALON ACCEPTS */}
                            {/* ------------------------------------- */}

                            <View
                                style={
                                    styles.bookingFeeRow
                                }
                            >
                                <View
                                    style={
                                        styles.bookingFeeInfo
                                    }
                                >
                                    <Text
                                        style={
                                            styles.bookingFeeTitle
                                        }
                                    >
                                        Booking fee
                                    </Text>

                                    <Text
                                        style={
                                            styles.bookingFeeSubtitle
                                        }
                                    >
                                        ₹{BOOKING_FEE} paid
                                        after salon accepts
                                    </Text>
                                </View>

                                <Text
                                    style={
                                        styles.bookingFeeAmount
                                    }
                                >
                                    ₹{BOOKING_FEE}
                                </Text>
                            </View>

                            {/* ------------------------------------- */}
                            {/* PAY AT SALON */}
                            {/* ------------------------------------- */}

                            <View
                                style={
                                    styles.salonPaymentBox
                                }
                            >
                                <View
                                    style={
                                        styles.salonPaymentIcon
                                    }
                                >
                                    <Text>
                                        🏪
                                    </Text>
                                </View>

                                <View
                                    style={{
                                        flex: 1,
                                    }}
                                >
                                    <Text
                                        style={
                                            styles.salonPaymentTitle
                                        }
                                    >
                                        Remaining amount at
                                        salon
                                    </Text>

                                    <Text
                                        style={
                                            styles.salonPaymentText
                                        }
                                    >
                                        ₹
                                        {discountedServicesTotal.toFixed(
                                            0,
                                        )}{' '}
                                        will be paid
                                        directly to the
                                        salon.
                                    </Text>
                                </View>
                            </View>

                            {/* ------------------------------------- */}
                            {/* SAVINGS */}
                            {/* ------------------------------------- */}

                            {offerApplied && (
                                <Text
                                    style={
                                        styles.savingsText
                                    }
                                >
                                    You save ₹
                                    {discountAmount.toFixed(
                                        0,
                                    )}{' '}
                                    with this offer.
                                </Text>
                            )}

                            {/* ------------------------------------- */}
                            {/* HOW IT WORKS */}
                            {/* ------------------------------------- */}

                            <View
                                style={
                                    styles.paymentExplanation
                                }
                            >
                                <Text
                                    style={
                                        styles.paymentExplanationTitle
                                    }
                                >
                                    How your booking works
                                </Text>

                                <View
                                    style={
                                        styles.stepRow
                                    }
                                >
                                    <View
                                        style={
                                            styles.stepCircle
                                        }
                                    >
                                        <Text
                                            style={
                                                styles.stepNumber
                                            }
                                        >
                                            1
                                        </Text>
                                    </View>

                                    <Text
                                        style={
                                            styles.stepText
                                        }
                                    >
                                        Send your booking
                                        request to the
                                        salon.
                                    </Text>
                                </View>

                                <View
                                    style={
                                        styles.stepRow
                                    }
                                >
                                    <View
                                        style={
                                            styles.stepCircle
                                        }
                                    >
                                        <Text
                                            style={
                                                styles.stepNumber
                                            }
                                        >
                                            2
                                        </Text>
                                    </View>

                                    <Text
                                        style={
                                            styles.stepText
                                        }
                                    >
                                        Salon accepts your
                                        requested date and
                                        time.
                                    </Text>
                                </View>

                                <View
                                    style={
                                        styles.stepRow
                                    }
                                >
                                    <View
                                        style={
                                            styles.stepCircle
                                        }
                                    >
                                        <Text
                                            style={
                                                styles.stepNumber
                                            }
                                        >
                                            3
                                        </Text>
                                    </View>

                                    <Text
                                        style={
                                            styles.stepText
                                        }
                                    >
                                        Pay the ₹
                                        {BOOKING_FEE}{' '}
                                        booking fee to
                                        Clavata.
                                    </Text>
                                </View>

                                <View
                                    style={
                                        styles.stepRow
                                    }
                                >
                                    <View
                                        style={
                                            styles.stepCircle
                                        }
                                    >
                                        <Text
                                            style={
                                                styles.stepNumber
                                            }
                                        >
                                            4
                                        </Text>
                                    </View>

                                    <Text
                                        style={
                                            styles.stepText
                                        }
                                    >
                                        Visit the salon
                                        and pay the
                                        remaining ₹
                                        {discountedServicesTotal.toFixed(
                                            0,
                                        )}{' '}
                                        directly to the
                                        salon.
                                    </Text>
                                </View>
                            </View>

                            {offer && (
                                <Text
                                    style={
                                        styles.backendNote
                                    }
                                >
                                    The final offer
                                    discount will be
                                    verified when your
                                    booking is created.
                                </Text>
                            )}
                        </View>

                        {/* ========================================= */}
                        {/* REQUEST BOOKING */}
                        {/* ========================================= */}

                        <TouchableOpacity
                            style={[
                                styles.confirm,
                                loading &&
                                    styles.confirmDisabled,
                            ]}
                            disabled={
                                loading
                            }
                            onPress={
                                requestBooking
                            }
                            activeOpacity={0.85}
                        >
                            <View
                                style={
                                    styles.confirmContent
                                }
                            >
                                <View
                                    style={{
                                        flex: 1,
                                    }}
                                >
                                    <Text
                                        style={
                                            styles.confirmMainText
                                        }
                                    >
                                        {loading
                                            ? 'Sending request...'
                                            : 'Request Booking'}
                                    </Text>

                                    {!loading && (
                                        <Text
                                            style={
                                                styles.confirmSubText
                                            }
                                        >
                                            No payment required
                                            yet
                                        </Text>
                                    )}
                                </View>

                                {!loading && (
                                    <Text
                                        style={
                                            styles.confirmArrow
                                        }
                                    >
                                        →
                                    </Text>
                                )}
                            </View>
                        </TouchableOpacity>
                    </View>
                }

                contentContainerStyle={{
                    paddingBottom: 30,
                }}
                showsVerticalScrollIndicator={
                    false
                }
            />
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F5F6FA',
    },

    /*
    ================================================================
    HEADER
    ================================================================
    */

    backButton: {
        width: 45,
        height: 42,
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: 2,
        marginLeft: 4,
    },

    back: {
        fontSize: 28,
        fontWeight: '700',
    },

    heading: {
        fontSize: 28,
        fontWeight: '700',
        marginHorizontal: 20,
        marginTop: 5,
        marginBottom: 18,
        color: '#171717',
    },

    /*
    ================================================================
    REQUEST INFO
    ================================================================
    */

    requestInfoCard: {
        backgroundColor: '#EAF8F3',
        marginHorizontal: 15,
        marginBottom: 15,
        borderRadius: 16,
        padding: 16,
        flexDirection: 'row',
        borderWidth: 1,
        borderColor: '#B9E5D5',
    },

    requestIcon: {
        width: 42,
        height: 42,
        borderRadius: 21,
        backgroundColor: PRIMARY,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 12,
    },

    requestIconText: {
        color: '#FFF',
        fontSize: 20,
        fontWeight: '800',
    },

    requestInfoContent: {
        flex: 1,
    },

    requestInfoTitle: {
        color: '#176B53',
        fontSize: 16,
        fontWeight: '800',
    },

    requestInfoText: {
        color: '#39705F',
        fontSize: 13,
        lineHeight: 19,
        marginTop: 4,
    },

    /*
    ================================================================
    GENERAL CARD
    ================================================================
    */

    card: {
        backgroundColor: '#FFF',
        marginHorizontal: 15,
        marginBottom: 15,
        borderRadius: 14,
        padding: 18,
    },

    salon: {
        fontSize: 20,
        fontWeight: '700',
        color: '#171717',
    },

    address: {
        marginTop: 8,
        color: '#666',
        lineHeight: 20,
    },

    sectionTitle: {
        fontSize: 18,
        fontWeight: '700',
        marginBottom: 12,
        color: '#171717',
    },

    sectionTitleSmall: {
        fontSize: 16,
        fontWeight: '700',
        color: '#171717',
    },

    mutedText: {
        marginTop: 4,
        color: '#777',
        fontSize: 12,
    },

    /*
    ================================================================
    APPOINTMENT
    ================================================================
    */

    appointmentRow: {
        flexDirection: 'row',
        alignItems: 'center',
    },

    appointmentIcon: {
        fontSize: 22,
        width: 38,
    },

    appointmentContent: {
        flex: 1,
    },

    appointmentLabel: {
        color: '#888',
        fontSize: 12,
        marginBottom: 2,
    },

    appointmentValue: {
        color: '#222',
        fontSize: 15,
        fontWeight: '600',
    },

    /*
    ================================================================
    SERVICES HEADER
    ================================================================
    */

    servicesHeader: {
        marginHorizontal: 15,
        marginBottom: 10,
        paddingHorizontal: 3,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },

    serviceCount: {
        color: '#777',
        fontSize: 13,
        fontWeight: '600',
    },

    /*
    ================================================================
    OFFER TOP CARD
    ================================================================
    */

    offerTopCard: {
        backgroundColor: '#EAF8F3',
        marginHorizontal: 15,
        marginBottom: 15,
        borderRadius: 14,
        padding: 16,
        flexDirection: 'row',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#B9E5D5',
    },

    offerTopTitle: {
        fontSize: 16,
        fontWeight: '700',
        color: PRIMARY,
    },

    offerTopMessage: {
        marginTop: 4,
        color: '#176B53',
        fontSize: 13,
    },

    offerTopDiscount: {
        marginLeft: 12,
        fontSize: 18,
        fontWeight: '800',
        color: PRIMARY,
    },

    /*
    ================================================================
    SERVICES
    ================================================================
    */

    serviceRow: {
        backgroundColor: '#FFF',
        marginHorizontal: 15,
        marginBottom: 8,
        padding: 18,
        borderRadius: 14,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },

    serviceInfo: {
        flex: 1,
        paddingRight: 10,
    },

    service: {
        fontWeight: '700',
        fontSize: 16,
        color: '#222',
    },

    duration: {
        marginTop: 5,
        color: '#777',
        fontSize: 13,
    },

    eligibleText: {
        marginTop: 4,
        color: PRIMARY,
        fontSize: 11,
        fontWeight: '700',
    },

    priceContainer: {
        alignItems: 'flex-end',
    },

    originalPrice: {
        color: '#999',
        fontSize: 13,
        textDecorationLine:
            'line-through',
    },

    price: {
        color: PRIMARY,
        fontWeight: '700',
        fontSize: 18,
    },

    discountedPrice: {
        color: PRIMARY,
    },

    /*
    ================================================================
    DURATION
    ================================================================
    */

    simpleRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },

    durationValue: {
        color: PRIMARY,
        fontSize: 17,
        fontWeight: '800',
    },

    /*
    ================================================================
    PROMO
    ================================================================
    */

    input: {
        borderWidth: 1,
        borderColor: '#DDD',
        borderRadius: 10,
        paddingHorizontal: 15,
        height: 50,
        color: '#222',
        backgroundColor: '#FFF',
    },

    apply: {
        alignSelf: 'flex-end',
        marginTop: 12,
    },

    offerApplied: {
        marginTop: 14,
        padding: 14,
        borderRadius: 12,
        backgroundColor: '#EAF8F3',
        borderWidth: 1,
        borderColor: '#B9E5D5',
        flexDirection: 'row',
        alignItems: 'center',
    },

    offerAppliedTitle: {
        fontSize: 15,
        fontWeight: '700',
        color: PRIMARY,
    },

    offerAppliedText: {
        marginTop: 4,
        fontSize: 14,
        fontWeight: '600',
        color: '#222',
    },

    offerDescription: {
        marginTop: 3,
        fontSize: 12,
        color: '#666',
    },

    offerDiscount: {
        marginLeft: 10,
        fontSize: 15,
        fontWeight: '800',
        color: PRIMARY,
    },

    /*
    ================================================================
    PAYMENT
    ================================================================
    */

    paymentRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginVertical: 7,
    },

    paymentLabel: {
        fontSize: 15,
        color: '#222',
        fontWeight: '500',
    },

    paymentSubLabel: {
        fontSize: 11,
        color: '#888',
        marginTop: 2,
    },

    paymentPriceContainer: {
        alignItems: 'flex-end',
    },

    paymentOriginalPrice: {
        color: '#999',
        fontSize: 12,
        textDecorationLine:
            'line-through',
        marginBottom: 1,
    },

    paymentAmount: {
        fontSize: 15,
        fontWeight: '700',
        color: '#222',
    },

    discountLabel: {
        fontWeight: '600',
        color: PRIMARY,
    },

    discountValue: {
        color: PRIMARY,
        fontWeight: '700',
    },

    minimumAmountText: {
        marginTop: 8,
        marginBottom: 8,
        color: '#C47A00',
        fontSize: 12,
        lineHeight: 18,
    },

    divider: {
        height: 1,
        backgroundColor: '#EEEEEE',
        marginVertical: 14,
    },

    /*
    ================================================================
    BOOKING FEE
    ================================================================
    */

    bookingFeeRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 4,
    },

    bookingFeeInfo: {
        flex: 1,
        paddingRight: 10,
    },

    bookingFeeTitle: {
        fontSize: 16,
        fontWeight: '700',
        color: '#222',
    },

    bookingFeeSubtitle: {
        marginTop: 3,
        fontSize: 12,
        color: '#777',
        lineHeight: 17,
    },

    bookingFeeAmount: {
        fontSize: 18,
        fontWeight: '800',
        color: PRIMARY,
    },

    /*
    ================================================================
    PAY AT SALON
    ================================================================
    */

    salonPaymentBox: {
        marginTop: 14,
        padding: 13,
        borderRadius: 12,
        backgroundColor: '#F7F7F7',
        borderWidth: 1,
        borderColor: '#E7E7E7',
        flexDirection: 'row',
        alignItems: 'center',
    },

    salonPaymentIcon: {
        width: 38,
        height: 38,
        borderRadius: 19,
        backgroundColor: '#FFF',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 10,
    },

    salonPaymentTitle: {
        fontSize: 14,
        fontWeight: '700',
        color: '#222',
    },

    salonPaymentText: {
        marginTop: 3,
        color: '#666',
        fontSize: 12,
        lineHeight: 17,
    },

    /*
    ================================================================
    HOW IT WORKS
    ================================================================
    */

    paymentExplanation: {
        marginTop: 15,
        padding: 14,
        borderRadius: 12,
        backgroundColor: '#F8FAFA',
        borderWidth: 1,
        borderColor: '#E5EEEE',
    },

    paymentExplanationTitle: {
        fontSize: 14,
        fontWeight: '700',
        color: '#222',
        marginBottom: 10,
    },

    stepRow: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        marginBottom: 10,
    },

    stepCircle: {
        width: 24,
        height: 24,
        borderRadius: 12,
        backgroundColor: PRIMARY,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 10,
    },

    stepNumber: {
        color: '#FFF',
        fontSize: 12,
        fontWeight: '800',
    },

    stepText: {
        flex: 1,
        color: '#666',
        fontSize: 12,
        lineHeight: 18,
        paddingTop: 2,
    },

    savingsText: {
        marginTop: 12,
        color: '#16845E',
        fontWeight: '700',
        fontSize: 13,
    },

    backendNote: {
        marginTop: 12,
        fontSize: 12,
        lineHeight: 18,
        color: '#777',
    },

    /*
    ================================================================
    CONFIRM / REQUEST BUTTON
    ================================================================
    */

    confirm: {
        marginHorizontal: 20,
        marginBottom: 30,
        backgroundColor: PRIMARY,
        minHeight: 62,
        borderRadius: 18,
        justifyContent: 'center',
        paddingHorizontal: 20,
    },

    confirmDisabled: {
        opacity: 0.65,
    },

    confirmContent: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },

    confirmMainText: {
        color: '#FFF',
        fontWeight: '800',
        fontSize: 17,
    },

    confirmSubText: {
        color: '#E7FFFA',
        fontSize: 12,
        marginTop: 3,
    },

    confirmArrow: {
        color: '#FFF',
        fontSize: 26,
        fontWeight: '600',
    },
});