import React, { useState } from 'react';
import {
  SafeAreaView,
  FlatList,
  StyleSheet,
} from 'react-native';

import HomeHeader from './HomeHeader';
import SearchBar from './SearchBar';
import ServiceChips from './ServiceChips';
import SalonCard from './SalonCard';
import LocationBottomSheet from './LocationBottomSheet';

const salons = [
  {
    id: '1',
    name: 'Style Studio',
    rating: 4.8,
    reviews: 234,
    distance: '650 m',
    services: 'Hair • Spa • Facial',
    price: 299,
    image: 'https://picsum.photos/300/300',
  },
  {
    id: '2',
    name: 'Royal Salon',
    rating: 4.9,
    reviews: 612,
    distance: '1.4 km',
    services: 'Hair • Bridal',
    price: 499,
    image: 'https://picsum.photos/301/301',
  },
];

export default function HomeScreenPage() {
  const [search, setSearch] = useState('');
  const [showLocationModal, setShowLocationModal] = useState(false);
  const [selectedLocation, setSelectedLocation] = useState(
    'Choose Location',
  );

  return (
    <SafeAreaView style={styles.container}>
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
        contentContainerStyle={{ paddingBottom: 30 }}
      />

      <LocationBottomSheet
        visible={showLocationModal}
        onClose={() => setShowLocationModal(false)}
        onLocationSelected={(location) => {
          setSelectedLocation(location.address);
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
});