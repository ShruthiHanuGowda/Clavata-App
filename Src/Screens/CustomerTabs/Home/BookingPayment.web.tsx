import React, { useState } from 'react';

import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  Platform,
} from 'react-native';

import { useNavigation, useRoute } from '@react-navigation/native';

import { useMutation } from '@apollo/client';

import { CREATE_BOOKING } from '../../../graphql/queries';

import { DButton } from '../../../components';


// ============================================================
// TYPES
// ============================================================

type RouteParams = {
  salonId?: string;
  serviceId?: string;
  serviceName?: string;

  bookingDate?: string;
  bookingTime?: string;

  totalAmount?: number;
  bookingFee?: number;
  remainingAmount?: number;

  customerId?: string;
  userId?: string;
};


// ============================================================
// COMPONENT
// ============================================================

export default function BookingPayment() {
  const navigation = useNavigation<any>();

  const route = useRoute<any>();

  const params =
    (route.params || {}) as RouteParams;


  // ============================================================
  // VALUES
  // ============================================================

  const salonId =
    params.salonId || '';

  const serviceId =
    params.serviceId || '';

  const serviceName =
    params.serviceName || 'Service';

  const bookingDate =
    params.bookingDate || '';

  const bookingTime =
    params.bookingTime || '';

  const totalAmount =
    Number(params.totalAmount || 0);

  const bookingFee =
    Number(params.bookingFee || 0);

  const remainingAmount =
    Number(
      params.remainingAmount ??
      Math.max(
        totalAmount - bookingFee,
        0,
      ),
    );


  // ============================================================
  // STATE
  // ============================================================

  const [loading, setLoading] =
    useState(false);


  // ============================================================
  // CREATE BOOKING
  // ============================================================

  const [
    createBooking,
  ] = useMutation(CREATE_BOOKING);


  // ============================================================
  // PAY AT SALON
  // ============================================================

  const handlePayAtSalon =
    async () => {

      if (loading) {
        return;
      }

      try {

        setLoading(true);

        console.log(
          '========================================',
        );

        console.log(
          'WEB BOOKING',
        );

        console.log(
          '========================================',
        );

        console.log(
          'Salon ID:',
          salonId,
        );

        console.log(
          'Service ID:',
          serviceId,
        );

        console.log(
          'Service:',
          serviceName,
        );

        console.log(
          'Date:',
          bookingDate,
        );

        console.log(
          'Time:',
          bookingTime,
        );

        console.log(
          'Total Amount:',
          totalAmount,
        );

        console.log(
          'Booking Fee:',
          bookingFee,
        );

        console.log(
          'Remaining Amount:',
          remainingAmount,
        );

        console.log(
          '========================================',
        );


        // ======================================================
        // CREATE BOOKING
        // ======================================================

        const { data } =
          await createBooking({
            variables: {
              input: {
                salonId,
                serviceId,
                bookingDate,
                bookingTime,

                totalAmount,

                bookingFee,

                remainingAmount,

                paymentMethod:
                  'PAY_AT_SALON',

                paymentStatus:
                  'PENDING',

                bookingStatus:
                  'CONFIRMED',
              },
            },
          });


        console.log(
          'CREATE BOOKING RESULT:',
          JSON.stringify(
            data,
            null,
            2,
          ),
        );


        const booking =
          data?.createBooking;


        if (!booking) {

          Alert.alert(
            'Booking Failed',
            'Unable to create your booking.',
          );

          return;
        }


        // ======================================================
        // SUCCESS
        // ======================================================

        Alert.alert(
          'Booking Confirmed',
          `Your ${serviceName} booking has been confirmed.`,
          [
            {
              text: 'OK',
              onPress: () => {

                navigation.navigate(
                  'BookingSuccess',
                  {
                    booking,
                  },
                );

              },
            },
          ],
        );

      } catch (error) {

        console.error(
          'WEB BOOKING ERROR:',
          error,
        );

        Alert.alert(
          'Booking Failed',
          'Something went wrong while creating your booking.',
        );

      } finally {

        setLoading(false);

      }
    };


  // ============================================================
  // RAZORPAY WEB
  // ============================================================

  const handleRazorpay =
    async () => {

      if (loading) {
        return;
      }

      /*
       * IMPORTANT:
       *
       * Do NOT import:
       *
       * import RazorpayCheckout from
       * 'react-native-razorpay';
       *
       * in this file.
       *
       * react-native-razorpay is native-only.
       *
       * For web, Razorpay should normally be integrated
       * using Razorpay Checkout.js or your web payment flow.
       */


      Alert.alert(
        'Online Payment',
        'Online Razorpay payment is not configured for the web yet.',
      );
    };


  // ============================================================
  // RENDER
  // ============================================================

  return (
    <View style={styles.container}>

      {/* ======================================================
          HEADER
      ====================================================== */}

      <View style={styles.header}>

        <TouchableOpacity
          onPress={() =>
            navigation.goBack()
          }
          style={styles.backButton}
        >

          <Text style={styles.back}>
            ←
          </Text>

        </TouchableOpacity>


        <Text style={styles.title}>
          Payment
        </Text>

      </View>


      {/* ======================================================
          SERVICE
      ====================================================== */}

      <View style={styles.card}>

        <Text style={styles.sectionTitle}>
          Booking Details
        </Text>


        <View style={styles.row}>

          <Text style={styles.label}>
            Service
          </Text>

          <Text style={styles.value}>
            {serviceName}
          </Text>

        </View>


        <View style={styles.row}>

          <Text style={styles.label}>
            Date
          </Text>

          <Text style={styles.value}>
            {bookingDate || '-'}
          </Text>

        </View>


        <View style={styles.row}>

          <Text style={styles.label}>
            Time
          </Text>

          <Text style={styles.value}>
            {bookingTime || '-'}
          </Text>

        </View>

      </View>


      {/* ======================================================
          PRICE
      ====================================================== */}

      <View style={styles.card}>

        <Text style={styles.sectionTitle}>
          Payment Summary
        </Text>


        <View style={styles.row}>

          <Text style={styles.label}>
            Total Amount
          </Text>

          <Text style={styles.value}>
            ₹{totalAmount.toFixed(2)}
          </Text>

        </View>


        <View style={styles.row}>

          <Text style={styles.label}>
            Booking Fee
          </Text>

          <Text style={styles.value}>
            ₹{bookingFee.toFixed(2)}
          </Text>

        </View>


        <View style={styles.divider} />


        <View style={styles.row}>

          <Text style={styles.totalLabel}>
            Pay at Salon
          </Text>

          <Text style={styles.totalValue}>
            ₹{remainingAmount.toFixed(2)}
          </Text>

        </View>

      </View>


      {/* ======================================================
          PAYMENT OPTIONS
      ====================================================== */}

      <View style={styles.paymentCard}>

        <Text style={styles.sectionTitle}>
          Choose Payment Method
        </Text>


        {/* PAY AT SALON */}

        <TouchableOpacity
          style={styles.paymentOption}
          onPress={handlePayAtSalon}
          disabled={loading}
          activeOpacity={0.8}
        >

          <View style={styles.paymentIcon}>
            <Text style={styles.paymentIconText}>
              💵
            </Text>
          </View>


          <View style={styles.paymentContent}>

            <Text style={styles.paymentTitle}>
              Pay at Salon
            </Text>

            <Text style={styles.paymentDescription}>
              Pay the remaining amount when you visit the salon.
            </Text>

          </View>


          <Text style={styles.arrow}>
            ›
          </Text>

        </TouchableOpacity>


        {/* RAZORPAY */}

        <TouchableOpacity
          style={[
            styles.paymentOption,
            styles.lastOption,
          ]}
          onPress={handleRazorpay}
          disabled={loading}
          activeOpacity={0.8}
        >

          <View style={styles.paymentIcon}>
            <Text style={styles.paymentIconText}>
              💳
            </Text>
          </View>


          <View style={styles.paymentContent}>

            <Text style={styles.paymentTitle}>
              Pay Online
            </Text>

            <Text style={styles.paymentDescription}>
              Pay securely online using Razorpay.
            </Text>

          </View>


          <Text style={styles.arrow}>
            ›
          </Text>

        </TouchableOpacity>

      </View>


      {/* ======================================================
          LOADING
      ====================================================== */}

      {loading && (

        <View style={styles.loadingOverlay}>

          <ActivityIndicator
            size="large"
            color="#009D94"
          />

          <Text style={styles.loadingText}>
            Processing booking...
          </Text>

        </View>

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
      backgroundColor: '#F7F8FA',
      padding: 20,
    },


    // ========================================================
    // HEADER
    // ========================================================

    header: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: 25,
    },

    backButton: {
      marginRight: 12,
    },

    back: {
      fontSize: 30,
      fontWeight: '700',
      color: '#111',
    },

    title: {
      fontSize: 28,
      fontWeight: '700',
      color: '#111',
    },


    // ========================================================
    // CARD
    // ========================================================

    card: {
      backgroundColor: '#FFFFFF',
      borderRadius: 16,
      padding: 20,
      marginBottom: 15,

      shadowColor: '#000',
      shadowOffset: {
        width: 0,
        height: 2,
      },

      shadowOpacity: 0.05,
      shadowRadius: 5,

      elevation: 2,
    },


    sectionTitle: {
      fontSize: 18,
      fontWeight: '700',
      color: '#111',
      marginBottom: 18,
    },


    row: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 13,
    },


    label: {
      fontSize: 14,
      color: '#777',
      flex: 1,
    },


    value: {
      fontSize: 15,
      fontWeight: '600',
      color: '#222',
      textAlign: 'right',
      flex: 1,
    },


    divider: {
      height: 1,
      backgroundColor: '#E7E7E7',
      marginVertical: 8,
    },


    totalLabel: {
      fontSize: 16,
      fontWeight: '700',
      color: '#111',
    },


    totalValue: {
      fontSize: 20,
      fontWeight: '800',
      color: '#009D94',
    },


    // ========================================================
    // PAYMENT CARD
    // ========================================================

    paymentCard: {
      backgroundColor: '#FFFFFF',
      borderRadius: 16,
      padding: 20,

      shadowColor: '#000',
      shadowOffset: {
        width: 0,
        height: 2,
      },

      shadowOpacity: 0.05,
      shadowRadius: 5,

      elevation: 2,
    },


    paymentOption: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingVertical: 16,
      borderBottomWidth: 1,
      borderBottomColor: '#EEEEEE',
    },


    lastOption: {
      borderBottomWidth: 0,
    },


    paymentIcon: {
      width: 48,
      height: 48,
      borderRadius: 24,
      backgroundColor: '#F0FAF8',
      alignItems: 'center',
      justifyContent: 'center',
      marginRight: 14,
    },


    paymentIconText: {
      fontSize: 22,
    },


    paymentContent: {
      flex: 1,
    },


    paymentTitle: {
      fontSize: 16,
      fontWeight: '700',
      color: '#111',
      marginBottom: 4,
    },


    paymentDescription: {
      fontSize: 13,
      lineHeight: 18,
      color: '#777',
    },


    arrow: {
      fontSize: 28,
      color: '#999',
      marginLeft: 10,
    },


    // ========================================================
    // LOADING
    // ========================================================

    loadingOverlay: {
      position: 'absolute',
      left: 0,
      right: 0,
      top: 0,
      bottom: 0,

      backgroundColor:
        'rgba(255,255,255,0.85)',

      alignItems: 'center',
      justifyContent: 'center',
    },


    loadingText: {
      marginTop: 12,
      fontSize: 14,
      color: '#555',
    },

  });

