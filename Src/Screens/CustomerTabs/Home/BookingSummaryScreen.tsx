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

export default function BookingSummaryScreen({
    navigation,
    route,
}: any) {
    const {
        salonId,
        salon,
        customerUserId,
        services,
        date,
        time,

        // Optional offer.
        // Normal bookings will have this as undefined.
        offer,
    } = route.params;

    console.log(
        'BookingSummaryScreen params:',
        route.params,
    );

    console.log('date', date);

    console.log(
        'Applied offer:',
        offer,
    );

    const [createBooking, { loading }] =
        useMutation(CREATE_BOOKING);

    const [paymentMethod, setPaymentMethod] =
        useState<'SALON' | 'ONLINE'>('SALON');

    const [couponCode, setCouponCode] =
        useState(
            offer?.couponCode ||
            offer?.code ||
            '',
        );

    const subtotal = useMemo(() => {
        return services.reduce(
            (sum: number, item: any) =>
                sum + Number(item.price || 0),
            0,
        );
    }, [services]);

    const duration = useMemo(() => {
        return services.reduce(
            (sum: number, item: any) =>
                sum + Number(item.duration || 0),
            0,
        );
    }, [services]);

    const platformFee = 20;

    const gst = Math.round(
        platformFee * 0.18,
    );

    /*
     * IMPORTANT:
     *
     * We do NOT calculate the offer discount here.
     *
     * The backend will:
     * - fetch the offer
     * - validate the offer
     * - validate salon
     * - validate services
     * - validate dates
     * - validate minimum booking amount
     * - validate usage limits
     * - calculate the actual discount
     * - calculate final booking total
     *
     * This prevents the customer from manipulating the
     * discounted amount on the mobile app.
     *
     * For display purposes we continue showing the normal
     * subtotal here.
     */

    const total =
        subtotal +
        platformFee +
        gst;

    const formatTime = (time: string) => {
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

    const getOfferDiscountText = () => {
        if (!offer) {
            return null;
        }

        if (
            offer.discountType ===
            'PERCENTAGE'
        ) {
            return `${offer.discountValue}% OFF`;
        }

        if (
            offer.discountType ===
            'FIXED'
        ) {
            return `₹${offer.discountValue} OFF`;
        }

        return 'Offer Applied';
    };

    const confirmBooking = async () => {
        try {
            /*
             * The offer is optional.
             *
             * Normal booking:
             * offerId = undefined
             *
             * Offer booking:
             * offerId = selected offer ID
             */

            const response =
                await createBooking({
                    variables: {
                        input: {
                            salonId,

                            customerUserId,

                            bookingDate:
                                date.date
                                    .toISOString()
                                    .split('T')[0],

                            startTime:
                                formatTime(time),

                            paymentMethod:
                                paymentMethod ===
                                'ONLINE'
                                    ? 'ONLINE'
                                    : 'PAY_AT_SALON',

                            services:
                                services.map(
                                    (
                                        service: any,
                                    ) => ({
                                        serviceId:
                                            service.serviceId,
                                    }),
                                ),

                            notes: '',

                            // =========================================
                            // OFFER
                            // =========================================
                            //
                            // This is the only new value being sent.
                            //
                            // Backend will validate and calculate
                            // the actual discount.
                            //
                            ...(offer?.offerId ||
                                offer?.id
                                ? {
                                    offerId:
                                        offer.offerId ||
                                        offer.id,
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
                <Text style={styles.back}>
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
                }) => (
                    <View
                        style={
                            styles.serviceRow
                        }
                    >
                        <View>
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
                                {item.duration}{' '}
                                mins
                            </Text>
                        </View>

                        <Text
                            style={
                                styles.price
                            }
                        >
                            ₹{item.price}
                        </Text>
                    </View>
                )}

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
                                {duration} mins
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
                                        {
                                            getOfferDiscountText()
                                        }
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

                            {/* SERVICES */}

                            <View
                                style={
                                    styles.row
                                }
                            >
                                <Text>
                                    Services
                                </Text>

                                <Text>
                                    ₹{subtotal}
                                </Text>
                            </View>

                            {/* OFFER */}

                            {offer && (
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
                                            styles.discountPending
                                        }
                                    >
                                        Applied at checkout
                                    </Text>
                                </View>
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
                                    ₹{platformFee}
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
                                    {offer
                                        ? 'Estimated Total'
                                        : 'Total'}
                                </Text>

                                <Text
                                    style={{
                                        fontWeight:
                                            '700',
                                        color:
                                            PRIMARY,
                                        fontSize: 18,
                                    }}
                                >
                                    ₹{total}
                                </Text>
                            </View>

                            {offer && (
                                <Text
                                    style={
                                        styles.backendNote
                                    }
                                >
                                    Final offer discount
                                    and total will be
                                    verified when the
                                    booking is created.
                                </Text>
                            )}
                        </View>

                        {/* ========================================= */}
                        {/* PAYMENT METHOD */}
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
                                Payment Method
                            </Text>

                            {/* PAY AT SALON */}

                            <TouchableOpacity
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
                            </TouchableOpacity>

                            {/* ONLINE */}

                            <TouchableOpacity
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
                            </TouchableOpacity>
                        </View>

                        {/* ========================================= */}
                        {/* CONFIRM */}
                        {/* ========================================= */}

                        <TouchableOpacity
                            style={
                                styles.confirm
                            }
                            disabled={loading}
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

    serviceRow: {
        backgroundColor: '#FFF',
        marginHorizontal: 15,
        marginBottom: 8,
        padding: 18,
        borderRadius: 14,
        flexDirection: 'row',
        justifyContent: 'space-between',
    },

    service: {
        fontWeight: '700',
        fontSize: 16,
    },

    duration: {
        marginTop: 5,
        color: '#777',
    },

    price: {
        color: PRIMARY,
        fontWeight: '700',
        fontSize: 18,
    },

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

    discountLabel: {
        fontWeight: '600',
    },

    discountPending: {
        color: PRIMARY,
        fontSize: 12,
        fontWeight: '600',
    },

    backendNote: {
        marginTop: 12,
        fontSize: 12,
        lineHeight: 18,
        color: '#777',
    },

    row: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginVertical: 6,
    },

    option: {
        marginVertical: 10,
    },

    confirm: {
        marginHorizontal: 20,
        marginBottom: 30,
        backgroundColor: PRIMARY,
        height: 55,
        borderRadius: 28,
        justifyContent: 'center',
        alignItems: 'center',
    },

    back: {
        fontSize: 28,
        fontWeight: '700',
    },

    confirmText: {
        color: '#FFF',
        fontWeight: '700',
        fontSize: 17,
    },
});