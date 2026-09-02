
import React, { useState } from 'react';
import {
    SafeAreaView,
    View,
    Text,
    TouchableOpacity,
    StyleSheet,
    Alert,
} from 'react-native';

import RazorpayCheckout from 'react-native-razorpay';
import { useMutation } from '@apollo/client';

import {
    CREATE_RAZORPAY_ORDER,
    VERIFY_RAZORPAY_PAYMENT,
} from '../../../graphql/queries';

interface Booking {
    bookingId: string;
    salonName?: string;
    bookingDate?: string;
    bookingFee: number;
    remainingAmount?: number;
    customerPhone?: string;
    customerName?: string;
    customerEmail?: string;
}

interface BookingPaymentProps {
    route: {
        params: {
            booking: Booking;
        };
    };
    navigation: any;
}

interface RazorpayOrder {
    orderId: string;
    amount: number;
    currency: string;
    keyId: string;
}

interface CreateRazorpayOrderResult {
    createRazorpayOrder: {
        success: boolean;
        message: string;
        order: RazorpayOrder | null;
    };
}

interface VerifyRazorpayPaymentResult {
    verifyRazorpayPayment: {
        success: boolean;
        message: string;
        booking: Booking | null;
    };
}

export default function BookingPayment({
    route,
    navigation,
}: BookingPaymentProps) {

    const { booking } = route.params;

    const [loading, setLoading] = useState(false);

    const [createRazorpayOrder] =
        useMutation<CreateRazorpayOrderResult>(
            CREATE_RAZORPAY_ORDER
        );

    const [verifyRazorpayPayment] =
        useMutation<VerifyRazorpayPaymentResult>(
            VERIFY_RAZORPAY_PAYMENT
        );

    const startPayment = async () => {

        if (loading) {
            return;
        }

        if (!booking?.bookingId) {
            Alert.alert(
                'Payment Error',
                'Booking ID is missing.'
            );
            return;
        }

        const bookingFee = Number(
            booking.bookingFee
        );

        if (
            !Number.isFinite(bookingFee) ||
            bookingFee <= 0
        ) {
            Alert.alert(
                'Payment Error',
                'Invalid booking fee.'
            );
            return;
        }

        try {

            setLoading(true);

            console.log(
                '========================================'
            );

            console.log(
                'STARTING RAZORPAY TEST PAYMENT'
            );

            console.log(
                '========================================'
            );

            console.log(
                'Booking ID:',
                booking.bookingId
            );

            console.log(
                'Booking Fee:',
                bookingFee
            );

            // ============================================
            // STEP 1
            // CREATE RAZORPAY ORDER
            // ============================================

            console.log(
                'Creating Razorpay order...'
            );

            const orderResponse =
                await createRazorpayOrder({
                    variables: {
                        input: {
                            bookingId:
                                booking.bookingId,
                        },
                    },
                });

            console.log(
                'CREATE ORDER RESPONSE:',
                JSON.stringify(
                    orderResponse.data,
                    null,
                    2
                )
            );

            const createOrder =
                orderResponse.data
                    ?.createRazorpayOrder;

            if (!createOrder) {

                throw new Error(
                    'No response received from the server.'
                );
            }

            if (!createOrder.success) {

                throw new Error(
                    createOrder.message ||
                    'Failed to create Razorpay order.'
                );
            }

            if (!createOrder.order) {

                throw new Error(
                    'Razorpay order was not returned.'
                );
            }

            const order =
                createOrder.order;

            if (!order.orderId) {

                throw new Error(
                    'Razorpay Order ID is missing.'
                );
            }

            if (!order.keyId) {

                throw new Error(
                    'Razorpay Key ID is missing.'
                );
            }

            if (!order.amount) {

                throw new Error(
                    'Razorpay amount is missing.'
                );
            }

            console.log(
                '========================================'
            );

            console.log(
                'RAZORPAY ORDER CREATED'
            );

            console.log(
                'Order ID:',
                order.orderId
            );

            console.log(
                'Amount (paise):',
                order.amount
            );

            console.log(
                'Currency:',
                order.currency
            );

            console.log(
                'Key ID:',
                order.keyId
            );

            console.log(
                '========================================'
            );

            // ============================================
            // STEP 2
            // OPEN RAZORPAY CHECKOUT
            // ============================================

            const razorpayOptions = {

                description:
                    'Salon booking advance payment',

                currency:
                    order.currency,

                key:
                    order.keyId,

                amount:
                    order.amount,

                order_id:
                    order.orderId,

                name:
                    booking.salonName ||
                    'Salon Booking',

                prefill: {

                    name:
                        booking.customerName ||
                        '',

                    email:
                        booking.customerEmail ||
                        'customer@example.com',

                    contact:
                        booking.customerPhone ||
                        '',
                },

                theme: {
                    color: '#009D94',
                },
            };

            console.log(
                'Opening Razorpay Checkout...'
            );

            const payment =
                await RazorpayCheckout.open(
                    razorpayOptions
                );

            // ============================================
            // STEP 3
            // RAZORPAY SUCCESS
            // ============================================

            console.log(
                '========================================'
            );

            console.log(
                'RAZORPAY CHECKOUT SUCCESS'
            );

            console.log(
                'Payment Response:',
                JSON.stringify(
                    payment,
                    null,
                    2
                )
            );

            console.log(
                '========================================'
            );

            if (
                !payment?.razorpay_order_id ||
                !payment?.razorpay_payment_id ||
                !payment?.razorpay_signature
            ) {

                throw new Error(
                    'Razorpay returned an incomplete payment response.'
                );
            }

            // ============================================
            // STEP 4
            // VERIFY PAYMENT ON BACKEND
            // ============================================

            console.log(
                'Verifying payment on backend...'
            );

            const verifyResponse =
                await verifyRazorpayPayment({
                    variables: {

                        input: {

                            bookingId:
                                booking.bookingId,

                            razorpayOrderId:
                                payment.razorpay_order_id,

                            razorpayPaymentId:
                                payment.razorpay_payment_id,

                            razorpaySignature:
                                payment.razorpay_signature,
                        },
                    },
                });

            console.log(
                'VERIFY PAYMENT RESPONSE:',
                JSON.stringify(
                    verifyResponse.data,
                    null,
                    2
                )
            );

            const verification =
                verifyResponse.data
                    ?.verifyRazorpayPayment;

            if (!verification) {

                throw new Error(
                    'No response received from payment verification.'
                );
            }

            // ============================================
            // STEP 5
            // PAYMENT VERIFIED
            // ============================================

            if (verification.success) {

                console.log(
                    '========================================'
                );

                console.log(
                    'PAYMENT VERIFIED SUCCESSFULLY'
                );

                console.log(
                    '========================================'
                );

                Alert.alert(
                    'Payment Successful',
                    'Your booking fee has been paid successfully.',
                    [
                        {
                            text: 'OK',
                            onPress: () => {
                                navigation.goBack();
                            },
                        },
                    ]
                );

            } else {

                console.error(
                    'Payment verification failed:',
                    verification.message
                );

                Alert.alert(
                    'Verification Failed',
                    verification.message ||
                    'Payment could not be verified.'
                );
            }

        } catch (error: any) {

            console.error(
                '========================================'
            );

            console.error(
                'RAZORPAY PAYMENT ERROR'
            );

            console.error(
                '========================================'
            );

            console.error(
                'Error:',
                error
            );

            console.error(
                'Code:',
                error?.code
            );

            console.error(
                'Description:',
                error?.description
            );

            console.error(
                'Message:',
                error?.message
            );

            // ============================================
            // USER CANCELLED PAYMENT
            // ============================================

            if (
                error?.code === 0 ||
                error?.code === '0'
            ) {

                Alert.alert(
                    'Payment Cancelled',
                    'You cancelled the payment.'
                );

                return;
            }

            // ============================================
            // PAYMENT FAILED
            // ============================================

            Alert.alert(
                'Payment Failed',
                error?.description ||
                error?.message ||
                'Something went wrong while processing the payment.'
            );

        } finally {

            setLoading(false);

            console.log(
                'Payment processing finished.'
            );
        }
    };

    return (
        <SafeAreaView style={styles.container}>

            <View style={styles.card}>

                <Text style={styles.title}>
                    Confirm Payment
                </Text>

                <Text style={styles.salon}>
                    {booking.salonName ||
                        'Salon'}
                </Text>

                <Text style={styles.label}>
                    Appointment Date
                </Text>

                <Text style={styles.value}>
                    {booking.bookingDate ||
                        'Not available'}
                </Text>

                <Text style={styles.label}>
                    Booking Fee
                </Text>

                <Text style={styles.amount}>
                    ₹
                    {bookingFeeDisplay(
                        booking.bookingFee
                    )}
                </Text>

                {booking.remainingAmount !==
                    undefined && (

                        <Text style={styles.note}>
                            Remaining ₹
                            {Number(
                                booking.remainingAmount
                            ).toFixed(2)}
                            {' '}
                            will be paid at salon.
                        </Text>
                    )}

                <TouchableOpacity
                    style={[
                        styles.button,
                        loading &&
                        styles.buttonDisabled,
                    ]}
                    disabled={loading}
                    onPress={startPayment}
                    activeOpacity={0.8}
                >

                    <Text style={styles.buttonText}>
                        {loading
                            ? 'Processing...'
                            : 'Pay Now'}
                    </Text>

                </TouchableOpacity>

                <Text style={styles.testMode}>
                    TEST MODE
                </Text>

                <Text style={styles.testModeText}>
                    This is a test payment.
                    No real money will be charged.
                </Text>

            </View>

        </SafeAreaView>
    );
}

function bookingFeeDisplay(
    amount: number
): string {

    const value = Number(amount);

    if (!Number.isFinite(value)) {
        return '0.00';
    }

    return value.toFixed(2);
}

const styles = StyleSheet.create({

    container: {
        flex: 1,
        justifyContent: 'center',
        backgroundColor: '#F7F8FA',
        padding: 20,
    },

    card: {
        backgroundColor: '#FFFFFF',
        borderRadius: 20,
        padding: 24,
        elevation: 3,
    },

    title: {
        fontSize: 24,
        fontWeight: '700',
        marginBottom: 20,
        color: '#111827',
    },

    salon: {
        fontSize: 20,
        fontWeight: '700',
        color: '#009D94',
        marginBottom: 20,
    },

    label: {
        fontSize: 14,
        color: '#6B7280',
        marginTop: 10,
    },

    value: {
        fontSize: 17,
        fontWeight: '600',
        marginBottom: 12,
        color: '#111827',
    },

    amount: {
        fontSize: 32,
        fontWeight: '700',
        color: '#009D94',
        marginVertical: 15,
    },

    note: {
        fontSize: 14,
        color: '#6B7280',
        marginBottom: 25,
        lineHeight: 22,
    },

    button: {
        height: 52,
        borderRadius: 12,
        backgroundColor: '#009D94',
        justifyContent: 'center',
        alignItems: 'center',
    },

    buttonDisabled: {
        opacity: 0.7,
    },

    buttonText: {
        color: '#FFFFFF',
        fontSize: 17,
        fontWeight: '700',
    },

    testMode: {
        textAlign: 'center',
        marginTop: 18,
        fontSize: 13,
        fontWeight: '800',
        color: '#009D94',
    },

    testModeText: {
        textAlign: 'center',
        marginTop: 5,
        fontSize: 12,
        color: '#6B7280',
    },

});

