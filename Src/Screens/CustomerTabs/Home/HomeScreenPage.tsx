import React, {
  useEffect,
  useMemo,
  useState,
} from 'react';
import type {
  SavedLocation,
  LocationData,
} from '../../../services/locationTypes';
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

import HomeHeader from './HomeHeader';
import ServiceChips from './ServiceChips';
import SalonCard from './SalonCard';
import LocationBottomSheet from './LocationBottomSheet';
import ReviewPopup from './ReviewPopup';
import HomeAdCarousel from './HomeAdCarousel';

import {
  getActiveLocation,
  getCurrentLocation,
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

import {
  COLORS,
  FONT_SIZES,
  SPACING,
  RADIUS,
} from '../../../constants/constants';


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
// COMPONENT
// ============================================================

export default function HomeScreenPage() {

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
  ] = useState(
    10,
  );


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

    if (
      currentUser?.userId
    ) {
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
      // ========================================================
      // 1. CHECK SAVED LOCATION
      // ========================================================

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

      // ========================================================
      // 2. NO LOCATION
      //    REQUEST PERMISSION + GET GPS
      // ========================================================

      console.log(
        '📍 No saved location. Requesting device location...',
      );

      const currentLocation =
        await getCurrentLocation();

      // ========================================================
      // 3. USER DENIED PERMISSION / GPS FAILED
      // ========================================================

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

      // ========================================================
      // 4. LOCATION SUCCESS
      // ========================================================

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

      // ========================================================
      // 5. LOAD NEARBY SALONS
      // ========================================================

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

      if (
        locationCoordinates
      ) {
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
      // LOCATION MODE
      // --------------------------------------------------------

      if (
        USE_HARDCODED_LOCATION
      ) {

        const activeLocation =
          await getActiveLocation();

        if (
          activeLocation
        ) {

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


      if (
        cleanCategory
      ) {

        finalCategory =
          cleanCategory;

      } else if (
        cleanSearch
      ) {

        finalSearch =
          cleanSearch;
      }


      // --------------------------------------------------------
      // GRAPHQL
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


      try {

        setLoadingSalons(
          true,
        );

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
                    item.distance *
                    1000,
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

        setLoadingSalons(
          false,
        );

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

      setShowLocationModal(
        false,
      );

    };


  // ==========================================================
  // SEARCH
  // ==========================================================

  const handleSearchChange =
    (text: string) => {

      setSearch(text);

      if (
        text.trim()
      ) {

        setSelectedCategory(
          '',
        );

      }

    };


  const handleSearchSubmit =
    () => {

      const location =
        getActiveCoordinates();

      if (!location) {

        setShowLocationModal(
          true,
        );

        return;
      }


      const cleanSearch =
        search.trim();


      setSelectedCategory(
        '',
      );


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
        selectedDistance,
      );

    };


  // ==========================================================
  // FILTER
  // ==========================================================

  const openFilter =
    () => {

      setShowFilterModal(
        true,
      );

    };


  const applyFilters =
    async () => {

      setShowFilterModal(
        false,
      );


      const location =
        getActiveCoordinates();


      if (!location) {

        setShowLocationModal(
          true,
        );

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

      setShowFilterModal(
        false,
      );


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

          setShowReviewPopup(
            true,
          );

        }

      } catch (error) {

        console.log(
          'Booking loading error:',
          error,
        );

      }

    };


  // ==========================================================
  // FILTER SUMMARY
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


  const resultTitle =
    useMemo(() => {

      if (
        search.trim()
      ) {
        return 'Search results';
      }

      if (
        selectedCategory
      ) {
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
      style={
        styles.container
      }
    >

      <FlatList

        data={
          salons
        }

        keyExtractor={
          item =>
            item.id
        }

        renderItem={({
          item,
        }) => (

          <SalonCard
            salon={
              item
            }
          />

        )}

        ListHeaderComponent={
          <>

            {/* ==================================================
                HEADER
            ================================================== */}

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


            {/* ==================================================
                SEARCH
            ================================================== */}

            <View
              style={
                styles.searchRow
              }
            >

              <View
                style={
                  styles.searchBox
                }
              >

                <Text
                  style={
                    styles.searchSymbol
                  }
                >
                  ⌕
                </Text>


                <TextInput
                  value={
                    search
                  }
                  onChangeText={
                    handleSearchChange
                  }
                  onSubmitEditing={
                    handleSearchSubmit
                  }
                  placeholder="Search salons or services"
                  placeholderTextColor={
                    COLORS.textMuted
                  }
                  style={
                    styles.searchInput
                  }
                  returnKeyType="search"
                />

              </View>


              <TouchableOpacity
                style={
                  styles.filterButton
                }
                onPress={
                  openFilter
                }
                activeOpacity={
                  0.8
                }
              >

                <Text
                  style={
                    styles.filterSymbol
                  }
                >
                  ☷
                </Text>


                {filterCount > 0 && (

                  <View
                    style={
                      styles.filterBadge
                    }
                  >

                    <Text
                      style={
                        styles.filterBadgeText
                      }
                    >
                      {filterCount}
                    </Text>

                  </View>

                )}

              </TouchableOpacity>

            </View>


            {/* ==================================================
                QUICK FILTER SUMMARY
            ================================================== */}

            <View
              style={
                styles.quickFilters
              }
            >

              <TouchableOpacity
                style={
                  styles.quickChip
                }
                onPress={
                  openFilter
                }
              >

                <Text
                  style={
                    styles.quickChipText
                  }
                >
                  ₹ {selectedBudget.label}
                </Text>

              </TouchableOpacity>


              <TouchableOpacity
                style={
                  styles.quickChip
                }
                onPress={
                  openFilter
                }
              >

                <Text
                  style={
                    styles.quickChipText
                  }
                >
                  Within {selectedDistance} km
                </Text>

              </TouchableOpacity>

            </View>


            {/* ==================================================
                SERVICES
            ================================================== */}

            <View
              style={
                styles.sectionHeader
              }
            >

              <Text
                style={
                  styles.sectionTitle
                }
              >
                Choose Services
              </Text>

              {/* <Text
                style={
                  styles.sectionAction
                }
              >
                Explore
              </Text> */}

            </View>


            <ServiceChips
              selectedCategory={
                selectedCategory
              }
              onSelect={
                handleCategorySelect
              }
            />


            {/* ==================================================
                CLAVATA
            ================================================== */}

            <TouchableOpacity
              style={
                styles.clavataCard
              }
              onPress={
                askClavata
              }
              activeOpacity={
                0.9
              }
            >

              {/* <View
                style={
                  styles.clavataMark
                }
              >

                <Text
                  style={
                    styles.clavataMarkText
                  }
                >
                  C
                </Text>

              </View> */}


              <View
                style={
                  styles.clavataBody
                }
              >

                <Text
                  style={
                    styles.clavataTitle
                  }
                >
                  Let Clavata choose
                </Text>

                <Text
                  style={
                    styles.clavataText
                  }
                >
                  Best match for you
                </Text>

              </View>


              <View
                style={
                  styles.clavataArrow
                }
              >

                <Text
                  style={
                    styles.clavataArrowText
                  }
                >
                  →
                </Text>

              </View>

            </TouchableOpacity>


            {/* ==================================================
                AD
            ================================================== */}

            {/* <HomeAdCarousel
              onAdPress={
                ad => {
                  console.log(
                    'Advertisement clicked:',
                    ad,
                  );
                }
              }
            /> */}


            {/* ==================================================
                RESULTS
            ================================================== */}

            <View
              style={
                styles.resultsHeader
              }
            >

              <View
                style={
                  styles.resultsTitleWrap
                }
              >

                <Text
                  style={
                    styles.resultsTitle
                  }
                >
                  {resultTitle}
                </Text>

                <Text
                  style={
                    styles.resultsSubtitle
                  }
                >
                  {salons.length} places
                </Text>

              </View>


              <TouchableOpacity
                style={
                  styles.sortButton
                }
                onPress={
                  openFilter
                }
              >

                <Text
                  style={
                    styles.sortText
                  }
                >
                  Filter
                </Text>

              </TouchableOpacity>

            </View>

          </>
        }


        ListEmptyComponent={

          loadingSalons ? (

            <View
              style={
                styles.loadingContainer
              }
            >

              <ActivityIndicator
                size="small"
                color={
                  COLORS.black
                }
              />

              <Text
                style={
                  styles.loadingText
                }
              >
                Finding nearby salons
              </Text>

            </View>

          ) : (

            <View
              style={
                styles.emptyContainer
              }
            >

              {/* <View
                style={
                  styles.emptyCircle
                }
              >

                <Text
                  style={
                    styles.emptyCircleText
                  }
                >
                  —
                </Text>

              </View> */}


              <Text
                style={
                  styles.emptyTitle
                }
              >
                No salons near by
              </Text>


              <Text
                style={
                  styles.emptyText
                }
              >
                Try a wider search area
              </Text>


              <TouchableOpacity
                style={
                  styles.emptyButton
                }
                onPress={
                  openFilter
                }
              >

                <Text
                  style={
                    styles.emptyButtonText
                  }
                >
                  Adjust search
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


      {/* ======================================================
          LOCATION
      ====================================================== */}

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

          setShowReviewPopup(
            false,
          );

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

          setShowReviewPopup(
            false,
          );

        }}

      />


      {/* ======================================================
          FILTER SHEET
      ====================================================== */}

      <Modal
        visible={
          showFilterModal
        }
        transparent
        animationType="slide"
        onRequestClose={() =>
          setShowFilterModal(
            false,
          )
        }
      >

        <View
          style={
            styles.modalOverlay
          }
        >

          <Pressable
            style={
              styles.modalDismiss
            }
            onPress={() =>
              setShowFilterModal(
                false,
              )
            }
          />


          <View
            style={
              styles.filterSheet
            }
          >

            <View
              style={
                styles.sheetHandle
              }
            />


            {/* HEADER */}

            <View
              style={
                styles.sheetHeader
              }
            >

              <View>

                <Text
                  style={
                    styles.sheetTitle
                  }
                >
                  Filters
                </Text>

                <Text
                  style={
                    styles.sheetSubtitle
                  }
                >
                  Refine your search
                </Text>

              </View>


              <TouchableOpacity
                style={
                  styles.closeButton
                }
                onPress={() =>
                  setShowFilterModal(
                    false,
                  )
                }
              >

                <Text
                  style={
                    styles.closeButtonText
                  }
                >
                  ×
                </Text>

              </TouchableOpacity>

            </View>


            {/* SERVICE */}

            <Text
              style={
                styles.filterLabel
              }
            >
              SERVICE
            </Text>


            <TouchableOpacity
              style={
                styles.filterField
              }
              onPress={() => {

                setShowFilterModal(
                  false,
                );

              }}
            >

              <View>

                <Text
                  style={
                    styles.filterFieldValue
                  }
                  numberOfLines={
                    1
                  }
                >
                  {selectedCategory ||
                    search ||
                    'Any service'}
                </Text>

                <Text
                  style={
                    styles.filterFieldHint
                  }
                >
                  Search or choose a service above
                </Text>

              </View>


              <Text
                style={
                  styles.fieldArrow
                }
              >
                →
              </Text>

            </TouchableOpacity>


            {/* LOCATION */}

            <Text
              style={
                styles.filterLabel
              }
            >
              LOCATION
            </Text>


            <TouchableOpacity
              style={
                styles.filterField
              }
              onPress={() => {

                setShowFilterModal(
                  false,
                );

                setShowLocationModal(
                  true,
                );

              }}
            >

              <View
                style={
                  styles.locationField
                }
              >

                <View
                  style={
                    styles.locationDot
                  }
                />

                <View
                  style={
                    styles.locationValueWrap
                  }
                >

                  <Text
                    style={
                      styles.filterFieldValue
                    }
                    numberOfLines={
                      1
                    }
                  >
                    {selectedLocation}
                  </Text>

                  <Text
                    style={
                      styles.filterFieldHint
                    }
                  >
                    Search around this location
                  </Text>

                </View>

              </View>


              <Text
                style={
                  styles.fieldArrow
                }
              >
                →
              </Text>

            </TouchableOpacity>


            {/* BUDGET */}

            <View
              style={
                styles.labelRow
              }
            >

              <Text
                style={
                  styles.filterLabel
                }
              >
                BUDGET
              </Text>

              <Text
                style={
                  styles.selectedValue
                }
              >
                {selectedBudget.label}
              </Text>

            </View>


            <View
              style={
                styles.budgetGrid
              }
            >

              {BUDGET_OPTIONS.map(
                option => {

                  const isSelected =
                    selectedBudget.label ===
                    option.label;

                  return (

                    <TouchableOpacity
                      key={
                        option.label
                      }
                      style={[
                        styles.budgetOption,
                        isSelected &&
                        styles.budgetOptionSelected,
                      ]}
                      onPress={() =>
                        setSelectedBudget(
                          option,
                        )
                      }
                      activeOpacity={
                        0.8
                      }
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
              style={
                styles.labelRowDistance
              }
            >

              <Text
                style={
                  styles.filterLabel
                }
              >
                DISTANCE
              </Text>

              <Text
                style={
                  styles.selectedValue
                }
              >
                {selectedDistance} km
              </Text>

            </View>


            <View
              style={
                styles.distanceRow
              }
            >

              {DISTANCE_OPTIONS.map(
                distance => {

                  const isSelected =
                    selectedDistance ===
                    distance;

                  return (

                    <TouchableOpacity
                      key={
                        distance
                      }
                      style={[
                        styles.distanceOption,
                        isSelected &&
                        styles.distanceOptionSelected,
                      ]}
                      onPress={() =>
                        setSelectedDistance(
                          distance,
                        )
                      }
                      activeOpacity={
                        0.8
                      }
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
              style={
                styles.findButton
              }
              onPress={
                applyFilters
              }
              activeOpacity={
                0.85
              }
            >

              <Text
                style={
                  styles.findButtonText
                }
              >
                Show salons
              </Text>

              <Text
                style={
                  styles.findButtonArrow
                }
              >
                →
              </Text>

            </TouchableOpacity>


            {/* CLAVATA */}

            <TouchableOpacity
              style={
                styles.clavataLink
              }
              onPress={
                askClavata
              }
              activeOpacity={
                0.8
              }
            >

              <Text
                style={
                  styles.clavataLinkText
                }
              >
                ✦  Let Clavata decide
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
    // BASE
    // ========================================================

    container: {
      flex: 1,
      backgroundColor:
        COLORS.background,
    },

    listContent: {
      paddingBottom:
        40,
    },


    // ========================================================
    // SEARCH
    // ========================================================

    searchRow: {
      flexDirection:
        'row',

      alignItems:
        'center',

      marginHorizontal:
        SPACING.xl,

      marginTop:
        8,

      marginBottom:
        12,

      gap:
        10,
    },

    searchBox: {
      flex: 1,

      height: 54,

      backgroundColor:
        COLORS.white,

      borderRadius:
        14,

      borderWidth:
        1,

      borderColor:
        '#E3E3E3',

      flexDirection:
        'row',

      alignItems:
        'center',

      paddingHorizontal:
        15,
    },

    searchSymbol: {
      fontSize:
        25,

      color:
        COLORS.black,

      fontWeight:
        '300',

      marginRight:
        8,
    },

    searchInput: {
      flex: 1,

      height:
        '100%',

      fontSize:
        15,

      color:
        COLORS.black,

      paddingVertical:
        0,
    },

    filterButton: {
      width: 54,

      height: 54,

      borderRadius:
        14,

      backgroundColor:
        COLORS.black,

      alignItems:
        'center',

      justifyContent:
        'center',

      position:
        'relative',
    },

    filterSymbol: {
      color:
        COLORS.white,

      fontSize:
        22,

      fontWeight:
        '400',
    },

    filterBadge: {
      position:
        'absolute',

      right:
        -2,

      top:
        -4,

      minWidth:
        18,

      height:
        18,

      paddingHorizontal:
        4,

      borderRadius:
        9,

      backgroundColor:
        COLORS.white,

      borderWidth:
        2,

      borderColor:
        COLORS.black,

      alignItems:
        'center',

      justifyContent:
        'center',
    },

    filterBadgeText: {
      fontSize:
        9,

      color:
        COLORS.black,

      fontWeight:
        '800',
    },


    // ========================================================
    // QUICK FILTERS
    // ========================================================

    quickFilters: {
      flexDirection:
        'row',

      marginHorizontal:
        SPACING.xl,

      marginBottom:
        22,

      gap:
        8,
    },

    quickChip: {
      height:
        34,

      paddingHorizontal:
        13,

      borderRadius:
        17,

      backgroundColor:
        COLORS.white,

      borderWidth:
        1,

      borderColor:
        '#E4E4E4',

      justifyContent:
        'center',
    },

    quickChipText: {
      fontSize:
        12,

      color:
        '#333333',

      fontWeight:
        '600',
    },


    // ========================================================
    // SECTION
    // ========================================================

    sectionHeader: {
      marginHorizontal:
        SPACING.xl,

      marginBottom:
        12,

      flexDirection:
        'row',

      alignItems:
        'center',

      justifyContent:
        'space-between',
    },

    sectionTitle: {
      fontSize:
        21,

      color:
        COLORS.black,

      fontWeight:
        '700',

      letterSpacing:
        -0.4,
    },

    sectionAction: {
      fontSize:
        12,

      color:
        COLORS.textSecondary,

      fontWeight:
        '600',
    },


    // ========================================================
    // CLAVATA
    // ========================================================

    clavataCard: {
      marginHorizontal:
        SPACING.xl,

      marginTop:
        20,

      marginBottom:
        20,

      minHeight:
        72,

      borderRadius:
        18,

      backgroundColor:
        COLORS.black,

      flexDirection:
        'row',

      alignItems:
        'center',

      paddingHorizontal:
        14,
    },

    clavataMark: {
      width:
        44,

      height:
        44,

      borderRadius:
        14,

      backgroundColor:
        COLORS.white,

      alignItems:
        'center',

      justifyContent:
        'center',

      marginRight:
        12,
    },

    clavataMarkText: {
      fontSize:
        19,

      fontWeight:
        '800',

      color:
        COLORS.black,
    },

    clavataBody: {
      flex: 1,
    },

    clavataTitle: {
      fontSize:
        15,

      color:
        COLORS.white,

      fontWeight:
        '700',
    },

    clavataText: {
      marginTop:
        3,

      fontSize:
        12,

      color:
        '#BEBEBE',

      fontWeight:
        '400',
    },

    clavataArrow: {
      width:
        36,

      height:
        36,

      alignItems:
        'center',

      justifyContent:
        'center',
    },

    clavataArrowText: {
      fontSize:
        21,

      color:
        COLORS.white,

      fontWeight:
        '300',
    },


    // ========================================================
    // RESULTS
    // ========================================================

    resultsHeader: {
      marginHorizontal:
        SPACING.xl,

      marginTop:
        24,

      marginBottom:
        14,

      flexDirection:
        'row',

      alignItems:
        'center',

      justifyContent:
        'space-between',
    },

    resultsTitleWrap: {
      flex: 1,
    },

    resultsTitle: {
      fontSize:
        21,

      color:
        COLORS.black,

      fontWeight:
        '700',

      letterSpacing:
        -0.3,
    },

    resultsSubtitle: {
      marginTop:
        3,

      fontSize:
        12,

      color:
        COLORS.textMuted,

      fontWeight:
        '500',
    },

    sortButton: {
      height:
        34,

      paddingHorizontal:
        13,

      borderRadius:
        17,

      borderWidth:
        1,

      borderColor:
        '#DDDDDD',

      backgroundColor:
        COLORS.white,

      alignItems:
        'center',

      justifyContent:
        'center',
    },

    sortText: {
      fontSize:
        12,

      color:
        COLORS.black,

      fontWeight:
        '600',
    },


    // ========================================================
    // LOADING
    // ========================================================

    loadingContainer: {
      marginTop:
        45,

      alignItems:
        'center',
    },

    loadingText: {
      marginTop:
        12,

      fontSize:
        13,

      color:
        COLORS.textSecondary,

      fontWeight:
        '500',
    },


    // ========================================================
    // EMPTY
    // ========================================================

    emptyContainer: {
      marginTop:
        45,

      marginHorizontal:
        30,

      alignItems:
        'center',
    },

    emptyCircle: {
      width:
        58,

      height:
        58,

      borderRadius:
        29,

      backgroundColor:
        COLORS.white,

      borderWidth:
        1,

      borderColor:
        '#E2E2E2',

      alignItems:
        'center',

      justifyContent:
        'center',
    },

    emptyCircleText: {
      fontSize:
        24,

      color:
        COLORS.textMuted,
    },

    emptyTitle: {
      marginTop:
        16,

      fontSize:
        18,

      color:
        COLORS.black,

      fontWeight:
        '700',
    },

    emptyText: {
      marginTop:
        5,

      fontSize:
        13,

      color:
        COLORS.textSecondary,
    },

    emptyButton: {
      marginTop:
        18,

      height:
        44,

      paddingHorizontal:
        20,

      borderRadius:
        12,

      backgroundColor:
        COLORS.black,

      alignItems:
        'center',

      justifyContent:
        'center',
    },

    emptyButtonText: {
      color:
        COLORS.white,

      fontSize:
        13,

      fontWeight:
        '600',
    },


    // ========================================================
    // MODAL
    // ========================================================

    modalOverlay: {
      flex: 1,

      backgroundColor:
        'rgba(0,0,0,0.48)',

      justifyContent:
        'flex-end',
    },

    modalDismiss: {
      flex: 1,
    },

    filterSheet: {
      backgroundColor:
        COLORS.white,

      borderTopLeftRadius:
        28,

      borderTopRightRadius:
        28,

      paddingHorizontal:
        22,

      paddingTop:
        10,

      paddingBottom:
        22,

      maxHeight:
        '88%',
    },

    sheetHandle: {
      width:
        38,

      height:
        4,

      borderRadius:
        4,

      backgroundColor:
        '#D4D4D4',

      alignSelf:
        'center',

      marginBottom:
        18,
    },

    sheetHeader: {
      flexDirection:
        'row',

      alignItems:
        'flex-start',

      justifyContent:
        'space-between',

      marginBottom:
        12,
    },

    sheetTitle: {
      fontSize:
        27,

      color:
        COLORS.black,

      fontWeight:
        '700',

      letterSpacing:
        -0.7,
    },

    sheetSubtitle: {
      marginTop:
        4,

      fontSize:
        13,

      color:
        COLORS.textSecondary,

      fontWeight:
        '400',
    },

    closeButton: {
      width:
        36,

      height:
        36,

      borderRadius:
        18,

      backgroundColor:
        '#F4F4F4',

      alignItems:
        'center',

      justifyContent:
        'center',
    },

    closeButtonText: {
      fontSize:
        24,

      color:
        COLORS.black,

      fontWeight:
        '300',

      marginTop:
        -2,
    },


    // ========================================================
    // FILTER FIELDS
    // ========================================================

    filterLabel: {
      fontSize:
        10,

      color:
        '#8A8A8A',

      fontWeight:
        '700',

      letterSpacing:
        1.1,

      marginTop:
        14,

      marginBottom:
        7,
    },

    filterField: {
      minHeight:
        56,

      borderRadius:
        13,

      borderWidth:
        1,

      borderColor:
        '#E5E5E5',

      backgroundColor:
        '#FAFAFA',

      paddingHorizontal:
        14,

      flexDirection:
        'row',

      alignItems:
        'center',

      justifyContent:
        'space-between',
    },

    filterFieldValue: {
      maxWidth:
        '90%',

      fontSize:
        14,

      color:
        COLORS.black,

      fontWeight:
        '600',
    },

    filterFieldHint: {
      marginTop:
        2,

      fontSize:
        10,

      color:
        COLORS.textMuted,

      fontWeight:
        '400',
    },

    fieldArrow: {
      fontSize:
        20,

      color:
        COLORS.black,

      fontWeight:
        '300',
    },

    locationField: {
      flexDirection:
        'row',

      alignItems:
        'center',

      flex:
        1,
    },

    locationDot: {
      width:
        10,

      height:
        10,

      borderRadius:
        5,

      backgroundColor:
        COLORS.black,

      marginRight:
        12,
    },

    locationValueWrap: {
      flex:
        1,
    },


    // ========================================================
    // BUDGET
    // ========================================================

    labelRow: {
      marginTop:
        13,

      flexDirection:
        'row',

      alignItems:
        'center',

      justifyContent:
        'space-between',
    },

    selectedValue: {
      fontSize:
        12,

      color:
        COLORS.black,

      fontWeight:
        '600',

      marginTop:
        14,
    },

    budgetGrid: {
      flexDirection:
        'row',

      flexWrap:
        'wrap',

      gap:
        7,

      marginTop:
        1,
    },

    budgetOption: {
      paddingHorizontal:
        13,

      height:
        39,

      borderRadius:
        20,

      borderWidth:
        1,

      borderColor:
        '#E2E2E2',

      backgroundColor:
        COLORS.white,

      alignItems:
        'center',

      justifyContent:
        'center',
    },

    budgetOptionSelected: {
      backgroundColor:
        COLORS.black,

      borderColor:
        COLORS.black,
    },

    budgetOptionText: {
      fontSize:
        11,

      color:
        '#333333',

      fontWeight:
        '600',
    },

    budgetOptionTextSelected: {
      color:
        COLORS.white,
    },


    // ========================================================
    // DISTANCE
    // ========================================================

    labelRowDistance: {
      marginTop:
        10,

      flexDirection:
        'row',

      alignItems:
        'center',

      justifyContent:
        'space-between',
    },

    distanceRow: {
      flexDirection:
        'row',

      justifyContent:
        'space-between',

      marginTop:
        2,
    },

    distanceOption: {
      width:
        52,

      height:
        46,

      borderRadius:
        12,

      borderWidth:
        1,

      borderColor:
        '#E2E2E2',

      backgroundColor:
        COLORS.white,

      alignItems:
        'center',

      justifyContent:
        'center',
    },

    distanceOptionSelected: {
      backgroundColor:
        COLORS.black,

      borderColor:
        COLORS.black,
    },

    distanceNumber: {
      fontSize:
        14,

      color:
        COLORS.black,

      fontWeight:
        '700',

      lineHeight:
        16,
    },

    distanceNumberSelected: {
      color:
        COLORS.white,
    },

    distanceUnit: {
      fontSize:
        9,

      color:
        COLORS.textMuted,

      fontWeight:
        '500',
    },

    distanceUnitSelected: {
      color:
        '#CFCFCF',
    },


    // ========================================================
    // ACTION
    // ========================================================

    findButton: {
      height:
        54,

      borderRadius:
        14,

      backgroundColor:
        COLORS.black,

      marginTop:
        18,

      flexDirection:
        'row',

      alignItems:
        'center',

      justifyContent:
        'center',
    },

    findButtonText: {
      color:
        COLORS.white,

      fontSize:
        14,

      fontWeight:
        '700',
    },

    findButtonArrow: {
      color:
        COLORS.white,

      fontSize:
        20,

      marginLeft:
        8,

      fontWeight:
        '300',
    },

    clavataLink: {
      height:
        40,

      alignItems:
        'center',

      justifyContent:
        'center',

      marginTop:
        3,
    },

    clavataLinkText: {
      color:
        COLORS.black,

      fontSize:
        12,

      fontWeight:
        '600',
    },

  });