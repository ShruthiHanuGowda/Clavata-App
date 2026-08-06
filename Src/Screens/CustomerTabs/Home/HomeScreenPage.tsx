import React, { useEffect, useState } from 'react';
import {
  SafeAreaView,
  FlatList,
  StyleSheet,
  View,
  Text,
} from 'react-native';
import HomeHeader from './HomeHeader';
import SearchBar from './SearchBar';
import ServiceChips from './ServiceChips';
import SalonCard from './SalonCard';
import LocationBottomSheet from './LocationBottomSheet';
import { getSavedLocation } from '../../../services/locationStorage';
import { GET_NEARBY_SALONS } from '../../../graphql/queries';
import { useApolloClient } from '@apollo/client';
import ReviewPopup from './ReviewPopup';
import { CUSTOMER_BOOKINGS } from '../../../graphql/queries';
import { useNavigation } from '@react-navigation/native';
import { useUser } from '../../../context/UserContext';

type Booking = {
  bookingId: string;
  salonId: string;
  customerUserId: string;
  customerName: string;
  salonName: string;
  bookingStatus: string;
  reviewSubmitted?: boolean;
};

export default function HomeScreenPage() {
  const client = useApolloClient();
  const navigation = useNavigation<any>();
  const [showReviewPopup, setShowReviewPopup] = useState(false);
  const [pendingBooking, setPendingBooking] =
    useState<Booking | null>(null);
  const [bookings, setBookings] = useState<any[]>([]);
  const [salons, setSalons] = useState<any[]>([]);
  const [search, setSearch] = useState('');
  const [showLocationModal, setShowLocationModal] = useState(false);
  const [selectedLocation, setSelectedLocation] = useState(
    'Choose Location',
  );
  const { currentUser } = useUser();

  // useEffect(() => {
  //   loadLocation();
  //   loadCustomerBookings();
  // }, []);

  useEffect(() => {
    loadLocation();
    if (currentUser?.userId) {
      loadCustomerBookings();
    }
  }, [currentUser]);

  const fetchNearbySalons = async (
    latitude: number,
    longitude: number,
  ) => {
    console.log('Customer Latitude:', latitude);
    console.log('Customer Longitude:', longitude);
    try {
      const { data } = await client.query({
        query: GET_NEARBY_SALONS,
        variables: {
          latitude,
          longitude,
          radius: 10,
        },
        fetchPolicy: 'network-only',
      });

      console.log('Nearby Salons Data:', data);

      const formatted = data.nearbySalons.map((item: any) => ({
        id: item.salonId,
        name: item.salonName,
        rating: item.averageRating,
        reviews: item.totalReviews,
        distance:
          item.distance < 1
            ? `${Math.round(item.distance * 1000)} m`
            : `${item.distance.toFixed(1)} km`,

        address: item.address,
        price: 0,
        image: item.logoUrl || 'https://picsum.photos/300/300',
      }));
      setSalons(formatted);

      console.log('formatted Salons Data:', formatted);

    } catch (e) {
      console.log(e);
    }
  };

  const loadLocation = async () => {
    const location = await getSavedLocation();

    if (location) {
      setSelectedLocation(location.address);

      fetchNearbySalons(
        12.963694,
        77.4014239,
        // location.latitude,
        // location.longitude,
      );
    }
  };

  const loadCustomerBookings = async () => {
    try {
      const { data } = await client.query({
        query: CUSTOMER_BOOKINGS,
        variables: {
          customerUserId: currentUser?.userId
        },
        fetchPolicy: "network-only"
      });
      setBookings(data.customerBookings);
      const booking =
        data.customerBookings.find(
          (item: any) =>
            item.bookingStatus === "COMPLETED" &&
            item.reviewSubmitted === false
        );
      if (booking) {
        setPendingBooking(booking);
        setShowReviewPopup(true);
      }
    } catch (error) {
      console.log(
        "Booking loading error",
        error
      );
    }
  };
  return (
    <SafeAreaView style={styles.container}>
      {/* <FlatList
        ListHeaderComponent={
          <>
            <HomeHeader
              location={selectedLocation}
              onPressLocation={() => setShowLocationModal(true)}
            />
            <SearchBar
              value={search}
              onChangeText={setSearch}
            />

            <ServiceChips
              onSelect={setSearch}
            />
          </>
        }
        data={salons}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <SalonCard salon={item} />
        )}
        contentContainerStyle={{ paddingBottom: 30 }}
      /> */}

      <FlatList
        ListHeaderComponent={
          <>
            <HomeHeader
              location={selectedLocation}
              onPressLocation={() => setShowLocationModal(true)}
            />

            <SearchBar
              value={search}
              onChangeText={setSearch}
            />

            <ServiceChips
              onSelect={setSearch}
            />
          </>
        }
        data={salons}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <SalonCard salon={item} />
        )}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyTitle}>
              No salons found nearby
            </Text>

            <Text style={styles.emptySubtitle}>
              Try changing your location or increase the search radius.
            </Text>
          </View>
        }
        contentContainerStyle={{ paddingBottom: 30 }}
      />

      <LocationBottomSheet
        visible={showLocationModal}
        onClose={() => setShowLocationModal(false)}
        onLocationSelected={(location) => {
          setSelectedLocation(location.address);

          fetchNearbySalons(
            // location.latitude,
            // location.longitude,
            12.963694,
            77.4014239,
          );
        }}
      />
      <ReviewPopup
        visible={showReviewPopup}
        salonName={
          pendingBooking?.salonName
        }
        onRate={() => {
          setShowReviewPopup(false);
          navigation.navigate(
            "Bookings",
            {
              screen: "RateReview",
              params: {
                booking: pendingBooking
              }
            }
          );
        }}
        onLater={() => {
          setShowReviewPopup(false);
        }}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F6F7FB',
  },

  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 60,
    paddingHorizontal: 20,
  },

  emptyTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#111',
  },

  emptySubtitle: {
    marginTop: 8,
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
  },
});