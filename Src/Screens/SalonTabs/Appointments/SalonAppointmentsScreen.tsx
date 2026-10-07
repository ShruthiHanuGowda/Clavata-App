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
  gql,
  useQuery,
  useMutation,
} from '@apollo/client';

import styles from './styles';

import AppointmentCard, {
  Booking,
} from './AppointmentCard';

import AppointmentFilter from './AppointmentFilter';

import {useUser} from '../../../context/UserContext';

import {
  ACCEPT_BOOKING,
  REJECT_BOOKING,
  COMPLETE_BOOKING,
} from '../../../graphql/queries';


// ============================================================
// GRAPHQL QUERY
// ============================================================

export const SALON_DASHBOARD_QUERY = gql`
  query SalonDashboard($salonId: ID!) {
    salonBookings(salonId: $salonId) {
      bookingId
      salonId
      customerUserId
      salonName
      customerName
      customerPhone
      bookingDate
      startTime
      endTime

      services {
        serviceId
        name
        audience
        category
        subcategory
        categoryId
        subcategoryId
        duration
        price
      }

      totalDuration
      subtotal
      discount
      totalAmount

      paymentMethod
      paymentStatus
      bookingStatus

      notes
      salonNote

      bookingFee
      bookingFeeStatus
      bookingFeePaidAt
      remainingAmount

      razorpayOrderId
      razorpayPaymentId
      paymentGateway

      reviewSubmitted
      rating
      review
      reviewedAt

      createdAt
      updatedAt
    }
  }
`;


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
    SALON_DASHBOARD_QUERY,
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
          '[SalonAppointments] SALON_DASHBOARD_QUERY SUCCESS'
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
          '[SalonAppointments] services received:',
          JSON.stringify(
            responseData?.salonBookings?.map(
              (booking: Booking) => ({
                bookingId:
                  booking.bookingId,

                services:
                  booking.services,
              })
            ),
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
          '[SalonAppointments] SALON_DASHBOARD_QUERY ERROR'
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
  // BOOKING SERVICES DEBUG
  // ============================================================

  console.log(
    '[SalonAppointments] booking services:',
    JSON.stringify(
      bookings.map(
        booking => ({
          bookingId:
            booking.bookingId,

          services:
            booking.services,
        })
      ),
      null,
      2
    )
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
           paddingHorizontal: 4,
    paddingBottom: 30,


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
            booking={item}

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
