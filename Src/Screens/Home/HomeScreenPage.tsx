import React from 'react';
import {
  SafeAreaView,
  ScrollView,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  Image,
} from 'react-native';

const nearbySalons = [
  {
    id: '1',
    name: 'Style Studio',
    rating: '4.8',
    distance: '1.2 km',
    services: 'Hair • Spa • Makeup',
    price: 'Starts ₹299',
  },
  {
    id: '2',
    name: 'Urban Glow',
    rating: '4.7',
    distance: '2.1 km',
    services: 'Hair • Nails',
    price: 'Starts ₹399',
  },
];

const popularSalons = [
  {
    id: '3',
    name: 'Royal Salon',
    rating: '4.9',
    distance: '3.0 km',
    services: 'Hair • Bridal',
    price: 'Starts ₹499',
  },
];

export default function HomeScreen() {
  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{paddingBottom: 30}}>

        {/* Header */}

        <View style={styles.header}>
          <View>
            <Text style={styles.greeting}>Good Morning 👋</Text>
            <TouchableOpacity>
              <Text style={styles.location}>📍 Whitefield ▼</Text>
            </TouchableOpacity>
          </View>

          <TouchableOpacity style={styles.profile}>
            <Text style={{fontSize: 22}}>👤</Text>
          </TouchableOpacity>
        </View>

        {/* Search */}

        <TouchableOpacity activeOpacity={0.8}>
          <View style={styles.searchBox}>
            <TextInput
              editable={false}
              placeholder="Search salons or services"
              placeholderTextColor="#888"
            />
          </View>
        </TouchableOpacity>

        {/* Offer */}

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{paddingHorizontal: 20}}>

          <TouchableOpacity style={styles.offerCard}>
            <Text style={styles.offerTitle}>
              20% OFF Hair Spa
            </Text>

            <Text style={styles.offerSub}>
              Glow Studio
            </Text>

            <TouchableOpacity style={styles.offerButton}>
              <Text style={styles.offerButtonText}>
                Book Now
              </Text>
            </TouchableOpacity>
          </TouchableOpacity>

          <TouchableOpacity style={styles.offerCard}>
            <Text style={styles.offerTitle}>
              Flat ₹300 OFF
            </Text>

            <Text style={styles.offerSub}>
              First Booking
            </Text>

            <TouchableOpacity style={styles.offerButton}>
              <Text style={styles.offerButtonText}>
                Claim
              </Text>
            </TouchableOpacity>
          </TouchableOpacity>

        </ScrollView>

        {/* Nearby */}

        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>
            Nearby Salons
          </Text>

          <TouchableOpacity>
            <Text style={styles.seeAll}>
              See All
            </Text>
          </TouchableOpacity>
        </View>

        {nearbySalons.map(item => (
          <TouchableOpacity
            key={item.id}
            style={styles.card}>

            <View style={styles.imagePlaceholder}>
              <Text>📷</Text>
            </View>

            <View style={{flex: 1}}>

              <Text style={styles.salonName}>
                {item.name}
              </Text>

              <Text style={styles.details}>
                ⭐ {item.rating}    📍 {item.distance}
              </Text>

              <Text style={styles.service}>
                {item.services}
              </Text>

              <Text style={styles.price}>
                {item.price}
              </Text>

            </View>

          </TouchableOpacity>
        ))}

        {/* Popular */}

        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>
            Popular Salons
          </Text>

          <TouchableOpacity>
            <Text style={styles.seeAll}>
              See All
            </Text>
          </TouchableOpacity>
        </View>

        {popularSalons.map(item => (
          <TouchableOpacity
            key={item.id}
            style={styles.card}>

            <View style={styles.imagePlaceholder}>
              <Text>📷</Text>
            </View>

            <View style={{flex: 1}}>

              <Text style={styles.salonName}>
                {item.name}
              </Text>

              <Text style={styles.details}>
                ⭐ {item.rating}    📍 {item.distance}
              </Text>

              <Text style={styles.service}>
                {item.services}
              </Text>

              <Text style={styles.price}>
                {item.price}
              </Text>

            </View>

          </TouchableOpacity>
        ))}

      </ScrollView>
    </SafeAreaView>
  );
}

const PRIMARY = '#008060';

const styles = StyleSheet.create({

  container: {
    flex: 1,
    backgroundColor: '#F7F8FA',
  },

  header: {
    paddingHorizontal: 20,
    paddingTop: 15,
    marginBottom: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },

  greeting: {
    fontSize: 28,
    fontWeight: '700',
    color: '#111',
  },

  location: {
    marginTop: 8,
    color: PRIMARY,
    fontWeight: '600',
    fontSize: 15,
  },

  profile: {
    height: 45,
    width: 45,
    borderRadius: 22,
    backgroundColor: '#FFF',
    justifyContent: 'center',
    alignItems: 'center',
  },

  searchBox: {
    marginHorizontal: 20,
    backgroundColor: '#FFF',
    borderRadius: 15,
    paddingHorizontal: 18,
    height: 55,
    justifyContent: 'center',
    marginBottom: 20,
  },

  offerCard: {
    width: 280,
    height: 150,
    backgroundColor: '#008060',
    borderRadius: 18,
    padding: 20,
    marginRight: 15,
    justifyContent: 'space-between',
  },

  offerTitle: {
    color: '#FFF',
    fontSize: 22,
    fontWeight: '700',
  },

  offerSub: {
    color: '#FFF',
    fontSize: 16,
  },

  offerButton: {
    alignSelf: 'flex-start',
    backgroundColor: '#FFF',
    borderRadius: 20,
    paddingHorizontal: 18,
    paddingVertical: 8,
  },

  offerButtonText: {
    color: PRIMARY,
    fontWeight: '700',
  },

  sectionHeader: {
    marginTop: 28,
    marginBottom: 15,
    marginHorizontal: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },

  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#111',
  },

  seeAll: {
    color: PRIMARY,
    fontWeight: '600',
  },

  card: {
    flexDirection: 'row',
    marginHorizontal: 20,
    backgroundColor: '#FFF',
    borderRadius: 18,
    padding: 14,
    marginBottom: 15,
  },

  imagePlaceholder: {
    height: 95,
    width: 95,
    borderRadius: 14,
    backgroundColor: '#ECECEC',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },

  salonName: {
    fontSize: 18,
    fontWeight: '700',
    color: '#111',
  },

  details: {
    marginTop: 5,
    color: '#666',
  },

  service: {
    marginTop: 6,
    color: '#666',
  },

  price: {
    marginTop: 8,
    fontWeight: '700',
    color: PRIMARY,
  },

});