import React from 'react';
import {
  SafeAreaView,
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';

const PRIMARY = '#009D94';

export default function BookingPaymentScreen({
  navigation,
  route,
}: any) {

  const booking = route.params?.booking;

  const totalAmount = booking?.totalAmount ?? 1000;

  const bookingFee = Number((totalAmount * 0.05).toFixed(2));

  const remaining = Number(
    (totalAmount - bookingFee).toFixed(2),
  );

  const payNow = () => {

    // Razorpay / PhonePe / Cashfree

    navigation.replace(
      'BookingSuccess',
      {
        booking: {
          ...booking,
          bookingFee,
          remaining,
        },
      },
    );
  };

  return (
    <SafeAreaView style={styles.container}>

      <View style={styles.content}>

        <Text style={styles.icon}>🎉</Text>

        <Text style={styles.title}>
          Appointment Accepted
        </Text>

        <Text style={styles.subtitle}>
          Your salon has accepted your booking.
          Pay a small booking fee to secure
          your appointment.
        </Text>

        <View style={styles.card}>

          <Row
            title="Service Total"
            value={`₹${totalAmount}`}
          />

          <Row
            title="Booking Fee (5%)"
            value={`₹${bookingFee}`}
          />

          <Row
            title="Pay at Salon"
            value={`₹${remaining}`}
          />

        </View>

        <TouchableOpacity
          style={styles.payButton}
          onPress={payNow}>

          <Text style={styles.payText}>
            Pay ₹{bookingFee}
          </Text>

        </TouchableOpacity>

      </View>

    </SafeAreaView>
  );
}

function Row({
  title,
  value,
}: {
  title: string;
  value: string;
}) {
  return (
    <View style={styles.row}>
      <Text style={styles.label}>
        {title}
      </Text>

      <Text style={styles.value}>
        {value}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({

  container: {
    flex: 1,
    backgroundColor: '#F5F7FA',
  },

  content: {
    flex: 1,
    justifyContent: 'center',
    padding: 24,
  },

  icon: {
    fontSize: 70,
    textAlign: 'center',
  },

  title: {
    marginTop: 18,
    fontSize: 28,
    fontWeight: '700',
    textAlign: 'center',
  },

  subtitle: {
    marginTop: 12,
    color: '#666',
    textAlign: 'center',
    fontSize: 15,
    lineHeight: 22,
    marginBottom: 35,
  },

  card: {
    backgroundColor: '#FFF',
    borderRadius: 16,
    padding: 20,
  },

  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginVertical: 12,
  },

  label: {
    color: '#555',
    fontSize: 16,
  },

  value: {
    fontWeight: '700',
    fontSize: 17,
  },

  payButton: {
    marginTop: 35,
    height: 56,
    borderRadius: 30,
    backgroundColor: PRIMARY,
    justifyContent: 'center',
    alignItems: 'center',
  },

  payText: {
    color: '#FFF',
    fontWeight: '700',
    fontSize: 18,
  },

});