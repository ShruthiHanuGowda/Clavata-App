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

const PRIMARY = '#008060';

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
        These are passed from BookingDateTimeScreen.

        We still calculate everything again here rather
        than blindly trusting the values passed by the
        previous screen.
        */
        offerId: routeOfferId,
    } = route.params || {};

    console.log(
        'BookingSummaryScreen params:',
        route?.params,
    );

    console.log(
        'date',
        date,
    );

    console.log(
        'Applied offer:',
        offer,
    );

    const [createBooking, { loading }] =
        useMutation(CREATE_BOOKING);

    const [paymentMethod, setPaymentMethod] =
        useState<'SALON' | 'ONLINE'>(
            'SALON',
        );

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
    OFFER VALIDATION FOR DISPLAY
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

            Fixed discount is applied once
            to the eligible subtotal.
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
    PLATFORM FEE + GST
    ================================================================
    */

    const platformFee = 20;

    const gst = Math.round(
        platformFee * 0.18,
    );

    /*
    ================================================================
    FINAL DISPLAY TOTAL
    ================================================================

    Normal booking:
        services total
        + platform fee
        + GST

    Offer booking:
        discounted services total
        + platform fee
        + GST
    */

    const total = useMemo(() => {
        return (
            discountedServicesTotal +
            platformFee +
            gst
        );
    }, [
        discountedServicesTotal,
        platformFee,
        gst,
    ]);

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

        The fixed amount is applied once
        to the eligible subtotal.

        For display, distribute the
        discount proportionally.
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
    TIME FORMAT
    ================================================================
    */

    const formatTime = (
        time: string,
    ) => {
        const [clock, period] =
            time.split(' ');

        let [hour, minute] =
            clock.split(':');

        let h = parseInt(
            hour,
            10,
        );

        if (
            period === 'PM' &&
            h !== 12
        ) {
            h += 12;
        }

        if (
            period === 'AM' &&
            h === 12
        ) {
            h = 0;
        }

        return `${String(h).padStart(
            2,
            '0',
        )}:${minute}`;
    };

    /*
    ================================================================
    CREATE BOOKING
    ================================================================
    */

    const confirmBooking =
        async () => {
            try {
                /*
                IMPORTANT:

                We only send offerId.

                The backend should:
                - fetch offer
                - validate offer
                - validate salon
                - validate services
                - validate dates
                - validate minimum amount
                - validate usage limits
                - calculate discount
                - calculate final total
                */

                const finalOfferId =
                    normalizedOffer
                        ?.offerId ||
                    routeOfferId ||
                    offer?.id;

                const response =
                    await createBooking({
                        variables: {
                            input: {
                                salonId,

                                customerUserId,

                                bookingDate:
                                    date.date
                                        .toISOString()
                                        .split(
                                            'T',
                                        )[0],

                                startTime:
                                    formatTime(
                                        time,
                                    ),

                                paymentMethod:
                                    paymentMethod ===
                                    'ONLINE'
                                        ? 'ONLINE'
                                        : 'PAY_AT_SALON',

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
                                    offerId is sent
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
                    'createBooking response:',
                    response.data,
                );

                if (
                    response.data
                        ?.createBooking
                        ?.success
                ) {
                    navigation.replace(
                        'BookingRequestSent',
                        {
                            booking:
                                response.data
                                    .createBooking
                                    .booking,
                        },
                    );
                } else {
                    Alert.alert(
                        response.data
                            ?.createBooking
                            ?.message ||
                            'Unable to create booking.',
                    );
                }
            } catch (err: any) {
                console.error(
                    'Create booking error:',
                    err,
                );

                Alert.alert(
                    err?.message ||
                        'Something went wrong while creating the booking.',
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
                    <>
                        <Text
                            style={
                                styles.heading
                            }
                        >
                            Booking Summary
                        </Text>

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

                            <Text>
                                📅{' '}
                                {date.label},{' '}
                                {date.dayNumber}{' '}
                                {date.month}{' '}
                                {date.date.getFullYear()}
                            </Text>

                            <Text
                                style={{
                                    marginTop: 8,
                                }}
                            >
                                🕒 {time}
                            </Text>
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
                        {/* SELECTED SERVICES */}
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
                                Selected Services
                            </Text>
                        </View>
                    </>
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
                                            Offer applied
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
                    <>
                        {/* ========================================= */}
                        {/* DURATION */}
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
                                Duration
                            </Text>

                            <Text>
                                {duration}{' '}
                                mins
                            </Text>
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

                            {/* ORIGINAL SERVICES */}

                            <View
                                style={
                                    styles.row
                                }
                            >
                                <Text>
                                    Services
                                </Text>

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

                                    <Text>
                                        ₹
                                        {discountedServicesTotal.toFixed(
                                            0,
                                        )}
                                    </Text>
                                </View>
                            </View>

                            {/* OFFER DISCOUNT */}

                            {offerApplied && (
                                <View
                                    style={
                                        styles.row
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

                            {/* MINIMUM AMOUNT MESSAGE */}

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

                            {/* PLATFORM FEE */}

                            <View
                                style={
                                    styles.row
                                }
                            >
                                <Text>
                                    Platform Fee
                                </Text>

                                <Text>
                                    ₹
                                    {platformFee}
                                </Text>
                            </View>

                            {/* GST */}

                            <View
                                style={
                                    styles.row
                                }
                            >
                                <Text>
                                    GST
                                </Text>

                                <Text>
                                    ₹{gst}
                                </Text>
                            </View>

                            {/* TOTAL */}

                            <View
                                style={[
                                    styles.row,
                                    {
                                        marginTop: 10,
                                    },
                                ]}
                            >
                                <Text
                                    style={{
                                        fontWeight:
                                            '700',
                                    }}
                                >
                                    Total
                                </Text>

                                <Text
                                    style={
                                        styles.totalPrice
                                    }
                                >
                                    ₹
                                    {total.toFixed(
                                        0,
                                    )}
                                </Text>
                            </View>

                            {offerApplied && (
                                <Text
                                    style={
                                        styles.savingsText
                                    }
                                >
                                    You save ₹
                                    {discountAmount.toFixed(
                                        0,
                                    )} with this
                                    offer.
                                </Text>
                            )}

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
                        {/* PAYMENT METHOD */}
                        {/* ========================================= */}

                        {/* <View
                            style={
                                styles.card
                            }
                        > */}
                            {/* <Text
                                style={
                                    styles.sectionTitle
                                }
                            >
                                Payment Method
                            </Text> */}

                            {/* PAY AT SALON */}

                            {/* <TouchableOpacity
                                style={
                                    styles.option
                                }
                                onPress={() =>
                                    setPaymentMethod(
                                        'SALON',
                                    )
                                }
                            >
                                <Text>
                                    {paymentMethod ===
                                    'SALON'
                                        ? '🟢'
                                        : '⚪'}{' '}
                                    Pay at Salon
                                </Text>
                            </TouchableOpacity> */}

                            {/* ONLINE */}

                            {/* <TouchableOpacity
                                style={
                                    styles.option
                                }
                                onPress={() =>
                                    setPaymentMethod(
                                        'ONLINE',
                                    )
                                }
                            >
                                <Text>
                                    {paymentMethod ===
                                    'ONLINE'
                                        ? '🟢'
                                        : '⚪'}{' '}
                                    Pay Online
                                </Text>
                            </TouchableOpacity> */}
                        {/* </View> */}

                        {/* ========================================= */}
                        {/* CONFIRM */}
                        {/* ========================================= */}

                        <TouchableOpacity
                            style={
                                styles.confirm
                            }
                            disabled={
                                loading
                            }
                            onPress={
                                confirmBooking
                            }
                        >
                            <Text
                                style={
                                    styles.confirmText
                                }
                            >
                                {loading
                                    ? 'Booking...'
                                    : 'Confirm Booking'}
                            </Text>
                        </TouchableOpacity>
                    </>
                }

                contentContainerStyle={{
                    paddingBottom: 30,
                }}
            />
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F5F6FA',
    },

    heading: {
        fontSize: 28,
        fontWeight: '700',
        margin: 20,
    },

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
    },

    address: {
        marginTop: 8,
        color: '#666',
    },

    sectionTitle: {
        fontSize: 18,
        fontWeight: '700',
        marginBottom: 12,
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
        justifyContent:
            'space-between',
        alignItems: 'center',
    },

    serviceInfo: {
        flex: 1,
        paddingRight: 10,
    },

    service: {
        fontWeight: '700',
        fontSize: 16,
    },

    duration: {
        marginTop: 5,
        color: '#777',
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
    PROMO
    ================================================================
    */

    input: {
        borderWidth: 1,
        borderColor: '#DDD',
        borderRadius: 10,
        paddingHorizontal: 15,
        height: 50,
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

    row: {
        flexDirection: 'row',
        justifyContent:
            'space-between',
        alignItems: 'center',
        marginVertical: 6,
    },

    paymentPriceContainer: {
        alignItems: 'flex-end',
    },

    paymentOriginalPrice: {
        color: '#999',
        fontSize: 12,
        textDecorationLine:
            'line-through',
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

    totalPrice: {
        fontWeight: '700',
        color: PRIMARY,
        fontSize: 18,
    },

    savingsText: {
        marginTop: 10,
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
    PAYMENT METHOD
    ================================================================
    */

    option: {
        marginVertical: 10,
    },

    /*
    ================================================================
    CONFIRM
    ================================================================
    */

    confirm: {
        marginHorizontal: 20,
        marginBottom: 30,
        backgroundColor: PRIMARY,
        height: 55,
        borderRadius: 28,
        justifyContent:
            'center',
        alignItems: 'center',
    },

    confirmText: {
        color: '#FFF',
        fontWeight: '700',
        fontSize: 17,
    },

    back: {
        fontSize: 28,
        fontWeight: '700',
        marginLeft: 10,
        marginTop: 5,
    },
});