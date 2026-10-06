import React, {
  useMemo,
  useState,
} from 'react';

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
  COMPLETE_BOOKING,
} from '../../../graphql/queries';


// ============================================================
// TYPES
// ============================================================

type Service = {
  serviceId?: string;

  name: string;

  audience?: 'FEMALE' | 'MALE' | 'KIDS' | null;

  category?: string;

  subcategory?: string;

  categoryId?: string | null;

  subcategoryId?: string | null;

  duration?: number;

  price?: number;
};


type Booking = {
  bookingId: string;

  salonId?: string;

  customerUserId?: string;

  customerName: string;

  customerPhone: string;

  bookingDate: string;

  startTime: string;

  endTime: string;

  bookingStatus: string;

  totalAmount: number;

  services: Service[];

  bookingFeeStatus: string;

  bookingFee: number;
};


// ============================================================
// SCREEN
// ============================================================

export default function SalonAppointmentsScreen() {

  const {
    currentUser,
  } = useUser();


  // ============================================================
  // SALON ID
  // ============================================================

  const salonId =
    currentUser?.salonId;


  console.log(
    '===================================================='
  );

  console.log(
    '[SalonAppointments] currentUser:',
    JSON.stringify(
      currentUser,
      null,
      2
    )
  );

  console.log(
    '[SalonAppointments] salonId:',
    salonId
  );

  console.log(
    '===================================================='
  );


  // ============================================================
  // FILTER
  // ============================================================

  const [
    selectedFilter,
    setSelectedFilter,
  ] = useState('Requests');


  // ============================================================
  // GET BOOKINGS
  // ============================================================

  const {
    data,
    loading,
    error,
    refetch,
  } = useQuery(
    LIST_BOOKINGS,
    {
      skip: !salonId,

      variables: {
        salonId,
      },

      fetchPolicy:
        'network-only',

      notifyOnNetworkStatusChange:
        true,

      onCompleted: (
        responseData
      ) => {

        console.log(
          '===================================================='
        );

        console.log(
          '[SalonAppointments] LIST_BOOKINGS SUCCESS'
        );

        console.log(
          '[SalonAppointments] response:',
          JSON.stringify(
            responseData,
            null,
            2
          )
        );

        console.log(
          '===================================================='
        );

      },

      onError: (
        queryError
      ) => {

        console.log(
          '===================================================='
        );

        console.log(
          '[SalonAppointments] LIST_BOOKINGS ERROR'
        );

        console.log(
          '[SalonAppointments] message:',
          queryError.message
        );

        console.log(
          '[SalonAppointments] graphQLErrors:',
          JSON.stringify(
            queryError.graphQLErrors,
            null,
            2
          )
        );

        console.log(
          '[SalonAppointments] networkError:',
          queryError.networkError
        );

        console.log(
          '===================================================='
        );

      },
    }
  );


  // ============================================================
  // MUTATIONS
  // ============================================================

  const [
    completeBookingMutation,
  ] = useMutation(
    COMPLETE_BOOKING
  );


  const [
    acceptBookingMutation,
  ] = useMutation(
    ACCEPT_BOOKING
  );


  const [
    rejectBookingMutation,
  ] = useMutation(
    REJECT_BOOKING
  );


  // ============================================================
  // RAW BOOKINGS
  // ============================================================

  const bookings: Booking[] =
    data?.salonBookings ?? [];


  console.log(
    '[SalonAppointments] bookings:',
    JSON.stringify(
      bookings,
      null,
      2
    )
  );


  console.log(
    '[SalonAppointments] booking count:',
    bookings.length
  );


  console.log(
    '[SalonAppointments] selected filter:',
    selectedFilter
  );


  // ============================================================
  // BOOKING STATUS DEBUG
  // ============================================================

  console.log(
    '[SalonAppointments] statuses:',
    bookings.map(
      booking => ({
        bookingId:
          booking.bookingId,

        bookingStatus:
          booking.bookingStatus,

        bookingDate:
          booking.bookingDate,

        salonId:
          booking.salonId,
      })
    )
  );


  // ============================================================
  // COMPLETE BOOKING
  // ============================================================

  const completeBooking = async (
    bookingId: string,
  ) => {

    Alert.alert(
      'Complete Service',

      'Have you completed the service and collected the remaining payment?',

      [
        {
          text: 'Cancel',

          style: 'cancel',
        },

        {
          text: 'Complete',

          onPress:
            async () => {

              try {

                await completeBookingMutation({

                  variables: {

                    input: {

                      bookingId,

                      bookingStatus:
                        'COMPLETED',

                      salonNote:
                        'Service completed.',

                    },

                  },

                });


                Alert.alert(
                  'Success',
                  'Booking completed successfully.',
                );


                await refetch();

              } catch (
                mutationError: any
              ) {

                console.log(
                  '[SalonAppointments] COMPLETE ERROR:',
                  mutationError
                );

                Alert.alert(
                  'Error',
                  mutationError.message,
                );

              }

            },

        },

      ],
    );

  };


  // ============================================================
  // ACCEPT BOOKING
  // ============================================================

  const acceptBooking = async (
    bookingId: string,
  ) => {

    console.log(
      '[SalonAppointments] accepting booking:',
      bookingId
    );


    try {

      await acceptBookingMutation({

        variables: {

          bookingId,

          salonNote:
            'See you at your appointment.',

        },

      });


      Alert.alert(
        'Success',
        'Appointment accepted.',
      );


      await refetch();

    } catch (
      mutationError: any
    ) {

      console.log(
        '[SalonAppointments] ACCEPT ERROR:',
        mutationError
      );


      Alert.alert(
        'Error',
        mutationError.message,
      );

    }

  };


  // ============================================================
  // REJECT BOOKING
  // ============================================================

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

          onPress:
            async () => {

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


                await refetch();

              } catch (
                mutationError: any
              ) {

                console.log(
                  '[SalonAppointments] REJECT ERROR:',
                  mutationError
                );


                Alert.alert(
                  'Error',
                  mutationError.message,
                );

              }

            },

        },

      ],
    );

  };


  // ============================================================
  // FILTER BOOKINGS
  // ============================================================

  const filteredAppointments =
    useMemo(
      () => {

        console.log(
          '[SalonAppointments] filtering:',
          {
            selectedFilter,
            totalBookings:
              bookings.length,
          }
        );


        const result =
          bookings.filter(
            item => {

              const status =
                String(
                  item.bookingStatus ??
                  ''
                ).toUpperCase();


              switch (
                selectedFilter
              ) {

                case 'Requests':

                  return (
                    status ===
                    'PENDING'
                  );


                case 'Confirmed':

                  return (
                    status ===
                    'CONFIRMED'
                  );


                case 'Completed':

                  return (
                    status ===
                    'COMPLETED'
                  );


                case 'Cancelled':

                  return (
                    status ===
                    'CANCELLED'
                  );


                default:

                  return true;

              }

            }
          );


        console.log(
          '[SalonAppointments] filtered count:',
          result.length
        );


        return result;

      },

      [
        bookings,
        selectedFilter,
      ]
    );


  // ============================================================
  // LOADING
  // ============================================================

  if (
    loading &&
    !data
  ) {

    return (

      <SafeAreaView
        style={
          styles.loader
        }>

        <ActivityIndicator
          size="large"
          color="#009D94"
        />

      </SafeAreaView>

    );

  }


  // ============================================================
  // QUERY ERROR
  // ============================================================

  if (
    error &&
    !data
  ) {

    return (

      <SafeAreaView
        style={
          styles.container
        }>

        <View
          style={{
            flex: 1,

            justifyContent:
              'center',

            alignItems:
              'center',

            paddingHorizontal:
              30,
          }}>

          <Text
            style={{
              fontSize: 16,

              color: '#777',

              textAlign:
                'center',

              marginBottom:
                10,
            }}>

            Unable to load appointments.

          </Text>


          <Text
            style={{
              fontSize: 13,

              color: '#999',

              textAlign:
                'center',
            }}>

            {error.message}

          </Text>

        </View>

      </SafeAreaView>

    );

  }


  // ============================================================
  // NO SALON ID
  // ============================================================

  if (!salonId) {

    return (

      <SafeAreaView
        style={
          styles.container
        }>

        <View
          style={{
            flex: 1,

            justifyContent:
              'center',

            alignItems:
              'center',

            paddingHorizontal:
              30,
          }}>

          <Text
            style={{
              fontSize: 16,

              color: '#777',

              textAlign:
                'center',
            }}>

            Salon information is not available.

          </Text>

        </View>

      </SafeAreaView>

    );

  }


  // ============================================================
  // UI
  // ============================================================

  return (

    <SafeAreaView
      style={
        styles.container
      }>


      {/* ======================================================
          HEADER
      ======================================================= */}

      <View
        style={
          styles.header
        }>

        <Text
          style={
            styles.title
          }>

          Appointment

        </Text>

      </View>


      {/* ======================================================
          FILTERS
      ======================================================= */}

      <AppointmentFilter
        selected={
          selectedFilter
        }

        onSelect={
          setSelectedFilter
        }
      />


      {/* ======================================================
          LIST
      ======================================================= */}

      <FlatList
        data={
          filteredAppointments
        }

        keyExtractor={
          item =>
            item.bookingId
        }

        showsVerticalScrollIndicator={
          false
        }

        refreshing={
          loading
        }

        onRefresh={
          refetch
        }

        contentContainerStyle={{
          paddingBottom:
            30,

          flexGrow:
            filteredAppointments.length ===
            0
              ? 1
              : 0,
        }}


        ListEmptyComponent={

          <View
            style={{
              flex: 1,

              justifyContent:
                'center',

              alignItems:
                'center',

              paddingTop:
                80,

              paddingHorizontal:
                30,
            }}>

            <Text
              style={{
                fontSize: 16,

                color: '#777',

                textAlign:
                  'center',
              }}>

              {bookings.length === 0

                ? 'No appointments found'

                : `No ${selectedFilter.toLowerCase()} appointments`}

            </Text>


            {bookings.length > 0 && (

              <Text
                style={{
                  fontSize: 13,

                  color: '#999',

                  marginTop: 8,

                  textAlign:
                    'center',
                }}>

                {bookings.length}{' '}
                appointment
                {bookings.length === 1
                  ? ''
                  : 's'} found in total.

              </Text>

            )}

          </View>

        }


        renderItem={({
          item,
        }) => (

          <AppointmentCard

            bookingId={
              item.bookingId
            }

            customer={
              item.customerName
            }

            service={
              Array.isArray(
                item.services
              )
                ? item.services
                    .map(
                      service =>
                        service.name
                    )
                    .join(', ')
                : ''
            }

            amount={
              item.totalAmount
            }

            phone={
              item.customerPhone
            }

            time={
              `${item.bookingDate} • ${item.startTime} - ${item.endTime}`
            }

            status={
              item.bookingStatus
            }


            onPress={() => {

              Alert.alert(

                item.customerName,

                Array.isArray(
                  item.services
                )
                  ? item.services
                      .map(
                        service =>
                          service.name
                      )
                      .join('\n')
                  : 'No services',

              );

            }}


            bookingFeeStatus={
              item.bookingFeeStatus
            }

            bookingFee={
              item.bookingFee
            }


            onAccept={() =>
              acceptBooking(
                item.bookingId
              )
            }


            onReject={() =>
              rejectBooking(
                item.bookingId
              )
            }


            onComplete={() =>
              completeBooking(
                item.bookingId
              )
            }

          />

        )}

      />

    </SafeAreaView>

  );

}