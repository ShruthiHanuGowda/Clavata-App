import React, {
  useEffect,
  useState,
} from 'react';

import {
  SafeAreaView,
  FlatList,
  StyleSheet,
  View,
  Text,
} from 'react-native';

import {
  useApolloClient,
} from '@apollo/client';

import {
  useNavigation,
} from '@react-navigation/native';

import HomeHeader from './HomeHeader';
import SearchBar from './SearchBar';
import ServiceChips from './ServiceChips';
import SalonCard from './SalonCard';
import LocationBottomSheet from './LocationBottomSheet';
import ReviewPopup from './ReviewPopup';
import HomeAdCarousel from './HomeAdCarousel';

import {
  getActiveLocation,
  LocationData,
} from '../../../services/locationStorage';

import {
  DEFAULT_LOCATION_RADIUS,
  USE_HARDCODED_LOCATION,
} from '../../../services/locationConfig';

import {
  GET_NEARBY_SALONS,
  CUSTOMER_BOOKINGS,
} from '../../../graphql/queries';

import {
  useUser,
} from '../../../context/UserContext';


// ============================================================
// TYPES
// ============================================================

type Booking = {
  bookingId: string;
  salonId: string;
  customerUserId: string;
  customerName: string;
  salonName: string;
  bookingStatus: string;
  reviewSubmitted?: boolean;
};


// ============================================================
// COMPONENT
// ============================================================

export default function HomeScreenPage() {
  const client = useApolloClient();

  const navigation = useNavigation();

  const { currentUser } = useUser();


  // ==========================================================
  // STATE
  // ==========================================================

  const [
    showReviewPopup,
    setShowReviewPopup,
  ] = useState(false);

  const [
    pendingBooking,
    setPendingBooking,
  ] = useState<Booking | null>(null);

  const [
    bookings,
    setBookings,
  ] = useState<any[]>([]);

  const [
    salons,
    setSalons,
  ] = useState<any[]>([]);

  const [
    search,
    setSearch,
  ] = useState('');

  const [
    showLocationModal,
    setShowLocationModal,
  ] = useState(false);

  const [
    selectedLocation,
    setSelectedLocation,
  ] = useState('Choose Location');

  const [
    selectedCategory,
    setSelectedCategory,
  ] = useState('');

  const [
    locationCoordinates,
    setLocationCoordinates,
  ] = useState<LocationData | null>(null);


  // ==========================================================
  // INITIAL LOAD
  // ==========================================================

  useEffect(() => {
    console.log('');
    console.log('======================================');
    console.log('🏠 HOME SCREEN INITIAL LOAD');
    console.log('======================================');

    console.log(
      'Current User:',
      currentUser,
    );

    console.log(
      'Location Mode:',
      USE_HARDCODED_LOCATION
        ? '🧪 HARDCODED TEST'
        : '🚀 PRODUCTION',
    );

    loadLocation();

    if (currentUser?.userId) {
      loadCustomerBookings();
    }
  }, [currentUser]);


  // ==========================================================
  // LOAD ACTIVE LOCATION
  // ==========================================================

  const loadLocation = async () => {
    try {
      console.log('');
      console.log('======================================');
      console.log('📍 HOME SCREEN - LOAD LOCATION');
      console.log('======================================');

      const location =
        await getActiveLocation();

      if (!location) {
        console.log(
          'ℹ️ No active location found',
        );

        setSelectedLocation(
          'Choose Location',
        );

        setLocationCoordinates(null);

        setSalons([]);

        return;
      }

      console.log(
        '📍 Active Location:',
        location,
      );

      // --------------------------------------------------------
      // UPDATE UI
      // --------------------------------------------------------

      setSelectedLocation(
        location.address,
      );

      setLocationCoordinates(
        location,
      );

      // --------------------------------------------------------
      // FETCH SALONS
      // --------------------------------------------------------

      await fetchNearbySalons(
        location.latitude,
        location.longitude,
        '',
        '',
      );

    } catch (error) {
      console.log(
        '❌ Location loading error:',
        error,
      );
    }
  };


  // ==========================================================
  // GET ACTIVE COORDINATES
  // ==========================================================

  const getActiveCoordinates =
    (): LocationData | null => {

      if (locationCoordinates) {
        return {
          ...locationCoordinates,
        };
      }

      return null;
    };


  // ==========================================================
  // FETCH NEARBY SALONS
  // ==========================================================

  const fetchNearbySalons = async (
    latitude?: number,
    longitude?: number,
    searchText = '',
    category = '',
  ) => {

    console.log('');
    console.log('======================================');
    console.log('🔎 FETCH NEARBY SALONS');
    console.log('======================================');

    // --------------------------------------------------------
    // DETERMINE LOCATION
    // --------------------------------------------------------

    let finalLatitude:
      number | null = null;

    let finalLongitude:
      number | null = null;


    // ========================================================
    // HARDCODED MODE
    // ========================================================

    if (USE_HARDCODED_LOCATION) {

      console.log(
        '🧪 HARDCODED LOCATION MODE',
      );

      const activeLocation =
        await getActiveLocation();

      if (activeLocation) {
        finalLatitude =
          activeLocation.latitude;

        finalLongitude =
          activeLocation.longitude;
      }

    }


    // ========================================================
    // PRODUCTION MODE
    // ========================================================

    else {

      const activeLocation =
        getActiveCoordinates();

      finalLatitude =
        latitude ??
        activeLocation?.latitude ??
        null;

      finalLongitude =
        longitude ??
        activeLocation?.longitude ??
        null;
    }


    // ========================================================
    // NO LOCATION
    // ========================================================

    if (
      finalLatitude === null ||
      finalLongitude === null
    ) {

      console.log(
        '⚠️ Cannot fetch salons: no location available',
      );

      setSalons([]);

      return;
    }


    console.log(
      '📍 Latitude:',
      finalLatitude,
    );

    console.log(
      '📍 Longitude:',
      finalLongitude,
    );


    // ========================================================
    // SEARCH / CATEGORY
    // ========================================================

    const cleanSearch =
      searchText.trim();

    const cleanCategory =
      category.trim();

    let finalSearch:
      string | null = null;

    let finalCategory:
      string | null = null;


    if (cleanCategory) {

      finalCategory =
        cleanCategory;

    } else if (cleanSearch) {

      finalSearch =
        cleanSearch;
    }


    // ========================================================
    // GRAPHQL VARIABLES
    // ========================================================

    const variables = {
      latitude:
        finalLatitude,

      longitude:
        finalLongitude,

      radius:
        DEFAULT_LOCATION_RADIUS,

      search:
        finalSearch,

      category:
        finalCategory,
    };


    console.log(
      'GraphQL Variables:',
      JSON.stringify(
        variables,
        null,
        2,
      ),
    );


    // ========================================================
    // API CALL
    // ========================================================

    try {

      const { data } =
        await client.query({
          query:
            GET_NEARBY_SALONS,

          variables,

          fetchPolicy:
            'network-only',
        });


      console.log(
        'Nearby salons:',
        data?.nearbySalons,
      );


      // ======================================================
      // FORMAT RESULTS
      // ======================================================

      const formatted =
        (
          data?.nearbySalons ||
          []
        ).map(
          (item: any) => ({

            id:
              item.salonId,

            salonId:
              item.salonId,

            name:
              item.salonName,

            rating:
              item.averageRating,

            reviews:
              item.totalReviews,

            distance:
              item.distance < 1
                ? `${Math.round(
                  item.distance * 1000,
                )} m`
                : `${item.distance.toFixed(
                  1,
                )} km`,

            address:
              item.address,

            price:
              0,

            image:
              item.logoUrl ||
              'https://picsum.photos/300/300',

            salonStatus:
              item.salonStatus,

            businessHours:
              item.businessHours,

            categories:
              item.categories ||
              [],
          }),
        );


      setSalons(
        formatted,
      );

    } catch (error) {

      console.log(
        '❌ NEARBY SALONS ERROR:',
        error,
      );

      setSalons([]);
    }
  };


  // ==========================================================
  // LOCATION SELECTED
  // ==========================================================

  const handleLocationSelected =
    async (
      location: LocationData,
    ) => {

      console.log('');
      console.log('======================================');
      console.log('📍 LOCATION SELECTED');
      console.log('======================================');

      console.log(
        location,
      );


      // --------------------------------------------------------
      // UPDATE UI
      // --------------------------------------------------------

      setSelectedLocation(
        location.address,
      );

      setLocationCoordinates(
        location,
      );


      // --------------------------------------------------------
      // FETCH SALONS
      // --------------------------------------------------------

      await fetchNearbySalons(
        location.latitude,
        location.longitude,
        search,
        selectedCategory,
      );


      // --------------------------------------------------------
      // CLOSE MODAL
      // --------------------------------------------------------

      setShowLocationModal(false);
    };


  // ==========================================================
  // LOAD CUSTOMER BOOKINGS
  // ==========================================================

  const loadCustomerBookings =
    async () => {

      try {

        console.log('');
        console.log('======================================');
        console.log('📋 LOAD CUSTOMER BOOKINGS');
        console.log('======================================');


        const { data } =
          await client.query({
            query:
              CUSTOMER_BOOKINGS,

            variables: {
              customerUserId:
                currentUser?.userId,
            },

            fetchPolicy:
              'network-only',
          });


        console.log(
          'Customer bookings:',
          data?.customerBookings,
        );


        setBookings(
          data?.customerBookings ||
          [],
        );


        // ======================================================
        // FIND PENDING REVIEW
        // ======================================================

        const booking =
          data?.customerBookings?.find(
            (item: Booking) =>
              item.bookingStatus ===
              'COMPLETED' &&
              item.reviewSubmitted ===
              false,
          );


        console.log(
          'Pending review booking:',
          booking,
        );


        if (booking) {

          setPendingBooking(
            booking,
          );

          setShowReviewPopup(
            true,
          );

        }

      } catch (error) {

        console.log(
          '❌ Booking loading error:',
          error,
        );
      }
    };


  // ==========================================================
  // SEARCH TEXT CHANGED
  // ==========================================================

  const handleSearchChange =
    (text: string) => {

      console.log(
        'Search text:',
        text,
      );

      setSearch(text);


      // --------------------------------------------------------
      // If user is typing, don't fetch on every keystroke
      // --------------------------------------------------------

      if (text.trim() !== '') {

        setSelectedCategory('');

        return;
      }


      // --------------------------------------------------------
      // Empty search
      // --------------------------------------------------------

      setSelectedCategory('');


      const location =
        getActiveCoordinates();


      if (!location) {
        return;
      }


      fetchNearbySalons(
        location.latitude,
        location.longitude,
        '',
        '',
      );
    };


  // ==========================================================
  // SEARCH SUBMIT
  // ==========================================================

  const handleSearchSubmit =
    () => {

      const cleanSearch =
        search.trim();


      console.log(
        'Search submitted:',
        cleanSearch,
      );


      const location =
        getActiveCoordinates();


      if (!location) {

        console.log(
          '⚠️ No location selected',
        );

        setShowLocationModal(
          true,
        );

        return;
      }


      // --------------------------------------------------------
      // Empty search
      // --------------------------------------------------------

      if (!cleanSearch) {

        setSelectedCategory('');

        fetchNearbySalons(
          location.latitude,
          location.longitude,
          '',
          '',
        );

        return;
      }


      // --------------------------------------------------------
      // Search
      // --------------------------------------------------------

      setSelectedCategory('');


      fetchNearbySalons(
        location.latitude,
        location.longitude,
        cleanSearch,
        '',
      );
    };


  // ==========================================================
  // CATEGORY SELECTED
  // ==========================================================

  const handleCategorySelect =
    (category: string) => {

      console.log(
        'Selected Category:',
        category,
      );


      setSelectedCategory(
        category,
      );

      setSearch('');


      const location =
        getActiveCoordinates();


      if (!location) {

        console.log(
          '⚠️ No location selected',
        );

        setShowLocationModal(
          true,
        );

        return;
      }


      fetchNearbySalons(
        location.latitude,
        location.longitude,
        '',
        category,
      );
    };


  // ==========================================================
  // RENDER
  // ==========================================================

  return (
    <SafeAreaView
      style={
        styles.container
      }
    >

      <FlatList

        ListHeaderComponent={
          <>
            {/* ================================================== */}
            {/* HEADER */}
            {/* ================================================== */}

            <HomeHeader
              location={
                selectedLocation
              }
              onPressLocation={() =>
                setShowLocationModal(
                  true,
                )
              }
            />


            {/* ================================================== */}
            {/* SEARCH */}
            {/* ================================================== */}

            <SearchBar
              value={
                search
              }
              onChangeText={
                handleSearchChange
              }
              onSubmitEditing={
                handleSearchSubmit
              }
            />


            {/* ================================================== */}
            {/* SERVICE CATEGORIES */}
            {/* ================================================== */}

            <ServiceChips
              selectedCategory={
                selectedCategory
              }
              onSelect={
                handleCategorySelect
              }
            />


            {/* ================================================== */}
            {/* ADVERTISEMENT */}
            {/* ================================================== */}

            <HomeAdCarousel
              onAdPress={
                ad => {
                  console.log(
                    'Advertisement clicked:',
                    ad,
                  );
                }
              }
            />


            {/* ================================================== */}
            {/* SALON RESULTS HEADER */}
            {/* ================================================== */}

            <View
              style={
                styles.salonSectionHeader
              }
            >

              <View>

                <Text
                  style={
                    styles.salonSectionTitle
                  }
                >
                  {search.trim()
                    ? 'Search Results'
                    : selectedCategory
                      ? `${selectedCategory} Near You`
                      : 'Nearby Salons'}
                </Text>


                {!search.trim() &&
                  !selectedCategory && (
                    <Text
                      style={
                        styles.salonSectionSubtitle
                      }
                    >
                      Salons near your
                      location
                    </Text>
                  )}

              </View>


              <Text
                style={
                  styles.salonCount
                }
              >
                {
                  salons.length
                }{' '}
                {
                  salons.length === 1
                    ? 'salon'
                    : 'salons'
                }
              </Text>

            </View>

          </>
        }


        // ======================================================
        // SALON DATA
        // ======================================================

        data={
          salons
        }


        keyExtractor={
          item =>
            item.id
        }


        // ======================================================
        // SALON CARD
        // ======================================================

        renderItem={({
          item,
        }) => (

          <SalonCard
            salon={
              item
            }
          />

        )}


        // ======================================================
        // EMPTY RESULTS
        // ======================================================

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
              {locationCoordinates
                ? 'No salons found nearby'
                : 'Choose your location'}
            </Text>


            <Text
              style={
                styles.emptySubtitle
              }
            >
              {locationCoordinates
                ? 'Try changing your search, category or location.'
                : 'Select a saved address or use your current location.'}
            </Text>

          </View>

        }


        contentContainerStyle={{
          paddingBottom: 30,
        }}

      />


      {/* ====================================================== */}
      {/* LOCATION BOTTOM SHEET */}
      {/* ====================================================== */}

      <LocationBottomSheet
        visible={
          showLocationModal
        }

        onClose={() =>
          setShowLocationModal(
            false,
          )
        }

        onLocationSelected={
          handleLocationSelected
        }
      />


      {/* ====================================================== */}
      {/* REVIEW POPUP */}
      {/* ====================================================== */}

      <ReviewPopup
        visible={
          showReviewPopup
        }

        salonName={
          pendingBooking?.salonName
        }

        onRate={() => {

          setShowReviewPopup(
            false,
          );


          navigation.navigate(
            'Bookings' as any,
            {
              screen:
                'RateReview',

              params: {
                booking:
                  pendingBooking,
              },
            } as never,
          );

        }}

        onLater={() => {

          setShowReviewPopup(
            false,
          );

        }}
      />

    </SafeAreaView>
  );
}


// ============================================================
// STYLES
// ============================================================

const styles =
  StyleSheet.create({

    container: {
      flex: 1,
      backgroundColor:
        '#F6F7FB',
    },


    // ========================================================
    // EMPTY STATE
    // ========================================================

    emptyContainer: {
      alignItems:
        'center',

      justifyContent:
        'center',

      marginTop:
        60,

      paddingHorizontal:
        20,
    },


    emptyTitle: {
      fontSize:
        18,

      fontWeight:
        '700',

      color:
        '#111',
    },


    emptySubtitle: {
      marginTop:
        8,

      fontSize:
        14,

      color:
        '#666',

      textAlign:
        'center',
    },


    // ========================================================
    // SALON SECTION
    // ========================================================

    salonSectionHeader: {
      flexDirection:
        'row',

      alignItems:
        'center',

      justifyContent:
        'space-between',

      paddingHorizontal:
        16,

      paddingTop:
        18,

      paddingBottom:
        10,
    },


    salonSectionTitle: {
      fontSize:
        20,

      fontWeight:
        '800',

      color:
        '#111',
    },


    salonSectionSubtitle: {
      marginTop:
        3,

      fontSize:
        12,

      color:
        '#888',
    },


    salonCount: {
      fontSize:
        12,

      fontWeight:
        '700',

      color:
        '#008060',

      backgroundColor:
        '#E8F6F3',

      paddingHorizontal:
        10,

      paddingVertical:
        6,

      borderRadius:
        14,
    },

  });