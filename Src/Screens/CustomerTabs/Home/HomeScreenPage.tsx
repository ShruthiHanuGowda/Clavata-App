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

// const salons = [
//   {
//     id: '1',
//     name: 'Style Studio',
//     rating: 4.8,
//     reviews: 234,
//     distance: '650 m',
//     services: 'Hair • Spa • Facial',
//     price: 299,
//     image: 'https://picsum.photos/300/300',
//   },
//   {
//     id: '2',
//     name: 'Royal Salon',
//     rating: 4.9,
//     reviews: 612,
//     distance: '1.4 km',
//     services: 'Hair • Bridal',
//     price: 499,
//     image: 'https://picsum.photos/301/301',
//   },
// ];

export default function HomeScreenPage() {
  const client = useApolloClient();
  const [salons, setSalons] = useState<any[]>([]);
  const [search, setSearch] = useState('');
  const [showLocationModal, setShowLocationModal] = useState(false);
  const [selectedLocation, setSelectedLocation] = useState(
    'Choose Location',
  );


  useEffect(() => {
    loadLocation();
  }, []);

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

      const formatted = data.nearbySalons.map((item: any) => ({
        id: item.salonId,
        name: item.salonName,
        rating: item.averageRating,
        reviews: 0,
        distance:
          item.distance < 1
            ? `${Math.round(item.distance * 1000)} m`
            : `${item.distance.toFixed(1)} km`,
        services: item.address.city,
        price: 0,
        image:
          item.logoUrl ||
          'https://picsum.photos/300/300',
      }));

      setSalons(formatted);

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