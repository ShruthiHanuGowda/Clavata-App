import React, { useMemo, useState } from 'react';
import {
  SafeAreaView,
  View,
  Text,
  FlatList,
  Alert,
  ActivityIndicator,
} from 'react-native';

import {
  useQuery,
  useMutation,
} from '@apollo/client';

import styles from './styles';
import AppointmentCard from './AppointmentCard';
import AppointmentFilter from './AppointmentFilter';
import { useUser } from '../../../context/UserContext';
import {
  LIST_BOOKINGS,
  ACCEPT_BOOKING,
  REJECT_BOOKING,
} from '../../../graphql/queries';

type Booking = {
  bookingId: string;
  customerName: string;
  customerPhone: string;
  bookingDate: string;
  startTime: string;
  endTime: string;
  bookingStatus: string;
  totalAmount: number;
  services: {
    name: string;
  }[];
};

export default function SalonAppointmentsScreen() {

  const { currentUser } = useUser();
  const salonId = currentUser?.salonId;
  const [selectedFilter, setSelectedFilter] =
    useState('Requests');

  const {
    data,
    loading,
    refetch,
  } = useQuery(LIST_BOOKINGS, {
    skip: !salonId,
    variables: {
      salonId,
    },
    fetchPolicy: 'network-only',
  });


  const [acceptBookingMutation] =
    useMutation(ACCEPT_BOOKING);

  const [rejectBookingMutation] =
    useMutation(REJECT_BOOKING);

  const bookings: Booking[] =
    data?.salonBookings ?? [];

  const filteredAppointments = useMemo(() => {
    return bookings.filter(item => {
      switch (selectedFilter) {
        case 'Requests':
          return item.bookingStatus === 'PENDING';

        case 'Confirmed':
          return item.bookingStatus === 'CONFIRMED';

        case 'Completed':
          return item.bookingStatus === 'COMPLETED';

        case 'Cancelled':
          return item.bookingStatus === 'CANCELLED';

        default:
          return true;
      }
    });
  }, [bookings, selectedFilter]);

  const acceptBooking = async (
    bookingId: string,
  ) => {
    try {
      await acceptBookingMutation({
        variables: {
          bookingId,
          salonNote: 'See you at your appointment.',
        },
      });

      Alert.alert(
        'Success',
        'Appointment accepted.',
      );

      refetch();
    } catch (error: any) {
      Alert.alert(
        'Error',
        error.message,
      );
    }
  };

  const rejectBooking = async (
    bookingId: string,
  ) => {
    Alert.alert(
      'Reject Appointment',
      'Are you sure you want to reject this booking?',
      [
        {
          text: 'No',
          style: 'cancel',
        },
        {
          text: 'Yes',
          style: 'destructive',
          onPress: async () => {
            try {
              await rejectBookingMutation({
                variables: {
                  bookingId,
                  salonNote:
                    'Salon unavailable.',
                },
              });

              Alert.alert(
                'Cancelled',
                'Appointment cancelled.',
              );

              refetch();
            } catch (error: any) {
              Alert.alert(
                'Error',
                error.message,
              );
            }
          },
        },
      ],
    );
  };

  if (loading) {
    return (
      <SafeAreaView
        style={styles.loader}>
        <ActivityIndicator
          size="large"
          color="#009D94"
        />
      </SafeAreaView>
    );
  }
  return (
    <SafeAreaView style={styles.container}>

      {/* Header */}

      <View style={styles.header}>
        <Text style={styles.title}>
          Appointments
        </Text>
      </View>

      {/* Filters */}

      <AppointmentFilter
        selected={selectedFilter}
        onSelect={setSelectedFilter}
      />

      {/* List */}

      <FlatList
        data={filteredAppointments}
        keyExtractor={(item) => item.bookingId}
        showsVerticalScrollIndicator={false}
        refreshing={loading}
        onRefresh={refetch}
        contentContainerStyle={{
          paddingBottom: 30,
          flexGrow: filteredAppointments.length === 0 ? 1 : 0,
        }}
        ListEmptyComponent={
          <View
            style={{
              flex: 1,
              justifyContent: 'center',
              alignItems: 'center',
              paddingTop: 80,
            }}>
            <Text
              style={{
                fontSize: 16,
                color: '#777',
              }}>
              No appointments found
            </Text>
          </View>
        }
        renderItem={({ item }) => (
          <AppointmentCard
            bookingId={item.bookingId}
            customer={item.customerName}
            service={item.services
              .map(service => service.name)
              .join(', ')}
            amount={item.totalAmount}
            phone={item.customerPhone}
            time={`${item.bookingDate} • ${item.startTime} - ${item.endTime}`}
            status={item.bookingStatus}
            onPress={() =>
              Alert.alert(
                item.customerName,
                item.services
                  .map(service => service.name)
                  .join('\n')
              )
            }
            onAccept={() =>
              acceptBooking(item.bookingId)
            }
            onReject={() =>
              rejectBooking(item.bookingId)
            }
          />
        )}
      />

    </SafeAreaView>
  );
}