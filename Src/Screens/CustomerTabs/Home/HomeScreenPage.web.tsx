import React, {
  useEffect,
  useMemo,
  useState,
} from 'react';

import {
  SafeAreaView,
  FlatList,
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  TextInput,
  Modal,
  ActivityIndicator,
  Pressable,
} from 'react-native';

import {
  useApolloClient,
} from '@apollo/client';

import {
  useNavigation,
} from '@react-navigation/native';

import SalonCard from './SalonCard';
import ServiceChips from './ServiceChips';
import LocationBottomSheet from './LocationBottomSheet';
import ReviewPopup from './ReviewPopup';

import {
  getActiveLocation,
  getCurrentLocation,
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

type BudgetOption = {
  label: string;
  min: number;
  max: number;
};


// ============================================================
// OPTIONS
// ============================================================

const BUDGET_OPTIONS: BudgetOption[] = [
  {
    label: 'Any',
    min: 0,
    max: 100000,
  },
  {
    label: 'Under ₹500',
    min: 0,
    max: 500,
  },
  {
    label: '₹500 – ₹1K',
    min: 500,
    max: 1000,
  },
  {
    label: '₹1K – ₹2K',
    min: 1000,
    max: 2000,
  },
  {
    label: '₹2K+',
    min: 2000,
    max: 100000,
  },
];

const DISTANCE_OPTIONS = [
  2,
  5,
  10,
  15,
  25,
];


// ============================================================
// WEB HOME
// ============================================================

export default function HomeScreenPage() {

  console.log('🔥 WEB HOME SCREEN EXECUTING');

  const client = useApolloClient();

  const navigation =
    useNavigation<any>();

  const {
    currentUser,
  } = useUser();


  // ==========================================================
  // DATA
  // ==========================================================

  const [
    salons,
    setSalons,
  ] = useState<any[]>([]);

  const [
    bookings,
    setBookings,
  ] = useState<any[]>([]);


  // ==========================================================
  // SEARCH
  // ==========================================================

  const [
    search,
    setSearch,
  ] = useState('');

  const [
    selectedCategory,
    setSelectedCategory,
  ] = useState('');


  // ==========================================================
  // LOCATION
  // ==========================================================

  const [
    selectedLocation,
    setSelectedLocation,
  ] = useState(
    'Choose location',
  );

  const [
    locationCoordinates,
    setLocationCoordinates,
  ] = useState<LocationData | null>(
    null,
  );

  const [
    showLocationModal,
    setShowLocationModal,
  ] = useState(false);


  // ==========================================================
  // FILTER
  // ==========================================================

  const [
    showFilterModal,
    setShowFilterModal,
  ] = useState(false);

  const [
    selectedBudget,
    setSelectedBudget,
  ] = useState<BudgetOption>(
    BUDGET_OPTIONS[0],
  );

  const [
    selectedDistance,
    setSelectedDistance,
  ] = useState(10);


  // ==========================================================
  // LOADING
  // ==========================================================

  const [
    loadingSalons,
    setLoadingSalons,
  ] = useState(false);


  // ==========================================================
  // REVIEW
  // ==========================================================

  const [
    showReviewPopup,
    setShowReviewPopup,
  ] = useState(false);

  const [
    pendingBooking,
    setPendingBooking,
  ] = useState<Booking | null>(
    null,
  );


  // ==========================================================
  // INITIAL LOAD
  // ==========================================================

  useEffect(() => {

    loadLocation();

    if (currentUser?.userId) {
      loadCustomerBookings();
    }

  }, [
    currentUser?.userId,
  ]);


  // ==========================================================
  // LOCATION
  // ==========================================================

  const loadLocation = async () => {

    try {

      const savedLocation =
        await getActiveLocation();

      if (savedLocation) {

        console.log(
          '📍 Using saved location:',
          savedLocation,
        );

        setSelectedLocation(
          savedLocation.address,
        );

        setLocationCoordinates(
          savedLocation,
        );

        await fetchNearbySalons(
          savedLocation.latitude,
          savedLocation.longitude,
          '',
          '',
          selectedDistance,
        );

        return;
      }


      console.log(
        '📍 No saved location. Requesting device location...',
      );


      const currentLocation =
        await getCurrentLocation();


      if (!currentLocation) {

        console.log(
          '⚠️ Location unavailable',
        );

        setSelectedLocation(
          'Choose location',
        );

        setLocationCoordinates(null);
        setSalons([]);

        return;
      }


      console.log(
        '✅ Device location:',
        currentLocation,
      );


      setSelectedLocation(
        currentLocation.address,
      );

      setLocationCoordinates(
        currentLocation,
      );


      await fetchNearbySalons(
        currentLocation.latitude,
        currentLocation.longitude,
        '',
        '',
        selectedDistance,
      );

    } catch (error) {

      console.log(
        '❌ Load location error:',
        error,
      );

      setSelectedLocation(
        'Choose location',
      );

      setLocationCoordinates(null);
      setSalons([]);
    }
  };


  // ==========================================================
  // ACTIVE LOCATION
  // ==========================================================

  const getActiveCoordinates =
    (): LocationData | null => {

      if (locationCoordinates) {
        return locationCoordinates;
      }

      return null;
    };


  // ==========================================================
  // FETCH SALONS
  // ==========================================================

  const fetchNearbySalons =
    async (
      latitude?: number,
      longitude?: number,
      searchText = '',
      category = '',
      radiusOverride?: number,
    ) => {

      let finalLatitude:
        number | null = null;

      let finalLongitude:
        number | null = null;


      // --------------------------------------------------------
      // LOCATION
      // --------------------------------------------------------

      if (USE_HARDCODED_LOCATION) {

        const activeLocation =
          await getActiveLocation();

        if (activeLocation) {

          finalLatitude =
            activeLocation.latitude;

          finalLongitude =
            activeLocation.longitude;
        }

      } else {

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


      // --------------------------------------------------------
      // NO LOCATION
      // --------------------------------------------------------

      if (
        finalLatitude === null ||
        finalLongitude === null
      ) {

        setSalons([]);

        return;
      }


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


      // --------------------------------------------------------
      // VARIABLES
      // --------------------------------------------------------

      const variables = {

        latitude:
          finalLatitude,

        longitude:
          finalLongitude,

        radius:
          radiusOverride ??
          selectedDistance ??
          DEFAULT_LOCATION_RADIUS,

        search:
          finalSearch,

        category:
          finalCategory,
      };


      // --------------------------------------------------------
      // GRAPHQL
      // --------------------------------------------------------

      try {

        setLoadingSalons(true);


        const {
          data,
        } =
          await client.query({

            query:
              GET_NEARBY_SALONS,

            variables,

            fetchPolicy:
              'network-only',

          });


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
          'Nearby salons error:',
          error,
        );

        setSalons([]);

      } finally {

        setLoadingSalons(false);
      }
    };


  // ==========================================================
  // LOCATION SELECTED
  // ==========================================================

  const handleLocationSelected =
    async (
      location: LocationData,
    ) => {

      setSelectedLocation(
        location.address,
      );

      setLocationCoordinates(
        location,
      );


      await fetchNearbySalons(
        location.latitude,
        location.longitude,
        search,
        selectedCategory,
        selectedDistance,
      );


      setShowLocationModal(false);
    };


  // ==========================================================
  // SEARCH
  // ==========================================================

  const handleSearchChange =
    (text: string) => {

      setSearch(text);

      if (text.trim()) {
        setSelectedCategory('');
      }
    };


  const handleSearchSubmit =
    () => {

      const location =
        getActiveCoordinates();


      if (!location) {

        setShowLocationModal(true);

        return;
      }


      const cleanSearch =
        search.trim();


      setSelectedCategory('');


      fetchNearbySalons(
        location.latitude,
        location.longitude,
        cleanSearch,
        '',
        selectedDistance,
      );
    };


  // ==========================================================
  // CATEGORY
  // ==========================================================

  const handleCategorySelect =
    (category: string) => {

      setSelectedCategory(
        category,
      );

      setSearch('');


      const location =
        getActiveCoordinates();


      if (!location) {

        setShowLocationModal(true);

        return;
      }


      fetchNearbySalons(
        location.latitude,
        location.longitude,
        '',
        category,
        selectedDistance,
      );
    };


  // ==========================================================
  // FILTER
  // ==========================================================

  const openFilter =
    () => {

      setShowFilterModal(true);
    };


  const applyFilters =
    async () => {

      setShowFilterModal(false);


      const location =
        getActiveCoordinates();


      if (!location) {

        setShowLocationModal(true);

        return;
      }


      await fetchNearbySalons(
        location.latitude,
        location.longitude,
        search,
        selectedCategory,
        selectedDistance,
      );
    };


  // ==========================================================
  // CLAVATA
  // ==========================================================

  const askClavata =
    () => {

      setShowFilterModal(false);


      navigation.navigate(
        'ClavataMatch',
        {

          service:
            selectedCategory ||
            search.trim(),

          location:
            locationCoordinates,

          minBudget:
            selectedBudget.min,

          maxBudget:
            selectedBudget.max,

          distance:
            selectedDistance,

        },
      );
    };


  // ==========================================================
  // BOOKINGS
  // ==========================================================

  const loadCustomerBookings =
    async () => {

      try {

        const {
          data,
        } =
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


        setBookings(
          data?.customerBookings ||
          [],
        );


        const booking =
          data?.customerBookings?.find(
            (item: Booking) =>
              item.bookingStatus ===
                'COMPLETED' &&
              item.reviewSubmitted ===
                false,
          );


        if (booking) {

          setPendingBooking(
            booking,
          );

          setShowReviewPopup(true);
        }

      } catch (error) {

        console.log(
          'Booking loading error:',
          error,
        );
      }
    };


  // ==========================================================
  // FILTER COUNT
  // ==========================================================

  const filterCount =
    useMemo(() => {

      let count = 0;


      if (
        selectedBudget.label !==
        'Any'
      ) {
        count++;
      }


      if (
        selectedDistance !== 10
      ) {
        count++;
      }


      return count;

    }, [
      selectedBudget,
      selectedDistance,
    ]);


  // ==========================================================
  // RESULT TITLE
  // ==========================================================

  const resultTitle =
    useMemo(() => {

      if (search.trim()) {
        return 'Search results';
      }


      if (selectedCategory) {
        return selectedCategory;
      }


      return 'Salons near you';

    }, [
      search,
      selectedCategory,
    ]);


  // ==========================================================
  // RENDER
  // ==========================================================

  return (

    <SafeAreaView
      style={styles.page}
    >

      {/* ======================================================
          MAIN AREA
      ====================================================== */}

      <View
        style={styles.mainArea}
      >

        {/* ====================================================
            TOP HEADER
        ==================================================== */}

        <View
          style={styles.topHeader}
        >

          <View>

            <Text
              style={styles.welcomeText}
            >
              Discover your next look
            </Text>

            <Text
              style={styles.welcomeSubtext}
            >
              Find salons and services you'll love.
            </Text>

          </View>


          {/* LOCATION */}

          <TouchableOpacity
            style={styles.locationButton}
            onPress={() =>
              setShowLocationModal(true)
            }
            activeOpacity={0.8}
          >

            <View
              style={styles.locationIcon}
            >

              <Text
                style={styles.locationIconText}
              >
                ●
              </Text>

            </View>


            <View
              style={styles.locationTextWrap}
            >

              <Text
                style={styles.locationLabel}
              >
                LOCATION
              </Text>


              <Text
                style={styles.locationValue}
                numberOfLines={1}
              >
                {selectedLocation}
              </Text>

            </View>


            <Text
              style={styles.locationArrow}
            >
              ↓
            </Text>

          </TouchableOpacity>

        </View>


        {/* ====================================================
            SCROLLABLE CONTENT
        ==================================================== */}

        <FlatList

          data={salons}

          keyExtractor={item =>
            item.id
          }

          renderItem={({ item }) => (

            <View
              style={styles.salonCardWrap}
            >

              <SalonCard
                salon={item}
              />

            </View>

          )}


          ListHeaderComponent={
            <View>

              {/* ==================================================
                  SEARCH
              ================================================== */}

              <View
                style={styles.searchRow}
              >

                <View
                  style={styles.searchBox}
                >

                  <Text
                    style={styles.searchIcon}
                  >
                    ⌕
                  </Text>


                  <TextInput
                    value={search}
                    onChangeText={
                      handleSearchChange
                    }
                    onSubmitEditing={
                      handleSearchSubmit
                    }
                    placeholder="Search salons, services or treatments"
                    placeholderTextColor="#999999"
                    style={styles.searchInput}
                    returnKeyType="search"
                  />


                  {search.length > 0 && (

                    <TouchableOpacity
                      onPress={() => {

                        setSearch('');

                        handleSearchSubmit();

                      }}
                    >

                      <Text
                        style={styles.clearSearch}
                      >
                        ×
                      </Text>

                    </TouchableOpacity>

                  )}

                </View>


                {/* FILTER */}

                <TouchableOpacity
                  style={styles.filterButton}
                  onPress={openFilter}
                  activeOpacity={0.8}
                >

                  <Text
                    style={styles.filterIcon}
                  >
                    ☷
                  </Text>


                  <Text
                    style={styles.filterButtonText}
                  >
                    Filters
                  </Text>


                  {filterCount > 0 && (

                    <View
                      style={styles.filterBadge}
                    >

                      <Text
                        style={styles.filterBadgeText}
                      >
                        {filterCount}
                      </Text>

                    </View>

                  )}

                </TouchableOpacity>

              </View>


              {/* ==================================================
                  QUICK FILTERS
              ================================================== */}

              <View
                style={styles.quickFilters}
              >

                <TouchableOpacity
                  style={styles.quickChip}
                  onPress={openFilter}
                >

                  <Text
                    style={styles.quickChipIcon}
                  >
                    ₹
                  </Text>

                  <Text
                    style={styles.quickChipText}
                  >
                    {selectedBudget.label}
                  </Text>

                </TouchableOpacity>


                <TouchableOpacity
                  style={styles.quickChip}
                  onPress={openFilter}
                >

                  <Text
                    style={styles.quickChipIcon}
                  >
                    ◉
                  </Text>

                  <Text
                    style={styles.quickChipText}
                  >
                    Within {selectedDistance} km
                  </Text>

                </TouchableOpacity>


                {selectedCategory && (

                  <View
                    style={[
                      styles.quickChip,
                      styles.quickChipSelected,
                    ]}
                  >

                    <Text
                      style={styles.quickChipTextSelected}
                    >
                      {selectedCategory}
                    </Text>

                  </View>

                )}

              </View>


              {/* ==================================================
                  SERVICES
              ================================================== */}

              <View
                style={styles.sectionHeader}
              >

                <View>

                  <Text
                    style={styles.sectionTitle}
                  >
                    Choose a service
                  </Text>

                  <Text
                    style={styles.sectionSubtitle}
                  >
                    What are you looking for today?
                  </Text>

                </View>

              </View>


              <View
                style={styles.servicesContainer}
              >

                <ServiceChips
                  selectedCategory={
                    selectedCategory
                  }
                  onSelect={
                    handleCategorySelect
                  }
                />

              </View>


              {/* ==================================================
                  CLAVATA CARD
              ================================================== */}

              <TouchableOpacity
                style={styles.clavataCard}
                onPress={askClavata}
                activeOpacity={0.9}
              >

                <View
                  style={styles.clavataIconBox}
                >

                  <Text
                    style={styles.clavataIcon}
                  >
                    ✦
                  </Text>

                </View>


                <View
                  style={styles.clavataBody}
                >

                  <Text
                    style={styles.clavataTitle}
                  >
                    Let Clavata choose
                  </Text>

                  <Text
                    style={styles.clavataText}
                  >
                    Tell us what you want and we'll find the best match for you.
                  </Text>

                </View>


                <View
                  style={styles.clavataArrowBox}
                >

                  <Text
                    style={styles.clavataArrow}
                  >
                    →
                  </Text>

                </View>

              </TouchableOpacity>


              {/* ==================================================
                  RESULTS HEADER
              ================================================== */}

              <View
                style={styles.resultsHeader}
              >

                <View>

                  <Text
                    style={styles.resultsTitle}
                  >
                    {resultTitle}
                  </Text>


                  <Text
                    style={styles.resultsSubtitle}
                  >
                    {salons.length}{' '}
                    {salons.length === 1
                      ? 'place'
                      : 'places'}{' '}
                    found near you
                  </Text>

                </View>


                <TouchableOpacity
                  style={styles.resultFilterButton}
                  onPress={openFilter}
                >

                  <Text
                    style={styles.resultFilterIcon}
                  >
                    ☷
                  </Text>

                  <Text
                    style={styles.resultFilterText}
                  >
                    Filter
                  </Text>

                </TouchableOpacity>

              </View>

            </View>
          }


          ListEmptyComponent={

            loadingSalons ? (

              <View
                style={styles.loadingContainer}
              >

                <View
                  style={styles.loadingCircle}
                >

                  <ActivityIndicator
                    size="small"
                    color="#111111"
                  />

                </View>


                <Text
                  style={styles.loadingTitle}
                >
                  Finding salons near you
                </Text>


                <Text
                  style={styles.loadingText}
                >
                  Looking for the best options in your area.
                </Text>

              </View>

            ) : (

              <View
                style={styles.emptyContainer}
              >

                <View
                  style={styles.emptyIcon}
                >

                  <Text
                    style={styles.emptyIconText}
                  >
                    ⌕
                  </Text>

                </View>


                <Text
                  style={styles.emptyTitle}
                >
                  No salons nearby
                </Text>


                <Text
                  style={styles.emptyText}
                >
                  Try increasing your search distance or choosing another location.
                </Text>


                <TouchableOpacity
                  style={styles.emptyButton}
                  onPress={openFilter}
                  activeOpacity={0.85}
                >

                  <Text
                    style={styles.emptyButtonText}
                  >
                    Adjust search
                  </Text>

                  <Text
                    style={styles.emptyButtonArrow}
                  >
                    →
                  </Text>

                </TouchableOpacity>

              </View>

            )
          }


          contentContainerStyle={
            styles.listContent
          }

          showsVerticalScrollIndicator={
            false
          }

        />

      </View>


      {/* ======================================================
          LOCATION
      ====================================================== */}

      <LocationBottomSheet

        visible={
          showLocationModal
        }

        onClose={() =>
          setShowLocationModal(false)
        }

        onLocationSelected={
          handleLocationSelected
        }

      />


      {/* ======================================================
          REVIEW
      ====================================================== */}

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
            'Bookings',
            {
              screen:
                'RateReview',

              params: {
                booking:
                  pendingBooking,
              },
            },
          );

        }}

        onLater={() => {

          setShowReviewPopup(false);

        }}

      />


      {/* ======================================================
          FILTER MODAL
      ====================================================== */}

      <Modal
        visible={
          showFilterModal
        }
        transparent
        animationType="fade"
        onRequestClose={() =>
          setShowFilterModal(false)
        }
      >

        <View
          style={styles.modalOverlay}
        >

          <Pressable
            style={styles.modalDismiss}
            onPress={() =>
              setShowFilterModal(false)
            }
          />


          <View
            style={styles.filterModal}
          >

            {/* HEADER */}

            <View
              style={styles.modalHeader}
            >

              <View>

                <Text
                  style={styles.modalTitle}
                >
                  Filters
                </Text>

                <Text
                  style={styles.modalSubtitle}
                >
                  Refine your salon search
                </Text>

              </View>


              <TouchableOpacity
                style={styles.closeButton}
                onPress={() =>
                  setShowFilterModal(false)
                }
              >

                <Text
                  style={styles.closeButtonText}
                >
                  ×
                </Text>

              </TouchableOpacity>

            </View>


            {/* SERVICE */}

            <Text
              style={styles.filterLabel}
            >
              SERVICE
            </Text>


            <TouchableOpacity
              style={styles.filterField}
              onPress={() =>
                setShowFilterModal(false)
              }
            >

              <View
                style={styles.filterFieldContent}
              >

                <Text
                  style={styles.filterFieldValue}
                  numberOfLines={1}
                >
                  {selectedCategory ||
                    search ||
                    'Any service'}
                </Text>


                <Text
                  style={styles.filterFieldHint}
                >
                  Search or choose a service above
                </Text>

              </View>


              <Text
                style={styles.fieldArrow}
              >
                →
              </Text>

            </TouchableOpacity>


            {/* LOCATION */}

            <Text
              style={styles.filterLabel}
            >
              LOCATION
            </Text>


            <TouchableOpacity
              style={styles.filterField}
              onPress={() => {

                setShowFilterModal(false);
                setShowLocationModal(true);

              }}
            >

              <View
                style={styles.locationField}
              >

                <View
                  style={styles.locationDot}
                />


                <View
                  style={styles.filterFieldContent}
                >

                  <Text
                    style={styles.filterFieldValue}
                    numberOfLines={1}
                  >
                    {selectedLocation}
                  </Text>


                  <Text
                    style={styles.filterFieldHint}
                  >
                    Search around this location
                  </Text>

                </View>

              </View>


              <Text
                style={styles.fieldArrow}
              >
                →
              </Text>

            </TouchableOpacity>


            {/* BUDGET */}

            <View
              style={styles.labelRow}
            >

              <Text
                style={styles.filterLabel}
              >
                BUDGET
              </Text>


              <Text
                style={styles.selectedValue}
              >
                {selectedBudget.label}
              </Text>

            </View>


            <View
              style={styles.budgetGrid}
            >

              {BUDGET_OPTIONS.map(
                option => {

                  const isSelected =
                    selectedBudget.label ===
                    option.label;


                  return (

                    <TouchableOpacity
                      key={option.label}
                      style={[
                        styles.budgetOption,
                        isSelected &&
                          styles.budgetOptionSelected,
                      ]}
                      onPress={() =>
                        setSelectedBudget(option)
                      }
                      activeOpacity={0.8}
                    >

                      <Text
                        style={[
                          styles.budgetOptionText,
                          isSelected &&
                            styles.budgetOptionTextSelected,
                        ]}
                      >
                        {option.label}
                      </Text>

                    </TouchableOpacity>

                  );
                },
              )}

            </View>


            {/* DISTANCE */}

            <View
              style={styles.labelRowDistance}
            >

              <Text
                style={styles.filterLabel}
              >
                DISTANCE
              </Text>


              <Text
                style={styles.selectedValue}
              >
                {selectedDistance} km
              </Text>

            </View>


            <View
              style={styles.distanceRow}
            >

              {DISTANCE_OPTIONS.map(
                distance => {

                  const isSelected =
                    selectedDistance ===
                    distance;


                  return (

                    <TouchableOpacity
                      key={distance}
                      style={[
                        styles.distanceOption,
                        isSelected &&
                          styles.distanceOptionSelected,
                      ]}
                      onPress={() =>
                        setSelectedDistance(distance)
                      }
                      activeOpacity={0.8}
                    >

                      <Text
                        style={[
                          styles.distanceNumber,
                          isSelected &&
                            styles.distanceNumberSelected,
                        ]}
                      >
                        {distance}
                      </Text>


                      <Text
                        style={[
                          styles.distanceUnit,
                          isSelected &&
                            styles.distanceUnitSelected,
                        ]}
                      >
                        km
                      </Text>

                    </TouchableOpacity>

                  );
                },
              )}

            </View>


            {/* ACTION */}

            <TouchableOpacity
              style={styles.findButton}
              onPress={applyFilters}
              activeOpacity={0.85}
            >

              <Text
                style={styles.findButtonText}
              >
                Show salons
              </Text>


              <Text
                style={styles.findButtonArrow}
              >
                →
              </Text>

            </TouchableOpacity>


            {/* CLAVATA */}

            <TouchableOpacity
              style={styles.clavataLink}
              onPress={askClavata}
              activeOpacity={0.8}
            >

              <Text
                style={styles.clavataLinkText}
              >
                ✦ Let Clavata decide
              </Text>

            </TouchableOpacity>

          </View>

        </View>

      </Modal>

    </SafeAreaView>
  );
}


// ============================================================
// STYLES
// ============================================================

const styles =
  StyleSheet.create({

    // ========================================================
    // PAGE
    // ========================================================

    page: {
      flex: 1,
      backgroundColor: '#F6F6F3',
    },


    // ========================================================
    // MAIN
    // ========================================================

    mainArea: {
      flex: 1,
      minWidth: 0,
      backgroundColor: '#F6F6F3',
    },


    topHeader: {
      height: 92,
      paddingHorizontal: 42,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      backgroundColor: '#F6F6F3',
    },


    welcomeText: {
      fontSize: 24,
      fontWeight: '800',
      color: '#111111',
      letterSpacing: -0.7,
    },


    welcomeSubtext: {
      marginTop: 4,
      fontSize: 12,
      color: '#888888',
    },


    // ========================================================
    // LOCATION
    // ========================================================

    locationButton: {
      minWidth: 225,
      height: 53,
      backgroundColor: '#FFFFFF',
      borderWidth: 1,
      borderColor: '#E4E4E1',
      borderRadius: 14,
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: 13,
    },


    locationIcon: {
      width: 31,
      height: 31,
      borderRadius: 10,
      backgroundColor: '#F1F1EE',
      alignItems: 'center',
      justifyContent: 'center',
      marginRight: 9,
    },


    locationIconText: {
      color: '#111111',
      fontSize: 10,
    },


    locationTextWrap: {
      flex: 1,
    },


    locationLabel: {
      fontSize: 8,
      color: '#999999',
      fontWeight: '800',
      letterSpacing: 1,
    },


    locationValue: {
      marginTop: 3,
      fontSize: 11,
      color: '#222222',
      fontWeight: '700',
    },


    locationArrow: {
      fontSize: 16,
      color: '#444444',
      marginLeft: 7,
    },


    // ========================================================
    // LIST
    // ========================================================

    listContent: {
      paddingHorizontal: 42,
      paddingBottom: 50,
    },


    // ========================================================
    // SEARCH
    // ========================================================

    searchRow: {
      flexDirection: 'row',
      alignItems: 'center',
      marginTop: 10,
      gap: 10,
    },


    searchBox: {
      flex: 1,
      height: 58,
      backgroundColor: '#FFFFFF',
      borderWidth: 1,
      borderColor: '#E2E2DF',
      borderRadius: 15,
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: 17,
    },


    searchIcon: {
      fontSize: 25,
      color: '#222222',
      fontWeight: '300',
      marginRight: 10,
    },


    searchInput: {
      flex: 1,
      height: '100%',
      fontSize: 14,
      color: '#111111',
      paddingVertical: 0,
      outlineStyle: 'none',
    } as any,


    clearSearch: {
      fontSize: 21,
      color: '#777777',
      paddingHorizontal: 5,
    },


    filterButton: {
      height: 58,
      minWidth: 125,
      paddingHorizontal: 18,
      borderRadius: 15,
      backgroundColor: '#111111',
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      position: 'relative',
    },


    filterIcon: {
      color: '#FFFFFF',
      fontSize: 19,
      marginRight: 8,
    },


    filterButtonText: {
      color: '#FFFFFF',
      fontSize: 13,
      fontWeight: '700',
    },


    filterBadge: {
      position: 'absolute',
      right: -5,
      top: -5,
      width: 19,
      height: 19,
      borderRadius: 10,
      backgroundColor: '#FFFFFF',
      borderWidth: 2,
      borderColor: '#111111',
      alignItems: 'center',
      justifyContent: 'center',
    },


    filterBadgeText: {
      color: '#111111',
      fontSize: 9,
      fontWeight: '800',
    },


    // ========================================================
    // QUICK FILTERS
    // ========================================================

    quickFilters: {
      flexDirection: 'row',
      alignItems: 'center',
      flexWrap: 'wrap',
      gap: 8,
      marginTop: 12,
    },


    quickChip: {
      height: 34,
      paddingHorizontal: 13,
      borderRadius: 17,
      backgroundColor: '#FFFFFF',
      borderWidth: 1,
      borderColor: '#E2E2DF',
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
    },


    quickChipSelected: {
      backgroundColor: '#111111',
      borderColor: '#111111',
    },


    quickChipIcon: {
      fontSize: 11,
      color: '#666666',
      fontWeight: '800',
      marginRight: 5,
    },


    quickChipText: {
      fontSize: 11,
      color: '#444444',
      fontWeight: '600',
    },


    quickChipTextSelected: {
      fontSize: 11,
      color: '#FFFFFF',
      fontWeight: '700',
    },


    // ========================================================
    // SECTION
    // ========================================================

    sectionHeader: {
      marginTop: 30,
      marginBottom: 13,
    },


    sectionTitle: {
      fontSize: 20,
      color: '#111111',
      fontWeight: '800',
      letterSpacing: -0.4,
    },


    sectionSubtitle: {
      fontSize: 11,
      color: '#999999',
      marginTop: 4,
    },


    servicesContainer: {
      minHeight: 45,
    },


    // ========================================================
    // CLAVATA
    // ========================================================

    clavataCard: {
      marginTop: 25,
      minHeight: 86,
      borderRadius: 18,
      backgroundColor: '#111111',
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: 18,
      paddingVertical: 14,
    },


    clavataIconBox: {
      width: 48,
      height: 48,
      borderRadius: 14,
      backgroundColor: '#FFFFFF',
      alignItems: 'center',
      justifyContent: 'center',
      marginRight: 15,
    },


    clavataIcon: {
      fontSize: 21,
      color: '#111111',
      fontWeight: '800',
    },


    clavataBody: {
      flex: 1,
    },


    clavataTitle: {
      fontSize: 15,
      color: '#FFFFFF',
      fontWeight: '800',
    },


    clavataText: {
      marginTop: 4,
      fontSize: 11,
      color: '#AFAFAF',
      fontWeight: '400',
    },


    clavataArrowBox: {
      width: 40,
      height: 40,
      borderRadius: 20,
      backgroundColor: '#252525',
      alignItems: 'center',
      justifyContent: 'center',
      marginLeft: 15,
    },


    clavataArrow: {
      fontSize: 19,
      color: '#FFFFFF',
      fontWeight: '300',
    },


    // ========================================================
    // RESULTS
    // ========================================================

    resultsHeader: {
      marginTop: 32,
      marginBottom: 16,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
    },


    resultsTitle: {
      fontSize: 20,
      color: '#111111',
      fontWeight: '800',
      letterSpacing: -0.4,
    },


    resultsSubtitle: {
      marginTop: 4,
      fontSize: 11,
      color: '#999999',
    },


    resultFilterButton: {
      height: 35,
      paddingHorizontal: 14,
      borderRadius: 18,
      backgroundColor: '#FFFFFF',
      borderWidth: 1,
      borderColor: '#E0E0DD',
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
    },


    resultFilterIcon: {
      fontSize: 14,
      color: '#333333',
      marginRight: 6,
    },


    resultFilterText: {
      fontSize: 11,
      color: '#333333',
      fontWeight: '700',
    },


    salonCardWrap: {
      marginBottom: 15,
    },


    // ========================================================
    // LOADING
    // ========================================================

    loadingContainer: {
      minHeight: 260,
      alignItems: 'center',
      justifyContent: 'center',
      paddingVertical: 50,
    },


    loadingCircle: {
      width: 48,
      height: 48,
      borderRadius: 24,
      backgroundColor: '#FFFFFF',
      alignItems: 'center',
      justifyContent: 'center',
      borderWidth: 1,
      borderColor: '#E7E7E4',
    },


    loadingTitle: {
      marginTop: 14,
      fontSize: 14,
      color: '#222222',
      fontWeight: '700',
    },


    loadingText: {
      marginTop: 5,
      fontSize: 11,
      color: '#999999',
    },


    // ========================================================
    // EMPTY
    // ========================================================

    emptyContainer: {
      minHeight: 270,
      alignItems: 'center',
      justifyContent: 'center',
      paddingHorizontal: 40,
    },


    emptyIcon: {
      width: 58,
      height: 58,
      borderRadius: 29,
      backgroundColor: '#FFFFFF',
      borderWidth: 1,
      borderColor: '#E2E2DF',
      alignItems: 'center',
      justifyContent: 'center',
    },


    emptyIconText: {
      fontSize: 26,
      color: '#888888',
    },


    emptyTitle: {
      marginTop: 16,
      fontSize: 17,
      color: '#111111',
      fontWeight: '800',
    },


    emptyText: {
      marginTop: 6,
      maxWidth: 390,
      textAlign: 'center',
      fontSize: 12,
      lineHeight: 18,
      color: '#999999',
    },


    emptyButton: {
      marginTop: 18,
      height: 43,
      paddingHorizontal: 19,
      borderRadius: 12,
      backgroundColor: '#111111',
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
    },


    emptyButtonText: {
      color: '#FFFFFF',
      fontSize: 12,
      fontWeight: '700',
    },


    emptyButtonArrow: {
      color: '#FFFFFF',
      fontSize: 17,
      marginLeft: 8,
    },


    // ========================================================
    // MODAL
    // ========================================================

    modalOverlay: {
      flex: 1,
      backgroundColor: 'rgba(0,0,0,0.45)',
      alignItems: 'center',
      justifyContent: 'center',
      padding: 30,
    },


    modalDismiss: {
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
    },


    filterModal: {
      width: '100%',
      maxWidth: 540,
      backgroundColor: '#FFFFFF',
      borderRadius: 24,
      paddingHorizontal: 26,
      paddingTop: 25,
      paddingBottom: 23,
      maxHeight: '90%',
      shadowColor: '#000000',
      shadowOffset: {
        width: 0,
        height: 10,
      },
      shadowOpacity: 0.18,
      shadowRadius: 30,
      elevation: 10,
    },


    modalHeader: {
      flexDirection: 'row',
      alignItems: 'flex-start',
      justifyContent: 'space-between',
      marginBottom: 10,
    },


    modalTitle: {
      fontSize: 26,
      color: '#111111',
      fontWeight: '800',
      letterSpacing: -0.7,
    },


    modalSubtitle: {
      marginTop: 4,
      fontSize: 12,
      color: '#999999',
    },


    closeButton: {
      width: 36,
      height: 36,
      borderRadius: 18,
      backgroundColor: '#F3F3F1',
      alignItems: 'center',
      justifyContent: 'center',
    },


    closeButtonText: {
      fontSize: 23,
      color: '#111111',
      fontWeight: '300',
      marginTop: -2,
    },


    // ========================================================
    // FILTER
    // ========================================================

    filterLabel: {
      fontSize: 9,
      color: '#8B8B86',
      fontWeight: '800',
      letterSpacing: 1.1,
      marginTop: 13,
      marginBottom: 7,
    },


    filterField: {
      minHeight: 55,
      borderRadius: 13,
      borderWidth: 1,
      borderColor: '#E4E4E1',
      backgroundColor: '#FAFAF8',
      paddingHorizontal: 14,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
    },


    filterFieldContent: {
      flex: 1,
    },


    filterFieldValue: {
      maxWidth: '90%',
      fontSize: 13,
      color: '#111111',
      fontWeight: '700',
    },


    filterFieldHint: {
      marginTop: 3,
      fontSize: 9,
      color: '#999999',
    },


    fieldArrow: {
      fontSize: 19,
      color: '#222222',
      fontWeight: '300',
      marginLeft: 10,
    },


    locationField: {
      flex: 1,
      flexDirection: 'row',
      alignItems: 'center',
    },


    locationDot: {
      width: 9,
      height: 9,
      borderRadius: 5,
      backgroundColor: '#111111',
      marginRight: 12,
    },


    labelRow: {
      marginTop: 11,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
    },


    selectedValue: {
      fontSize: 11,
      color: '#222222',
      fontWeight: '700',
      marginTop: 13,
    },


    // ========================================================
    // BUDGET
    // ========================================================

    budgetGrid: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: 7,
    },


    budgetOption: {
      paddingHorizontal: 12,
      height: 37,
      borderRadius: 19,
      borderWidth: 1,
      borderColor: '#E1E1DE',
      backgroundColor: '#FFFFFF',
      alignItems: 'center',
      justifyContent: 'center',
    },


    budgetOptionSelected: {
      backgroundColor: '#111111',
      borderColor: '#111111',
    },


    budgetOptionText: {
      fontSize: 10,
      color: '#333333',
      fontWeight: '600',
    },


    budgetOptionTextSelected: {
      color: '#FFFFFF',
    },


    // ========================================================
    // DISTANCE
    // ========================================================

    labelRowDistance: {
      marginTop: 9,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
    },


    distanceRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      marginTop: 2,
    },


    distanceOption: {
      width: 57,
      height: 45,
      borderRadius: 11,
      borderWidth: 1,
      borderColor: '#E1E1DE',
      backgroundColor: '#FFFFFF',
      alignItems: 'center',
      justifyContent: 'center',
    },


    distanceOptionSelected: {
      backgroundColor: '#111111',
      borderColor: '#111111',
    },


    distanceNumber: {
      fontSize: 13,
      color: '#111111',
      fontWeight: '800',
      lineHeight: 15,
    },


    distanceNumberSelected: {
      color: '#FFFFFF',
    },


    distanceUnit: {
      fontSize: 8,
      color: '#999999',
      fontWeight: '500',
    },


    distanceUnitSelected: {
      color: '#CFCFCF',
    },


    // ========================================================
    // ACTION
    // ========================================================

    findButton: {
      height: 52,
      borderRadius: 13,
      backgroundColor: '#111111',
      marginTop: 18,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
    },


    findButtonText: {
      color: '#FFFFFF',
      fontSize: 13,
      fontWeight: '800',
    },


    findButtonArrow: {
      color: '#FFFFFF',
      fontSize: 19,
      marginLeft: 8,
      fontWeight: '300',
    },


    clavataLink: {
      height: 38,
      alignItems: 'center',
      justifyContent: 'center',
    },


    clavataLinkText: {
      color: '#111111',
      fontSize: 11,
      fontWeight: '700',
    },

  });