import React, { useEffect, useState } from 'react';
import {
  SafeAreaView,
  FlatList,
  StyleSheet,
  View,
  Text,
} from 'react-native';
import HomeAdBanner from './HomeAdCarousel';
import HomeHeader from './HomeHeader';
import SearchBar from './SearchBar';
import ServiceChips from './ServiceChips';
import SalonCard from './SalonCard';
import LocationBottomSheet from './LocationBottomSheet';
import ReviewPopup from './ReviewPopup';

import { getSavedLocation } from '../../../services/locationStorage';
import {
  GET_NEARBY_SALONS,
  CUSTOMER_BOOKINGS,
} from '../../../graphql/queries';

import { useApolloClient } from '@apollo/client';
import { useNavigation } from '@react-navigation/native';
import { useUser } from '../../../context/UserContext';
import HomeAdCarousel from './HomeAdCarousel';

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
  const navigation = useNavigation();
  const { currentUser } = useUser();

  const [showReviewPopup, setShowReviewPopup] = useState(false);
  const [pendingBooking, setPendingBooking] =
    useState<Booking | null>(null);

  const [bookings, setBookings] = useState<any[]>([]);
  const [salons, setSalons] = useState<any[]>([]);

  const [search, setSearch] = useState('');

  const [showLocationModal, setShowLocationModal] =
    useState(false);

  const [selectedLocation, setSelectedLocation] =
    useState('Choose Location');

  const [selectedCategory, setSelectedCategory] =
    useState('');

  /*
   * LOCATION IS HARD CODED FOR TESTING
   */
  const HARDCODED_LATITUDE = 12.963694;
  const HARDCODED_LONGITUDE = 77.4014239;

  /*
   * Keep these coordinates in state only for UI/location flow.
   * Actual API request uses the hardcoded coordinates above.
   */
  const [locationCoordinates, setLocationCoordinates] =
    useState<{
      latitude: number;
      longitude: number;
    } | null>(null);

  // ============================================================
  // INITIAL LOAD
  // ============================================================

  useEffect(() => {
    console.log('======================================');
    console.log('HOME SCREEN INITIAL LOAD');
    console.log('======================================');

    console.log('Current User:', currentUser);

    loadLocation();

    if (currentUser?.userId) {
      console.log(
        'Loading bookings for user:',
        currentUser.userId,
      );

      loadCustomerBookings();
    } else {
      console.log(
        'No currentUser.userId available yet',
      );
    }
  }, [currentUser]);

  // ============================================================
  // FETCH NEARBY SALONS
  // ============================================================

  const fetchNearbySalons = async (
    _latitude?: number,
    _longitude?: number,
    searchText = '',
    category = '',
  ) => {
    console.log('');
    console.log('======================================');
    console.log('FETCH NEARBY SALONS');
    console.log('======================================');

    /*
     * ONLY LATITUDE AND LONGITUDE ARE HARDCODED
     */
    const latitude = HARDCODED_LATITUDE;
    const longitude = HARDCODED_LONGITUDE;

    /*
     * Clean search/category values
     */
    const cleanSearch = searchText.trim();
    const cleanCategory = category.trim();

    let finalSearch: string | null = null;
    let finalCategory: string | null = null;

    if (cleanCategory) {
      finalCategory = cleanCategory;
      finalSearch = null;
    } else if (cleanSearch) {
      finalSearch = cleanSearch;
      finalCategory = null;
    }

    console.log('Latitude:', latitude);
    console.log('Longitude:', longitude);
    console.log('Original Search:', searchText);
    console.log('Original Category:', category);
    console.log('Final Search:', finalSearch);
    console.log('Final Category:', finalCategory);

    const variables = {
      latitude,
      longitude,
      radius: 10,
      search: finalSearch,
      category: finalCategory,
    };

    console.log(
      'GraphQL Variables:',
      JSON.stringify(variables, null, 2),
    );

    try {
      const { data } = await client.query({
        query: GET_NEARBY_SALONS,
        variables,
        fetchPolicy: 'network-only',
      });

      console.log('');
      console.log('GRAPHQL RESPONSE:');

      console.log(
        JSON.stringify(data, null, 2),
      );

      console.log(
        'Number of salons:',
        data?.nearbySalons?.length || 0,
      );

      console.log(
        'Nearby Salons:',
        data?.nearbySalons,
      );

      const formatted =
        (data?.nearbySalons || []).map(
          (item: any) => ({
            id: item.salonId,

            name: item.salonName,

            rating: item.averageRating,

            reviews: item.totalReviews,

            distance:
              item.distance < 1
                ? `${Math.round(
                  item.distance * 1000,
                )} m`
                : `${item.distance.toFixed(1)} km`,

            address: item.address,

            price: 0,

            image:
              item.logoUrl ||
              'https://picsum.photos/300/300',
          }),
        );

      console.log('');
      console.log('FORMATTED SALONS:');

      console.log(
        JSON.stringify(formatted, null, 2),
      );

      setSalons(formatted);
    } catch (error) {
      console.log('');
      console.log('❌ NEARBY SALONS ERROR:');
      console.log(error);
    }
  };

  // ============================================================
  // LOAD LOCATION
  // ============================================================

  const loadLocation = async () => {
    try {
      console.log('');
      console.log('======================================');
      console.log('LOAD SAVED LOCATION');
      console.log('======================================');

      const location = await getSavedLocation();

      console.log('Saved Location:', location);

      if (location) {
        setSelectedLocation(
          location.address,
        );

        setLocationCoordinates({
          latitude: location.latitude,
          longitude: location.longitude,
        });

        /*
         * First load:
         *
         * No search
         * No category
         *
         * Therefore show ALL nearby salons.
         */
        fetchNearbySalons(
          HARDCODED_LATITUDE,
          HARDCODED_LONGITUDE,
          '',
          '',
        );
      } else {
        /*
         * Even if there is no saved location,
         * still load using hardcoded coordinates.
         */
        console.log(
          'No saved location. Using hardcoded coordinates.',
        );

        setLocationCoordinates({
          latitude: HARDCODED_LATITUDE,
          longitude: HARDCODED_LONGITUDE,
        });

        fetchNearbySalons(
          HARDCODED_LATITUDE,
          HARDCODED_LONGITUDE,
          '',
          '',
        );
      }
    } catch (error) {
      console.log(
        'Location loading error:',
        error,
      );
    }
  };

  // ============================================================
  // LOAD CUSTOMER BOOKINGS
  // ============================================================

  const loadCustomerBookings = async () => {
    try {
      console.log('');
      console.log(
        '======================================',
      );
      console.log(
        'LOAD CUSTOMER BOOKINGS',
      );
      console.log(
        '======================================',
      );

      const { data } =
        await client.query({
          query: CUSTOMER_BOOKINGS,

          variables: {
            customerUserId:
              currentUser?.userId,
          },

          fetchPolicy: 'network-only',
        });

      console.log(
        'Customer bookings:',
        data?.customerBookings,
      );

      setBookings(
        data?.customerBookings || [],
      );

      const booking =
        data?.customerBookings?.find(
          (item: any) =>
            item.bookingStatus ===
            'COMPLETED' &&
            item.reviewSubmitted === false,
        );

      console.log(
        'Pending review booking:',
        booking,
      );

      if (booking) {
        setPendingBooking(booking);
        setShowReviewPopup(true);
      }
    } catch (error) {
      console.log(
        'Booking loading error:',
        error,
      );
    }
  };

  // ============================================================
  // SEARCH TEXT CHANGED
  // ============================================================

  const handleSearchChange = (
    text: string,
  ) => {
    console.log('');
    console.log(
      '======================================',
    );
    console.log('SEARCH CHANGED');
    console.log(
      '======================================',
    );

    console.log('Search text:', text);

    setSearch(text);

    /*
     * When user starts typing:
     *
     * Remove category selection.
     */
    if (text.trim() !== '') {
      console.log(
        'Text search active. Clearing category.',
      );

      setSelectedCategory('');
      return;
    }

    /*
     * When search is completely cleared:
     *
     * Show ALL nearby salons.
     */
    console.log(
      'Search cleared. Loading all nearby salons.',
    );

    setSelectedCategory('');

    fetchNearbySalons(
      HARDCODED_LATITUDE,
      HARDCODED_LONGITUDE,
      '',
      '',
    );
  };

  // ============================================================
  // SEARCH SUBMIT
  // ============================================================

  const handleSearchSubmit = () => {
    const cleanSearch =
      search.trim();

    console.log('');
    console.log(
      '======================================',
    );
    console.log('SEARCH SUBMITTED');
    console.log(
      '======================================',
    );

    console.log(
      'Search:',
      cleanSearch,
    );

    /*
     * Empty search
     * => show nearby salons
     */
    if (!cleanSearch) {
      console.log(
        'Empty search. Loading all nearby salons.',
      );

      setSelectedCategory('');

      fetchNearbySalons(
        HARDCODED_LATITUDE,
        HARDCODED_LONGITUDE,
        '',
        '',
      );

      return;
    }

    /*
     * Text search
     * => search only
     */
    setSelectedCategory('');

    fetchNearbySalons(
      HARDCODED_LATITUDE,
      HARDCODED_LONGITUDE,
      cleanSearch,
      '',
    );
  };

  // ============================================================
  // CATEGORY SELECTED
  // ============================================================

  const handleCategorySelect = (
    category: string,
  ) => {
    console.log('');
    console.log(
      '======================================',
    );
    console.log('CATEGORY SELECTED');
    console.log(
      '======================================',
    );

    console.log(
      'Selected Category:',
      category,
    );

    /*
     * Category becomes the active filter.
     */
    setSelectedCategory(category);

    /*
     * Clear text search.
     */
    setSearch('');

    /*
     * Send:
     *
     * search = null
     * category = selected category
     */
    fetchNearbySalons(
      HARDCODED_LATITUDE,
      HARDCODED_LONGITUDE,
      '',
      category,
    );
  };

  // ============================================================
  // RENDER
  // ============================================================

  return (
    <SafeAreaView style={styles.container}>
      <FlatList
        ListHeaderComponent={
          <>
            <HomeHeader
              location={selectedLocation}
              onPressLocation={() =>
                setShowLocationModal(true)
              }
            />

            <SearchBar
              value={search}
              onChangeText={
                handleSearchChange
              }
              onSubmitEditing={
                handleSearchSubmit
              }
            />

            <ServiceChips
              selectedCategory={
                selectedCategory
              }
              onSelect={
                handleCategorySelect
              }
            />
            <HomeAdCarousel onAdPress={(ad) => { console.log('Advertisement clicked:', ad,); /* * Later we can navigate based * on ad.targetType / targetId. * * Example: * * navigation.navigate( * 'Explore' * ); */ }} />
          </>
        }

        data={salons}

        keyExtractor={(item) =>
          item.id
        }

        renderItem={({ item }) => (
          <SalonCard salon={item} />
        )}

        ListEmptyComponent={
          <View
            style={
              styles.emptyContainer
            }
          >
            <Text
              style={
                styles.emptyTitle
              }
            >
              No salons found nearby
            </Text>

            <Text
              style={
                styles.emptySubtitle
              }
            >
              Try changing your search,
              category or location.
            </Text>
          </View>
        }

        contentContainerStyle={{
          paddingBottom: 30,
        }}
      />

      <LocationBottomSheet
        visible={
          showLocationModal
        }

        onClose={() =>
          setShowLocationModal(false)
        }

        onLocationSelected={(
          location,
        ) => {
          console.log(
            'New location selected:',
            location,
          );

          setSelectedLocation(
            location.address,
          );

          /*
           * Still using hardcoded
           * latitude/longitude.
           */
          fetchNearbySalons(
            HARDCODED_LATITUDE,
            HARDCODED_LONGITUDE,
            search,
            selectedCategory,
          );

          setShowLocationModal(false);
        }}
      />

      <ReviewPopup
        visible={
          showReviewPopup
        }

        salonName={
          pendingBooking?.salonName
        }

        onRate={() => {
          setShowReviewPopup(false);

          navigation.navigate(
            'Bookings' as any,
            {
              screen: 'RateReview',
              params: {
                booking:
                  pendingBooking,
              },
            } as never,
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

