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
    UPDATE_BOOKING_PAYMENT_STATUS,
} from '../../../graphql/queries';


export default function BookingPayment({ route, navigation }: any) {

    const { booking } = route.params;

    const [loading, setLoading] = useState(false);


    const [updatePaymentStatus] =
        useMutation(
            UPDATE_BOOKING_PAYMENT_STATUS
        );


    const startPayment = async () => {

        try {

            setLoading(true);


            const options = {

                description:
                    'Salon booking advance payment',

                image:
                    'https://your-logo-url.com/logo.png',

                currency:
                    'INR',

                key:
                    'YOUR_RAZORPAY_KEY',

                amount:
                    booking.bookingFee * 100,


                order_id:
                    "order_TEST123456",


                name:
                    booking.salonName,


                prefill: {
                    email:
                        'customer@email.com',

                    contact:
                        booking.customerPhone,

                    name:
                        booking.customerName,
                },


                theme: {
                    color: '#009D94'
                }

            };

            RazorpayCheckout.open(options)

                .then(async (data: any) => {


                    console.log(
                        "Payment Success",
                        data
                    );


                    await updatePaymentStatus({

                        variables: {

                            bookingId:
                                booking.bookingId,


                            paymentId:
                                data.razorpay_payment_id,


                            bookingFeeStatus:
                                "PAID"

                        }

                    });



                    Alert.alert(
                        "Payment Successful",
                        "Your booking is confirmed"
                    );


                    navigation.goBack();



                })

                .catch((error: any) => {


                    console.log(error);


                    Alert.alert(
                        "Payment Failed",
                        error.description
                    );


                });


        }
        catch (e: any) {

            Alert.alert(
                "Error",
                e.message
            );

        }
        finally {

            setLoading(false);

        }

    }



    return (

        <SafeAreaView style={styles.container}>


            <View style={styles.card}>


                <Text style={styles.title}>
                    Confirm Payment
                </Text>


                <Text style={styles.salon}>
                    {booking.salonName}
                </Text>


                <Text>
                    Appointment Date
                </Text>


                <Text style={styles.value}>
                    {booking.bookingDate}
                </Text>


                <Text>
                    Booking Fee
                </Text>


                <Text style={styles.amount}>
                    ₹{booking.bookingFee}
                </Text>


                <Text style={styles.note}>
                    Remaining ₹
                    {booking.remainingAmount}
                    {' '}
                    will be paid at salon
                </Text>



                <TouchableOpacity
                    style={styles.button}
                    onPress={startPayment}
                    disabled={loading}
                >

                    <Text style={styles.buttonText}>
                        {
                            loading
                                ?
                                "Processing..."
                                :
                                "Pay Now"
                        }
                    </Text>

                </TouchableOpacity>


            </View>


        </SafeAreaView>

    )

}



const styles = StyleSheet.create({

    container: {
        flex: 1,
        backgroundColor: '#F7F8FA',
        justifyContent: 'center',
        padding: 20
    },


    card: {
        backgroundColor: '#fff',
        padding: 20,
        borderRadius: 20
    },


    title: {
        fontSize: 24,
        fontWeight: '700',
        marginBottom: 20
    },


    salon: {
        fontSize: 18,
        fontWeight: '700',
        marginBottom: 15
    },


    value: {
        fontSize: 16,
        marginBottom: 15
    },


    amount: {
        fontSize: 28,
        fontWeight: '700',
        color: '#009D94',
        marginVertical: 10
    },


    note: {
        color: '#666',
        marginBottom: 20
    },


    button: {
        height: 50,
        backgroundColor: '#009D94',
        borderRadius: 12,
        alignItems: 'center',
        justifyContent: 'center'
    },


    buttonText: {
        color: '#fff',
        fontSize: 17,
        fontWeight: '700'
    }


});