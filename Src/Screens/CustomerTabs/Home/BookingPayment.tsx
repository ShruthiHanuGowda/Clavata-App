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

export default function BookingPayment({ route, navigation }: any) {

    const { booking } = route.params;

    const [loading, setLoading] = useState(false);

    const [createRazorpayOrder] =
        useMutation(CREATE_RAZORPAY_ORDER);

    const [verifyRazorpayPayment] =
        useMutation(VERIFY_RAZORPAY_PAYMENT);

    const startPayment = async () => {

        try {

            setLoading(true);

            // Create Razorpay Order
            const orderResponse =
                await createRazorpayOrder({
                    variables: {
                        input: {
                            bookingId:
                                booking.bookingId,
                        },
                    },
                });

            const order =
                orderResponse.data
                    .createRazorpayOrder
                    .order;

            const options = {

                description:
                    'Salon booking advance payment',

                image:
                    'https://your-logo-url.com/logo.png',

                currency:
                    order.currency,

                key:
                    order.keyId,

                amount:
                    order.amount,

                order_id:
                    order.orderId,

                name:
                    booking.salonName,

                prefill: {

                    email:
                        "customer@email.com",

                    contact:
                        booking.customerPhone,

                    name:
                        booking.customerName,
                },

                theme: {
                    color: '#009D94'
                }
            };

            const payment =
                await RazorpayCheckout.open(
                    options
                );

            console.log(
                "Payment Success",
                payment
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

            if (
                verifyResponse.data
                    .verifyRazorpayPayment
                    .success
            ) {

                Alert.alert(
                    "Payment Successful",
                    "Booking fee paid successfully.",
                    [
                        {
                            text: "OK",
                            onPress: () =>
                                navigation.goBack()
                        }
                    ]
                );

            } else {

                Alert.alert(
                    "Verification Failed",
                    verifyResponse.data
                        .verifyRazorpayPayment
                        .message
                );

            }

        }
        catch (error: any) {

            console.log(error);

            if (error?.code === 0) {
                Alert.alert(
                    "Payment Cancelled",
                    "You cancelled the payment."
                );
                return;
            }

            Alert.alert(
                "Payment Failed",
                error?.description ||
                error?.message ||
                "Something went wrong."
            );
        }
        finally {

            setLoading(false);

        }

    };

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.card}>

                <Text style={styles.title}>
                    Confirm Payment
                </Text>

                <Text style={styles.salon}>
                    {booking.salonName}
                </Text>

                <Text style={styles.label}>
                    Appointment Date
                </Text>

                <Text style={styles.value}>
                    {booking.bookingDate}
                </Text>

                <Text style={styles.label}>
                    Booking Fee
                </Text>

                <Text style={styles.amount}>
                    ₹{booking.bookingFee}
                </Text>

                <Text style={styles.note}>
                    Remaining ₹
                    {booking.remainingAmount}
                    {" "}
                    will be paid at salon.
                </Text>

                <TouchableOpacity
                    style={[
                        styles.button,
                        loading && styles.buttonDisabled
                    ]}
                    disabled={loading}
                    onPress={startPayment}
                >
                    <Text style={styles.buttonText}>
                        {
                            loading
                                ? "Processing..."
                                : "Pay Now"
                        }
                    </Text>
                </TouchableOpacity>

            </View>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({

    container: {
        flex: 1,
        justifyContent: "center",
        backgroundColor: "#F7F8FA",
        padding: 20,
    },

    card: {
        backgroundColor: "#FFFFFF",
        borderRadius: 20,
        padding: 24,
        elevation: 3,
    },

    title: {
        fontSize: 24,
        fontWeight: "700",
        marginBottom: 20,
        color: "#111827",
    },

    salon: {
        fontSize: 20,
        fontWeight: "700",
        color: "#009D94",
        marginBottom: 20,
    },

    label: {
        fontSize: 14,
        color: "#6B7280",
        marginTop: 10,
    },

    value: {
        fontSize: 17,
        fontWeight: "600",
        marginBottom: 12,
        color: "#111827",
    },

    amount: {
        fontSize: 32,
        fontWeight: "700",
        color: "#009D94",
        marginVertical: 15,
    },

    note: {
        fontSize: 14,
        color: "#6B7280",
        marginBottom: 25,
        lineHeight: 22,
    },

    button: {
        height: 52,
        borderRadius: 12,
        backgroundColor: "#009D94",
        justifyContent: "center",
        alignItems: "center",
    },

    buttonDisabled: {
        opacity: 0.7,
    },

    buttonText: {
        color: "#FFFFFF",
        fontSize: 17,
        fontWeight: "700",
    },

});